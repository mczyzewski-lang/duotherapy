// Ładowanie pełnych danych sprawy dla panelu (zawsze w kontekście uprawnionego specjalisty – RLS).
import type { PersonData } from "./analysis";
import { loadAnswers } from "./cases";
import { decrypt } from "./crypto";
import type { Tx } from "./db";
import { loadVersion } from "./templates";

export interface NoteView {
  id: string;
  participant_id: string | null;
  question_id: string | null;
  kind: "private" | "discussed" | "report";
  joint_ok: boolean;
  tags: string[];
  stage: string | null;
  body: string;
  created_at: Date;
  author: string;
}

export async function loadCase(tx: Tx, caseId: string) {
  const [c] = await tx`
    select c.*, t.display_name as therapist_name from cases c join therapists t on t.id = c.therapist_id where c.id = ${caseId}`;
  if (!c) return null;
  const participants = await tx`
    select p.*,
      (select row_to_json(i) from (select id, created_at, expires_at, revoked_at, last_used_at, failed_attempts from invitations
         where participant_id = p.id order by created_at desc limit 1) i) as invitation,
      (select row_to_json(r) from (select status, trigger_keys, note_enc, reviewed_at, updated_at from risk_review_statuses where participant_id = p.id) r) as risk
    from participants p where case_id = ${caseId} order by position`;
  return { c, participants };
}

export async function loadPeople(tx: Tx, participants: { id: string; display_name: string; template_version_id: string }[]): Promise<PersonData[]> {
  const out: PersonData[] = [];
  for (const p of participants) {
    out.push({ participantId: p.id, name: p.display_name, version: (await loadVersion(tx, p.template_version_id))!, answers: await loadAnswers(tx, p.id) });
  }
  return out;
}

export async function loadNotes(tx: Tx, caseId: string): Promise<NoteView[]> {
  const rows = await tx`
    select n.*, u.name as author from session_notes n join users u on u.id = n.created_by where n.case_id = ${caseId} order by n.created_at`;
  return rows.map((r) => ({
    id: r.id,
    participant_id: r.participant_id,
    question_id: r.question_id,
    kind: r.kind,
    joint_ok: r.joint_ok,
    tags: r.tags,
    stage: r.stage,
    body: decrypt<string>(r.body_enc) ?? "",
    created_at: r.created_at,
    author: r.author,
  }));
}
