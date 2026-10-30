import type { Settings } from "@/lib/settings";
import clsx from "clsx";

/** Ramka „Bezpieczeństwo i pilna pomoc” – treść z materiałów źródłowych, edytowalna w ustawieniach. */
export function SafetyBox({ helplines, abroad, compact, className }: { helplines: Settings["helplines"]; abroad?: boolean; compact?: boolean; className?: string }) {
  return (
    <section aria-labelledby="safety-h" className={clsx("rounded-2xl bg-white p-5 ring-1 ring-alert/25 sm:p-6", className)}>
      <h2 id="safety-h" className="font-display text-xl text-alert">
        Bezpieczeństwo i pilna pomoc
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Jeśli w tej chwili jesteś w niebezpieczeństwie, masz myśli samobójcze lub obawiasz się o życie czy zdrowie swoje albo bliskich, nie czekaj na
        sesję. Skorzystaj z pomocy od razu:
      </p>
      {abroad && (
        <p className="mt-3 rounded-lg bg-alert-soft p-3 text-sm font-medium text-ink">
          Podany kraj zamieszkania jest inny niż Polska. {helplines.abroad}
        </p>
      )}
      <ul className="mt-4 divide-y divide-sand">
        {helplines.items.map((h) => (
          <li key={h.number} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
            <a href={`tel:${h.number.replace(/\s/g, "")}`} className="min-w-28 font-display text-2xl font-semibold text-forest underline-offset-4 hover:underline">
              {h.number}
            </a>
            <span className="flex-1 text-sm text-ink">{h.when}</span>
            <span className="text-xs text-muted">{h.availability}</span>
          </li>
        ))}
      </ul>
      {!abroad && <p className="mt-3 text-sm text-ink-soft">{helplines.abroad}</p>}
      {!compact && (
        <>
          <p className="mt-3 text-xs text-muted">{helplines.verifiedNote}</p>
          <p className="mt-1 text-xs text-muted">{helplines.disclaimer}</p>
        </>
      )}
    </section>
  );
}
