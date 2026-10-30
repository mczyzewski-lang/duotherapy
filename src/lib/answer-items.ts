import type { AnswerItem } from "@/components/panel/answers-view";
import type { NoteLite } from "@/components/panel/notes";
import { formatAnswer, questionRef, type PersonData } from "./analysis";
import type { NoteView } from "./case-data";
import { decrypt } from "./crypto";
import type { Tx } from "./db";
import type { AnswerValue } from "@/questionnaires/types";

export async function buildAnswerSections(tx: Tx, person: PersonData, sectionKey?: string) {
  const revs = await tx`
    select r.*, u.name as user_name from answer_revisions r left join users u on u.id = r.changed_by_user
    where r.participant_id = ${person.participantId} order by r.created_at`;
  const metaRows = await tx`select question_id, updated_by_user, updated_at from answers where participant_id = ${person.participantId}`;
  return person.version.sections
    .filter((s) => !sectionKey || s.key === sectionKey)
    .map((s) => ({
      key: s.key,
      title: s.title,
      items: s.questions
        .filter((q) => q.type !== "info")
        .map((q): AnswerItem => {
          const a = person.answers.find((x) => x.question_id === q.id);
          const meta = metaRows.find((m) => m.question_id === q.id);
          const qv = {
            id: q.id, key: q.key, type: q.type, prompt: q.prompt, hint: q.hint, options: q.options, primaryPick: q.primary_pick, required: q.required,
            allowNA: q.allow_na, showIf: q.show_if, group: q.group_label, sourceNumber: q.source_number, tags: q.tags, ref: questionRef(q, person.version),
          };
          return {
            q: qv,
            a: a ? { state: a.state, value: a.value, byTherapist: Boolean(meta?.updated_by_user), updatedAt: new Date(meta?.updated_at ?? Date.now()).toISOString() } : null,
            display: a ? formatAnswer(q, a) || "—" : "brak odpowiedzi",
            revisions: revs
              .filter((r) => a && r.answer_id === (a as unknown as { id: string }).id)
              .map((r) => ({
                at: new Date(r.created_at).toISOString(),
                who: r.user_name ?? "klient",
                reason: r.reason,
                old: r.old_state ? formatAnswer(q, { question_id: q.id, state: r.old_state, value: decrypt<AnswerValue>(r.old_value_enc) }) : "—",
                new: formatAnswer(q, { question_id: q.id, state: r.new_state, value: decrypt<AnswerValue>(r.new_value_enc) }),
              })),
          };
        }),
    }));
}

export const toNoteLite = (n: NoteView): NoteLite => ({ ...n, created_at: new Date(n.created_at).toISOString() });
