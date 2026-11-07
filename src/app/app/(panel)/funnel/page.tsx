import { Alert, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { readSettings } from "@/lib/settings";
import { system } from "@/lib/db";

export const metadata = { title: "Lejek" };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "–");
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
    const leads = await tx<{ stage: string; online: boolean; sale: number | null; ab_variant: string | null; src: string | null; camp: string | null; case_id: string | null; session_done: boolean; delivered: boolean }[]>`
      select l.stage, exists (select 1 from orders o where o.lead_id = l.id and o.status = 'paid') as online, l.sale_amount_pln as sale, l.ab_variant, l.attribution->>'utm_source' as src, l.attribution->>'utm_campaign' as camp, l.case_id,
        coalesce(c.session_ended_at is not null, false) as session_done,
        exists (select 1 from reports r join report_shares sh on sh.report_id = r.id where r.case_id = l.case_id) as delivered
      from leads l left join cases c on c.id = l.case_id
      where l.created_at >= ${since} and l.product = 'mapa_relacji'`;
    return { ev, steps, leads: [...leads], settings: await readSettings(tx) };
  });

  // materiały → podsumowanie → zapis z numerem → płatność za Mapę Relacji (osoby po e-mailu; same liczby, bez danych)
  const since = new Date(Date.now() - days * 86400_000);
  const [lm] = await system((tx) => tx<{ leads: number; summary: number; phone: number; paid: number }[]>`
    with p as (select lower(email) as e, min(created_at) as first_at from content_leads where created_at >= ${since} group by 1)
    select count(*)::int as leads,
      count(*) filter (where exists (select 1 from content_answers a where a.email_lc = p.e and a.summary_at is not null))::int as summary,
      count(*) filter (where exists (select 1 from content_leads c where lower(c.email) = p.e and c.phone_verified_at is not null))::int as phone,
      count(*) filter (where exists (select 1 from mail_contacts m where m.email_lc = p.e and m.purchased_at > p.first_at))::int as paid
    from p`);

  // ta sama ścieżka krok po kroku (sesje przeglądarki, które weszły na stronę materiału w tym okresie)
  const LM_STEPS: [string, string][] = [
    ["lead_magnet_landing_view", "Wejście na stronę materiału"],
    ["lead_magnet_form_started", "Rozpoczęty formularz"],
    ["lead_magnet_submitted", "Ukończony formularz (zapis)"],
    ["lead_magnet_summary_view", "Wygenerowane podsumowanie"],
    ["lead_magnet_offer_click", "Przejście do oferty Mapy Relacji"],
    ["checkout_started", "Rozpoczęta płatność"],
    ["purchase_completed", "Zakup"],
  ];
  const lmSteps = await asStaff(s, (tx) => tx<{ event: string; n: number }[]>`
    with cohort as (select distinct anon_id from funnel_events where event = 'lead_magnet_landing_view' and created_at >= ${since} and anon_id is not null)
    select f.event, count(distinct f.anon_id)::int as n from funnel_events f join cohort c on c.anon_id = f.anon_id
    where f.created_at >= ${since} and f.event in ${tx(LM_STEPS.map(([e]) => e))} group by 1`);
  const stepN = (e: string) => lmSteps.find((x) => x.event === e)?.n ?? 0;
  const drops = LM_STEPS.slice(1).map(([e], i) => ({ e, rate: stepN(LM_STEPS[i][0]) ? stepN(e) / stepN(LM_STEPS[i][0]) : 1 }));
  const worst = stepN(LM_STEPS[0][0]) ? drops.reduce((a, b) => (b.rate < a.rate ? b : a), drops[0]).e : null;

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
  const priceInput = Number(sp.price) || 0;
  const cost = Number(sp.cost) || 0;
  const paid = reached("paid");
  const sales = d.leads.map((l) => l.sale).filter((x): x is number => typeof x === "number" && x > 0);
  const revenue = sales.reduce((a, b) => a + b, 0);
  const avgSale = sales.length ? Math.round(revenue / sales.length) : 0;
  // cena: wpisana ręcznie albo średnia z faktycznie wpisanych kwot sprzedaży
  const price = priceInput || avgSale;

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
          <thead className="text-left text-xs text-muted"><tr><th className="py-2">Etap</th><th>Razem</th><th>Hero A</th><th>Hero B</th></tr></thead>
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
              <td className="py-2.5 text-ink">Kliknięcia przyklejonego CTA (telefon)</td>
              <td>{pct(count("sticky_cta_click"), count("landing_view"))} <span className="text-xs text-muted">({count("sticky_cta_click")})</span></td>
              {variants.map((v) => <td key={v}>{pct(count("sticky_cta_click", v), count("landing_view", v))}</td>)}
            </tr>
            <tr>
              <td className="py-2.5 text-ink">Otwarcie przykładowej Mapy Relacji</td>
              <td>{pct(count("sample_report_open"), count("landing_view"))} <span className="text-xs text-muted">({count("sample_report_open")})</span></td>
              {variants.map((v) => <td key={v}>{pct(count("sample_report_open", v), count("landing_view", v))}</td>)}
            </tr>
            <tr>
              <td className="py-2.5 text-ink">Błędy wysyłki formularza</td>
              <td>{count("lead_submission_error")}</td><td /><td />
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-muted">Ten sam nagłówek, różne rozwinięcie: A – nacisk na emocjonalny problem, B – nacisk na konkretną wartość Mapy Relacji (od 2.11.2026; starsze dane dotyczą wcześniejszych nagłówków, porównuj okresy po tej dacie). Wnioski wyciągaj dopiero przy kilkuset wejściach na wariant.</p>
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

      <Card className="mb-6 overflow-x-auto p-6" data-testid="lm-funnel">
        <h2 className="font-display text-xl text-ink">Materiał → podsumowanie → płatność za Mapę Relacji</h2>
        <p className="mt-1 text-xs text-muted">Osoby (po adresie e-mail), które odebrały bezpłatny materiał w tym okresie. Płatność – zakup Mapy Relacji po odebraniu materiału.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {(
            [
              ["Odebrany materiał", lm.leads, null],
              ["Zrobione podsumowanie", lm.summary, lm.leads],
              ["Zapis z numerem (#znumerem)", lm.phone, lm.leads],
              ["Płatność za Mapę Relacji", lm.paid, lm.leads],
            ] as [string, number, number | null][]
          ).map(([label, n, base], i) => (
            <div key={label} className="relative rounded-2xl bg-linen/60 p-4 ring-1 ring-sand">
              <p className="text-xs text-muted">{i + 1}. {label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{n}</p>
              {base !== null && <p className="text-xs text-forest">{pct(n, base)} z odebranych</p>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Podsumowanie → płatność: <strong>{pct(lm.paid, lm.summary)}</strong> · Sesje: otwarcia podsumowania {count("lead_magnet_summary_view")}, zapisy z numerem {count("lead_magnet_phone_saved")}.</p>
      </Card>

      <Card className="mb-6 overflow-x-auto p-6" data-testid="lm-steps">
        <h2 className="font-display text-xl text-ink">Materiał – konwersja na każdym kroku</h2>
        <p className="mt-1 text-xs text-muted">Sesje przeglądarki, które w tym okresie weszły na stronę materiału. Pokazuje, czy problemem jest pozyskanie, niedokończony formularz, czy decyzja o zakupie.</p>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted"><tr><th className="py-2">Krok</th><th>Sesje</th><th>Z poprzedniego kroku</th><th>Od wejścia</th></tr></thead>
          <tbody className="divide-y divide-sand/60">
            {LM_STEPS.map(([e, label], i) => (
              <tr key={e} className={worst === e ? "bg-alert-soft/40" : ""} data-step={e}>
                <td className="py-2.5 text-ink">{i + 1}. {label}{worst === e && <span className="ml-2 rounded-full bg-alert-soft px-2 py-0.5 text-[11px] font-semibold text-alert">największy spadek</span>}</td>
                <td className="font-medium">{stepN(e)}</td>
                <td>{i === 0 ? "–" : pct(stepN(e), stepN(LM_STEPS[i - 1][0]))}</td>
                <td>{i === 0 ? "–" : pct(stepN(e), stepN(LM_STEPS[0][0]))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">Podsumowanie wysłane e-mailem: {count("lead_magnet_summary_email")} · zapis z numerem: {count("lead_magnet_phone_saved")}.</p>
      </Card>

      <Card className="mb-6 overflow-x-auto p-6" data-testid="vsl-funnel">
        <h2 className="font-display text-xl text-ink">Strona po quizie (VSL) → zakup online</h2>
        <p className="mt-1 text-xs text-muted">Zakup liczony wyłącznie po potwierdzeniu operatora płatności. Unikalne sesje przeglądarki.</p>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted"><tr><th className="py-2">Etap</th><th>Konwersja</th><th>Hero A</th><th>Hero B</th></tr></thead>
          <tbody className="divide-y divide-sand/60">
            {(
              [
                ["Quiz ukończony → strona VSL", "quiz_completed", "vsl_page_view"],
                ["Strona VSL → odtworzenie filmu", "vsl_page_view", "vsl_play"],
                ["Film: 25% obejrzane", "vsl_play", "vsl_25_percent"],
                ["Film: 50% obejrzane", "vsl_play", "vsl_50_percent"],
                ["Film: 75% obejrzane", "vsl_play", "vsl_75_percent"],
                ["Film: obejrzany do końca", "vsl_play", "vsl_completed"],
                ["Strona VSL → „Zamawiam”", "vsl_page_view", "checkout_click"],
                ["„Zamawiam” → rozpoczęta płatność", "checkout_click", "checkout_started"],
                ["Rozpoczęta płatność → zakup", "checkout_started", "purchase_completed"],
                ["Strona VSL → zakup (łącznie)", "vsl_page_view", "purchase_completed"],
              ] as [string, string, string][]
            ).map(([label, from, to]) => (
              <tr key={label}>
                <td className="py-2.5 text-ink">{label}</td>
                <td><strong>{pct(count(to), count(from))}</strong> <span className="text-xs text-muted">({count(to)}/{count(from)})</span></td>
                {variants.map((v) => <td key={v}>{pct(count(to, v), count(from, v))}</td>)}
              </tr>
            ))}
            <tr><td className="py-2.5 text-ink">Płatności odrzucone</td><td>{count("purchase_failed")}</td><td /><td /></tr>
          </tbody>
        </table>
        <h3 className="mt-6 text-sm font-medium text-ink">Kanał sprzedaży (zgłoszenia z okresu)</h3>
        <table className="mt-2 w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted"><tr><th className="py-2">Kanał</th><th>Sprzedaże</th><th>% zgłoszeń</th><th>Przychód</th></tr></thead>
          <tbody className="divide-y divide-sand/60">
            {(
              [
                ["Online (bez rozmowy)", d.leads.filter((l) => l.online)],
                ["Przez konsultanta (po rozmowie)", d.leads.filter((l) => !l.online && STAGE_RANK.indexOf(l.stage) >= STAGE_RANK.indexOf("paid"))],
              ] as [string, typeof d.leads][]
            ).map(([label, list]) => (
              <tr key={label}>
                <td className="py-2.5 text-ink">{label}</td>
                <td className="font-medium">{list.length}</td>
                <td>{pct(list.length, d.leads.length)}</td>
                <td>{list.reduce((a, l) => a + (l.sale ?? 0), 0)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">Brak zakupu online → kontakt telefoniczny → zakup po rozmowie: zgłoszenia z otwartą lub przerwaną płatnością pozostają w Zgłoszeniach z regułą „kiedy dzwonić”.</p>
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
                ["Sprzedaże z wpisaną kwotą", sales.length, paid],
              ] as [string, number, number | null][]
            ).map(([label, n, base]) => (
              <tr key={label}><td className="py-2.5 text-ink">{label}</td><td className="font-medium">{n}</td><td className="text-muted">{base !== null ? pct(n, base) : ""}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-ink">
          Przychód z wpisanych kwot: <strong>{revenue} zł</strong>
          {avgSale > 0 && <span className="text-muted"> · średnia sprzedaż {avgSale} zł</span>}
        </p>
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
            <div><dt className="text-muted">Koszt pozyskania płacącego klienta (CAC)</dt><dd className="font-display text-2xl text-forest">{spend && paid ? `${Math.round(spend / paid)} zł` : "–"}</dd></div>
            <div><dt className="text-muted">Koszt leada</dt><dd className="font-display text-2xl text-forest">{spend && d.leads.length ? `${Math.round(spend / d.leads.length)} zł` : "–"}</dd></div>
            <div><dt className="text-muted">Marża na 1 Mapie</dt><dd className="font-display text-2xl text-forest">{price ? `${price - cost} zł` : "–"}</dd></div>
            <div><dt className="text-muted">Zwrot z reklamy (przychód / wydatki)</dt><dd className="font-display text-2xl text-forest">{spend && revenue ? `${(revenue / spend).toFixed(2)}×` : "–"}</dd></div>
            <div><dt className="text-muted">Marża po kosztach reklamy</dt><dd className="font-display text-2xl text-forest">{price && spend && paid ? `${Math.round(price - cost - spend / paid)} zł` : "–"}</dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}
