// Dostęp do wersji online materiału z autozapisem: przeglądarka powiązana z zapisem (e-mail) tokenem w ciasteczku httpOnly.
// Odpowiedzi przypisane do e-maila i materiału, szyfrowane w bazie.
import { cookies } from "next/headers";
import { decrypt, encrypt, hashToken } from "./crypto";
import type { Tx } from "./db";
import { env } from "./env";
import type { Answers } from "@/knowledge/fields";

export const CONTENT_COOKIE = "duo_cl";

export async function setContentCookie(token: string) {
  (await cookies()).set(CONTENT_COOKIE, token, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
}

async function tokenFromCookie(): Promise<string | null> {
  const v = (await cookies()).get(CONTENT_COOKIE)?.value ?? "";
  return /^[A-Za-z0-9_-]{40,60}$/.test(v) ? v : null;
}

/** Zapis materiału powiązany z tą przeglądarką (rola system). Zwraca e-mail i materiały, do których ta osoba się zapisała. */
export async function contentReader(tx: Tx): Promise<{ email: string; magnets: string[] } | null> {
  const t = await tokenFromCookie();
  if (!t) return null;
  const [r] = await tx`select lower(email) as email from content_leads where access_token_hash = ${hashToken(t)}`;
  if (!r) return null;
  const all = await tx`select distinct magnet_id from content_leads where lower(email) = ${r.email}`;
  return { email: r.email, magnets: all.map((x) => x.magnet_id as string) };
}

export async function loadAnswers(tx: Tx, email: string, magnetId: string): Promise<{ id: string; data: Answers; updatedAt: Date } | null> {
  const [r] = await tx`select id, data_enc, updated_at from content_answers where email_lc = ${email} and magnet_id = ${magnetId}`;
  return r ? { id: r.id, data: decrypt<Answers>(r.data_enc) ?? {}, updatedAt: r.updated_at } : null;
}

export async function storeAnswers(tx: Tx, email: string, magnetId: string, data: Answers, filled: number) {
  await tx`insert into content_answers (email_lc, magnet_id, data_enc, filled) values (${email}, ${magnetId}, ${encrypt(data)}, ${filled})
           on conflict (email_lc, magnet_id) do update set data_enc = excluded.data_enc, filled = excluded.filled, updated_at = now()`;
}
