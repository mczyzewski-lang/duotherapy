// Link z wiadomości nurturingowej: /{kod maila}/{kod osoby}, np. /n3/k7m2p9xq.
// Zapisuje kliknięcie przy osobie (podróż do zakupu), wiąże przeglądarkę z kontaktem (ciasteczko httpOnly)
// i przekierowuje na stronę z CTA z parametrami UTM (kampania = kod maila). Inne dwuczłonowe adresy → 404.
import { NextResponse } from "next/server";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { CONTACT_CODE_RE, CONTACT_COOKIE, STEP_CODE_RE } from "@/lib/mailing";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ mail: string; cid: string }> }) {
  const { mail, cid } = await params;
  if (!STEP_CODE_RE.test(mail) || !CONTACT_CODE_RE.test(cid)) return new NextResponse("Nie znaleziono", { status: 404 });
  const hit = await system(async (tx) => {
    const [step] = await tx`select id, sequence_id, cta_url from mail_steps where code = ${mail}`;
    if (!step) return null;
    const [contact] = await tx`select id from mail_contacts where code = ${cid}`;
    if (contact) await tx`insert into mail_clicks (contact_id, step_id, target) values (${contact.id}, ${step.id}, ${step.cta_url})`;
    return { url: step.cta_url as string, seq: step.sequence_id as string, known: !!contact };
  });
  if (!hit) return new NextResponse("Nie znaleziono", { status: 404 });
  const target = new URL(hit.url || "/", env.appUrl);
  target.searchParams.set("utm_source", "duo_mail");
  target.searchParams.set("utm_medium", "email");
  target.searchParams.set("utm_campaign", mail);
  target.searchParams.set("utm_content", hit.seq);
  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  if (hit.known) res.cookies.set(CONTACT_COOKIE, cid, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  return res;
}
