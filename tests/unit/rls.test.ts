// Testy autoryzacji na poziomie bazy (RLS) – niezależne od kodu interfejsu.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCase, loadAnswers, saveAnswer } from "@/lib/cases";
import { sql, system, withActor, type Actor } from "@/lib/db";

let t1: Actor & { userId: string; therapistId: string };
let t2: Actor;
let caseId: string;
let pA: string;
let pB: string;
let qScale: string;
let qScreen: string;

beforeAll(async () => {
  const users = await system((tx) => tx`select u.id as uid, u.email, t.id as tid from users u join therapists t on t.user_id = u.id`);
  const u1 = users.find((u) => u.email === "psycholog@demo.duo")!;
  const u2 = users.find((u) => u.email === "psycholog2@demo.duo")!;
  t1 = { kind: "therapist", userId: u1.uid, therapistId: u1.tid };
  t2 = { kind: "therapist", userId: u2.uid, therapistId: u2.tid };
  caseId = await withActor(t1, (tx) =>
    createCase(tx, t1, { kind: "couple", therapistId: t1.therapistId, participants: [{ name: "A", gender: "female" }, { name: "B", gender: "male" }] }),
  );
  const parts = await withActor(t1, (tx) => tx`select id, position, template_version_id from participants where case_id = ${caseId} order by position`);
  pA = parts[0].id;
  pB = parts[1].id;
  const qs = await withActor(t1, (tx) => tx`select id, key from questions where version_id = ${parts[0].template_version_id} and key in ('s2.1', 's1.1')`);
  qScale = qs.find((q) => q.key === "s2.1")!.id;
  qScreen = qs.find((q) => q.key === "s1.1")!.id;
  await withActor({ kind: "participant", participantId: pA }, (tx) => saveAnswer(tx, { kind: "participant", participantId: pA }, pA, qScale, "answered", 4));
});

afterAll(async () => {
  await sql().end();
});

const asA: Actor = { kind: "participant", participantId: "" };
const A = () => ({ ...asA, participantId: pA }) as Actor;
const B = () => ({ ...asA, participantId: pB }) as Actor;

describe("RLS: izolacja uczestników pary", () => {
  it("uczestnik widzi wyłącznie własne odpowiedzi", async () => {
    const own = await withActor(A(), (tx) => tx`select * from answers`);
    expect(own).toHaveLength(1);
    const other = await withActor(B(), (tx) => tx`select * from answers where participant_id = ${pA}`);
    expect(other).toHaveLength(0);
    expect(await withActor(B(), (tx) => loadAnswers(tx, pA))).toHaveLength(0);
  });

  it("uczestnik nie widzi danych drugiej osoby ani notatek psychologa", async () => {
    await withActor(t1, (tx) => tx`insert into session_notes (case_id, participant_id, kind, body_enc, created_by) values (${caseId}, ${pA}, 'private', 'x', ${(t1 as { userId: string }).userId})`);
    expect(await withActor(B(), (tx) => tx`select * from participants`)).toHaveLength(1);
    expect(await withActor(B(), (tx) => tx`select * from session_notes`)).toHaveLength(0);
    expect(await withActor(A(), (tx) => tx`select * from session_notes`)).toHaveLength(0);
    expect(await withActor(A(), (tx) => tx`select * from risk_review_statuses`)).toHaveLength(0);
    expect(await withActor(A(), (tx) => tx`select * from leads`)).toHaveLength(0);
  });

  it("uczestnik nie może zapisać odpowiedzi w imieniu drugiej osoby", async () => {
    await expect(withActor(B(), (tx) => tx`insert into answers (participant_id, question_id, state, value_enc) values (${pA}, ${qScreen}, 'answered', 'x')`)).rejects.toThrow(/row-level security/);
    const r = await withActor(B(), (tx) => saveAnswer(tx, B(), pA, qScale, "answered", 1));
    expect(r.ok).toBe(false);
    expect(await withActor(t1, (tx) => loadAnswers(tx, pA))).toEqual([expect.objectContaining({ value: 4 })]);
  });

  it("„tak” w przesiewie ustawia prywatny status przeglądu widoczny tylko dla prowadzącego", async () => {
    const r = await withActor(A(), (tx) => saveAnswer(tx, A(), pA, qScreen, "answered", "yes"));
    expect(r).toEqual({ ok: true, riskTriggered: true });
    const rows = await withActor(t1, (tx) => tx`select status, trigger_keys from risk_review_statuses where participant_id = ${pA}`);
    expect(rows[0]).toMatchObject({ status: "needs_review", trigger_keys: ["s1.1"] });
    expect(await withActor(t2, (tx) => tx`select * from risk_review_statuses`)).toHaveLength(0);
  });

  it("po przekazaniu uczestnik nie może zmieniać odpowiedzi ani cofnąć statusu", async () => {
    await withActor(A(), (tx) => tx`update participants set q_status = 'submitted', q_submitted_at = now() where id = ${pA}`);
    const r = await withActor(A(), (tx) => saveAnswer(tx, A(), pA, qScale, "answered", 2));
    expect(r.ok).toBe(false);
    await expect(withActor(A(), (tx) => tx`update answers set state = 'not_applicable' where participant_id = ${pA} returning id`)).resolves.toHaveLength(0);
    await expect(withActor(A(), (tx) => tx`update participants set q_status = 'in_progress' where id = ${pA}`)).rejects.toThrow(/przekazany/);
    await expect(withActor(A(), (tx) => tx`update participants set template_version_id = template_version_id, display_name = 'X' where id = ${pA}`)).rejects.toThrow();
  });

  it("korekta przez psychologa wymaga powodu i zapisuje historię zmian", async () => {
    expect((await withActor(t1, (tx) => saveAnswer(tx, t1, pA, qScale, "answered", 3))).ok).toBe(false);
    expect((await withActor(t1, (tx) => saveAnswer(tx, t1, pA, qScale, "answered", 3, "prośba klienta"))).ok).toBe(true);
    const revs = await withActor(t1, (tx) => tx`select reason, changed_by_user from answer_revisions where participant_id = ${pA}`);
    expect(revs.at(-1)).toMatchObject({ reason: "prośba klienta", changed_by_user: (t1 as { userId: string }).userId });
  });
});

