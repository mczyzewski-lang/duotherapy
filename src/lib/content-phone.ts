// Kody SMS do materiałów: przypisanie numeru (bind) i powrót z linku w e-mailu (access). 4 cyfry, 10 minut, maks. 5 prób.
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { hashToken } from "./crypto";
import type { Tx } from "./db";
import { env } from "./env";
import { maskPhone, sendSms, smsDemoFallback } from "./sms";

export const CONTENT_PENDING_COOKIE = "duo_clp"; // link z e-maila czeka na potwierdzenie kodem SMS
const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

const codeHash = (email: string, code: string) => hashToken(`sms:${email}:${code}`);

/** Tworzy kod i wysyła SMS. W trybie DEMO bez SMSAPI zwraca kod do pokazania na ekranie. */
export async function issueCode(tx: Tx, purpose: "bind" | "access", email: string, phone: string): Promise<{ ok: true; masked: string; demoCode?: string } | { ok: false; error: string }> {
  const code = String(randomInt(0, 10000)).padStart(4, "0");
  await tx`update sms_codes set used_at = now() where email_lc = ${email} and purpose = ${purpose} and used_at is null`;
  await tx`insert into sms_codes (purpose, email_lc, phone, code_hash, expires_at) values (${purpose}, ${email}, ${phone}, ${codeHash(email, code)}, ${new Date(Date.now() + TTL_MIN * 60_000)})`;
  if (smsDemoFallback()) return { ok: true, masked: maskPhone(phone), demoCode: code };
  const text = purpose === "bind"
    ? `DUO: Twój kod do zapisania odpowiedzi: ${code}. Ważny ${TTL_MIN} min. Nie podawaj go nikomu.`
    : `DUO: Twój kod dostępu do zapisanych odpowiedzi: ${code}. Ważny ${TTL_MIN} min. Nie podawaj go nikomu.`;
  const r = await sendSms(phone, text);
  return r.ok ? { ok: true, masked: maskPhone(phone) } : { ok: false, error: r.error };
}

/** Sprawdza kod; zwraca numer, dla którego był wydany (albo komunikat błędu). */
export async function checkCode(tx: Tx, purpose: "bind" | "access", email: string, code: string): Promise<{ ok: true; phone: string } | { ok: false; error: string }> {
  if (!/^[0-9]{4}$/.test(code)) return { ok: false, error: "Wpisz 4 cyfry z SMS-a." };
  const [c] = await tx<{ id: string; phone: string; code_hash: string; attempts: number; expires_at: Date }[]>`
    select id, phone, code_hash, attempts, expires_at from sms_codes where email_lc = ${email} and purpose = ${purpose} and used_at is null order by created_at desc limit 1`;
  if (!c || new Date(c.expires_at) < new Date()) return { ok: false, error: "Kod wygasł – wyślij nowy." };
  if (c.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Za dużo prób – wyślij nowy kod." };
  if (c.code_hash !== codeHash(email, code)) {
    await tx`update sms_codes set attempts = attempts + 1 where id = ${c.id}`;
    return { ok: false, error: `Nieprawidłowy kod. Pozostało prób: ${MAX_ATTEMPTS - c.attempts - 1}.` };
  }
  await tx`update sms_codes set used_at = now() where id = ${c.id}`;
  return { ok: true, phone: c.phone };
}

export async function pendingToken(): Promise<string | null> {
  const v = (await cookies()).get(CONTENT_PENDING_COOKIE)?.value ?? "";
  return /^[A-Za-z0-9_-]{40,60}$/.test(v) ? v : null;
}
export const pendingCookieOpts = { httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/", maxAge: 30 * 60 };
