// Domena: sprawy, uczestnicy, odpowiedzi, statusy.
import type { AnswerState, AnswerValue } from "@/questionnaires/types";
import { RISK_TRIGGER_TAG, validateAnswer } from "@/questionnaires/validate";
import { audit } from "./audit";
import { decrypt, encrypt } from "./crypto";
import type { Actor, Tx } from "./db";
import { publishedVersionId, type QuestionRow } from "./templates";

export const CASE_STATUSES = [
  ["new", "Nowe zgłoszenie"],
  ["awaiting_questionnaire", "Oczekuje na ankietę"],
  ["questionnaire_partial", "Ankieta częściowo wypełniona"],
  ["ready_for_session", "Gotowe do sesji"],
  ["session_done", "Sesja odbyta"],
  ["report_in_progress", "Podsumowanie w przygotowaniu"],
  ["report_approved", "Podsumowanie zatwierdzone"],
  ["report_shared", "Podsumowanie udostępnione"],
  ["closed", "Zamknięte"],
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number][0];
export const statusLabel = (s: string) => CASE_STATUSES.find(([k]) => k === s)?.[1] ?? s;
const rank = (s: string) => CASE_STATUSES.findIndex(([k]) => k === s);

export const Q_STATUS_LABEL: Record<string, string> = {
  not_started: "Nierozpoczęta",
  in_progress: "W trakcie",
  submitted: "Przekazana",
  reopened: "Otwarta do poprawy",
};

export interface NewParticipant {
  name: string;
  gender: "male" | "female";
  email?: string;
  phone?: string;
}

export async function createCase(
  tx: Tx,
  actor: Actor & { userId: string },
  input: { kind: "individual" | "couple"; therapistId: string; participants: NewParticipant[]; goal?: string; intent?: string | null; leadId?: string | null; isDemo?: boolean },
): Promise<string> {
  if (input.kind === "couple" && input.participants.length !== 2) throw new Error("Konsultacja dla pary wymaga dwóch uczestników");
  if (input.kind === "individual" && input.participants.length !== 1) throw new Error("Konsultacja indywidualna ma jednego uczestnika");
  const year = new Date().getFullYear();
  const [{ n }] = await tx<{ n: number }[]>`select count(*)::int + 1 as n from cases where ref like ${`DUO-${year}-%`}`;
  const ref = `DUO-${year}-${String(n).padStart(4, "0")}${input.isDemo ? "-DEMO" : ""}`;
  const [c] = await tx<{ id: string }[]>`
    insert into cases (ref, kind, therapist_id, goal, intent, session_minutes, lead_id, created_by, is_demo)
    values (${ref}, ${input.kind}, ${input.therapistId}, ${input.goal ?? null}, ${input.intent ?? null}, ${input.kind === "couple" ? 90 : 60},
            ${input.leadId ?? null}, ${actor.userId}, ${input.isDemo ?? false})
    returning id`;
  let pos = 1;
  for (const p of input.participants) {
    const key = `${input.kind}_${p.gender}` as const;
    const versionId = await publishedVersionId(tx, key);
    await tx`insert into participants (case_id, position, display_name, gender, email, phone, template_version_id)
             values (${c.id}, ${pos++}, ${p.name}, ${p.gender}, ${p.email || null}, ${p.phone || null}, ${versionId})`;
  }
  if (input.leadId) await tx`update leads set case_id = ${c.id}, stage = 'converted', updated_at = now() where id = ${input.leadId}`;
  await audit(tx, actor, "case_created", "case", c.id, c.id, { kind: input.kind });
  return c.id;
}

/** Automatyczne przejścia w początkowych etapach (dalsze etapy ustawia psycholog / podsumowanie). */
export async function recomputeStatus(tx: Tx, caseId: string) {
  const [c] = await tx`select status from cases where id = ${caseId}`;
  if (!c || rank(c.status) > rank("ready_for_session")) return;
  const parts = await tx`select p.q_status, (select count(*) from invitations i where i.participant_id = p.id)::int as invs from participants p where case_id = ${caseId}`;
  let next: CaseStatus = "new";
  if (parts.every((p) => p.q_status === "submitted")) next = "ready_for_session";
  else if (parts.some((p) => p.q_status !== "not_started")) next = "questionnaire_partial";
  else if (parts.some((p) => p.invs > 0)) next = "awaiting_questionnaire";
  if (next !== c.status) await tx`update cases set status = ${next}, updated_at = now() where id = ${caseId}`;
}

/** Podnosi status sprawy, jeśli obecny jest "niższy" (nigdy nie cofa automatycznie). */
export async function advanceStatus(tx: Tx, caseId: string, to: CaseStatus) {
  const [c] = await tx`select status from cases where id = ${caseId}`;
  if (c && rank(c.status) < rank(to)) await tx`update cases set status = ${to}, updated_at = now() where id = ${caseId}`;
}

export interface AnswerRow {
  id: string;
  question_id: string;
  state: AnswerState;
  value: AnswerValue;
  updated_at: Date;
  updated_by_user: string | null;
}

export async function loadAnswers(tx: Tx, participantId: string): Promise<AnswerRow[]> {
  const rows = await tx`select id, question_id, state, value_enc, updated_at, updated_by_user from answers where participant_id = ${participantId}`;
  return rows.map((r) => ({ id: r.id, question_id: r.question_id, state: r.state, value: decrypt<AnswerValue>(r.value_enc), updated_at: r.updated_at, updated_by_user: r.updated_by_user }));
}

