// SMS przez SMSAPI (smsapi.pl). Konfiguracja: SMSAPI_TOKEN (token OAuth z panelu SMSAPI) i SMSAPI_SENDER (pole nadawcy, domyślnie „DUO”).
// Bez tokenu: w trybie DEMO kod pokazujemy na ekranie (wyraźnie oznaczony), w produkcji – komunikat, że SMS nie jest skonfigurowany.
import { env } from "./env";

export const smsConfigured = () => Boolean(process.env.SMSAPI_TOKEN);
export const smsSender = () => process.env.SMSAPI_SENDER || "DUO";

/** Polski numer komórkowy → +48XXXXXXXXX (albo null). Przyjmuje spacje, myślniki, +48 / 0048 / 48. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0048")) d = d.slice(4);
  else if (d.length === 11 && d.startsWith("48")) d = d.slice(2);
  return /^[4-8][0-9]{8}$/.test(d) ? `+48${d}` : null;
}
/** „••• ••• 123” – do potwierdzenia „czy to Twój numer” bez ujawniania całości. */
export const maskPhone = (p: string) => `••• ••• ${p.slice(-3)}`;

export async function sendSms(phone: string, text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!smsConfigured()) return { ok: false, error: "Wysyłka SMS nie jest jeszcze skonfigurowana." };
  try {
    const res = await fetch("https://api.smsapi.pl/sms.do", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SMSAPI_TOKEN}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ to: phone.replace(/^\+/, ""), message: text, from: smsSender(), format: "json", encoding: "utf-8" }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: number; message?: string; count?: number };
    if (!res.ok || j.error) return { ok: false, error: `SMSAPI: ${j.message ?? `HTTP ${res.status}`}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).name === "TimeoutError" ? "SMSAPI nie odpowiedział – spróbuj ponownie." : (e as Error).message };
  }
}

/** Tryb demo bez skonfigurowanego SMSAPI – kod pokazujemy na ekranie (tylko DEMO_MODE, nigdy w produkcji). */
export const smsDemoFallback = () => !smsConfigured() && env.demoMode;
