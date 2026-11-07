import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapaQuiz } from "@/components/mapa/quiz";
import { BrandSymbol, MapaLogo } from "@/components/brand";
import { getSettings } from "@/lib/settings";
import { coverOf } from "@/knowledge/covers";
import { magnetBySlug } from "@/knowledge/registry";
import { knownVisitor, phoneForInput } from "@/lib/known-visitor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sprawdź, gdzie dziś jesteście – Mapa Relacji",
  description: "6 krótkich pytań, około 2 minut, bez oceniania. Pierwszy krok do Mapy Relacji DUO.",
  robots: { index: false, follow: true },
};

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const m = sp.dolacz ? magnetBySlug(sp.dolacz) : null;
  const attach = m && coverOf(m.slug)?.summary ? { slug: m.slug, title: m.short } : null;
  const preset = sp.forma === "solo" || sp.forma === "together" ? { q6: sp.forma } : undefined;
  const s = await getSettings();
  const known = await knownVisitor();
  const prefill = known ? { name: known.name, email: known.email, phone: phoneForInput(known.phone) } : null;
  return (
    <div className="min-h-dvh bg-gradient-to-b from-ivory to-linen">
      <header className="sticky top-0 z-30 border-b border-sand/50 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="DUO – strona główna">
            <BrandSymbol id="start" className="h-6 w-auto" />
            <span className="h-5 w-px bg-sand-dark" aria-hidden />
            <MapaLogo compact id="start-logo" />
          </Link>
          <Link href="/mapa-relacji" aria-label="Zamknij quiz i wróć do Mapy Relacji" className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-linen">
            <X size={20} aria-hidden />
          </Link>
        </div>
      </header>
      <main id="main">
        <MapaQuiz attach={attach} preset={preset} prefill={prefill} consentText={s.legal.leadContactConsent} marketingText={s.legal.leadMarketingConsent} callbackPromise={s.site.callbackPromise} />
      </main>
    </div>
  );
}
