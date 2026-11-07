// Krótki link do materiału z e-maila / SMS-a: duo.pl/plan/<kod>. Działa jak dawny link z tokenem:
// powiązuje przeglądarkę z zapisem, a gdy odpowiedzi są zapisane „na później” z numerem – najpierw kod SMS (/potwierdz).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CONTENT_COOKIE, SHORT_CODE_RE, shortAccess } from "@/lib/content-access";
import { CONTENT_PENDING_COOKIE, pendingCookieOpts } from "@/lib/content-phone";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { magnetById } from "@/knowledge/registry";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toLowerCase();
  const notFound = () => NextResponse.redirect(`${env.appUrl}/wiedza?link=niewazny`, 303);
  // ochrona przed zgadywaniem kodów
  if (!SHORT_CODE_RE.test(code) || !(await hit(`plan:${await clientIp()}`, 30, 10 * 60))) return notFound();
  const [lead] = await system((tx) => tx<{ magnet_id: string; protected: boolean }[]>`
    select c.magnet_id,
           (c.phone_verified_at is not null and exists (select 1 from content_answers a where a.email_lc = lower(c.email) and a.filled > 0)) as protected
    from content_leads c where c.short_code = ${code}`);
  const m = lead ? magnetById(lead.magnet_id) : null;
  if (!lead || !m) return notFound();
  const value = shortAccess(code);
  const already = (await cookies()).get(CONTENT_COOKIE)?.value === value;
  const res = NextResponse.redirect(`${env.appUrl}/wiedza/${m.slug}/${lead.protected && !already ? "potwierdz" : "material"}`, 303);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  if (lead.protected && !already) res.cookies.set(CONTENT_PENDING_COOKIE, value, pendingCookieOpts);
  else res.cookies.set(CONTENT_COOKIE, value, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
  return res;
}
