"use client";

// Podsumowanie z materiału: przejście do oferty Mapy Relacji (zdarzenie lejka) i stały dolny pasek „Załącz do Mapy Relacji”.
import { ArrowRight, Paperclip } from "lucide-react";
import Link from "next/link";
import { MapaSymbol } from "@/components/brand";
import { track } from "@/lib/track-client";

export function OfferLink({ href, n, children, className, testId = "summary-offer" }: { href: string; n: number; children: React.ReactNode; className?: string; testId?: string }) {
  return (
    <Link href={href} onClick={() => track("lead_magnet_offer_click", n)} className={className} data-testid={testId}>
      {children} <ArrowRight size={18} aria-hidden />
    </Link>
  );
}

/** Stały pasek na dole podsumowania: załączenie odpowiedzi do Mapy Relacji (quiz /start z ?dolacz=). */
export function AttachBar({ slug, n }: { slug: string; n: number }) {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-sand/80 bg-ivory/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(54,73,61,0.25)] backdrop-blur" data-testid="attach-bar">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-5">
        <div className="hidden min-w-0 flex-1 items-center gap-2.5 sm:flex">
          <MapaSymbol id={`ab-${n}`} className="h-6 w-auto shrink-0" />
          <p className="text-sm leading-snug text-ink-soft">Załącz te odpowiedzi do Mapy Relacji – psycholog zobaczy je przy Twojej sprawie, nie zaczniesz od zera.</p>
        </div>
        <OfferLink href={`/start?dolacz=${slug}`} n={n} testId="attach-offer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[15px] font-semibold text-white shadow-soft transition hover:bg-clay/90 sm:w-auto sm:shrink-0">
          <Paperclip size={17} aria-hidden /> Załącz do Mapy Relacji
        </OfferLink>
      </div>
    </div>
  );
}
