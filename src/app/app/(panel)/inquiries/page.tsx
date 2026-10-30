import { Mail, Phone } from "lucide-react";
import { inquiryStatusAction } from "@/actions/inquiries";
import { SubmitButton } from "@/components/form-bits";
import { Alert, Badge, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { notificationsEnabled } from "@/lib/notify";

export const metadata = { title: "Wiadomości" };

const LABEL: Record<string, string> = { new: "nowa", answered: "odpowiedziano", archived: "archiwum" };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const s = await requireStaff();
  const rows = await asStaff(s, (tx) => tx`
    select i.*, u.name as handler from inquiries i left join users u on u.id = i.handled_by
    where ${all === "1"} or i.status <> 'archived' order by (i.status = 'new') desc, i.created_at desc limit 200`);
  return (
    <>
      <PageTitle title="Wiadomości" sub="Pytania z formularza „Masz pytania? Napisz do mnie” na stronie głównej." actions={<a className="text-sm text-forest" href={all === "1" ? "?" : "?all=1"}>{all === "1" ? "Ukryj archiwum" : "Pokaż archiwum"}</a>} />
      {!notificationsEnabled() && (
        <Alert tone="info" className="mb-6">Powiadomienia e-mail o nowych wiadomościach są wyłączone. Aby je włączyć, ustaw zmienne SMTP_URL i NOTIFY_EMAIL (powiadomienie nie zawiera treści pytania).</Alert>
      )}
      {rows.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted ring-1 ring-sand">Brak wiadomości.</p>}
      <div className="space-y-4">
        {rows.map((r) => {
          const msg = decrypt<string>(r.message_enc) ?? "";
          const reply = `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent("Odpowiedź – DUO Terapia małżeństw")}&body=${encodeURIComponent(`Dzień dobry ${r.name},\n\n\n\n---\nTwoje pytanie:\n${msg}`)}`;
          return (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{r.name} <span className="font-normal text-muted">· {r.email}{r.phone && <> · <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="text-forest">{r.phone}</a></>}</span></p>
                  <p className="text-xs text-muted">{new Date(r.created_at).toLocaleString("pl-PL")}{r.handler ? ` · ${LABEL[r.status]}: ${r.handler}` : ""}</p>
                </div>
                <Badge tone={r.status === "new" ? "clay" : r.status === "answered" ? "ok" : "neutral"}>{LABEL[r.status]}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{msg}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={reply} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-600"><Mail size={15} aria-hidden /> Odpowiedz e-mailem</a>
                {r.phone && <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-forest ring-1 ring-sand-dark hover:bg-linen"><Phone size={15} aria-hidden /> Zadzwoń</a>}
                {(["answered", "archived", "new"] as const).filter((x) => x !== r.status).map((st) => (
                  <form key={st} action={inquiryStatusAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={st} />
                    <SubmitButton size="sm" variant="ghost">{{ answered: "Oznacz: odpowiedziano", archived: "Do archiwum", new: "Oznacz jako nową" }[st]}</SubmitButton>
                  </form>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
