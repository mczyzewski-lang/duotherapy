// „Mapa Relacji” na końcu materiału i landingu: krótkie wyjaśnienie + infografika (3 kroki → 3 możliwe drogi).
// Spokojny ton, bez presji: to propozycja kolejnego kroku, nie warunek.
import clsx from "clsx";
import { ArrowRight, ClipboardList, FileText, MessagesSquare } from "lucide-react";
import { MapaSymbol, RoadGlyph } from "@/components/brand";

const STEPS = [
  { icon: ClipboardList, title: "Kwestionariusz", text: "Poufnie, na prywatnym linku. Przy parze – każde z Was osobno." },
  { icon: MessagesSquare, title: "Spotkania z psychologiem", text: "Online. Dla Ciebie: 1 spotkanie. Dla Was: 3 – z każdym osobno i wspólne." },
  { icon: FileText, title: "Pisemne podsumowanie", text: "Co się dzieje, co Was wspiera i możliwe kolejne kroki – online i w PDF." },
] as const;

const ROADS = [
  { road: "rebuild" as const, label: "Odbudowa relacji" },
  { road: "clarity" as const, label: "Czas na decyzję" },
  { road: "separate" as const, label: "Świadome rozstanie" },
];

export function MapaExplainer({ id, lead, href, cta = "Poznaj Mapę Relacji", sampleHref = "/mapa-relacji-przyklad", compact }: {
  id: string;
  /** Zdanie nawiązujące do materiału. */
  lead: string;
  href: string;
  cta?: string;
  sampleHref?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={clsx("rounded-[1.75rem] bg-gradient-to-br from-forest to-forest-800 text-white shadow-soft", compact ? "p-6 sm:p-8" : "p-6 sm:p-10")} data-testid="mapa-explainer">
      <div className="flex items-center gap-2">
        <MapaSymbol id={`mx-${id}`} className="h-5 w-auto" />
        <span className="font-wordmark text-lg">Mapa Relacji</span>
      </div>
      <p className={clsx("mt-4 font-display leading-tight", compact ? "text-[1.45rem]" : "text-[1.6rem] sm:text-[2.1rem]")}>
        Zrozumieć Waszą sytuację, zanim zdecydujecie, co dalej
      </p>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
        {lead} Mapa Relacji to proces z psychologiem, który porządkuje całą sytuację – nie tylko jeden obszar.
      </p>

      {/* infografika: 3 kroki → 3 możliwe drogi */}
      <ol className="mt-7 grid gap-3 md:grid-cols-3 md:gap-0" aria-label="Jak wygląda Mapa Relacji">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative md:px-3 md:first:pl-0 md:last:pr-0">
            {i > 0 && <span className="absolute -left-1 top-6 hidden h-px w-2 bg-white/30 md:block" aria-hidden />}
            <div className="flex h-full gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 md:flex-col">
              <span className="flex shrink-0 items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-forest"><Icon size={19} aria-hidden /></span>
                <span className="font-display text-sm text-white/60 md:hidden">{i + 1}.</span>
              </span>
              <span>
                <span className="block font-semibold leading-snug"><span className="hidden text-white/60 md:inline">{i + 1}. </span>{title}</span>
                <span className="mt-1 block text-[14px] leading-snug text-white/75">{text}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">Efekt: wiecie, która droga jest Wasza</p>
        <ul className="mt-2.5 flex flex-wrap items-center gap-2">
          {ROADS.map((r, i) => (
            <li key={r.road} className="flex items-center gap-2">
              {i > 0 && <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">lub</span>}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[14px] font-medium text-ink">
                <RoadGlyph road={r.road} id={`mx-${id}-${r.road}`} className="h-4 w-4" /> {r.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a href={href} data-mapa-cta className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-forest transition hover:bg-ivory">
          {cta} <ArrowRight size={17} aria-hidden />
        </a>
        {sampleHref && (
          <a href={sampleHref} target="_blank" rel="noopener" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium text-white underline underline-offset-4">
            Zobacz przykładową Mapę
          </a>
        )}
        <span className="text-sm text-white/65 sm:ml-auto">Dla Ciebie 670 zł · dla Was 1270 zł · jednorazowo</span>
      </div>
    </div>
  );
}
