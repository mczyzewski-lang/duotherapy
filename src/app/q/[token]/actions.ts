"use server";

import { revalidatePath } from "next/cache";
import type { AnswerState } from "@/questionnaires/types";
import { isEmptyAnswer, isVisible } from "@/questionnaires/validate";
import { audit } from "@/lib/audit";
import { loadAnswers, saveAnswer } from "@/lib/cases";
import { withActor } from "@/lib/db";
import { env } from "@/lib/env";
import { currentParticipant, verifyInvitationCode } from "@/lib/participant-auth";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { questionnaireNotice, readSettings } from "@/lib/settings";
import { loadVersion } from "@/lib/templates";

export async function verifyCodeAction(token: string, code: string) {
  const r = await verifyInvitationCode(token, code, await clientIp());
  if (r.ok) revalidatePath(`/q/${token}`);
  return r;
}

async function participantOrThrow(token: string) {
  const pid = await currentParticipant(token);
  if (!pid) throw new Error("Sesja wygasła. Odśwież stronę i wpisz kod ponownie.");
  return pid;
}

export async function saveAnswerAction(token: string, questionId: string, state: AnswerState, value: unknown) {
  try {
    const pid = await participantOrThrow(token);
    if (!(await hit(`save:${pid}`, 600, 60))) return { ok: false as const, error: "Zbyt wiele zapisów naraz – spróbuj za chwilę." };
    return await withActor({ kind: "participant", participantId: pid }, async (tx) => {
      const [q] = await tx`select type from questions where id = ${questionId}`;
      const res = await saveAnswer(tx, { kind: "participant", participantId: pid }, pid, questionId, state, value);
      // zgody z kwestionariusza trafiają do rejestru zgód z wersją tekstu
      if (res.ok && q && (q.type === "consent" || q.type === "signature")) {
        const s = await readSettings(tx);
        const [qq] = await tx`select prompt from questions where id = ${questionId}`;
        const granted = q.type === "consent" ? Boolean((value as { granted?: boolean })?.granted) : true;
        const snapshot = q.type === "consent" ? `${questionnaireNotice(s)}\n\n${qq.prompt}` : qq.prompt;
        await tx`insert into consents (participant_id, kind, granted, text_version, text_snapshot)
                 values (${pid}, ${q.type === "consent" ? "data_processing" : "declaration"}, ${granted}, ${s.legal.version}, ${snapshot})`;
        await audit(tx, { kind: "participant", participantId: pid }, "consent_recorded", "participant", pid, null, { kind: q.type, granted });
      }
      return res;
    });
  } catch (e) {
    return { ok: false as const, error: e instanceof Error && e.message.startsWith("Sesja") ? e.message : "Nie udało się zapisać odpowiedzi. Sprawdź połączenie i spróbuj ponownie." };
  }
}

export async function submitAction(token: string) {
  const pid = await participantOrThrow(token);
  return withActor({ kind: "participant", participantId: pid }, async (tx) => {
    const [p] = await tx`select template_version_id, q_status, case_id from participants where id = ${pid}`;
    if (p.q_status === "submitted") return { ok: true as const };
    const s = await readSettings(tx);
    if (!s.legal.approved && !env.demoMode) return { ok: false as const, error: "Formularz jest chwilowo niedostępny. Skontaktuj się z psychologiem prowadzącym." };
    const v = (await loadVersion(tx, p.template_version_id))!;
    const answers = await loadAnswers(tx, pid);
    const byKey: Record<string, unknown> = {};
    const all = v.sections.flatMap((x) => x.questions);
    for (const a of answers) {
      const q = all.find((x) => x.id === a.question_id);
      if (q) byKey[q.key] = a.value;
    }
    const missing = all.filter((q) => {
      if (!q.required || !isVisible(q.show_if, byKey as never)) return false;
      const a = answers.find((x) => x.question_id === q.id);
      return !a || (a.state === "answered" && isEmptyAnswer(q.type, a.value));
    });
    if (missing.length) return { ok: false as const, error: `Uzupełnij wymagane pola: ${missing.map((m) => m.prompt.slice(0, 60)).join("; ")}` };
    await tx`update participants set q_status = 'submitted', q_submitted_at = now() where id = ${pid}`;
    await tx`select app_participant_progress()`;
    await audit(tx, { kind: "participant", participantId: pid }, "questionnaire_submitted", "participant", pid, null);
    return { ok: true as const };
  });
}

export async function chooseSlotAction(token: string, slotId: string) {
  const pid = await participantOrThrow(token);
  return withActor({ kind: "participant", participantId: pid }, async (tx) => {
    const [slot] = await tx`select id, status from session_slots where id = ${slotId}`;
    if (!slot || !["offered", "chosen"].includes(slot.status)) return { ok: false as const, error: "Ten termin nie jest już dostępny." };
    await tx`update session_slots set status = 'offered', chosen_by = null where status = 'chosen' and chosen_by = ${pid}`;
    await tx`update session_slots set status = 'chosen', chosen_by = ${pid} where id = ${slotId} and status = 'offered'`;
    await audit(tx, { kind: "participant", participantId: pid }, "slot_chosen", "session_slot", slotId);
    revalidatePath(`/q/${token}`);
    return { ok: true as const };
  });
}
