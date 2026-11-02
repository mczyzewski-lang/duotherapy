// Powiązanie przeglądarki z prośbą o kontakt (strona VSL po quizie) i z zamówieniem.
// W ciasteczkach httpOnly trzymamy losowe tokeny; w bazie wyłącznie ich hash.
import { cookies } from "next/headers";
import { hashToken } from "./crypto";
import type { Tx } from "./db";
import { env } from "./env";

export const LEAD_COOKIE = "duo_lead";
export const ORDER_COOKIE = "duo_order";

const opts = (days: number) => ({ httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/", maxAge: days * 86400 });

export async function setLeadCookie(token: string) {
  (await cookies()).set(LEAD_COOKIE, token, opts(30));
}

export async function setOrderCookie(token: string) {
  (await cookies()).set(ORDER_COOKIE, token, opts(60));
}

export async function readCookie(name: string): Promise<string | null> {
  const v = (await cookies()).get(name)?.value ?? "";
  return /^[A-Za-z0-9_-]{40,60}$/.test(v) ? v : null;
}

export interface LeadForVsl {
  id: string;
  firstName: string;
  mode: string | null;
  stage: string;
  email: string | null;
}

/** Zgłoszenie powiązane z tą przeglądarką (wywołujący działa jako rola system). */
export async function leadFromCookie(tx: Tx): Promise<LeadForVsl | null> {
  const token = await readCookie(LEAD_COOKIE);
  if (!token) return null;
  const [l] = await tx`select id, name, mode, stage, email from leads where access_token_hash = ${hashToken(token)}`;
  if (!l) return null;
  return { id: l.id, firstName: String(l.name).trim().split(/\s+/)[0], mode: l.mode, stage: l.stage, email: l.email };
}
