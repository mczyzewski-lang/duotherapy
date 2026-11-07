"use server";

// Okładki zdjęciowe materiałów (tylko administrator): generowanie przez OpenAI i usuwanie.
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { coverGenConfigured, coverState, generateCoverPhoto, invalidateCoverPhotos, type CoverVariant } from "@/lib/cover-photos";
import { runBulk, stopBulk } from "@/lib/bulk";
import { MAGNETS } from "@/knowledge/registry";
import { isLegacyArtCover } from "@/lib/cover-url";
import { allArticleImageJobs, articleImageJobs, articleImageMap, generateArticleImage, invalidateArticleImages, startBulkGeneration, stopBulkGeneration } from "@/lib/article-images";
import { COVERS } from "@/knowledge/covers";

type R = { error?: string; ok?: string } | undefined;

const variantOf = (fd: FormData): CoverVariant => (fd.get("variant") === "illustration" ? "illustration" : "photo");

export async function generateCoverAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  const variant = variantOf(fd);
  if (!COVERS[slug]) return { error: "Nieznany materiał." };
  const r = await generateCoverPhoto(slug, variant);
  if (!r.ok) return { error: r.error };
  await asStaff(s, (tx) => audit(tx, s.actor, "cover_generated", "cover", null, null, { slug, variant }));
  revalidatePath("/app/wiedza");
  return { ok: `Gotowe (${r.model}).` };
}

export async function deleteCoverAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  const variant = variantOf(fd);
  await asStaff(s, async (tx) => {
    await tx`delete from cover_images where slug = ${slug} and variant = ${variant}`;
    await audit(tx, s.actor, "cover_deleted", "cover", null, null, { slug, variant });
  });
  invalidateCoverPhotos();
  revalidatePath("/app/wiedza");
  return { ok: "Usunięto." };
}

/** Globalny wybór: co pokazuje strona – zdjęcia czy grafiki 2D. */
export async function setCoverStyleAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const style = variantOf(fd);
  await asStaff(s, async (tx) => {
    await tx`insert into app_settings (key, value, updated_by, updated_at) values ('covers', ${tx.json({ style })}, ${s.user.id}, now())
             on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
    await audit(tx, s.actor, "cover_style_set", "app_settings", null, null, { style });
  });
  invalidateCoverPhotos();
  revalidatePath("/", "layout");
  return { ok: style === "illustration" ? "Na stronie są teraz grafiki 2D." : "Na stronie są teraz zdjęcia." };
}

/** Wszystkie brakujące okładki danego wariantu – w tle. */
export async function generateMissingCoversAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  if (!coverGenConfigured()) return { error: "Brak OPENAI_API_KEY na serwerze." };
  const variant = variantOf(fd);
  const { all } = await coverState();
  // „legacy” – także grafiki 2D w starym (pionowym) układzie
  const legacy = fd.get("legacy") === "1" && variant === "illustration";
  const todo = MAGNETS.filter((m) => COVERS[m.slug] && (!all[variant][m.slug] || (legacy && isLegacyArtCover(all.illustration[m.slug]))));
  if (!todo.length) return { ok: "Wszystkie okładki tego wariantu są gotowe." };
  const started = runBulk("covers", todo.map((m) => ({ key: m.slug, run: () => generateCoverPhoto(m.slug, variant) })), { onDone: invalidateCoverPhotos });
  if (!started) return { ok: "Generowanie okładek już trwa." };
  await asStaff(s, (tx) => audit(tx, s.actor, "covers_bulk_started", "cover", null, null, { variant, count: todo.length }));
  revalidatePath("/app/wiedza");
  return { ok: `Start: ${todo.length} okładek w tle.` };
}

export async function stopCoversAction(_: R): Promise<R> {
  await requireStaff("admin");
  stopBulk("covers");
  revalidatePath("/app/wiedza");
  return { ok: "Zatrzymano po bieżących okładkach." };
}

/** Jedna ilustracja artykułu. */
export async function generateArticleImageAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const key = String(fd.get("key") ?? "");
  if (!allArticleImageJobs().some((j) => j.key === key)) return { error: "Nieznana grafika." };
  const r = await generateArticleImage(key);
  if (!r.ok) return { error: r.error };
  await asStaff(s, (tx) => audit(tx, s.actor, "article_image_generated", "article_image", null, null, { key }));
  revalidatePath("/app/wiedza");
  return { ok: `Gotowe (${r.model}).` };
}

/** Wszystkie brakujące ilustracje jednego artykułu – po kolei (każda ok. 30–60 s). */
export async function generateArticleMissingAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  const have = await articleImageMap();
  const todo = articleImageJobs(slug).filter((j) => !have[j.key]);
  if (!todo.length) return { ok: "Wszystkie grafiki tego artykułu są już gotowe." };
  let done = 0;
  for (const j of todo) {
    const r = await generateArticleImage(j.key);
    if (!r.ok) return { error: `Wygenerowano ${done} z ${todo.length}. Błąd: ${r.error}` };
    done++;
  }
  await asStaff(s, (tx) => audit(tx, s.actor, "article_images_generated", "article_image", null, null, { slug, count: done }));
  revalidatePath("/app/wiedza");
  return { ok: `Wygenerowano ${done} grafik.` };
}

export async function deleteArticleImageAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const key = String(fd.get("key") ?? "");
  await asStaff(s, async (tx) => {
    await tx`delete from article_images where key = ${key}`;
    await audit(tx, s.actor, "article_image_deleted", "article_image", null, null, { key });
  });
  invalidateArticleImages();
  revalidatePath("/app/wiedza");
  return { ok: "Usunięto." };
}

/** Wszystkie brakujące ilustracje wszystkich artykułów – w tle (postęp widać w panelu, strona sama się odświeża). */
export async function generateAllArticleImagesAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  if (!coverGenConfigured()) return { error: "Brak OPENAI_API_KEY na serwerze." };
  const r = await startBulkGeneration(fd.get("mode") === "outdated" ? "outdated" : "missing");
  if (!r.started) return r.total ? { ok: "Generowanie już trwa." } : { ok: "Wszystkie grafiki są gotowe." };
  await asStaff(s, (tx) => audit(tx, s.actor, "article_images_bulk_started", "article_image", null, null, { count: r.total }));
  revalidatePath("/app/wiedza");
  return { ok: `Start: ${r.total} grafik w tle. Możesz zamknąć tę stronę – generowanie trwa na serwerze.` };
}

export async function stopAllArticleImagesAction(_: R): Promise<R> {
  await requireStaff("admin");
  stopBulkGeneration();
  revalidatePath("/app/wiedza");
  return { ok: "Zatrzymano po bieżących grafikach." };
}
