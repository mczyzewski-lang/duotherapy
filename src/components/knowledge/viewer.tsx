// Widok pełnego materiału: /demo (podgląd dla właściciela, bez e-maila) i /material (po zapisie). Ta sama treść co PDF.
import { ArrowLeft, ArrowRight, Download, PenLine } from "lucide-react";
import Link from "next/link";
import { mapaHref } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";
import { KTrack } from "./client";
import { MaterialDoc } from "./doc";
import { AnswersProvider } from "./answers";
import { coverOf } from "@/knowledge/covers";

export function MaterialViewer({ m, variant, answers }: { m: LeadMagnet; variant: "demo" | "material"; answers?: Record<string, string | boolean> | null }) {
  const summary = coverOf(m.slug)?.summary;
  const fillable = variant === "material" && answers !== undefined && answers !== null && !!summary;
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
        {variant === "material" && !fillable && summary && (
          <p className="mb-5 flex gap-2.5 rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-sand">
            <PenLine size={17} className="mt-0.5 shrink-0 text-clay" aria-hidden />
            <span>Możesz uzupełniać ten materiał na stronie, a odpowiedzi zapiszą się same – po <Link href={`/wiedza/${m.slug}#odbierz`} className="font-medium text-forest underline">odebraniu go na swój e-mail</Link> albo przez link z wiadomości.</span>
          </p>
        )}
        {fillable ? (
          <AnswersProvider slug={m.slug} initial={answers ?? {}}>
            <p className="mb-5 flex gap-2.5 rounded-2xl bg-sage-soft/70 p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-sage/40">
              <PenLine size={17} className="mt-0.5 shrink-0 text-forest" aria-hidden />
              <span>Uzupełniaj pola bezpośrednio na stronie – odpowiedzi zapisują się automatycznie i są przypisane do Twojego e-maila. Widzisz je tylko Ty.</span>
            </p>
            <MaterialDoc m={m} mode="screen" mapaUrl={mapaHref(m, variant)} />
            <div className="sticky bottom-3 z-20 mt-8 flex justify-center">
              <Link href={`/wiedza/${m.slug}/podsumowanie`} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(169,81,47,0.8)]">
                Podsumuj {summary} <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </AnswersProvider>
        ) : (
          <MaterialDoc m={m} mode="screen" mapaUrl={mapaHref(m, variant)} />
        )}
      </main>
    </div>
  );
}
