import { AlertTriangle, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { CasesTable } from "@/components/panel/cases-table";
import { Alert, Badge, Card, LinkButton, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { CASE_STATUSES } from "@/lib/cases";
import { INTENT_LABEL } from "@/lib/leads";
import { listCases } from "@/lib/queries";
import { readSettings } from "@/lib/settings";
import { env } from "@/lib/env";

export const metadata = { title: "Pulpit" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const { err } = await searchParams;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => ({
    newInquiries: (await tx`select count(*)::int as n from inquiries where status = 'new'`)[0].n as number,
    leads: await tx`select id, name, mode, intent, created_at, stage from leads where stage in ('new', 'contacted') order by created_at desc limit 6`,
    risky: await listCases(tx, { risk: true, limit: 10 }),
    active: await listCases(tx, { limit: 12 }),
    counts: await tx`select status, count(*)::int as n from cases group by status`,
    settings: await readSettings(tx),
  }));
  const count = (k: string) => d.counts.find((c) => c.status === k)?.n ?? 0;
  return (
    <>
      <PageTitle title={`Dzień dobry, ${s.user.name.split(" ")[0]}`} sub="Nowe zgłoszenia, aktywne sprawy i sprawy wymagające pilnego przeglądu." actions={<LinkButton href="/app/cases/new"><Plus size={17} aria-hidden /> Nowa sprawa</LinkButton>} />
      {d.newInquiries > 0 && (
        <Alert tone="info" className="mb-4">Nowe wiadomości ze strony: <strong>{d.newInquiries}</strong>. <Link href="/app/inquiries" className="font-medium underline">Przejdź do wiadomości</Link></Alert>
      )}
      {err === "forbidden" && <Alert tone="warn" className="mb-4">Ta sekcja jest dostępna tylko dla administratora.</Alert>}
      {!d.settings.legal.approved && (
        <Alert tone="warn" className="mb-6" title="Teksty prawne niezatwierdzone">
          Dane administratora, klauzule i zgody wymagają uzupełnienia i zatwierdzenia przez prawnika/IOD. {env.demoMode ? "W trybie DEMO kwestionariusz działa mimo to." : "Do tego czasu kwestionariusz jest zablokowany dla klientów."}{" "}
          {s.user.role === "admin" && <Link href="/app/settings" className="font-medium underline">Przejdź do ustawień</Link>}
        </Alert>
      )}
      {d.risky.length > 0 && (
        <section className="mb-8" aria-labelledby="risk-h">
          <h2 id="risk-h" className="mb-3 flex items-center gap-2 font-display text-xl text-alert"><AlertTriangle size={20} aria-hidden /> Wymaga pilnego przeglądu przed sesją</h2>
          <CasesTable rows={d.risky} />
        </section>
      )}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["awaiting_questionnaire", "questionnaire_partial", "ready_for_session", "report_in_progress"] as const).map((k) => (
          <Link key={k} href={`/app/cases?status=${k}`}>
            <Card className="p-5 transition hover:ring-forest">
              <p className="font-display text-3xl text-forest">{count(k)}</p>
              <p className="mt-1 text-sm text-muted">{CASE_STATUSES.find(([x]) => x === k)?.[1]}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section aria-labelledby="active-h">
          <div className="mb-3 flex items-center justify-between"><h2 id="active-h" className="font-display text-xl text-ink">Ostatnio aktywne sprawy</h2><Link href="/app/cases" className="text-sm text-forest">Wszystkie →</Link></div>
          <CasesTable rows={d.active} />
        </section>
        <section aria-labelledby="leads-h">
          <div className="mb-3 flex items-center justify-between"><h2 id="leads-h" className="font-display text-xl text-ink">Nowe zgłoszenia</h2><Link href="/app/leads" className="text-sm text-forest">Pipeline →</Link></div>
          <Card className="divide-y divide-sand/70">
            {d.leads.length === 0 && <p className="p-5 text-sm text-muted">Brak nowych zgłoszeń.</p>}
            {d.leads.map((l) => (
              <Link key={l.id} href={`/app/leads/${l.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-ivory">
                <span>
                  <span className="block font-medium text-ink">{l.name}</span>
                  <span className="text-xs text-muted">{l.mode === "couple" ? "para" : "indywidualnie"} · {INTENT_LABEL[l.intent]}</span>
                </span>
                <Badge tone={l.stage === "new" ? "clay" : "neutral"}>{l.stage === "new" ? "nowe" : "kontakt"}</Badge>
                <ArrowRight size={15} className="text-muted" aria-hidden />
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </>
  );
}
