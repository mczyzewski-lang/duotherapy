// Ilustracje artykułów: generowanie (OpenAI, klucz na serwerze), zapis w bazie, lista dostępnych.
import { system } from "./db";
import { generateImageBytes } from "./cover-photos";
import { ARTICLES, articleBySlug } from "@/content/articles";

/** Wspólny styl: minimalistyczna, profesjonalna ilustracja w barwach DUO, z delikatnymi elementami komiksowymi, bez tekstu. */
export const ART_STYLE = [
  "Minimalist editorial illustration for a couples-therapy article. Flat vector style with subtle paper grain, calm and professional.",
  "Strict palette: deep forest green #36493d, terracotta #a9512f, warm sand #eadccb, ivory background #fbf9f5, soft rose #e07f78, sage #97ac9c.",
  "Light comic-style elements: simple rounded characters without detailed facial features, empty speech bubbles, gentle arrows, simple icons.",
  "Lots of negative space, clean composition, no clutter. Absolutely no text, letters, numbers, captions or logos inside the image.",
  "Respectful and inclusive, no stereotypes, no drama, no violence.",
].join(" ");

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

export async function generateArticleImage(key: string): Promise<{ ok: true; model: string } | { ok: false; error: string }> {
  const job = allArticleImageJobs().find((j) => j.key === key);
  if (!job) return { ok: false, error: "Nieznana grafika." };
  const r = await generateImageBytes(`${job.prompt}\n\n${ART_STYLE}`, "landscape");
  if (!r.ok) return r;
  await system((tx) => tx`insert into article_images (key, mime, data, model) values (${key}, ${r.mime}, ${r.data}, ${r.model})
                          on conflict (key) do update set mime = excluded.mime, data = excluded.data, model = excluded.model, updated_at = now()`);
  invalidateArticleImages();
  return { ok: true, model: r.model };
}
