import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswersView } from "@/components/panel/answers-view";
import { CaseHeader } from "@/components/panel/case-header";
import { Alert, Badge, Button, Card, Select } from "@/components/ui";
import { personSignals } from "@/lib/analysis";
import { buildAnswerSections, toNoteLite } from "@/lib/answer-items";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { loadCase, loadNotes, loadPeople } from "@/lib/case-data";

export const metadata = { title: "Odpowiedzi" };

export default async function AnswersPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ p?: string; section?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const data = await loadCase(tx, id);
    if (!data) return null;
    const people = await loadPeople(tx, data.participants as never);
    const person = people.find((p) => p.participantId === sp.p) ?? people[0];
    await audit(tx, s.actor, "answers_viewed", "participant", person.participantId, id);
    return { ...data, person, sections: await buildAnswerSections(tx, person, sp.section || undefined), notes: (await loadNotes(tx, id)).filter((n) => n.participant_id === person.participantId).map(toNoteLite) };
  });
  if (!d) notFound();
  const signals = personSignals(d.person);
  return (
    <>
      <CaseHeader c={d.c} participants={d.participants} active="answers" />
      <div className="mb-6 flex flex-wrap items-end gap-3">
        {d.participants.length > 1 && (
          <nav aria-label="Uczestnik" className="flex gap-1 rounded-full bg-linen p-1">
            {d.participants.map((p) => (
              <Link key={p.id} href={`?p=${p.id}`} aria-current={p.id === d.person.participantId ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm ${p.id === d.person.participantId ? "bg-white font-medium text-ink shadow-soft" : "text-muted"}`}>{p.display_name}</Link>
            ))}
          </nav>
        )}
        <form className="flex gap-2">
          <input type="hidden" name="p" value={d.person.participantId} />
          <Select name="section" defaultValue={sp.section ?? ""} aria-label="Filtr sekcji" className="min-w-64">
            <option value="">Wszystkie sekcje</option>
            {d.person.version.sections.map((x) => <option key={x.key} value={x.key}>{x.title}</option>)}
          </Select>
          <Button variant="secondary" type="submit">Pokaż</Button>
        </form>
        <Badge className="ml-auto">{d.person.version.title} · wersja {d.person.version.version}</Badge>
      </div>
      {d.c.kind === "couple" && <Alert tone="info" className="mb-6">Odpowiedzi tej osoby są poufne wobec drugiej osoby. Treść może trafić do wspólnego podsumowania tylko przez notatkę oznaczoną „może trafić do podsumowania wspólnego” – po uzyskaniu zgody.</Alert>}
      <Card className="mb-8 p-6">
        <h2 className="font-display text-xl text-ink">Sygnały do pogłębienia</h2>
        <p className="mt-1 text-xs text-muted">Wg wytycznych (rozdz. 7): skale autorskie i jakościowe, bez norm i bez diagnozy. Wskazują tematy do rozmowy, nie wnioski.</p>
        {signals.length === 0 ? <p className="mt-3 text-sm text-muted">Brak wyraźnych sygnałów w udzielonych odpowiedziach.</p> : (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {signals.map((x, i) => (
              <li key={i} className={`rounded-xl p-3 text-sm ring-1 ${x.level === "safety" ? "bg-alert-soft/50 ring-alert/20" : "bg-ivory ring-sand"}`}>
                <span className="text-xs font-medium text-clay">{x.area} · {x.refs.join(", ")}</span>
                <p className="mt-0.5 text-ink">{x.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <AnswersView caseId={id} participantId={d.person.participantId} couple={d.c.kind === "couple"} sections={d.sections} notes={d.notes} />
    </>
  );
}
