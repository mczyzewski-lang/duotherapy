// Dziennik audytowy: kto, co, kiedy – bez treści odpowiedzi ani notatek.
import type { Actor, Tx } from "./db";

export async function audit(
  tx: Tx,
  actor: Actor,
  action: string,
  entity: string,
  entityId: string | null,
  caseId: string | null = null,
  meta: Record<string, string | number | boolean | null> = {},
) {
  const actorKind = actor.kind === "admin" || actor.kind === "therapist" ? "user" : actor.kind;
  const actorId =
    "userId" in actor ? actor.userId : actor.kind === "participant" ? actor.participantId : actor.kind === "report_viewer" ? actor.shareId : null;
  await tx`insert into audit_logs (actor_kind, actor_id, action, entity, entity_id, case_id, meta)
           values (${actorKind}, ${actorId}, ${action}, ${entity}, ${entityId}, ${caseId}, ${tx.json(meta)})`;
}
