import { notFound } from "next/navigation";
import { CaseHeader } from "@/components/panel/case-header";
import { Alert, Badge, Card } from "@/components/ui";
import { compare, coupleSignals, formatAnswer, readinessMean } from "@/lib/analysis";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { loadCase, loadPeople } from "@/lib/case-data";

export const metadata = { title: "Porównanie" };

const STATUS: Record<string, { label: string; tone: "alert" | "ok" | "neutral" | "clay" }> = {
  divergent: { label: "rozbieżność", tone: "clay" },
  similar: { label: "podobnie", tone: "ok" },
  different_choice: { label: "różne odpowiedzi", tone: "clay" },
  same_choice: { label: "ta sama odpowiedź", tone: "ok" },
  missing: { label: "brak odpowiedzi", tone: "neutral" },
  text: { label: "odpowiedź opisowa", tone: "neutral" },
};

export default async function ComparePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ only?: string }> }) {
  const { id } = await params;
  const { only } = await searchParams;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const data = await loadCase(tx, id);
    if (!data || data.c.kind !== "couple") return null;
    await audit(tx, s.actor, "comparison_viewed", "case", id, id);
    return { ...data, people: await loadPeople(tx, data.participants as never) };
  });
  if (!d) notFound();
  const [a, b] = d.people;
  const rows = compare(a, b);
  const shown = only === "diff" ? rows.filter((r) => r.status === "divergent" || r.status === "different_choice") : rows;
  const signals = coupleSignals(a, b);
  const sections = [...new Set(shown.map((r) => r.section))];
  const ra = readinessMean(a);
  const rb = readinessMean(b);
  return (
    <>
      <CaseHeader c={d.c} participants={d.participants} active="compare" />
      <Alert tone="info" className="mb-6">
        Dwie perspektywy obok siebie – nie werdykt „kto ma rację”. Największą wartość mają rozbieżności, które warto pogłębić na sesji (wytyczne, rozdz. 7). Widok tylko dla psychologa; nie udostępniaj go uczestnikom.
      </Alert>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-lg text-ink">Pytania do pogłębienia</h2>
          {signals.length === 0 ? <p className="mt-2 text-sm text-muted">Brak sygnałów wynikających z porównania.</p> : (
            <ul className="mt-3 space-y-2 text-sm">{signals.map((x, i) => <li key={i} className="rounded-xl bg-ivory p-3 ring-1 ring-sand"><span className="text-xs text-clay">{x.area} · {x.refs.join(", ")}</span><p>{x.text}</p></li>)}</ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-lg text-ink">Gotowość (opisowo)</h2>
          <p className="mt-1 text-xs text-muted">Średnia z pozycji „gotowość” Cz. 10 (1–5) – wskaźnik pomocniczy, autorski, niediagnostyczny.</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">{a.name}</dt><dd className="font-display text-2xl text-forest">{ra?.toFixed(1) ?? "—"}</dd></div>
            <div><dt className="text-muted">{b.name}</dt><dd className="font-display text-2xl text-forest">{rb?.toFixed(1) ?? "—"}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Wytyczne: w części indywidualnej sesji zapytaj każdą osobę osobno o gotowość w skali 0–10.</p>
        </Card>
      </div>
      <nav className="mb-4 flex gap-2 text-sm" aria-label="Filtr">
        <a href="?" className={!only ? "font-medium text-ink" : "text-forest"}>Wszystkie pozycje</a>·<a href="?only=diff" className={only === "diff" ? "font-medium text-ink" : "text-forest"}>Tylko rozbieżności</a>
      </nav>
      {sections.map((sec) => (
        <section key={sec} className="mb-8">
          <h2 className="mb-3 font-display text-xl text-ink">{sec}</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-sand">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-linen/60 text-left text-xs text-muted"><tr><th className="px-4 py-2 font-medium">Pytanie</th><th className="px-4 py-2 font-medium">{a.name}</th><th className="px-4 py-2 font-medium">{b.name}</th><th className="px-4 py-2 font-medium" /></tr></thead>
              <tbody className="divide-y divide-sand/60">
                {shown.filter((r) => r.section === sec).map((r) => {
                  const qa = a.version.sections.flatMap((x) => x.questions).find((q) => q.key === r.key)!;
                  const qb = b.version.sections.flatMap((x) => x.questions).find((q) => q.key === r.key)!;
                  const st = STATUS[r.status];
                  return (
                    <tr key={r.key} className={r.status === "divergent" || r.status === "different_choice" ? "bg-clay-soft/25" : ""}>
                      <td className="w-2/5 px-4 py-3"><span className="text-xs text-muted">{r.ref}</span><p className="text-ink">{r.prompt[0]}</p></td>
                      <td className="px-4 py-3 align-top">{formatAnswer(qa, r.values[0])}</td>
                      <td className="px-4 py-3 align-top">{formatAnswer(qb, r.values[1])}</td>
                      <td className="px-4 py-3 align-top"><Badge tone={st.tone}>{st.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
