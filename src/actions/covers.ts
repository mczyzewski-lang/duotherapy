"use server";

// Okładki zdjęciowe materiałów (tylko administrator): generowanie przez OpenAI i usuwanie.
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCoverPhoto, invalidateCoverPhotos } from "@/lib/cover-photos";
import { allArticleImageJobs, articleImageJobs, articleImageMap, generateArticleImage, invalidateArticleImages, startBulkGeneration, stopBulkGeneration } from "@/lib/article-images";
import { coverGenConfigured } from "@/lib/cover-photos";
import { COVERS } from "@/knowledge/covers";

type R = { error?: string; ok?: string } | undefined;

export async function generateCoverAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  if (!COVERS[slug]) return { error: "Nieznany materiał." };
  const r = await generateCoverPhoto(slug);
  if (!r.ok) return { error: r.error };
  await asStaff(s, (tx) => audit(tx, s.actor, "cover_generated", "cover", null, null, { slug }));
  revalidatePath("/app/wiedza");
  return { ok: `Okładka gotowa (${r.model}) – widać ją już na stronie.` };
}

export async function deleteCoverAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  await asStaff(s, async (tx) => {
    await tx`delete from cover_images where slug = ${slug}`;
    await audit(tx, s.actor, "cover_deleted", "cover", null, null, { slug });
  });
  invalidateCoverPhotos();
  revalidatePath("/app/wiedza");
  return { ok: "Usunięto – wraca okładka bez zdjęcia." };
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
export async function generateAllArticleImagesAction(_: R): Promise<R> {
  const s = await requireStaff("admin");
  if (!coverGenConfigured()) return { error: "Brak OPENAI_API_KEY na serwerze." };
  const r = await startBulkGeneration();
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
