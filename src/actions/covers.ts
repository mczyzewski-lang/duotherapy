"use server";

// Okładki zdjęciowe materiałów (tylko administrator): generowanie przez OpenAI i usuwanie.
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCoverPhoto, invalidateCoverPhotos } from "@/lib/cover-photos";
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
