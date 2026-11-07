// Dostęp do wersji online materiału z autozapisem: przeglądarka powiązana z zapisem (e-mail) tokenem w ciasteczku httpOnly.
// Odpowiedzi przypisane do e-maila i materiału, szyfrowane w bazie.
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { randomUUID } from "node:crypto";
import { decrypt, encrypt, hashToken, newToken } from "./crypto";
import type { Tx } from "./db";
import { env } from "./env";
import type { Answers } from "@/knowledge/fields";

export const CONTENT_COOKIE = "duo_cl";

export async function setContentCookie(token: string) {
  (await cookies()).set(CONTENT_COOKIE, token, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
}

/** Wartość dostępu: długi token (formularz, stary link z e-maila) albo krótki kod z podpisem (link /plan/<kod>). */
const ACCESS_RE = /^([A-Za-z0-9_-]{40,60}|[a-z0-9]{7}\.[0-9a-f]{24})$/;
export const SHORT_CODE_RE = /^[a-z0-9]{7}$/;
const SHORT_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function newShortCode(): string {
  const b = randomBytes(7);
  return [...b].map((x) => SHORT_ALPHABET[x % SHORT_ALPHABET.length]).join("");
}
/** Wartość ciasteczka dla krótkiego linku – podpis serwera, więc nie da się jej podrobić bez kodu z linku. */
export const shortAccess = (code: string) => `${code}.${hashToken(`plan:${code}`).slice(0, 24)}`;
export const isAccessValue = (v: string | undefined | null): v is string => !!v && ACCESS_RE.test(v);

async function tokenFromCookie(): Promise<string | null> {
  const v = (await cookies()).get(CONTENT_COOKIE)?.value ?? "";
  return isAccessValue(v) ? v : null;
}

export interface AccessLead { id: string; email: string; magnet_id: string; phone: string | null; phone_verified_at: Date | null; short_code: string | null }

/** Zapis na materiał wskazany wartością dostępu (token albo krótki kod z podpisem). */
export async function leadByAccess(tx: Tx, v: string): Promise<AccessLead | null> {
  if (!isAccessValue(v)) return null;
  const short = /^([a-z0-9]{7})\.([0-9a-f]{24})$/.exec(v);
  if (short) {
    if (shortAccess(short[1]) !== v) return null;
    const [r] = await tx<AccessLead[]>`select id, lower(email) as email, magnet_id, phone, phone_verified_at, short_code from content_leads where short_code = ${short[1]}`;
    return r ?? null;
  }
  const [r] = await tx<AccessLead[]>`select id, lower(email) as email, magnet_id, phone, phone_verified_at, short_code from content_leads where access_token_hash = ${hashToken(v)}`;
  return r ?? null;
}

export interface Reader { email: string; magnets: string[]; /** numer potwierdzony kodem SMS = dostęp do wszystkich bezpłatnych materiałów */ unlocked: boolean }

/** Zapis materiału powiązany z tą przeglądarką (rola system). Zwraca e-mail, materiały tej osoby i czy ma dostęp do wszystkich. */
export async function contentReader(tx: Tx): Promise<Reader | null> {
  const t = await tokenFromCookie();
  if (!t) return null;
  const r = await leadByAccess(tx, t);
  if (!r) return null;
  const all = await tx<{ magnet_id: string; verified: boolean }[]>`
    select magnet_id, bool_or(phone_verified_at is not null) as verified from content_leads where lower(email) = ${r.email} group by magnet_id`;
  return { email: r.email, magnets: all.map((x) => x.magnet_id), unlocked: all.some((x) => x.verified) };
}

/**
 * Osoba z potwierdzonym numerem otwiera kolejny materiał: zapis na ten materiał tworzony na podstawie jej ostatniego zapisu
 * (te same zgody i numer), bez wysyłki e-maila. Idempotentne. Zwraca czytelnika z dopisanym materiałem.
 */
export async function ensureUnlockedMagnet(tx: Tx, who: Reader, magnet: { id: string; slug: string }): Promise<Reader> {
  if (!who.unlocked || who.magnets.includes(magnet.id)) return who;
  const [src] = await tx<{ name: string | null; email: string; marketing_consent: boolean; relationship: string | null; has_children: boolean | null; phone: string; phone_verified_at: Date }[]>`
    select name, email, marketing_consent, relationship, has_children, phone, phone_verified_at from content_leads
    where lower(email) = ${who.email} and phone_verified_at is not null order by created_at desc limit 1`;
  if (!src) return who;
  const unsub = newToken();
  const [row] = await tx<{ id: string }[]>`
    insert into content_leads (request_id, email, name, magnet_id, delivery_status, marketing_consent, unsubscribe_token_hash, unsubscribe_token_enc,
                               relationship, has_children, phone, phone_verified_at, short_code)
    values (${randomUUID()}, ${src.email}, ${src.name}, ${magnet.id}, 'unlocked', ${src.marketing_consent}, ${hashToken(unsub)}, ${encrypt(unsub)},
            ${src.relationship}, ${src.has_children}, ${src.phone}, ${src.phone_verified_at}, ${newShortCode()})
    returning id`;
  await tx`insert into content_lead_consents (content_lead_id, kind, granted, text_version, text_snapshot)
           values (${row.id}, 'marketing', ${src.marketing_consent}, 'unlock', 'Materiał otwarty po potwierdzeniu numeru kodem SMS – zgody przeniesione z wcześniejszego zapisu tej osoby.')`;
  await tx`update mail_contacts set tags = (select array(select distinct unnest(tags || array[${`lm-${magnet.slug}`}]::text[]))), updated_at = now() where email_lc = ${who.email}`;
  return { ...who, magnets: [...who.magnets, magnet.id] };
}

export async function loadAnswers(tx: Tx, email: string, magnetId: string): Promise<{ id: string; data: Answers; updatedAt: Date } | null> {
  const [r] = await tx`select id, data_enc, updated_at from content_answers where email_lc = ${email} and magnet_id = ${magnetId}`;
  return r ? { id: r.id, data: decrypt<Answers>(r.data_enc) ?? {}, updatedAt: r.updated_at } : null;
}

export async function storeAnswers(tx: Tx, email: string, magnetId: string, data: Answers, filled: number) {
  await tx`insert into content_answers (email_lc, magnet_id, data_enc, filled) values (${email}, ${magnetId}, ${encrypt(data)}, ${filled})
           on conflict (email_lc, magnet_id) do update set data_enc = excluded.data_enc, filled = excluded.filled, updated_at = now()`;
}
