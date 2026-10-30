import { createUserAction, therapistProfileAction } from "@/actions/admin";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { SettingsForm } from "@/components/panel/settings-form";
import { Alert, Badge, Card, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { env } from "@/lib/env";
import { readSettings } from "@/lib/settings";

export const metadata = { title: "Ustawienia" };

const LABELS: Record<string, string> = {
  controllerName: "Administrator danych (nazwa)", controllerContact: "Dane kontaktowe administratora", dpoContact: "Inspektor ochrony danych (kontakt)",
  processingLocation: "Lokalizacja przetwarzania", retentionPolicy: "Okres przechowywania danych (polityka retencji)", privacyPolicy: "Polityka prywatności (pełna treść)",
  questionnaireNotice: "Klauzula informacyjna w kwestionariuszu ({administrator} = dane administratora)", leadContactConsent: "Zgoda na kontakt (formularz zgłoszenia)",
  leadMarketingConsent: "Zgoda marketingowa (opcjonalna)", version: "Wersja tekstów prawnych (zapisywana w rejestrze zgód)", approved: "Teksty zatwierdzone przez prawnika / IOD",
  priceIndividual: "Cena – audyt indywidualny (puste = ukryj)", priceCouple: "Cena – audyt dla pary (puste = ukryj)", contactPhone: "Telefon kontaktowy (puste = ukryj)",
  contactEmail: "E-mail kontaktowy (puste = ukryj)", vslUrl: "Film wyjaśniający usługę (adres embed youtube-nocookie / vimeo; puste = ukryj)", paymentUrl: "Link do płatności (https)", faq: "FAQ",
  invitationDays: "Ważność linku do kwestionariusza (dni)", reportShareDays: "Ważność linku do raportu (dni)", requirePaymentBeforeQuestionnaire: "Wymagaj płatności przed kwestionariuszem",
  items: "Numery pomocy", abroad: "Informacja dla osób poza Polską", verifiedNote: "Data weryfikacji numerów", disclaimer: "Zastrzeżenie",
};

export default async function SettingsPage() {
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => ({
    settings: await readSettings(tx),
    me: s.user.therapistId ? (await tx`select * from therapists where id = ${s.user.therapistId}`)[0] : null,
    team: s.user.role === "admin" ? await tx`select u.email, u.name, u.role, u.mfa_enabled, u.disabled, t.id as tid, t.display_name, t.title, t.bio, t.is_public from users u left join therapists t on t.user_id = u.id order by u.name` : [],
  }));
  return (
    <>
      <PageTitle title="Ustawienia" sub="Treści, dane administratora, zgody, integracje i zespół." />
      {env.demoMode && <Alert tone="warn" className="mb-6">Tryb DEMO. Przed przetwarzaniem prawdziwych danych przejdź listę z docs/production-readiness.md.</Alert>}
      <div className="grid gap-6 xl:grid-cols-2">
        {d.me && (
          <Card className="p-6">
            <h2 className="font-display text-xl text-ink">Mój profil</h2>
            <ActionForm action={therapistProfileAction as never} className="mt-4 space-y-3">
              <input type="hidden" name="therapist_id" value={d.me.id} />
              <Field label="Imię i nazwisko (w raportach)"><Input name="display_name" defaultValue={d.me.display_name} /></Field>
              <Field label="Tytuł zawodowy"><Input name="title" defaultValue={d.me.title ?? ""} /></Field>
              <Field label="Krótki opis (strona główna)"><Textarea name="bio" defaultValue={d.me.bio ?? ""} /></Field>
              {s.user.role === "admin" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_public" defaultChecked={d.me.is_public} className="accent-forest" /> pokaż na stronie głównej</label>}
              <SubmitButton size="sm">Zapisz profil</SubmitButton>
            </ActionForm>
          </Card>
        )}
        {s.user.role === "admin" ? (
          <>
            <Card className="p-6 xl:row-span-2">
              <h2 className="font-display text-xl text-ink">Dane prawne i zgody {d.settings.legal.approved ? <Badge tone="ok">zatwierdzone</Badge> : <Badge tone="alert">niezatwierdzone</Badge>}</h2>
              <p className="mb-4 mt-1 text-xs text-muted">Do uzupełnienia i zatwierdzenia przez właściciela usługi oraz prawnika/IOD. Zmieniając treść, podnieś wersję.</p>
              <SettingsForm section="legal" value={d.settings.legal as never} labels={LABELS} />
            </Card>
            <Card className="p-6"><h2 className="mb-4 font-display text-xl text-ink">Strona i lejek</h2><SettingsForm section="site" value={d.settings.site as never} labels={LABELS} /></Card>
            <Card className="p-6"><h2 className="mb-4 font-display text-xl text-ink">Przebieg</h2><SettingsForm section="flow" value={d.settings.flow as never} labels={LABELS} /></Card>
            <Card className="p-6"><h2 className="mb-4 font-display text-xl text-ink">Numery pomocy</h2><SettingsForm section="helplines" value={d.settings.helplines as never} labels={LABELS} /></Card>
            <Card className="p-6">
              <h2 className="font-display text-xl text-ink">Zespół</h2>
              <ul className="mt-3 divide-y divide-sand/70 text-sm">
                {d.team.map((u) => <li key={u.email} className="py-2">{u.name} <span className="text-muted">· {u.email} · {u.role === "admin" ? "administrator" : "psycholog"}</span> {u.mfa_enabled ? <Badge tone="ok">MFA</Badge> : <Badge tone="clay">bez MFA</Badge>} {u.is_public && <Badge>na stronie</Badge>}</li>)}
              </ul>
              <ActionForm action={createUserAction as never} className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Imię i nazwisko"><Input name="name" /></Field>
                <Field label="E-mail"><Input name="email" type="email" /></Field>
                <Field label="Rola"><Select name="role"><option value="therapist">psycholog</option><option value="admin">administrator</option></Select></Field>
                <Field label="Hasło tymczasowe (min. 12 znaków)"><Input name="password" type="password" autoComplete="new-password" /></Field>
                <div className="sm:col-span-2"><SubmitButton size="sm">Dodaj osobę</SubmitButton></div>
              </ActionForm>
            </Card>
            <Card className="p-6">
              <h2 className="font-display text-xl text-ink">Integracje</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li><strong className="text-ink">E-mail:</strong> brak – linki i kody kopiujesz ręcznie. Integracja wymaga umowy powierzenia i decyzji, by nie wysyłać treści wrażliwych.</li>
                <li><strong className="text-ink">Płatności:</strong> link do płatności w sekcji „Strona i lejek”; status płatności oznaczasz ręcznie w karcie sprawy.</li>
                <li><strong className="text-ink">Kalendarz:</strong> brak – terminy proponujesz w karcie sprawy, klient wybiera pod swoim linkiem.</li>
                <li><strong className="text-ink">AI:</strong> wyłączone. Szkic raportu powstaje lokalnie z szablonu. Włączenie modelu AI wymaga DPIA, umowy powierzenia, przetwarzania w UE i wyraźnej zgody.</li>
                <li><strong className="text-ink">Analityka:</strong> brak skryptów analitycznych i reklamowych.</li>
              </ul>
            </Card>
          </>
        ) : (
          <Alert tone="info">Ustawienia usługi może zmieniać administrator.</Alert>
        )}
      </div>
    </>
  );
}
