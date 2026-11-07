// Panel Mailing → Automatyzacje: „Gdy osoba potwierdzi numer kodem SMS” → wyślij e-mail i/lub SMS o odblokowaniu wszystkich materiałów.
import { Mail, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { saveSmsVerifiedAutomationAction } from "@/actions/automations";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card } from "@/components/ui";
import { AUTOMATION_VARS, loginLink, type Automations } from "@/lib/automations";

const field = "w-full rounded-xl bg-white px-3 py-2 text-sm text-ink ring-1 ring-sand focus:outline-none focus:ring-2 focus:ring-forest";

export function AutomationsCard({ a, stats, mail, sms }: { a: Automations; stats: { runs: number; email: number; sms: number }; mail: boolean; sms: boolean }) {
  const v = a.smsVerified;
  return (
    <Card className="mb-6 p-6" data-testid="automations">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-ink"><Zap size={18} className="text-clay" aria-hidden /> Automatyzacje</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">Reakcje na zdarzenia w serwisie – niezależnie od ścieżek nurturingu poniżej.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={mail ? "ok" : "clay"}>{mail ? "E-mail: skonfigurowany" : "E-mail: brak konfiguracji poczty"}</Badge>
          <Badge tone={sms ? "ok" : "clay"}>{sms ? "SMS: SMSAPI skonfigurowane" : "SMS: ustaw SMSAPI_TOKEN"}</Badge>
        </div>
      </div>

      <ActionForm action={saveSmsVerifiedAutomationAction as never} className="mt-5 rounded-2xl bg-linen/50 p-4 ring-1 ring-sand">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-xs text-white"><ShieldCheck size={13} aria-hidden /> Wyzwalacz</span>
          Gdy osoba wpisze kod SMS (pierwsze potwierdzenie numeru w materiale)
        </p>
        <p className="mt-1 text-xs text-muted">
          Potwierdzony numer = dostęp do wszystkich bezpłatnych materiałów („zalogowanie”). Link w wiadomościach prowadzi do {loginLink().replace(/^https?:\/\//, "")} – tam osoba loguje się kodem SMS.
          Uruchomień: <b>{stats.runs}</b> (e-maile wysłane: {stats.email}, SMS-y: {stats.sms}).
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-sand">
            <legend className="sr-only">E-mail</legend>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="email_enabled" value="1" defaultChecked={v.email.enabled} className="h-4 w-4 accent-[#36493d]" data-testid="auto-email-on" />
              <Mail size={16} className="text-forest" aria-hidden /> Wyślij e-mail
            </label>
            <label className="mt-3 block text-xs font-medium text-ink-soft">Temat
              <input name="subject" defaultValue={v.email.subject} className={`${field} mt-1`} maxLength={150} />
            </label>
            <label className="mt-3 block text-xs font-medium text-ink-soft">Treść
              <textarea name="body" defaultValue={v.email.body} rows={9} className={`${field} mt-1 font-mono text-[13px]`} />
            </label>
          </fieldset>
          <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-sand">
            <legend className="sr-only">SMS</legend>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="sms_enabled" value="1" defaultChecked={v.sms.enabled} className="h-4 w-4 accent-[#36493d]" data-testid="auto-sms-on" />
              <MessageSquare size={16} className="text-forest" aria-hidden /> Wyślij SMS
            </label>
            <label className="mt-3 block text-xs font-medium text-ink-soft">Treść SMS-a (nadawca DUO)
              <textarea name="sms" defaultValue={v.sms.text} rows={4} className={`${field} mt-1 font-mono text-[13px]`} maxLength={300} />
            </label>
            <p className="mt-1 text-xs text-muted">Krótko: 1 SMS to ok. 70 znaków z polskimi literami (160 bez nich). Link wstawiamy bez „https://”.</p>
            <div className="mt-4 rounded-xl bg-linen/60 p-3 text-xs text-ink-soft">
              <p className="font-semibold text-ink">Zmienne</p>
              <ul className="mt-1 space-y-0.5">
                {AUTOMATION_VARS.map(([k, d]) => <li key={k}><code className="rounded bg-white px-1">{k}</code> – {d}</li>)}
              </ul>
            </div>
          </fieldset>
        </div>
        <div className="mt-4"><SubmitButton size="sm">Zapisz automatyzację</SubmitButton></div>
      </ActionForm>
    </Card>
  );
}