describe("RLS: uprawnienia specjalistów i ról", () => {
  it("psycholog nieprzypisany do sprawy nie widzi sprawy, uczestników ani odpowiedzi", async () => {
    expect(await withActor(t2, (tx) => tx`select * from cases where id = ${caseId}`)).toHaveLength(0);
    expect(await withActor(t2, (tx) => tx`select * from participants where case_id = ${caseId}`)).toHaveLength(0);
    expect(await withActor(t2, (tx) => tx`select * from answers where participant_id = ${pA}`)).toHaveLength(0);
    await expect(withActor(t2, (tx) => tx`insert into session_notes (case_id, kind, body_enc, created_by) values (${caseId}, 'private', 'x', ${(t2 as { userId: string }).userId})`)).rejects.toThrow(/row-level security/);
  });

  it("bez kontekstu aktora rola aplikacji nie widzi żadnych danych", async () => {
    expect(await sql()`select * from answers`).toHaveLength(0);
    expect(await sql()`select * from cases`).toHaveLength(0);
    expect(await sql()`select * from users`).toHaveLength(0);
  });

  it("rola publiczna może tylko dodać zgłoszenie (bez odczytu)", async () => {
    expect(await withActor({ kind: "public" }, (tx) => tx`select * from leads`)).toHaveLength(0);
    expect(await withActor({ kind: "public" }, (tx) => tx`select * from users`)).toHaveLength(0);
    await expect(withActor({ kind: "public" }, (tx) => tx`insert into leads (name, email, mode, intent, preferred_contact, stage) values ('x', 'x@x.pl', 'couple', 'unsure', 'email', 'paid')`)).rejects.toThrow(/row-level security/);
  });

  it("psycholog nie może edytować szablonów (tylko administrator)", async () => {
    const r = await withActor(t1, (tx) => tx`update questionnaire_template_versions set change_note = 'x' returning id`);
    expect(r).toHaveLength(0);
  });

  it("pytania opublikowanej wersji są niezmienne nawet dla administratora", async () => {
    const admin = await system((tx) => tx`select u.id from users u where role = 'admin' limit 1`);
    await expect(withActor({ kind: "admin", userId: admin[0].id, therapistId: null }, (tx) => tx`update questions set prompt = 'zmiana' where key = 's2.1'`)).rejects.toThrow(/niezmienne/);
  });

  it("dziennik audytowy jest tylko do dopisywania", async () => {
    await withActor(t1, (tx) => tx`insert into audit_logs (actor_kind, action, entity) values ('user', 'test', 'x')`);
    await expect(withActor(t1, (tx) => tx`delete from audit_logs`)).rejects.toThrow();
  });
});
