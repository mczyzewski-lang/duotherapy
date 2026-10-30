"use server";

import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function inquiryStatusAction(fd: FormData) {
  const s = await requireStaff();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["new", "answered", "archived"].includes(status)) return;
  await asStaff(s, async (tx) => {
    await tx`update inquiries set status = ${status}, handled_by = ${s.user.id}, handled_at = now() where id = ${id}`;
    await audit(tx, s.actor, "inquiry_status", "inquiry", id, null, { status });
  });
  revalidatePath("/app/inquiries");
}
