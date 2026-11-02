// Link z e-maila: powiązuje przeglądarkę z zapisem na materiał (autozapis odpowiedzi) i otwiera wersję online.
import { NextResponse } from "next/server";
import { hashToken } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { CONTENT_COOKIE } from "@/lib/content-access";
import { magnetBySlug } from "@/knowledge/registry";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m) return new NextResponse("Nie znaleziono", { status: 404 });
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const ok = /^[A-Za-z0-9_-]{40,60}$/.test(t) && (await system((tx) => tx`select 1 from content_leads where access_token_hash = ${hashToken(t)}`)).length > 0;
  const res = NextResponse.redirect(`${env.appUrl}/wiedza/${m.slug}/material`, 303);
  res.headers.set("x-robots-tag", "noindex, nofollow");
  if (ok) res.cookies.set(CONTENT_COOKIE, t, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 180 * 86400 });
  return res;
}
