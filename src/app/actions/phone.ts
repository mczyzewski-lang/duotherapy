"use server";

// Materiały: „zapisz na później” – przypisanie numeru telefonu kodem SMS, i powrót z linku w e-mailu – potwierdzenie numeru kodem SMS.
import { cookies } from "next/headers";
import { CONTENT_COOKIE, contentReader, leadByAccess } from "@/lib/content-access";
import { checkCode, CONTENT_PENDING_COOKIE, issueCode, pendingToken } from "@/lib/content-phone";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { maskPhone, normalizePhone } from "@/lib/sms";
import { magnetBySlug } from "@/knowledge/registry";

type Sent = { ok: true; masked: string; demoCode?: string } | { ok: false; error: string };
type Done = { ok: true; masked?: string } | { ok: false; error: string };

/** Krok 1 (w materiale): numer telefonu → kod SMS. */
export async function requestBindCode(slug: string, phoneInput: string): Promise<Sent> {
  const m = magnetBySlug(slug);
  if (!m) return { ok: false, error: "Nie znaleziono materiału." };
  const phone = normalizePhone(phoneInput);
  if (!phone) return { ok: false, error: "Podaj polski numer komórkowy, np. 600 100 200." };
  if (!(await hit(`smsb:${await clientIp()}`, 5, 15 * 60))) return { ok: false, error: "Wysłano już kilka kodów. Spróbuj za kilkanaście minut." };
  return system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return { ok: false as const, error: "Zapis jest dostępny po odebraniu materiału na Twój e-mail." };
    if (!(await hit(`smsb:${who.email}`, 4, 15 * 60))) return { ok: false as const, error: "Wysłano już kilka kodów. Spróbuj za kilkanaście minut." };
    // w SMS-ie także krótki link powrotu do materiału
    const [l] = await tx<{ short_code: string | null }[]>`select short_code from content_leads where lower(email) = ${who.email} and magnet_id = ${m.id} and short_code is not null order by created_at desc limit 1`;
    return issueCode(tx, "bind", who.email, phone, l?.short_code ? `${env.appUrl.replace(/^https?:\/\//, "")}/plan/${l.short_code}` : undefined);
  });
}

/** Krok 2 (w materiale): kod → numer przypisany do zapisu, tag #znumerem w mailingu. */
export async function confirmBindCode(slug: string, code: string): Promise<Done> {
  const m = magnetBySlug(slug);
  if (!m) return { ok: false, error: "Nie znaleziono materiału." };
  return system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return { ok: false as const, error: "Zapis jest dostępny po odebraniu materiału na Twój e-mail." };
    const r = await checkCode(tx, "bind", who.email, code.trim());
    if (!r.ok) return r;
    await tx`update content_leads set phone = ${r.phone}, phone_verified_at = now() where lower(email) = ${who.email}`;
    await tx`update mail_contacts set tags = (select array(select distinct unnest(tags || array['znumerem']::text[]))), updated_at = now() where email_lc = ${who.email}`;
    await tx`insert into audit_logs (actor_kind, action, entity, meta) values ('public', 'content_phone_verified', 'content_lead', ${tx.json({ magnet: m.id })})`;
    return { ok: true as const, masked: maskPhone(r.phone) };
  });
}

/** Powrót z linku w e-mailu: zapis czekający na potwierdzenie numeru (ciasteczko z /otworz). */
async function pendingLead() {
  const t = await pendingToken();
  if (!t) return null;
  const r = await system((tx) => leadByAccess(tx, t));
  return r?.phone && r.phone_verified_at ? { token: t, email: r.email, phone: r.phone } : null;
}

export async function requestAccessCode(): Promise<Sent> {
  const p = await pendingLead();
  if (!p) return { ok: false, error: "Link wygasł – otwórz go ponownie z wiadomości e-mail." };
  if (!(await hit(`smsa:${await clientIp()}`, 5, 15 * 60)) || !(await hit(`smsa:${p.email}`, 4, 15 * 60))) return { ok: false, error: "Wysłano już kilka kodów. Spróbuj za kilkanaście minut." };
  return system((tx) => issueCode(tx, "access", p.email, p.phone!));
}

export async function confirmAccessCode(code: string): Promise<Done> {
  const p = await pendingLead();
  if (!p) return { ok: false, error: "Link wygasł – otwórz go ponownie z wiadomości e-mail." };
  const r = await system((tx) => checkCode(tx, "access", p.email, code.trim()));
  if (!r.ok) return r;
  const jar = await cookies();
  jar.set(CONTENT_COOKIE, p.token, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
  jar.delete(CONTENT_PENDING_COOKIE);
  return { ok: true };
}
