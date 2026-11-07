// Ilustracje artykułów: generowanie (OpenAI, klucz na serwerze), zapis w bazie, lista dostępnych.
import { system } from "./db";
import { generateImageBytes } from "./cover-photos";
import { bulkStatus as bulkStatusOf, runBulk, stopBulk } from "./bulk";
import { ARTICLES, articleBySlug } from "@/content/articles";

export { ART_STYLE, ART_STYLE_VERSION } from "./art-style";
import { ART_STYLE, ART_STYLE_VERSION } from "./art-style";
import { artPromptExtra, withExtra } from "./art-extra";

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
  const r = await generateImageBytes(withExtra(`${job.prompt}\n\n${ART_STYLE}`, await artPromptExtra()), "landscape");
  if (!r.ok) return r;
  await system((tx) => tx`insert into article_images (key, mime, data, model, style_version) values (${key}, ${r.mime}, ${r.data}, ${r.model}, ${ART_STYLE_VERSION})
                          on conflict (key) do update set mime = excluded.mime, data = excluded.data, model = excluded.model, style_version = excluded.style_version, updated_at = now()`);
  invalidateArticleImages();
  return { ok: true, model: r.model };
}

// Generowanie hurtowe w tle (wspólny mechanizm z src/lib/bulk.ts).
export const bulkStatus = () => bulkStatusOf("articles");
export const stopBulkGeneration = () => stopBulk("articles");

/** mode „missing” – brakujące; „outdated” – brakujące i te w starym stylu. */
export async function startBulkGeneration(mode: "missing" | "outdated" = "missing"): Promise<{ started: boolean; total: number }> {
  const cur = bulkStatusOf("articles");
  if (cur?.running) return { started: false, total: cur.total };
  invalidateArticleImages();
  const have = await articleImageMap();
  const old = mode === "outdated" ? await outdatedArticleImages() : new Set<string>();
  const todo = allArticleImageJobs().filter((j) => !have[j.key] || old.has(j.key));
  const started = runBulk("articles", todo.map((j) => ({ key: j.key, run: () => generateArticleImage(j.key) })), { onDone: invalidateArticleImages });
  return { started, total: todo.length };
}
