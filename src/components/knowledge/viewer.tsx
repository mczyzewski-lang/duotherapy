// Widok pełnego materiału: /demo (podgląd dla właściciela, bez e-maila) i /material (po zapisie). Ta sama treść co PDF.
import { ArrowLeft, PenLine } from "lucide-react";
import Link from "next/link";
import { mapaHref } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";
import { KTrack } from "./client";
import { MaterialTopBar } from "./tabs";
import { MaterialDoc } from "./doc";
import { AnswersProvider, SummarizeBar } from "./answers";
import { coverOf } from "@/knowledge/covers";
import { fieldsOf, requirementsOf } from "@/knowledge/fields";

export function MaterialViewer({ m, variant, answers, phoneMasked = null, unlockList = [] }: { m: LeadMagnet; variant: "demo" | "material"; answers?: Record<string, string | boolean> | null; phoneMasked?: string | null; unlockList?: string[] }) {
  const summary = coverOf(m.slug)?.summary;
  // demo: pola zapisywane tylko w tej przeglądarce; material: autozapis przypisany do e-maila (gdy osoba jest zapisana)
  const local = variant === "demo" && !!summary;
  const fillable = local || (variant === "material" && answers !== undefined && answers !== null && !!summary);
  const requirements = requirementsOf(fieldsOf(m));
  return (
    <div className="min-h-dvh bg-linen/60">
      <KTrack event={variant === "demo" ? "lead_magnet_demo_view" : "lead_magnet_demo_view"} step={m.n} />
      <MaterialTopBar
        kicker={variant === "demo" ? "Podgląd materiału DUO" : "Twój materiał DUO"}
        title={m.short}
        materialHref={`/wiedza/${m.slug}/${variant}`}
        summaryHref={summary && (variant === "material" || local) ? `/wiedza/${m.slug}/${variant === "demo" ? "demo/" : ""}podsumowanie` : undefined}
        active="material"
      />
      <main id="main" className={fillable ? "mx-auto max-w-3xl px-4 pb-64 pt-6 sm:px-5" : "mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-5"}>
        <Link href={`/wiedza/${m.slug}`} className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-forest">
          <ArrowLeft size={16} aria-hidden /> {variant === "demo" ? "Wróć do strony materiału" : "Opis materiału"}
        </Link>
        {variant === "material" && !fillable && summary && (
          <p className="mb-5 flex gap-2.5 rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-sand">
            <PenLine size={17} className="mt-0.5 shrink-0 text-clay" aria-hidden />
            <span>Możesz uzupełniać ten materiał na stronie, a odpowiedzi zapiszą się same – po <Link href={`/wiedza/${m.slug}#odbierz`} className="font-medium text-forest underline">odebraniu go na swój e-mail</Link> albo przez link z wiadomości.</span>
          </p>
        )}
        {fillable ? (
          <AnswersProvider slug={m.slug} initial={answers ?? {}} local={local}>
            <p className="mb-5 flex gap-2.5 rounded-2xl bg-sage-soft/70 p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-sage/40">
              <PenLine size={17} className="mt-0.5 shrink-0 text-forest" aria-hidden />
              <span>
                {local
                  ? "Wpisuj odpowiedzi bezpośrednio na stronie – zapisują się tylko na tym urządzeniu. Na końcu kliknij „Podsumuj moje odpowiedzi”."
                  : "Uzupełniaj pola bezpośrednio na stronie – odpowiedzi zapisują się automatycznie i są przypisane do Twojego e-maila. Widzisz je tylko Ty."}
              </span>
            </p>
            <MaterialDoc m={m} mode="screen" mapaUrl={mapaHref(m, variant)} />
            <SummarizeBar
              href={local ? `/wiedza/${m.slug}/demo/podsumowanie` : `/wiedza/${m.slug}/podsumowanie`}
              label={local ? "Podsumuj moje odpowiedzi" : `Podsumuj ${summary}`}
              requirements={requirements}
              saveLater={local ? undefined : { slug: m.slug, n: m.n, masked: phoneMasked, unlockList }}
            />
          </AnswersProvider>
        ) : (
          <MaterialDoc m={m} mode="screen" mapaUrl={mapaHref(m, variant)} />
        )}
      </main>
    </div>
  );
}
