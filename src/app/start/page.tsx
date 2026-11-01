import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapaIcon } from "@/components/mapa/mark";
import { MapaQuiz } from "@/components/mapa/quiz";
import { BrandSymbol } from "@/components/brand";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sprawdź, gdzie dziś jesteście – Mapa Relacji",
  description: "6 krótkich pytań, około 2 minut, bez oceniania. Pierwszy krok do Mapy Relacji DUO.",
  robots: { index: false, follow: true },
};

export default async function StartPage() {
  const s = await getSettings();
  return (
    <div className="min-h-dvh bg-gradient-to-b from-ivory to-linen">
      <header className="sticky top-0 z-30 border-b border-sand/50 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="DUO – strona główna">
            <BrandSymbol id="start" className="h-6 w-auto" />
            <span className="h-5 w-px bg-sand-dark" aria-hidden />
            <span className="flex items-center gap-1.5 font-display text-[17px] text-ink"><MapaIcon className="h-4" /> Mapa Relacji</span>
          </Link>
          <Link href="/" aria-label="Zamknij quiz i wróć na stronę główną" className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-linen">
            <X size={20} aria-hidden />
          </Link>
        </div>
      </header>
      <main id="main">
        <MapaQuiz consentText={s.legal.leadContactConsent} marketingText={s.legal.leadMarketingConsent} callbackPromise={s.site.callbackPromise} />
      </main>
    </div>
  );
}
