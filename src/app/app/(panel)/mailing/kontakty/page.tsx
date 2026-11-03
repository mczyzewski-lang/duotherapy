// Kontakty mailingu: tagi, zgoda, ścieżki, wysłane / kliknięte, zakup. Filtr po tagu i adresie.
import Link from "next/link";
import { Badge, Card, Input, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { normTag } from "@/lib/mailing";

export const metadata = { title: "Kontakty – mailing" };
export const dynamic = "force-dynamic";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const s = await requireStaff("admin");
  const sp = await searchParams;
  const tag = sp.tag ? normTag(sp.tag) : "";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 100);
  const rows = await asStaff(s, (tx) => tx<{
    id: string; code: string; email_lc: string; name: string | null; tags: string[]; marketing_consent: boolean; unsubscribed_at: Date | null; purchased_at: Date | null;
    created_at: Date; sent: number; clicks: number; seqs: string | null;
  }[]>`
    select c.*,
      (select count(*) from mail_sends x where x.contact_id = c.id and x.status = 'sent')::int as sent,
      (select count(*) from mail_clicks k where k.contact_id = c.id)::int as clicks,
      (select string_agg(e.sequence_id || ':' || e.status, ',') from mail_enrollments e where e.contact_id = c.id) as seqs
    from mail_contacts c
    where (${tag} = '' or ${tag} = any(c.tags)) and (${q} = '' or c.email_lc like ${"%" + q + "%"})
    order by c.created_at desc limit 300`);
  const SEQ: Record<string, string> = { lead: "przed zakupem", customer: "po zakupie" };
  const ST: Record<string, string> = { active: "w toku", done: "ukończona", stopped: "zatrzymana" };

  return (
    <>
      <PageTitle title="Kontakty i podróże" sub={<><Link href="/app/mailing" className="text-forest underline">← Mailing</Link> · kliknij osobę, żeby zobaczyć jej drogę do zakupu</>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="Szukaj po e-mailu" className="max-w-xs" />
        <Input name="tag" defaultValue={tag ? `#${tag}` : ""} placeholder="#tag" className="max-w-[12rem]" />
        <button className="rounded-full bg-forest px-4 text-sm font-semibold text-white">Filtruj</button>
      </form>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-linen/60 text-left text-xs text-muted">
            <tr><th className="px-4 py-2.5">E-mail</th><th>Tagi</th><th>Zgoda</th><th>Ścieżki</th><th>Wysłane</th><th>Kliknięcia</th><th>Zakup</th><th>Od</th></tr>
          </thead>
          <tbody className="divide-y divide-sand/60">
            {rows.map((c) => (
              <tr key={c.id} data-testid="contact-row">
                <td className="px-4 py-2.5"><Link href={`/app/mailing/kontakty/${c.id}`} className="font-medium text-forest underline">{c.email_lc}</Link>{c.name && <span className="block text-xs text-muted">{c.name}</span>}</td>
                <td><span className="flex max-w-[260px] flex-wrap gap-1">{c.tags.map((t) => <Badge key={t} tone={t === "klient" ? "ok" : "neutral"}>#{t}</Badge>)}</span></td>
                <td>{c.unsubscribed_at ? <Badge tone="alert">wypisany</Badge> : c.marketing_consent ? <Badge tone="ok">tak</Badge> : <Badge>nie</Badge>}</td>
                <td className="text-xs">{(c.seqs ?? "").split(",").filter(Boolean).map((x) => { const [a, b] = x.split(":"); return <span key={x} className="block">{SEQ[a] ?? a}: {ST[b] ?? b}</span>; })}</td>
                <td>{c.sent}</td>
                <td>{c.clicks}</td>
                <td>{c.purchased_at ? new Date(c.purchased_at).toLocaleDateString("pl-PL") : "—"}</td>
                <td className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString("pl-PL")}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="px-4 py-6 text-center text-muted">Brak kontaktów.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
