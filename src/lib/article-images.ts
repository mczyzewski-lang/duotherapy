// Ilustracje artykułów: generowanie (OpenAI, klucz na serwerze), zapis w bazie, lista dostępnych.
import { system } from "./db";
import { generateImageBytes } from "./cover-photos";
import { ARTICLES, articleBySlug } from "@/content/articles";

/** Wspólny styl: minimalistyczna, profesjonalna ilustracja w barwach DUO, z delikatnymi elementami komiksowymi, bez tekstu. */
export const ART_STYLE = [
  "Minimalist editorial illustration for a couples-therapy article. Flat vector style with subtle paper grain, calm and professional.",
  "Strict palette: deep forest green #36493d, terracotta #a9512f, warm sand #eadccb, ivory background #fbf9f5, soft rose #e07f78, sage #97ac9c.",
  // Stały projekt postaci – ten sam w całej serii (bez tego model raz rysuje ludzi, raz manekiny z kropką zamiast głowy).
  "CHARACTER DESIGN – identical in every image of this series: friendly flat infographic-style adult people with natural proportions;",
  "every head has a clear solid-colour hairstyle (varied styles and hair colours) and a warm skin tone (diverse range);",
  "minimal friendly faces: tiny dot eyes, a small nose line, optionally a small soft mouth line; simple everyday clothes in the palette colours; visible hands.",
  "NEVER draw faceless mannequins, featureless blob or pin-shaped figures, bald round heads, heads made of a dot or plain circle, stick figures, emoji faces, realistic, 3D or anime people.",
  "Light comic-style elements: empty speech or thought bubbles, small motion marks, gentle arrows, simple icons.",
  "Lots of negative space, clean composition, no clutter. Absolutely no text, letters, numbers, captions or logos inside the image.",
  "Respectful and inclusive, no stereotypes, no drama, no violence.",
].join(" ");

/** Wersja stylu – grafiki wygenerowane wcześniejszą wersją panel oznacza jako „stary styl” i pozwala je odświeżyć. */
export const ART_STYLE_VERSION = 2;

export const heroKey = (slug: string) => `${slug}--hero`;
export const artKey = (slug: string, key: string) => `${slug}--${key}`;
const url = (key: string, v: Date) => `/wiedza-grafiki/${key}?v=${new Date(v).getTime()}`;

/** Wszystkie ilustracje do wygenerowania: [klucz, opis, prompt]. */
export function articleImageJobs(slug: string): { key: string; label: string; prompt: string }[] {
  const a = articleBySlug(slug);
  if (!a) return [];
  return [
    { key: heroKey(slug), label: "Grafika na górze", prompt: `${a.hero.prompt}\n\nWide hero image for the top of the article.` },
    ...a.blocks.flatMap((b) => (b.t === "art" ? [{ key: artKey(slug, b.key), label: b.title, prompt: `${b.prompt}\n\nExplainer illustration summarising one idea of the article.` }] : [])),
  ];
}
export const allArticleImageJobs = () => ARTICLES.flatMap((a) => articleImageJobs(a.slug).map((j) => ({ ...j, slug: a.slug })));

let cache: { at: number; map: Record<string, string> } | null = null;
/** klucz → adres obrazka (tylko wygenerowane). Bez bazy – pusta lista. */
export async function articleImageMap(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.map;
  try {
    const rows = await system((tx) => tx<{ key: string; updated_at: Date }[]>`select key, updated_at from article_images`);
    const map = Object.fromEntries(rows.map((r) => [r.key, url(r.key, r.updated_at)]));
    cache = { at: Date.now(), map };
    return map;
  } catch {
    return {};
  }
}
export const invalidateArticleImages = () => { cache = null; };

/** Klucze grafik wygenerowanych wcześniejszą wersją stylu (do odświeżenia). */
export async function outdatedArticleImages(): Promise<Set<string>> {
  try {
    const rows = await system((tx) => tx<{ key: string }[]>`select key from article_images where style_version < ${ART_STYLE_VERSION}`);
    return new Set(rows.map((r) => r.key));
  } catch {
    return new Set();
  }
}

