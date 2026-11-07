// Automatyzacje (panel Mailing): reakcje na zdarzenia w serwisie. Na razie jedno zdarzenie –
// „osoba potwierdziła numer telefonu kodem SMS” → e-mail i/lub SMS o odblokowaniu wszystkich bezpłatnych materiałów.
import type { Tx } from "./db";
import { system } from "./db";
import { env } from "./env";
import { customerMailConfigured, notifyCustomer } from "./notify";
import { sendSms, smsConfigured } from "./sms";

export interface SmsVerifiedAutomation {
  email: { enabled: boolean; subject: string; body: string };
  sms: { enabled: boolean; text: string };
}
export interface Automations { smsVerified: SmsVerifiedAutomation }

export const AUTOMATION_VARS = [
  ["{imie}", "imię osoby (albo puste)"],
  ["{liczba}", "liczba bezpłatnych materiałów na stronie"],
  ["{link}", "strona logowania kodem SMS"],
] as const;

export const DEFAULT_AUTOMATIONS: Automations = {
  smsVerified: {
    email: {
      enabled: true,
      subject: "Masz dostęp do wszystkich bezpłatnych materiałów DUO",
      body:
        "Cześć {imie},\n\nTwój numer telefonu jest potwierdzony – od teraz masz dostęp do wszystkich {liczba} bezpłatnych materiałów DUO, bez podawania e-maila przy każdym z nich.\n\n" +
        "Wejdź na stronę poniżej i zaloguj się kodem SMS:\n{link}\n\nTwoje odpowiedzi w materiałach widzisz tylko Ty.\n\nZespół DUO",
    },
    sms: { enabled: true, text: "DUO: Masz dostęp do wszystkich {liczba} bezpłatnych materiałów. Zaloguj się kodem SMS: {link}" },
  },
};

const merge = (v: Partial<Automations> | undefined): Automations => ({
  smsVerified: {
    email: { ...DEFAULT_AUTOMATIONS.smsVerified.email, ...(v?.smsVerified?.email ?? {}) },
    sms: { ...DEFAULT_AUTOMATIONS.smsVerified.sms, ...(v?.smsVerified?.sms ?? {}) },
  },
});

export async function readAutomations(tx: Tx): Promise<Automations> {
  const [r] = await tx<{ value: Partial<Automations> }[]>`select value from app_settings where key = 'automations'`;
  return merge(r?.value);
}

export const loginLink = () => `${env.appUrl}/wiedza/zaloguj`;
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(imie|liczba|link)\}/g, (_, k: string) => v[k] ?? "").replace(/Cześć ,/g, "Cześć,");

/** Po pierwszym potwierdzeniu numeru: e-mail i SMS wg ustawień. Błędy nie przerywają potwierdzenia – trafiają do dziennika. */
export async function runSmsVerifiedAutomation(p: { email: string; name: string | null; phone: string; count: number }) {
  const a = await system((tx) => readAutomations(tx));
  const vars = { imie: p.name ?? "", liczba: String(p.count), link: loginLink() };
  const out = { email: "wyłączony", sms: "wyłączony" };
  try {
    if (a.smsVerified.email.enabled) {
      if (!customerMailConfigured()) out.email = "poczta nieskonfigurowana";
      else out.email = (await notifyCustomer(p.email, fill(a.smsVerified.email.subject, vars), fill(a.smsVerified.email.body, vars))) ? "wysłany" : "błąd";
    }
    if (a.smsVerified.sms.enabled) {
      if (!smsConfigured()) out.sms = "SMSAPI nieskonfigurowane";
      else out.sms = (await sendSms(p.phone, fill(a.smsVerified.sms.text, { ...vars, link: vars.link.replace(/^https?:\/\//, "") }))).ok ? "wysłany" : "błąd";
    }
  } catch (e) {
    console.error("[automatyzacje] sms_verified:", e);
  }
  await system((tx) => tx`insert into audit_logs (actor_kind, action, entity, meta) values ('public', 'automation_sms_verified', 'automation', ${tx.json(out)})`);
  return out;
}
