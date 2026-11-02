// Przydział wariantu hero (test A/B: A – problem emocjonalny, B – konkretna wartość; od 11.2026 ciasteczko duo_hero2) – w ciasteczku pierwszej strony, bez danych osobowych.
// ?hero=A lub ?hero=B wymusza wariant (do podglądu i kontroli jakości).
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const forced = req.nextUrl.searchParams.get("hero");
  const current = req.cookies.get("duo_hero2")?.value;
  const variant = forced === "A" || forced === "B" ? forced : current === "A" || current === "B" ? current : Math.random() < 0.5 ? "A" : "B";
  const headers = new Headers(req.headers);
  headers.set("x-duo-hero", variant);
  const res = NextResponse.next({ request: { headers } });
  if (variant !== current) res.cookies.set("duo_hero2", variant, { path: "/", maxAge: 60 * 60 * 24 * 90, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}

export const config = { matcher: ["/mapa-relacji", "/start"] };
