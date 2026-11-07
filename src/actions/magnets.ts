"use server";

// Widoczność materiałów na stronie (tylko administrator).
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { invalidateMagnetVisibility } from "@/lib/magnet-visibility";
import { magnetBySlug } from "@/knowledge/registry";

type R = { error?: string; ok?: string } | undefined;

export async function setMagnetVisibilityAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const slug = String(fd.get("slug") ?? "");
  const visible = fd.get("visible") === "1";
  const m = magnetBySlug(slug);
  if (!m) return { error: "Nieznany materiał." };
  await asStaff(s, async (tx) => {
    const [r] = await tx<{ value: { hidden?: string[] } }[]>`select value from app_settings where key = 'magnets' for update`;
    const hidden = new Set(r?.value?.hidden ?? []);
    if (visible) hidden.delete(slug);
    else hidden.add(slug);
    await tx`insert into app_settings (key, value, updated_by, updated_at) values ('magnets', ${tx.json({ hidden: [...hidden] })}, ${s.user.id}, now())
             on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
    await audit(tx, s.actor, visible ? "magnet_shown" : "magnet_hidden", "magnet", null, null, { slug });
  });
  invalidateMagnetVisibility();
  revalidatePath("/", "layout");
  return { ok: visible ? `„${m.short}” jest widoczny na stronie.` : `„${m.short}” jest ukryty na stronie.` };
}
