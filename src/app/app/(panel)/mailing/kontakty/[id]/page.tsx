// Podróż kontaktu: pobrane materiały → wysłane e-maile → kliknięcia → quiz → zamówienie i płatność. Tagi i wypisanie.
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactTagsAction, contactUnsubscribeAction } from "@/actions/mailing";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card, Input, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { magnetById } from "@/knowledge/registry";

export const metadata = { title: "Podróż kontaktu – mailing" };
export const dynamic = "force-dynamic";

type Ev = { at: Date; kind: "magnet" | "send" | "skip" | "click" | "lead" | "order" | "paid" | "unsub"; text: string; sub?: string };
const ICON: Record<Ev["kind"], [string, "neutral" | "forest" | "clay" | "alert" | "ok"]> = {
  magnet: ["Materiał", "forest"], send: ["E-mail", "neutral"], skip: ["Pominięty", "neutral"], click: ["Kliknięcie", "clay"],
  lead: ["Quiz", "forest"], order: ["Zamówienie", "clay"], paid: ["Zakup", "ok"], unsub: ["Wypisanie", "alert"],
};

export default async function ContactJourney({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireStaff("admin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asStaff(s, async (tx) => {
    const [c] = await tx`select * from mail_contacts where id = ${id}`;
    if (!c) return null;
    return {
      c,
      magnets: await tx`select created_at, magnet_id, marketing_consent from content_leads where lower(email) = ${c.email_lc} order by created_at`,
      sends: await tx`select x.created_at, x.status, x.reason, st.code, st.subject from mail_sends x join mail_steps st on st.id = x.step_id where x.contact_id = ${id}`,
      clicks: await tx`select k.created_at, k.target, st.code from mail_clicks k left join mail_steps st on st.id = k.step_id where k.contact_id = ${id}`,
      leads: await tx`select id, created_at, name, stage from leads where mail_contact_id = ${id} or lower(email) = ${c.email_lc}`,
      orders: await tx`select o.created_at, o.paid_at, o.status, o.amount_pln from orders o join leads l on l.id = o.lead_id
                       where o.mail_contact_id = ${id} or l.mail_contact_id = ${id} or lower(coalesce(o.customer_email, l.email, '')) = ${c.email_lc}`,
      enr: await tx`select sequence_id, status, enrolled_at, stopped_reason from mail_enrollments where contact_id = ${id}`,
    };
  });
  if (!d) notFound();
  const { c } = d;
  const ev: Ev[] = [
    ...d.magnets.map((m) => ({ at: m.created_at, kind: "magnet" as const, text: `Pobrał(a) „${magnetById(m.magnet_id)?.short ?? m.magnet_id}”`, sub: m.marketing_consent ? "ze zgodą marketingową" : "bez zgody marketingowej" })),
    ...d.sends.map((x) => ({ at: x.created_at, kind: x.status === "skipped" ? ("skip" as const) : ("send" as const), text: `${x.code}: ${x.subject}`, sub: x.status === "sent" ? "wysłano" : x.reason ?? x.status })),
    ...d.clicks.map((k) => ({ at: k.created_at, kind: "click" as const, text: `Kliknięcie w /${k.code ?? "?"}/${c.code}`, sub: `→ ${k.target}` })),
    ...d.leads.map((l) => ({ at: l.created_at, kind: "lead" as const, text: "Quiz Mapy Relacji – prośba o kontakt", sub: `etap: ${l.stage}` })),
    ...d.orders.map((o) => ({ at: o.created_at, kind: "order" as const, text: `Zamówienie ${o.amount_pln} zł`, sub: `status: ${o.status}` })),
    ...d.orders.filter((o) => o.paid_at).map((o) => ({ at: o.paid_at, kind: "paid" as const, text: `Opłacono ${o.amount_pln} zł` })),
    ...(c.unsubscribed_at ? [{ at: c.unsubscribed_at, kind: "unsub" as const, text: "Wypisanie z wiadomości" }] : []),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <>
      <PageTitle title={c.email_lc} sub={<><Link href="/app/mailing/kontakty" className="text-forest underline">← Kontakty</Link> · kod osoby w linkach: <span className="font-mono">{c.code}</span></>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h2 className="font-display text-xl text-ink">Podróż</h2>
          <ol className="mt-4 space-y-3" data-testid="journey">
            {ev.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs text-muted">{new Date(e.at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</span>
                <span><Badge tone={ICON[e.kind][1]}>{ICON[e.kind][0]}</Badge> <span className="text-sm text-ink">{e.text}</span>{e.sub && <span className="block text-xs text-muted">{e.sub}</span>}</span>
              </li>
            ))}
            {!ev.length && <li className="text-sm text-muted">Brak zdarzeń.</li>}
          </ol>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Tagi</h2>
            <ActionForm action={contactTagsAction as never} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={c.id} />
              <Input name="tags" defaultValue={(c.tags as string[]).map((t) => `#${t}`).join(" ")} aria-label="Tagi" />
              <SubmitButton size="sm" variant="secondary">Zapisz</SubmitButton>
            </ActionForm>
          </Card>
          <Card className="p-6 text-sm">
            <h2 className="font-display text-lg text-ink">Status</h2>
            <dl className="mt-3 space-y-1.5">
              <div className="flex justify-between"><dt className="text-muted">Zgoda marketingowa</dt><dd>{c.marketing_consent ? "tak" : "nie"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Zakup</dt><dd>{c.purchased_at ? new Date(c.purchased_at).toLocaleString("pl-PL") : "–"}</dd></div>
              {d.enr.map((e) => (
                <div key={e.sequence_id} className="flex justify-between"><dt className="text-muted">Ścieżka {e.sequence_id === "lead" ? "przed zakupem" : "po zakupie"}</dt><dd>{e.status}{e.stopped_reason ? ` (${e.stopped_reason})` : ""}</dd></div>
              ))}
            </dl>
            {!c.unsubscribed_at && (
              <ActionForm action={contactUnsubscribeAction as never} className="mt-4">
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton size="sm" variant="danger" confirm="Wypisać tę osobę ze wszystkich wiadomości z sekwencji?">Wypisz z wiadomości</SubmitButton>
              </ActionForm>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
