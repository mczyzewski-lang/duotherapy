// Widok pełnego materiału: /demo (podgląd dla właściciela, bez e-maila) i /material (po zapisie). Ta sama treść co PDF.
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { mapaHref } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";
import { KTrack } from "./client";
import { MaterialDoc } from "./doc";

export function MaterialViewer({ m, variant }: { m: LeadMagnet; variant: "demo" | "material" }) {
  return (
    <div className="min-h-dvh bg-linen/60">
      <KTrack event={variant === "demo" ? "lead_magnet_demo_view" : "lead_magnet_demo_view"} step={m.n} />
      <header className="sticky top-0 z-30 border-b border-sand/70 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-clay">{variant === "demo" ? "Podgląd materiału DUO" : "Twój materiał DUO"}</p>
            <p className="truncate font-display text-[15px] text-ink sm:text-base">{m.short}</p>
          </div>
          <a href={`/wiedza/${m.slug}/pdf`} data-pdf className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-forest px-4 text-sm font-semibold text-white">
            <Download size={16} aria-hidden /> Pobierz PDF
          </a>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-5">
        <Link href={`/wiedza/${m.slug}`} className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-forest">
          <ArrowLeft size={16} aria-hidden /> {variant === "demo" ? "Wróć do strony materiału" : "Opis materiału"}
        </Link>
        {m.needsReview && variant === "demo" && (
          <p className="mb-4 rounded-2xl bg-white/80 px-4 py-2.5 text-xs text-muted ring-1 ring-sand">Treść przed publikacją wymaga akceptacji merytorycznej psycholożki DUO.</p>
        )}
        <MaterialDoc m={m} mode="screen" mapaUrl={mapaHref(m, variant)} />
      </main>
    </div>
  );
}
