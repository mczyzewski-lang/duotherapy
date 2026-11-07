// Zdjęciowe okładki materiałów: generowanie (OpenAI Images, klucz OPENAI_API_KEY na serwerze), zapis w bazie i lista dostępnych.
import { system } from "./db";
import { COVERS } from "@/knowledge/covers";
import { ART_STYLE } from "./art-style";

export const COVER_STYLE = [
  "Editorial documentary photograph, natural light, warm muted palette (ivory, sand, terracotta, deep green), subtle film grain, shallow depth of field.",
  "Emotional, quiet, intimate, honest – not a stock photo, no posed smiling couples.",
  "No text, no letters, no logos, no watermarks. If people appear, faces are not clearly visible (profile, back, hands, silhouette).",
  "Vertical composition with calm empty space in the upper third for a title overlay.",
].join(" ");

export const coverGenConfigured = () => Boolean(process.env.OPENAI_API_KEY);
/** Wariant okładki: zdjęcie albo grafika 2D (maskotki DUO). Który pokazuje strona – globalny wybór w panelu. */
import { coverPhotoUrl, type CoverVariant } from "./cover-url";
export { coverPhotoUrl, isIllustrationCover, type CoverVariant } from "./cover-url";
export const COVER_VARIANTS: CoverVariant[] = ["photo", "illustration"];
export const COVER_VARIANT_LABEL: Record<CoverVariant, string> = { photo: "Zdjęcie", illustration: "Grafika 2D" };

/** Kompozycja okładki 2D: pion, jasne tło, pusta górna część na tytuł. */
export const COVER_ART_STYLE = `${ART_STYLE} Vertical book-cover composition: keep the upper 38% and the bottom 18% as calm empty ivory background (title on top, a short quote at the bottom); place the scene in the middle band.`;


let cache: { at: number; style: CoverVariant; map: Record<string, string>; all: Record<CoverVariant, Record<string, string>> } | null = null;

async function load() {
  if (cache && Date.now() - cache.at < 30_000) return cache;
  try {
    const [rows, st] = await system(async (tx) => [
      await tx<{ slug: string; variant: CoverVariant; updated_at: Date }[]>`select slug, variant, updated_at from cover_images`,
      await tx<{ value: { style?: string } }[]>`select value from app_settings where key = 'covers'`,
    ] as const);
    const style: CoverVariant = st[0]?.value?.style === "illustration" ? "illustration" : "photo";
    const all: Record<CoverVariant, Record<string, string>> = { photo: {}, illustration: {} };
    for (const r of rows) all[r.variant][r.slug] = coverPhotoUrl(r.slug, r.updated_at, r.variant);
    cache = { at: Date.now(), style, map: all[style], all };
  } catch {
    cache = { at: Date.now(), style: "photo", map: {}, all: { photo: {}, illustration: {} } };
  }
  return cache;
}

/** slug → adres okładki w wariancie wybranym globalnie (tylko materiały, które mają ten wariant). Bez bazy – pusta lista. */
export async function coverPhotoMap(): Promise<Record<string, string>> {
  return (await load()).map;
}
/** Aktywny wariant i oba zestawy – do panelu. */
export async function coverState() {
  const c = await load();
  return { style: c.style, all: c.all };
}
export const invalidateCoverPhotos = () => { cache = null; };

// Modele obrazów próbowane po kolei (dostęp zależy od konta / projektu OpenAI). OPENAI_IMAGE_MODEL – wymuszenie modelu.
const IMAGE_MODELS = ["gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini", "dall-e-3"];
const modelMissing = (status: number, msg: string) =>
  status === 404 || /does not exist|model_not_found|not have access|must be verified|not supported/i.test(msg);

export type Orientation = "portrait" | "landscape";

async function requestImage(model: string, prompt: string, orientation: Orientation = "portrait"): Promise<{ ok: true; data: Buffer; mime: string } | { ok: false; status: number; error: string }> {
  const dalle = model.startsWith("dall-e");
  const land = orientation === "landscape";
  const body = dalle
    ? { model, prompt, size: land ? "1792x1024" : "1024x1792", quality: "hd", response_format: "b64_json", n: 1 }
    : { model, prompt, size: land ? "1536x1024" : "1024x1536", quality: "high", output_format: "webp", output_compression: 80, n: 1 };
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string }[]; error?: { message?: string } };
  const b64 = json.data?.[0]?.b64_json;
  if (!res.ok || !b64) return { ok: false, status: res.status, error: json.error?.message ?? `HTTP ${res.status}` };
  return { ok: true, data: Buffer.from(b64, "base64"), mime: dalle ? "image/png" : "image/webp" };
}

/** Modele obrazów dostępne dla klucza (do komunikatu, gdy żaden z listy nie działa). */
async function availableImageModels(): Promise<string[]> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, signal: AbortSignal.timeout(20_000) });
    const j = (await res.json()) as { data?: { id: string }[] };
    return (j.data ?? []).map((m) => m.id).filter((id) => /image|dall-e/i.test(id)).sort();
  } catch {
    return [];
  }
}

/** Generuje obraz przez OpenAI – próbuje kolejnych modeli; przy braku dostępu podaje modele dostępne dla klucza. */
export async function generateImageBytes(prompt: string, orientation: Orientation = "portrait"): Promise<{ ok: true; data: Buffer; mime: string; model: string } | { ok: false; error: string }> {
  if (!coverGenConfigured()) return { ok: false, error: "Brak OPENAI_API_KEY w zmiennych środowiskowych aplikacji." };
  const forced = process.env.OPENAI_IMAGE_MODEL;
  const models = forced ? [forced] : IMAGE_MODELS;
  try {
    for (const model of models) {
      const r = await requestImage(model, prompt, orientation);
      if (r.ok) return { ok: true, data: r.data, mime: r.mime, model };
      if (!modelMissing(r.status, r.error)) return { ok: false, error: `OpenAI (${model}): ${r.error}` };
    }
    const avail = await availableImageModels();
    return {
      ok: false,
      error: `Żaden model obrazów nie jest dostępny dla tego klucza (${models.join(", ")}). ${
        avail.length ? `Dostępne modele obrazów: ${avail.join(", ")} – ustaw jeden z nich w zmiennej OPENAI_IMAGE_MODEL.` : "Sprawdź w panelu OpenAI, czy projekt klucza ma dostęp do modeli obrazów (Limits → Model usage) i czy organizacja jest zweryfikowana."
      }`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).name === "TimeoutError" ? "OpenAI nie odpowiedział w 3 minuty – spróbuj ponownie." : (e as Error).message };
  }
}

/** Generuje okładkę (zdjęcie albo grafikę 2D) na podstawie projektu z covers.ts i zapisuje w bazie. */
export async function generateCoverPhoto(slug: string, variant: CoverVariant = "photo"): Promise<{ ok: true; model: string } | { ok: false; error: string }> {
  const c = COVERS[slug];
  const brief = variant === "illustration" ? c?.artBrief : c?.photoBrief;
  if (!brief) return { ok: false, error: "Brak projektu okładki dla tego materiału." };
  const r = await generateImageBytes(`${brief}\n\n${variant === "illustration" ? COVER_ART_STYLE : COVER_STYLE}`, "portrait");
  if (!r.ok) return r;
  await system((tx) => tx`insert into cover_images (slug, variant, mime, data, model) values (${slug}, ${variant}, ${r.mime}, ${r.data}, ${r.model})
                          on conflict (slug, variant) do update set mime = excluded.mime, data = excluded.data, model = excluded.model, updated_at = now()`);
  invalidateCoverPhotos();
  return { ok: true, model: r.model };
}
