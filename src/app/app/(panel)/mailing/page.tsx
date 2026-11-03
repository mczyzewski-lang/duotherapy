// Mailing (administrator): dwie ścieżki – przed zakupem (→ Mapa Relacji) i po zakupie – z e-mailami, warunkami tagów i wynikami.
import Link from "next/link";
import { runNowAction, saveSequenceAction } from "@/actions/mailing";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { TagChips } from "@/components/mailing";
import { Badge, Card, LinkButton, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureDefaults, resendConfigured, type StepRow } from "@/lib/mailing";

export const metadata = { title: "Mailing" };
export const dynamic = "force-dynamic";

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

export default async function MailingPage() {
  const s = await requireStaff("admin");
  await system((tx) => ensureDefaults(tx));
  const d = await asStaff(s, async (tx) => ({
    sequences: await tx<{ id: "lead" | "customer"; name: string; active: boolean; requires_consent: boolean }[]>`select * from mail_sequences order by trigger`,
    steps: await tx<(StepRow & { sent: number; skipped: number; clickers: number; buyers: number })[]>`
      select st.*,
        (select count(*) from mail_sends x where x.step_id = st.id and x.status = 'sent')::int as sent,
        (select count(*) from mail_sends x where x.step_id = st.id and x.status = 'skipped')::int as skipped,
        (select count(distinct k.contact_id) from mail_clicks k where k.step_id = st.id)::int as clickers,
        (select count(distinct k.contact_id) from mail_clicks k join mail_contacts c on c.id = k.contact_id where k.step_id = st.id and c.purchased_at > k.created_at)::int as buyers
      from mail_steps st order by st.sequence_id, st.position`,
    enr: await tx<{ sequence_id: string; status: string; n: number }[]>`select sequence_id, status, count(*)::int as n from mail_enrollments group by 1, 2`,
    contacts: (await tx<{ total: number; consent: number; unsub: number; buyers: number }[]>`
      select count(*)::int as total, count(*) filter (where marketing_consent and unsubscribed_at is null)::int as consent,
             count(*) filter (where unsubscribed_at is not null)::int as unsub, count(*) filter (where purchased_at is not null)::int as buyers from mail_contacts`)[0],
    tags: await tx<{ tag: string; n: number }[]>`select t as tag, count(*)::int as n from mail_contacts, unnest(tags) t group by 1 order by 2 desc, 1 limit 40`,
  }));
  const resend = resendConfigured();
  const cron = (process.env.CRON_SECRET ?? "").length >= 24;
  const enr = (seq: string, st: string) => d.enr.find((e) => e.sequence_id === seq && e.status === st)?.n ?? 0;

  return (
    <>
      <PageTitle
        title="Mailing – nurturing"
        sub="Osoba, która pobiera materiał, dostaje tag (np. #lm-petla-konfliktu) i trafia na ścieżkę „przed zakupem”. Po zakupie dostaje tag #klient, ta ścieżka się zatrzymuje i startuje ścieżka „po zakupie” – bez Mapy Relacji."
        actions={<LinkButton href="/app/mailing/kontakty" variant="secondary" size="sm">Kontakty i podróże ({d.contacts.total})</LinkButton>}
      />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Badge tone={resend ? "ok" : "clay"}>{resend ? "Resend skonfigurowany" : "Resend nieskonfigurowany – ustaw RESEND_API_KEY i MAIL_FROM"}</Badge>
        <Badge tone={cron ? "ok" : "neutral"}>{cron ? "Harmonogram: CRON_SECRET ustawiony" : "Harmonogram: ustaw CRON_SECRET i wywołuj /api/cron/nurture co godzinę"}</Badge>
        <Badge>Link w mailu: {env.appUrl.replace(/^https?:\/\//, "")}/<b>kod maila</b>/<b>kod osoby</b></Badge>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[["Kontakty", d.contacts.total], ["Ze zgodą marketingową", d.contacts.consent], ["Kupili", d.contacts.buyers], ["Wypisani", d.contacts.unsub]].map(([l, n]) => (
          <Card key={l} className="p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 font-display text-2xl text-ink">{n}</p></Card>
        ))}
      </div>

      {d.sequences.map((q) => {
        const steps = d.steps.filter((x) => x.sequence_id === q.id);
        return (
          <Card key={q.id} className="mb-6 overflow-x-auto p-6" data-testid={`seq-${q.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-ink">{q.name} {q.active ? <Badge tone="ok">włączona</Badge> : <Badge>wyłączona</Badge>}</h2>
                <p className="mt-1 text-xs text-muted">
                  {q.id === "lead" ? "Start: zapis na materiał (albo quiz z e-mailem). Koniec: zakup." : "Start: opłacone zamówienie (webhook płatności)."} W ścieżce: {enr(q.id, "active")} aktywnych, {enr(q.id, "done")} ukończonych, {enr(q.id, "stopped")} zatrzymanych.
                </p>
              </div>
              <ActionForm action={saveSequenceAction as never} className="flex flex-wrap items-center gap-3 text-sm">
                <input type="hidden" name="id" value={q.id} />
                <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={q.active} className="h-4 w-4 accent-[#36493d]" /> Wysyłaj</label>
                <label className="flex items-center gap-2" title="Wiadomości marketingowe wolno wysyłać tylko osobom ze zgodą"><input type="checkbox" name="requires_consent" defaultChecked={q.requires_consent} className="h-4 w-4 accent-[#36493d]" /> Tylko ze zgodą marketingową</label>
                <SubmitButton size="sm" variant="secondary" confirm={!q.active ? "Włączyć wysyłkę tej ścieżki do prawdziwych kontaktów?" : undefined}>Zapisz</SubmitButton>
              </ActionForm>
            </div>
            <table className="mt-4 w-full min-w-[860px] text-sm [&_td]:pr-3 [&_th]:pr-3">
              <thead className="text-left text-xs text-muted">
                <tr><th className="py-2">Kod / link</th><th>Dzień</th><th>Temat</th><th>Warunek tagów</th><th>Wysłane</th><th>Pominięte</th><th>Kliknęło</th><th>Kupiło po kliknięciu</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {steps.map((st) => (
                  <tr key={st.id} className={st.active ? "" : "opacity-50"}>
                    <td className="py-2.5 font-mono text-xs">/{st.code}/…</td>
                    <td>+{st.delay_days}</td>
                    <td className="max-w-[260px]"><span className="font-medium text-ink">{st.subject}</span><span className="block truncate text-xs text-muted">CTA → {st.cta_url}</span></td>
                    <td><TagChips step={st} /></td>
                    <td>{st.sent}</td>
                    <td>{st.skipped}</td>
                    <td>{st.clickers} <span className="text-xs text-muted">({pct(st.clickers, st.sent)})</span></td>
                    <td>{st.buyers}</td>
                    <td><Link href={`/app/mailing/${st.id}`} className="text-forest underline">Edytuj</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <LinkButton href={`/app/mailing/nowy?sciezka=${q.id}`} size="sm" variant="ghost" className="mt-3">+ Dodaj e-mail</LinkButton>
          </Card>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-xl text-ink">Uruchom wysyłkę teraz</h2>
          <p className="mt-1 text-sm text-ink-soft">Normalnie robi to harmonogram co godzinę. Każda osoba dostaje maks. 1 wiadomość na uruchomienie; wysyłane są tylko włączone ścieżki.</p>
          <ActionForm action={runNowAction as never} className="mt-4">
            <SubmitButton variant="secondary" confirm="Wysłać zaległe wiadomości do kontaktów z włączonych ścieżek?">Uruchom teraz</SubmitButton>
          </ActionForm>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl text-ink">Tagi</h2>
          <p className="mt-1 text-xs text-muted">Nadawane automatycznie: #lm-&lt;materiał&gt; (pobranie), #seria-7-dni, #quiz (quiz z e-mailem), #klient (zakup). Własne tagi dodasz przy kontakcie.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.tags.length ? d.tags.map((t) => <Link key={t.tag} href={`/app/mailing/kontakty?tag=${t.tag}`}><Badge>#{t.tag} · {t.n}</Badge></Link>) : <span className="text-sm text-muted">Brak kontaktów.</span>}
          </div>
        </Card>
      </div>
    </>
  );
}
