// Zdjęciowe okładki materiałów: generowanie (OpenAI Images, klucz OPENAI_API_KEY na serwerze), zapis w bazie i lista dostępnych.
import { system } from "./db";
import { COVERS } from "@/knowledge/covers";

export const COVER_STYLE = [
  "Editorial documentary photograph, natural light, warm muted palette (ivory, sand, terracotta, deep green), subtle film grain, shallow depth of field.",
  "Emotional, quiet, intimate, honest – not a stock photo, no posed smiling couples.",
  "No text, no letters, no logos, no watermarks. If people appear, faces are not clearly visible (profile, back, hands, silhouette).",
  "Vertical composition with calm empty space in the upper third for a title overlay.",
].join(" ");

export const coverGenConfigured = () => Boolean(process.env.OPENAI_API_KEY);
export const coverPhotoUrl = (slug: string, v: Date | number) => `/wiedza-okladki/${slug}?v=${new Date(v).getTime()}`;

let cache: { at: number; map: Record<string, string> } | null = null;

/** slug → adres zdjęcia okładki (tylko materiały, które mają wygenerowane zdjęcie). Bez bazy – pusta lista. */
export async function coverPhotoMap(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.map;
  try {
    const rows = await system((tx) => tx<{ slug: string; updated_at: Date }[]>`select slug, updated_at from cover_images`);
    const map = Object.fromEntries(rows.map((r) => [r.slug, coverPhotoUrl(r.slug, r.updated_at)]));
    cache = { at: Date.now(), map };
    return map;
  } catch {
    return {};
  }
}
export const invalidateCoverPhotos = () => { cache = null; };

/** Generuje zdjęcie okładki na podstawie projektu (photoBrief) i zapisuje w bazie. */
export async function generateCoverPhoto(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const brief = COVERS[slug]?.photoBrief;
  if (!brief) return { ok: false, error: "Brak projektu zdjęcia dla tego materiału." };
  if (!coverGenConfigured()) return { ok: false, error: "Brak OPENAI_API_KEY w zmiennych środowiskowych aplikacji." };
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: `${brief}\n\n${COVER_STYLE}`, size: "1024x1536", quality: "high", output_format: "webp", output_compression: 82, n: 1 }),
      signal: AbortSignal.timeout(180_000),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string }[]; error?: { message?: string } };
    const b64 = json.data?.[0]?.b64_json;
    if (!res.ok || !b64) return { ok: false, error: `OpenAI: ${json.error?.message ?? `HTTP ${res.status}`}` };
    const data = Buffer.from(b64, "base64");
    await system((tx) => tx`insert into cover_images (slug, mime, data, model) values (${slug}, 'image/webp', ${data}, ${model})
                            on conflict (slug) do update set mime = excluded.mime, data = excluded.data, model = excluded.model, updated_at = now()`);
    invalidateCoverPhotos();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).name === "TimeoutError" ? "OpenAI nie odpowiedział w 3 minuty – spróbuj ponownie." : (e as Error).message };
  }
}
