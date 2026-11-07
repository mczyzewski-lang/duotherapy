// Górny pasek materiału: nazwa + taby „Materiał” | „Podsumowanie” (ta sama nawigacja na stronie materiału i podsumowania).
import clsx from "clsx";
import { FileText, ListChecks } from "lucide-react";
import Link from "next/link";

export function MaterialTopBar({ kicker, title, materialHref, summaryHref, active }: {
  kicker: string;
  title: string;
  materialHref: string;
  /** Brak = materiał bez pól do uzupełnienia (bez taba „Podsumowanie”). */
  summaryHref?: string;
  active: "material" | "summary";
}) {
  const tab = (key: "material" | "summary", href: string, label: string, Icon: typeof FileText) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      data-testid={`tab-${key}`}
      className={clsx(
        "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition sm:flex-none",
        active === key ? "bg-forest text-white shadow-soft" : "text-ink-soft hover:text-forest",
      )}
    >
      <Icon size={15} aria-hidden /> {label}
    </Link>
  );
  return (
    <header className="no-print sticky top-0 z-30 border-b border-sand/70 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-clay">{kicker}</p>
          <p className="truncate font-display text-[15px] text-ink sm:text-base">{title}</p>
        </div>
        {summaryHref && (
          <nav aria-label="Materiał i podsumowanie" className="flex w-full rounded-full bg-white p-1 ring-1 ring-sand sm:w-auto" data-testid="material-tabs">
            {tab("material", materialHref, "Materiał", FileText)}
            {tab("summary", summaryHref, "Podsumowanie", ListChecks)}
          </nav>
        )}
      </div>
    </header>
  );
}
