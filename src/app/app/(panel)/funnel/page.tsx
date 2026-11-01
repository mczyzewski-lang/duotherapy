import { Alert, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { readSettings } from "@/lib/settings";

export const metadata = { title: "Lejek" };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "—");
const STAGE_RANK = ["new", "contacted", "call_scheduled", "call_done", "payment_sent", "paid", "converted"];

export default async function FunnelPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const s = await requireStaff("admin");
  const d = await asStaff(s, async (tx) => {
    const since = new Date(Date.now() - days * 86400_000);
    const ev = await tx<{ event: string; variant: string | null; n: number }[]>`
      select event, variant, count(distinct anon_id)::int as n from funnel_events where created_at >= ${since} group by 1, 2`;
    const steps = await tx<{ step: number; n: number }[]>`
      select step, count(distinct anon_id)::int as n from funnel_events where event = 'quiz_step_completed' and created_at >= ${since} group by 1 order by 1`;
    const leads = await tx<{ stage: string; ab_variant: string | null; src: string | null; camp: string | null; case_id: string | null; session_done: boolean; delivered: boolean }[]>`
      select l.stage, l.ab_variant, l.attribution->>'utm_source' as src, l.attribution->>'utm_campaign' as camp, l.case_id,
        coalesce(c.session_ended_at is not null, false) as session_done,
        exists (select 1 from reports r join report_shares sh on sh.report_id = r.id where r.case_id = l.case_id) as delivered
      from leads l left join cases c on c.id = l.case_id
      where l.created_at >= ${since} and l.product = 'mapa_relacji'`;
    return { ev, steps, leads: [...leads], settings: await readSettings(tx) };
  });

  const count = (event: string, variant?: string) => d.ev.filter((e) => e.event === event && (!variant || e.variant === variant)).reduce((a, e) => a + e.n, 0);
  const reached = (stage: string, list = d.leads) => list.filter((l) => STAGE_RANK.indexOf(l.stage) >= STAGE_RANK.indexOf(stage)).length;
  const variants = ["A", "B"] as const;
  const sources = Object.entries(
    d.leads.reduce<Record<string, typeof d.leads>>((acc, l) => {
      const k = [l.src ?? "bezpośrednio", l.camp].filter(Boolean).join(" · ");
      (acc[k] ||= []).push(l);
      return acc;
    }, {}),
  ).sort((a, b) => b[1].length - a[1].length);

  const spend = Number(sp.spend) || 0;
  const price = Number(sp.price) || 0;
  const cost = Number(sp.cost) || 0;
  const paid = reached("paid");

  const rows: [string, string, string][] = [
    ["1. Strona → rozpoczęcie quizu", "landing_view", "quiz_started"],
    ["2. Rozpoczęcie → ukończenie quizu", "quiz_started", "quiz_completed"],
    ["3. Ukończenie quizu → telefon", "quiz_completed", "lead_submitted"],
  ];

  return (
    <>
      <PageTitle
        title="Lejek Mapy Relacji"
        sub="Od wejścia na stronę do sprzedaży. Zdarzenia liczone jako unikalne sesje przeglądarki – bez treści odpowiedzi i bez danych osobowych."
        actions={
          <nav className="flex gap-1 rounded-full bg-linen p-1 text-sm" aria-label="Okres">
            {[7, 30, 90].map((n) => (
              <a key={n} href={`?days=${n}`} aria-current={n === days ? "page" : undefined} className={`rounded-full px-3 py-1 ${n === days ? "bg-white font-medium shadow-soft" : "text-muted"}`}>{n} dni</a>
            ))}
          </nav>
        }
      />
      {!d.settings.site.funnelTracking && <Alert tone="warn" className="mb-6">Pomiar lejka jest wyłączony w Ustawieniach – nowe zdarzenia nie są zapisywane.</Alert>}

      <Card className="mb-6 overflow-x-auto p-6">
        <h2 className="font-display text-xl text-ink">Strona → quiz → prośba o telefon</h2>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted"><tr><th className="py-2">Etap</th><th>Razem</th><th>Nagłówek A</th><th>Nagłówek B</th></tr></thead>
          <tbody className="divide-y divide-sand/60">
            {rows.map(([label, from, to]) => (
              <tr key={label}>
                <td className="py-2.5 text-ink">{label}</td>
                <td><strong>{pct(count(to), count(from))}</strong> <span className="text-xs text-muted">({count(to)}/{count(from)})</span></td>
                {variants.map((v) => <td key={v}>{pct(count(to, v), count(from, v))} <span className="text-xs text-muted">({count(to, v)}/{count(from, v)})</span></td>)}
              </tr>
            ))}
            <tr>
              <td className="py-2.5 text-ink">Kliknięcia głównego CTA w hero</td>
              <td>{pct(count("hero_cta_click"), count("landing_view"))} <span className="text-xs text-muted">({count("hero_cta_click")})</span></td>
              {variants.map((v) => <td key={v}>{pct(count("hero_cta_click", v), count("landing_view", v))}</td>)}
            </tr>
            <tr>
              <td className="py-2.5 text-ink">Błędy wysyłki formularza</td>
              <td>{count("lead_submission_error")}</td><td /><td />
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-muted">A: „Nie wiesz, co dalej z Waszą relacją?” · B: „Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.” Porównuj warianty dopiero przy kilkuset wejściach na wariant.</p>
        {d.steps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-ink">Ukończone pytania quizu (sesje)</h3>
            <div className="mt-3 flex items-end gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const v = d.steps.find((x) => x.step === n)?.n ?? 0;
                const max = Math.max(1, ...d.steps.map((x) => x.n));
                return (
                  <div key={n} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-ink">{v}</span>
                    <span className="w-full rounded-t-md bg-forest/80" style={{ height: `${Math.max(4, (v / max) * 90)}px` }} />
                    <span className="text-xs text-muted">P{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Card className="mb-6 overflow-x-auto p-6">
        <h2 className="font-display text-xl text-ink">Telefon → sprzedaż → realizacja</h2>
        <p className="mt-1 text-xs text-muted">Zgłoszenia z quizu z wybranego okresu, według etapu w CRM (Zgłoszenia) i statusu sprawy.</p>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <tbody className="divide-y divide-sand/60">
            {(
              [
                ["Prośby o telefon (leady)", d.leads.length, null],
                ["Kontakt podjęty", reached("contacted"), d.leads.length],
                ["4. Rozmowa odbyta", reached("call_done"), d.leads.length],
                ["Mapa Relacji zaproponowana", reached("payment_sent"), reached("call_done")],
                ["5. Mapa Relacji opłacona", paid, reached("call_done")],
                ["Konsultacja odbyta", d.leads.filter((l) => l.session_done).length, paid],
                ["Podsumowanie przekazane", d.leads.filter((l) => l.delivered).length, paid],
                ["Bez kontynuacji", d.leads.filter((l) => l.stage === "lost").length, d.leads.length],
              ] as [string, number, number | null][]
            ).map(([label, n, base]) => (
              <tr key={label}><td className="py-2.5 text-ink">{label}</td><td className="font-medium">{n}</td><td className="text-muted">{base !== null ? pct(n, base) : ""}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-x-auto p-6">
          <h2 className="font-display text-xl text-ink">Źródła (UTM)</h2>
          {sources.length === 0 ? <p className="mt-3 text-sm text-muted">Brak zgłoszeń w tym okresie.</p> : (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="py-2">Źródło · kampania</th><th>Leady</th><th>Rozmowy</th><th>Sprzedaże</th></tr></thead>
              <tbody className="divide-y divide-sand/60">
                {sources.map(([k, list]) => (
                  <tr key={k}><td className="py-2 text-ink">{k}</td><td>{list.length}</td><td>{reached("call_done", list)}</td><td>{reached("paid", list)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl text-ink">6–7. Koszt pozyskania i marża</h2>
          <p className="mt-1 text-xs text-muted">Wpisz własne dane z wybranego okresu – nic nie jest zapisywane ani szacowane.</p>
          <form className="mt-4 grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="days" value={days} />
            {(
              [
                ["spend", "Wydatki na reklamę (zł)"],
                ["price", "Cena Mapy Relacji (zł)"],
                ["cost", "Koszt realizacji 1 Mapy (zł)"],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className="text-xs text-muted">{l}
                <input name={k} type="number" min="0" step="1" defaultValue={sp[k] ?? ""} className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-ink ring-1 ring-sand-dark" />
              </label>
            ))}
            <button className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white sm:col-span-3 sm:justify-self-start">Przelicz</button>
          </form>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted">Koszt pozyskania płacącego klienta (CAC)</dt><dd className="font-display text-2xl text-forest">{spend && paid ? `${Math.round(spend / paid)} zł` : "—"}</dd></div>
            <div><dt className="text-muted">Koszt leada</dt><dd className="font-display text-2xl text-forest">{spend && d.leads.length ? `${Math.round(spend / d.leads.length)} zł` : "—"}</dd></div>
            <div><dt className="text-muted">Marża na 1 Mapie</dt><dd className="font-display text-2xl text-forest">{price ? `${price - cost} zł` : "—"}</dd></div>
            <div><dt className="text-muted">Marża po kosztach reklamy</dt><dd className="font-display text-2xl text-forest">{price && spend && paid ? `${Math.round(price - cost - spend / paid)} zł` : "—"}</dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}