export type SaveResult = { ok: true; riskTriggered: boolean } | { ok: false; error: string };

/**
 * Zapis odpowiedzi. Uczestnik: tylko własne odpowiedzi i tylko gdy kwestionariusz jest otwarty (RLS + trigger).
 * Psycholog: wyłącznie z podanym powodem (poprawka na prośbę klienta) – zawsze z historią zmian.
 */
export async function saveAnswer(
  tx: Tx,
  actor: Actor,
  participantId: string,
  questionId: string,
  state: AnswerState,
  rawValue: unknown,
  reason?: string,
): Promise<SaveResult> {
  const [q] = await tx<(QuestionRow & { template_version_id: string; q_status: string; case_id: string })[]>`
    select q.*, p.template_version_id, p.q_status, p.case_id from questions q
    join participants p on p.template_version_id = q.version_id
    where q.id = ${questionId} and p.id = ${participantId}`;
  if (!q) return { ok: false, error: "Pytanie nie należy do tego kwestionariusza." };
  const isStaffActor = actor.kind === "admin" || actor.kind === "therapist";
  if (state === "answered" && (rawValue === null || rawValue === undefined)) {
    // wyczyszczenie odpowiedzi (np. odznaczenie „nie dotyczy”)
    if (actor.kind === "participant" && !["not_started", "in_progress", "reopened"].includes(q.q_status)) return { ok: false, error: "Kwestionariusz został już przekazany." };
    if (isStaffActor && !reason?.trim()) return { ok: false, error: "Podaj powód zmiany odpowiedzi (np. prośba klienta)." };
    const [prev] = await tx`select id, state, value_enc from answers where participant_id = ${participantId} and question_id = ${questionId}`;
    if (prev && (isStaffActor || q.q_status === "reopened")) {
      await tx`insert into answer_revisions (answer_id, participant_id, old_state, old_value_enc, new_state, new_value_enc, changed_by_user, changed_by_participant, reason)
               values (${prev.id}, ${participantId}, ${prev.state}, ${prev.value_enc}, 'answered', null, ${isStaffActor ? (actor as { userId: string }).userId : null},
                       ${actor.kind === "participant" ? participantId : null}, ${reason ?? "wyczyszczono odpowiedź"})`;
      await tx`update answers set state = 'answered', value_enc = null, updated_at = now() where id = ${prev.id}`;
    } else if (prev) {
      await tx`delete from answers where id = ${prev.id}`;
    }
    return { ok: true, riskTriggered: false };
  }
  const v = validateAnswer(q, state, rawValue);
  if (!v.ok) return v;
  const isStaff = actor.kind === "admin" || actor.kind === "therapist";
  if (actor.kind === "participant" && !["not_started", "in_progress", "reopened"].includes(q.q_status)) {
    return { ok: false, error: "Kwestionariusz został już przekazany. Zmiany są możliwe tylko po otwarciu przez psychologa." };
  }
  if (isStaff && !reason?.trim()) return { ok: false, error: "Podaj powód zmiany odpowiedzi (np. prośba klienta)." };

  const [prev] = await tx`select id, state, value_enc from answers where participant_id = ${participantId} and question_id = ${questionId}`;
  const enc = v.value === null ? null : encrypt(v.value);
  const userId = isStaff ? (actor as { userId: string }).userId : null;
  const [saved] = await tx<{ id: string }[]>`
    insert into answers (participant_id, question_id, state, value_enc, updated_at, updated_by_user)
    values (${participantId}, ${questionId}, ${state}, ${enc}, now(), ${userId})
    on conflict (participant_id, question_id) do update
      set state = excluded.state, value_enc = excluded.value_enc, updated_at = now(), updated_by_user = excluded.updated_by_user
    returning id`;

  // Historia zmian: po przekazaniu (poprawki za zgodą psychologa) i przy każdej zmianie przez psychologa.
  if (isStaff || q.q_status === "reopened") {
    await tx`insert into answer_revisions (answer_id, participant_id, old_state, old_value_enc, new_state, new_value_enc, changed_by_user, changed_by_participant, reason)
             values (${saved.id}, ${participantId}, ${prev?.state ?? null}, ${prev?.value_enc ?? null}, ${state}, ${enc}, ${userId},
                     ${actor.kind === "participant" ? participantId : null}, ${reason ?? null})`;
  }
  if (isStaff) await audit(tx, actor, "answer_corrected", "answer", saved.id, q.case_id, { question: q.key });

  if (actor.kind === "participant" && q.q_status === "not_started") {
    await tx`update participants set q_status = 'in_progress', q_started_at = now() where id = ${participantId}`;
    await recomputeStatusAsParticipant(tx);
  }

  let riskTriggered = false;
  if (q.type === "screening" && q.tags.includes(RISK_TRIGGER_TAG) && state === "answered" && v.value === "yes") {
    riskTriggered = true;
    if (actor.kind === "participant") await tx`select app_flag_risk(${[q.key]})`;
  }
  return { ok: true, riskTriggered };
}

/** Uczestnik nie ma dostępu do innych uczestników – status sprawy przelicza funkcja definer. */
async function recomputeStatusAsParticipant(tx: Tx) {
  await tx`select app_participant_progress()`;
}
