"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { advanceStatus, CASE_STATUSES, createCase, recomputeStatus, saveAnswer } from "@/lib/cases";
import { encrypt } from "@/lib/crypto";
import { env } from "@/lib/env";
import { createInvitation } from "@/lib/participant-auth";
import { readSettings } from "@/lib/settings";
import type { AnswerState } from "@/questionnaires/types";

type R = { error?: string; ok?: string } | undefined;
const caseOfParticipant = async (tx: Parameters<Parameters<typeof asStaff>[1]>[0], pid: string) => {
  const [p] = await tx`select case_id from participants where id = ${pid}`;
  if (!p) throw new Error("Brak dostępu");
  return p.case_id as string;
};

const ParticipantSchema = z.object({ name: z.string().trim().min(2, "Podaj imię uczestnika."), gender: z.enum(["male", "female"]), email: z.string().trim().email().or(z.literal("")).optional(), phone: z.string().trim().max(40).optional() });

export async function createCaseAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const kind = fd.get("kind") === "couple" ? "couple" : "individual";
  const parts = (kind === "couple" ? [1, 2] : [1]).map((i) => ({
    name: String(fd.get(`p${i}_name`) ?? ""),
    gender: String(fd.get(`p${i}_gender`) ?? ""),
    email: String(fd.get(`p${i}_email`) ?? ""),
    phone: String(fd.get(`p${i}_phone`) ?? ""),
  }));
  const parsed = z.array(ParticipantSchema).safeParse(parts);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const therapistId = String(fd.get("therapist_id") || s.user.therapistId || "");
  if (!therapistId) return { error: "Wybierz psychologa prowadzącego." };
  if (s.user.role !== "admin" && therapistId !== s.user.therapistId) return { error: "Możesz zakładać sprawy tylko dla siebie." };
  const leadId = String(fd.get("lead_id") || "") || null;
  const id = await asStaff(s, (tx) =>
    createCase(tx, s.actor as never, {
      kind,
      therapistId,
      participants: parsed.data.map((p) => ({ ...p, email: p.email || undefined })),
      goal: String(fd.get("goal") ?? "") || undefined,
      intent: (String(fd.get("intent") || "") || null) as never,
      leadId,
      isDemo: env.demoMode,
    }),
  );
  redirect(`/app/cases/${id}`);
}

export async function updateCaseAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const id = String(fd.get("case_id"));
  const status = String(fd.get("status"));
  if (!CASE_STATUSES.some(([k]) => k === status)) return { error: "Nieznany status." };
  const payment = String(fd.get("payment_status"));
  if (!["unpaid", "paid", "waived"].includes(payment)) return { error: "Nieznany status płatności." };
  const secrets = String(fd.get("secrets_rule") || "") || null;
  const therapist = String(fd.get("therapist_id") || "") || null;
  await asStaff(s, async (tx) => {
    await tx`update cases set status = ${status}, payment_status = ${payment}, payment_note = ${String(fd.get("payment_note") ?? "") || null},
             goal = ${String(fd.get("goal") ?? "") || null}, secrets_rule = ${secrets},
             therapist_id = coalesce(${s.user.role === "admin" ? therapist : null}, therapist_id),
             closed_at = case when ${status} = 'closed' then now() else null end, updated_at = now() where id = ${id}`;
    await audit(tx, s.actor, "case_updated", "case", id, id, { status, payment });
  });
  revalidatePath(`/app/cases/${id}`);
  return { ok: "Zapisano." };
}

export async function generateInviteAction(participantId: string): Promise<{ url: string; code: string } | { error: string }> {
  const s = await requireStaff();
  return asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, participantId);
    const st = await readSettings(tx);
    const inv = await createInvitation(tx, participantId, s.user.id, st.flow.invitationDays);
    await recomputeStatus(tx, caseId);
    await audit(tx, s.actor, "invitation_created", "invitation", inv.id, caseId);
    revalidatePath(`/app/cases/${caseId}`);
    return { url: inv.url, code: inv.code };
  });
}

export async function revokeInviteAction(fd: FormData) {
  const s = await requireStaff();
  const pid = String(fd.get("participant_id"));
  await asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, pid);
    await tx`update invitations set revoked_at = now() where participant_id = ${pid} and revoked_at is null`;
    await tx`update participant_sessions set revoked_at = now() where participant_id = ${pid} and revoked_at is null`;
    await audit(tx, s.actor, "invitation_revoked", "participant", pid, caseId);
    revalidatePath(`/app/cases/${caseId}`);
  });
}

