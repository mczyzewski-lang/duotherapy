import { notFound } from "next/navigation";
import { sessionAction } from "@/actions/cases";
import { SubmitButton } from "@/components/form-bits";
import { CaseHeader } from "@/components/panel/case-header";
import { SessionView } from "@/components/panel/session-view";
import { answerByKey, compare, coupleSignals, formatAnswer, personSignals } from "@/lib/analysis";
import { toNoteLite } from "@/lib/answer-items";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { loadCase, loadNotes, loadPeople } from "@/lib/case-data";
import { COUPLE_PLAN, INDIVIDUAL_PLAN, SESSION_CONDITIONS } from "@/lib/session-plan";

export const metadata = { title: "Tryb sesji" };

const KEY_ANSWERS: [string, string][] = [
  ["sit.goal", "Cel"],
  ["sit.who_considers", "Kto rozważa rozstanie"],
  ["s2.o1", "Ostatnia poważna kłótnia"],
  ["s3.trigger", "Typowy wyzwalacz"],
  ["s3.thought", "Myśl"],
  ["s3.feeling", "Emocja"],
  ["s3.action", "Co robię"],
  ["s9.o1", "Najważniejsze potrzeby"],
  ["s10.position", "Gdzie jestem teraz"],
  ["s10.o2", "Co chcę wynieść z konsultacji"],
];

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const data = await loadCase(tx, id);
    if (!data) return null;
    await audit(tx, s.actor, "session_view_opened", "case", id, id);
    return { ...data, people: await loadPeople(tx, data.participants as never), notes: (await loadNotes(tx, id)).map(toNoteLite) };
  });
  if (!d) notFound();
  const couple = d.c.kind === "couple";
  const signals = [...d.people.flatMap(personSignals), ...(couple ? coupleSignals(d.people[0], d.people[1]) : [])];
  const discrepancies = couple
    ? compare(d.people[0], d.people[1])
        .filter((r) => r.status === "divergent" || r.status === "different_choice")
        .map((r) => {
          const qa = d.people[0].version.sections.flatMap((x) => x.questions).find((q) => q.key === r.key)!;
          return { ref: r.ref, prompt: r.prompt[0], a: formatAnswer(qa, r.values[0]), b: formatAnswer(qa, r.values[1]) };
        })
    : [];
  const keyAnswers = d.people.flatMap((p) =>
    KEY_ANSWERS.map(([k, label]) => {
      const { q, a } = answerByKey(p, k);
      return q && a ? { who: p.name, label, text: formatAnswer(q, a) } : null;
    }).filter((x): x is { who: string; label: string; text: string } => !!x && x.text !== "—"),
  );
  const risk = d.participants.some((p) => p.risk) || signals.some((x) => x.level === "safety");
  const form = (op: "start" | "end", label: string, variant: "clay" | "secondary") => (
    <form action={sessionAction}>
      <input type="hidden" name="case_id" value={id} />
      <input type="hidden" name="op" value={op} />
      <SubmitButton size="sm" variant={variant} className="w-full" confirm={op === "end" ? "Zakończyć sesję i przejść do podsumowania?" : undefined}>{label}</SubmitButton>
    </form>
  );
  return (
    <>
      <CaseHeader c={d.c} participants={d.participants} active="session" />
      <SessionView
        caseId={id}
        couple={couple}
        minutes={d.c.session_minutes}
        startedAt={d.c.session_started_at && !d.c.session_ended_at ? new Date(d.c.session_started_at).toISOString() : null}
        plan={couple ? COUPLE_PLAN : INDIVIDUAL_PLAN}
        conditions={SESSION_CONDITIONS}
        risk={risk}
        signals={signals}
        discrepancies={discrepancies}
        keyAnswers={keyAnswers}
        notes={d.notes}
        names={d.people.map((p) => p.name)}
        startForm={form("start", d.c.session_ended_at ? "Sesja zakończona" : "Rozpocznij sesję", "clay")}
        endForm={form("end", "Zakończ sesję i przejdź do podsumowania", "secondary")}
      />
    </>
  );
}