export async function generateArticleImage(key: string): Promise<{ ok: true; model: string } | { ok: false; error: string }> {
  const job = allArticleImageJobs().find((j) => j.key === key);
  if (!job) return { ok: false, error: "Nieznana grafika." };
  const r = await generateImageBytes(`${job.prompt}\n\n${ART_STYLE}`, "landscape");
  if (!r.ok) return r;
  await system((tx) => tx`insert into article_images (key, mime, data, model, style_version) values (${key}, ${r.mime}, ${r.data}, ${r.model}, ${ART_STYLE_VERSION})
                          on conflict (key) do update set mime = excluded.mime, data = excluded.data, model = excluded.model, style_version = excluded.style_version, updated_at = now()`);
  invalidateArticleImages();
  return { ok: true, model: r.model };
}

// ---------------------------------------------------------------------------
// Generowanie hurtowe w tle: wszystkie brakujące ilustracje, po 2 naraz, z ponowieniem przy limitach OpenAI.
// Stan żyje w procesie serwera (jedna instancja) – po restarcie wystarczy kliknąć ponownie: generują się tylko brakujące.
// ---------------------------------------------------------------------------
export interface BulkStatus {
  running: boolean;
  total: number;
  done: number;
  failed: { key: string; error: string }[];
  current: string[];
  startedAt: number;
  finishedAt: number | null;
  stoppedReason: string | null;
}
const g = globalThis as unknown as { __duoBulk?: BulkStatus };
export const bulkStatus = (): BulkStatus | null => g.__duoBulk ?? null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const retryable = (e: string) => /429|rate|limit|timeout|ECONNRESET|5\d\d|overloaded|temporarily/i.test(e);

/** mode „missing” – brakujące; „outdated” – brakujące i te w starym stylu. */
export async function startBulkGeneration(mode: "missing" | "outdated" = "missing", concurrency = 2): Promise<{ started: boolean; total: number }> {
  if (g.__duoBulk?.running) return { started: false, total: g.__duoBulk.total };
  invalidateArticleImages();
  const have = await articleImageMap();
  const old = mode === "outdated" ? await outdatedArticleImages() : new Set<string>();
  const todo = allArticleImageJobs().filter((j) => !have[j.key] || old.has(j.key));
  const st: BulkStatus = { running: todo.length > 0, total: todo.length, done: 0, failed: [], current: [], startedAt: Date.now(), finishedAt: todo.length ? null : Date.now(), stoppedReason: null };
  g.__duoBulk = st;
  if (!todo.length) return { started: false, total: 0 };
  let next = 0;
  let consecutiveFails = 0;
  const worker = async () => {
    while (st.running && next < todo.length) {
      const job = todo[next++];
      st.current.push(job.key);
      let r: Awaited<ReturnType<typeof generateArticleImage>> = { ok: false, error: "" };
      for (let attempt = 0; attempt < 4; attempt++) {
        r = await generateArticleImage(job.key).catch((e) => ({ ok: false as const, error: String(e?.message ?? e) }));
        if (r.ok || !retryable(r.error)) break;
        await sleep(15_000 * (attempt + 1));
      }
      st.current = st.current.filter((k) => k !== job.key);
      if (r.ok) { st.done++; consecutiveFails = 0; }
      else {
        st.failed.push({ key: job.key, error: r.error.slice(0, 300) });
        // ten sam błąd kilka razy z rzędu (brak klucza, model, limit konta) – przerywamy, żeby nie mnożyć kosztów i błędów
        if (++consecutiveFails >= 3) { st.running = false; st.stoppedReason = `Przerwano po 3 błędach z rzędu: ${r.error.slice(0, 200)}`; }
      }
    }
  };
  void Promise.all(Array.from({ length: Math.min(concurrency, todo.length) }, worker)).finally(() => {
    st.running = false;
    st.finishedAt = Date.now();
    invalidateArticleImages();
  });
  return { started: true, total: todo.length };
}

export function stopBulkGeneration() {
  if (g.__duoBulk?.running) { g.__duoBulk.running = false; g.__duoBulk.stoppedReason = "Zatrzymano ręcznie."; }
}