export async function reopenQuestionnaireAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const pid = String(fd.get("participant_id"));
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 3) return { error: "Podaj powód ponownego otwarcia (np. prośba klienta)." };
  await asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, pid);
    await tx`update participants set q_status = 'reopened', reopened_by = ${s.user.id}, reopened_at = now(), reopen_reason = ${reason} where id = ${pid}`;
    await audit(tx, s.actor, "questionnaire_reopened", "participant", pid, caseId);
    revalidatePath(`/app/cases/${caseId}`);
  });
  return { ok: "Kwestionariusz otwarty do poprawy. Każda zmiana klienta będzie zapisana w historii." };
}

export async function correctAnswerAction(participantId: string, questionId: string, state: AnswerState, value: unknown, reason: string) {
  const s = await requireStaff();
  return asStaff(s, async (tx) => {
    const r = await saveAnswer(tx, s.actor, participantId, questionId, state, value, reason);
    const caseId = await caseOfParticipant(tx, participantId);
    revalidatePath(`/app/cases/${caseId}/answers`);
    return r;
  });
}

export async function addSlotAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const caseId = String(fd.get("case_id"));
  const when = new Date(String(fd.get("starts_at")));
  if (isNaN(when.getTime()) || when < new Date()) return { error: "Podaj przyszły termin." };
  await asStaff(s, async (tx) => {
    const [c] = await tx`select session_minutes from cases where id = ${caseId}`;
    await tx`insert into session_slots (case_id, starts_at, minutes, created_by) values (${caseId}, ${when}, ${c.session_minutes}, ${s.user.id})`;
    await audit(tx, s.actor, "slot_offered", "case", caseId, caseId);
  });
  revalidatePath(`/app/cases/${caseId}`);
  return { ok: "Termin dodany – klient zobaczy go pod swoim linkiem." };
}

export async function slotAction(fd: FormData) {
  const s = await requireStaff();
  const slotId = String(fd.get("slot_id"));
  const op = String(fd.get("op"));
  await asStaff(s, async (tx) => {
    const [slot] = await tx`select case_id, starts_at from session_slots where id = ${slotId}`;
    if (!slot) return;
    if (op === "confirm") {
      await tx`update session_slots set status = 'cancelled' where case_id = ${slot.case_id} and id <> ${slotId} and status in ('offered', 'chosen')`;
      await tx`update session_slots set status = 'confirmed' where id = ${slotId}`;
      await tx`update cases set session_at = ${slot.starts_at}, updated_at = now() where id = ${slot.case_id}`;
    } else {
      await tx`update session_slots set status = 'cancelled' where id = ${slotId}`;
    }
    await audit(tx, s.actor, `slot_${op}`, "session_slot", slotId, slot.case_id);
    revalidatePath(`/app/cases/${slot.case_id}`);
  });
}

export async function riskReviewAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const pid = String(fd.get("participant_id"));
  const status = String(fd.get("status"));
  if (!["needs_review", "contacted", "reviewed", "safety_path"].includes(status)) return { error: "Nieznany status." };
  const note = String(fd.get("note") ?? "").trim();
  await asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, pid);
    await tx`update risk_review_statuses set status = ${status}, note_enc = ${note ? encrypt(note) : null}, reviewed_by = ${s.user.id}, reviewed_at = now(), updated_at = now()
             where participant_id = ${pid}`;
    await audit(tx, s.actor, "risk_review_updated", "participant", pid, caseId, { status });
    revalidatePath(`/app/cases/${caseId}`);
  });
  return { ok: "Zapisano status przeglądu." };
}

export async function recordDisclosureAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const pid = String(fd.get("participant_id"));
  const scope = String(fd.get("scope") ?? "").trim();
  if (scope.length < 5) return { error: "Opisz zakres zgody (co i komu może zostać ujawnione)." };
  await asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, pid);
    await tx`insert into consents (participant_id, kind, granted, text_version, text_snapshot, recorded_by, scope)
             values (${pid}, 'disclosure_to_partner', ${fd.get("granted") === "on"}, 'odnotowana przez psychologa', ${"Zgoda na ujawnienie drugiej osobie: " + scope}, ${s.user.id}, ${scope})`;
    await audit(tx, s.actor, "disclosure_consent_recorded", "participant", pid, caseId);
    revalidatePath(`/app/cases/${caseId}`);
  });
  return { ok: "Odnotowano zgodę." };
}

