// Panel „Wiedza” (administrator): zapisy na materiały, zgody, dostarczenie, sekwencje i lejek per materiał.
// Bez profilu psychologicznego – widać tylko e-mail, imię (opcjonalne), identyfikator materiału i statusy.
import { Badge, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { MAGNETS } from "@/knowledge/registry";
import { CoverAdmin } from "@/components/knowledge/cover-admin";
import { MagnetVisibilityAdmin } from "@/components/knowledge/visibility-admin";
import { ArtExtraAdmin } from "@/components/knowledge/art-extra-admin";
import { ArticleImagesAdmin } from "@/components/articles/images-admin";
import { customerMailConfigured } from "@/lib/notify";

export const metadata = { title: "Wiedza – zapisy" };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "–");
const DELIVERY: Record<string, [string, "ok" | "clay" | "alert" | "neutral"]> = {
  sent: ["wysłano", "ok"],
  not_configured: ["wysyłka nieskonfigurowana", "clay"],
  failed: ["błąd wysyłki", "alert"],
  pending: ["w toku", "neutral"],
};

export default async function KnowledgeAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const s = await requireStaff("admin");
  const d = await asStaff(s, async (tx) => {
    const since = new Date(Date.now() - days * 86400_000);
    return {
      ev: await tx<{ event: string; step: number | null; n: number }[]>`
        select event, step, count(distinct anon_id)::int as n from funnel_events
        where created_at >= ${since} and (event like 'lead_magnet_%' or event in ('knowledge_hub_view', 'mapa_relacji_cta_click')) group by 1, 2`,
      leads: await tx`
        select c.*, (select count(*) from content_lead_messages m where m.content_lead_id = c.id and m.status = 'sent')::int as sent_msgs
        from content_leads c where c.created_at >= ${since} order by c.created_at desc limit 300`,
      sales: await tx<{ camp: string | null; paid: number; leads: number; revenue: number }[]>`
        select attribution->>'utm_campaign' as camp, count(*)::int as leads,
               count(*) filter (where stage in ('paid', 'converted'))::int as paid, coalesce(sum(sale_amount_pln) filter (where stage in ('paid', 'converted')), 0)::int as revenue
        from leads where attribution->>'utm_source' = 'duo_wiedza' and created_at >= ${since} group by 1`,
    };
  });
  const c = (event: string, step?: number) => d.ev.filter((e) => e.event === event && (step === undefined || e.step === step)).reduce((a, e) => a + e.n, 0);
  const smtp = customerMailConfigured();
  const nurture = process.env.NURTURE_ENABLED === "true";

  return (
    <>
      <PageTitle
        title="Wiedza – zapisy na materiały"
        sub="Pobranie materiału nie jest prośbą o telefon – te osoby nie trafiają do Zgłoszeń. Zdarzenia liczone jako unikalne sesje przeglądarki."
        actions={
          <nav className="flex gap-1 rounded-full bg-linen p-1 text-sm" aria-label="Okres">
            {[7, 30, 90].map((n) => (
              <a key={n} href={`?days=${n}`} aria-current={n === days ? "page" : undefined} className={`rounded-full px-3 py-1 ${n === days ? "bg-white font-medium shadow-soft" : "text-muted"}`}>{n} dni</a>
            ))}
          </nav>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Badge tone={smtp ? "ok" : "clay"}>{smtp ? "Wysyłka skonfigurowana – materiały są wysyłane e-mailem" : "Brak wysyłki (Resend / SMTP) – materiał dostępny tylko na stronie podziękowania"}</Badge>
        <Badge tone={nurture ? "ok" : "neutral"}>{nurture ? "Seria 7 dni włączona (NURTURE_ENABLED)" : "Seria 7 dni wyłączona"}</Badge>
        <Badge tone="forest"><a href="/app/mailing" className="underline">Nurturing e-mailowy → Mailing</a></Badge>
      </div>

      <MagnetVisibilityAdmin />
      <ArtExtraAdmin />
      <CoverAdmin />
      <ArticleImagesAdmin />

      <Card className="mb-6 overflow-x-auto p-6">
        <h2 className="font-display text-xl text-ink">Materiały: landing → e-mail → dostarczenie → Mapa Relacji</h2>
        <p className="mt-1 text-xs text-muted">Strona zbiorcza /wiedza: {c("knowledge_hub_view")} wejść. Koszt pozyskania e-maila = wydatki na reklamę danego materiału / zapisy (licz w panelu reklamowym).</p>
        <table className="mt-4 w-full min-w-[900px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr><th className="py-2">Materiał</th><th>Wejścia</th><th>Formularz</th><th>Zapisy</th><th>Konwersja</th><th>Dostarczone</th><th>Demo/online</th><th>PDF</th><th>Klik Mapa</th><th>Zakupy Mapy</th></tr>
          </thead>
          <tbody className="divide-y divide-sand/60">
            {MAGNETS.map((m) => {
              const sale = d.sales.find((x) => x.camp === m.id);
              const subs = d.leads.filter((l) => l.magnet_id === m.id);
              return (
                <tr key={m.id}>
                  <td className="py-2.5 text-ink">{m.short} <span className="text-xs text-muted">({m.id})</span></td>
                  <td>{c("lead_magnet_landing_view", m.n)}</td>
                  <td>{c("lead_magnet_form_view", m.n)}</td>
                  <td className="font-medium">{subs.length}</td>
                  <td>{pct(c("lead_magnet_submitted", m.n), c("lead_magnet_landing_view", m.n))}</td>
                  <td>{subs.filter((l) => l.delivery_status === "sent").length}</td>
                  <td>{c("lead_magnet_demo_view", m.n)}</td>
                  <td>{c("lead_magnet_pdf_download", m.n)}</td>
                  <td>{c("mapa_relacji_cta_click", m.n)}</td>
                  <td>{sale ? `${sale.paid} (${sale.revenue} zł)` : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">„Zakupy Mapy” = zgłoszenia z quizu, które przyszły z linku w materiale (utm_source=duo_wiedza) i są opłacone. CAC z materiałów = wydatki / zakupy.</p>
      </Card>

      <Card className="overflow-x-auto p-6">
        <h2 className="font-display text-xl text-ink">Ostatnie zapisy</h2>
        {d.leads.length === 0 ? <p className="mt-3 text-sm text-muted">Brak zapisów w tym okresie.</p> : (
          <table className="mt-4 w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs text-muted"><tr><th className="py-2">Data</th><th>E-mail</th><th>Imię</th><th>Materiał</th><th>Źródło</th><th>Zgody</th><th>Dostarczenie</th><th>Kolejne wiadomości</th></tr></thead>
            <tbody className="divide-y divide-sand/60">
              {d.leads.map((l) => {
                const [label, tone] = DELIVERY[l.delivery_status] ?? [l.delivery_status, "neutral"];
                return (
                  <tr key={l.id}>
                    <td className="py-2 text-xs">{new Date(l.created_at).toLocaleString("pl-PL")}</td>
                    <td>{l.email}</td>
                    <td>{l.name ?? "–"}</td>
                    <td>{l.magnet_id}</td>
                    <td className="text-xs">{[l.attribution?.utm_source, l.attribution?.utm_campaign].filter(Boolean).join(" · ") || "bezpośrednio"}</td>
                    <td className="text-xs">{l.relationship ? (l.relationship === "para" ? "para" : "małżeństwo") : "–"} · {l.has_children === null ? "–" : l.has_children ? "dzieci" : "bez dzieci"}<br />marketing: {l.marketing_consent ? "tak" : "nie"}{l.series_consent ? " · seria 7 dni" : ""}{l.unsubscribed_at ? " · wypisany" : ""}</td>
                    <td><Badge tone={tone}>{label}</Badge></td>
                    <td className="text-xs">{l.marketing_consent || l.series_consent ? `${l.marketing_consent ? "zgoda – nurturing (Mailing)" : ""}${l.series_consent ? `${l.marketing_consent ? " · " : ""}seria: dzień ${l.series_day}/7` : ""}` : "brak zgody – nie wysyłamy"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
