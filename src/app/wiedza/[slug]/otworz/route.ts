// Link z e-maila: powiązuje przeglądarkę z zapisem na materiał (autozapis odpowiedzi) i otwiera wersję online.
// Jeśli osoba zapisała odpowiedzi „na później” z numerem telefonu – najpierw potwierdzenie numeru kodem SMS (/potwierdz).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { CONTENT_COOKIE } from "@/lib/content-access";
import { CONTENT_PENDING_COOKIE, pendingCookieOpts } from "@/lib/content-phone";
import { magnetBySlug } from "@/knowledge/registry";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m) return new NextResponse("Nie znaleziono", { status: 404 });
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const lead = /^[A-Za-z0-9_-]{40,60}$/.test(t)
    ? (await system((tx) => tx<{ email: string; protected: boolean }[]>`
        select lower(c.email) as email,
               (c.phone_verified_at is not null and exists (select 1 from content_answers a where a.email_lc = lower(c.email) and a.filled > 0)) as protected
        from content_leads c where c.access_token_hash = ${hashToken(t)}`))[0]
    : undefined;
  const already = (await cookies()).get(CONTENT_COOKIE)?.value === t; // to samo urządzenie – już ma dostęp
  if (lead?.protected && !already) {
    const res = NextResponse.redirect(`${env.appUrl}/wiedza/${m.slug}/potwierdz`, 303);
    res.headers.set("x-robots-tag", "noindex, nofollow");
    res.cookies.set(CONTENT_PENDING_COOKIE, t, pendingCookieOpts);
    return res;
  }
  const res = NextResponse.redirect(`${env.appUrl}/wiedza/${m.slug}/material`, 303);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  if (lead) res.cookies.set(CONTENT_COOKIE, t, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
  return res;
}