export async function sessionAction(fd: FormData) {
  const s = await requireStaff();
  const caseId = String(fd.get("case_id"));
  const op = String(fd.get("op"));
  await asStaff(s, async (tx) => {
    if (op === "start") await tx`update cases set session_started_at = coalesce(session_started_at, now()) where id = ${caseId}`;
    if (op === "end") {
      await tx`update cases set session_ended_at = now() where id = ${caseId}`;
      await advanceStatus(tx, caseId, "session_done");
    }
    await audit(tx, s.actor, `session_${op}`, "case", caseId, caseId);
  });
  revalidatePath(`/app/cases/${caseId}`);
  if (op === "end") redirect(`/app/cases/${caseId}?tab=reports`);
}

// ---------------------------------------------------------------------------
// Notatki psychologa (zawsze oddzielone od odpowiedzi klienta)
// ---------------------------------------------------------------------------
const NoteSchema = z.object({
  caseId: z.string().uuid(),
  participantId: z.string().uuid().nullable(),
  questionId: z.string().uuid().nullable(),
  kind: z.enum(["private", "discussed", "report"]),
  jointOk: z.boolean(),
  tags: z.array(z.enum(["to_check", "important", "discussed"])).max(3),
  body: z.string().trim().min(1).max(20000),
  stage: z.string().max(80).nullable(),
});

export async function saveNoteAction(input: z.input<typeof NoteSchema> & { id?: string }) {
  const s = await requireStaff();
  const d = NoteSchema.safeParse(input);
  if (!d.success) return { error: "Notatka jest pusta lub niepoprawna." };
  const n = d.data;
  return asStaff(s, async (tx) => {
    let id = input.id;
    if (id) {
      await tx`update session_notes set kind = ${n.kind}, joint_ok = ${n.kind === "report" && n.jointOk}, tags = ${n.tags}, body_enc = ${encrypt(n.body)}, updated_at = now()
               where id = ${id} and case_id = ${n.caseId}`;
    } else {
      const [r] = await tx<{ id: string }[]>`
        insert into session_notes (case_id, participant_id, question_id, kind, joint_ok, tags, stage, body_enc, created_by)
        values (${n.caseId}, ${n.participantId}, ${n.questionId}, ${n.kind}, ${n.kind === "report" && n.jointOk}, ${n.tags}, ${n.stage}, ${encrypt(n.body)}, ${s.user.id})
        returning id`;
      id = r.id;
    }
    await audit(tx, s.actor, input.id ? "note_updated" : "note_created", "session_note", id!, n.caseId, { kind: n.kind });
    return { id };
  });
}

export async function deleteNoteAction(noteId: string, caseId: string) {
  const s = await requireStaff();
  await asStaff(s, async (tx) => {
    await tx`delete from session_notes where id = ${noteId} and case_id = ${caseId}`;
    await audit(tx, s.actor, "note_deleted", "session_note", noteId, caseId);
  });
  revalidatePath(`/app/cases/${caseId}`);
}

// ---------------------------------------------------------------------------
// Prawa osoby, której dane dotyczą
// ---------------------------------------------------------------------------
export async function anonymizeParticipantAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const pid = String(fd.get("participant_id"));
  if (fd.get("confirm") !== "USUŃ") return { error: "Wpisz USUŃ, aby potwierdzić." };
  await asStaff(s, async (tx) => {
    const caseId = await caseOfParticipant(tx, pid);
    await tx`delete from answer_revisions where participant_id = ${pid}`;
    await tx`delete from answers where participant_id = ${pid}`;
    await tx`delete from session_notes where participant_id = ${pid}`;
    await tx`update invitations set revoked_at = now() where participant_id = ${pid} and revoked_at is null`;
    await tx`update participants set display_name = 'Usunięto', email = null, phone = null, anonymized_at = now() where id = ${pid}`;
    await audit(tx, s.actor, "participant_anonymized", "participant", pid, caseId);
  });
  return { ok: "Odpowiedzi, notatki i dane kontaktowe uczestnika zostały usunięte. Rejestr zgód i dziennik audytowy pozostają zgodnie z polityką retencji." };
}
