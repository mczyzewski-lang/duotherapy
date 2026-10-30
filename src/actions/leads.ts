"use server";

import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { LEAD_STAGES } from "@/lib/leads";



type R = { error?: string; ok?: string } | undefined;

export async function leadStageAction(fd: FormData) {
  const s = await requireStaff();
  const id = String(fd.get("lead_id"));
  const stage = String(fd.get("stage"));
  if (!LEAD_STAGES.some(([k]) => k === stage) || stage === "converted") return;
  await asStaff(s, async (tx) => {
    const [old] = await tx`select stage from leads where id = ${id}`;
    await tx`update leads set stage = ${stage}, lost_reason = ${stage === "lost" ? String(fd.get("lost_reason") ?? "") || null : null}, updated_at = now() where id = ${id}`;
    const label = (k: string) => LEAD_STAGES.find(([x]) => x === k)?.[1] ?? k;
    await tx`insert into lead_activities (lead_id, user_id, kind, content) values (${id}, ${s.user.id}, 'stage', ${`${label(old.stage)} → ${label(stage)}`})`;
    await audit(tx, s.actor, "lead_stage", "lead", id, null, { stage });
  });
  revalidatePath("/app/leads");
  revalidatePath(`/app/leads/${id}`);
}

export async function leadNoteAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const id = String(fd.get("lead_id"));
  const kind = String(fd.get("kind"));
  const content = String(fd.get("content") ?? "").trim();
  if (!content) return { error: "Wpisz treść." };
  if (!["note", "call", "email"].includes(kind)) return { error: "Nieznany typ." };
  await asStaff(s, async (tx) => {
    await tx`insert into lead_activities (lead_id, user_id, kind, content) values (${id}, ${s.user.id}, ${kind}, ${content})`;
    await tx`update leads set updated_at = now() where id = ${id}`;
  });
  revalidatePath(`/app/leads/${id}`);
  return { ok: "Dodano do historii kontaktu." };
}

export async function leadDetailsAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const id = String(fd.get("lead_id"));
  const callAt = String(fd.get("call_at") ?? "");
  const therapist = String(fd.get("assigned_therapist_id") ?? "") || null;
  await asStaff(s, async (tx) => {
    await tx`update leads set call_at = ${callAt ? new Date(callAt) : null}, assigned_therapist_id = ${therapist},
             stage = case when ${Boolean(callAt)} and stage in ('new', 'contacted') then 'call_scheduled' else stage end, updated_at = now() where id = ${id}`;
    await audit(tx, s.actor, "lead_updated", "lead", id);
  });
  revalidatePath(`/app/leads/${id}`);
  return { ok: "Zapisano." };
}
