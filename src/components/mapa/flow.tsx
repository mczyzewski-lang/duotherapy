"use client";

// Wizualizacja Mapy Relacji: TU JESTEŚCIE → MAPA RELACJI → trzy możliwe drogi.
// Drogi to możliwości do rozważenia po konsultacji – nie wynik quizu i nie rekomendacja.
import clsx from "clsx";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

export const ROADS = [
  {
    key: "rebuild",
    short: "Odbudowa relacji",
    title: "Chcemy spróbować jeszcze raz",
    tone: "rose",
    text: "Jeśli oboje lub jedno z Was widzi szansę na odbudowę, pomagamy zrozumieć trudności i rozpocząć pracę nad komunikacją, zaufaniem oraz bliskością.",
    services: ["Terapia par", "Program Odbudowa Więzi", "Indywidualne wsparcie psychologiczne"],
    cta: "Poznaj drogę odbudowy",
  },
  {
    key: "clarity",
    short: "Czas na zrozumienie i decyzję",
    title: "Jeszcze nie wiemy, co dalej",
    tone: "clay",
    text: "Nie musicie podejmować decyzji pod presją. Pomagamy uporządkować emocje, potrzeby i możliwości, aby świadomie zdecydować, co będzie dla Was właściwe.",
    services: ["Konsultacje decyzyjne", "Rozmowa z psychologiem", "Indywidualna lub wspólna praca nad zrozumieniem relacji"],
    cta: "Zobacz, jak uzyskać jasność",
  },
  {
    key: "separate",
    short: "Świadome rozstanie",
    title: "Chcemy rozstać się z szacunkiem",
    tone: "forest",
    text: "Jeżeli myślicie o rozstaniu albo decyzja już zapadła, pomożemy wskazać najlepszą dla Was drogę rozstania lub rozwodu – tak, by przejść przez ten etap spokojniej, z większym zrozumieniem i bez niepotrzebnej eskalacji konfliktu.",
    services: [
      "Konsultacja psychologiczna dotycząca rozstania",
      "Pomoc w wyborze drogi rozstania lub rozwodu, która najlepiej pasuje do Waszej sytuacji",
      "Przygotowanie do trudnych rozmów – także o dzieciach",
    ],
    cta: "Poznaj spokojną drogę rozstania",
  },
] as const;

const TONE = {
  rose: { dot: "bg-[#e07f78]", soft: "bg-[#fbe4e0]", text: "text-[#b9524b]", stroke: "#e07f78", ring: "ring-[#f0c2bb]" },
  clay: { dot: "bg-clay", soft: "bg-clay-soft", text: "text-clay", stroke: "#a9512f", ring: "ring-clay/30" },
  sand: { dot: "bg-[#b89b7f]", soft: "bg-linen", text: "text-[#7d6450]", stroke: "#b89b7f", ring: "ring-sand-dark" },
  forest: { dot: "bg-forest-600", soft: "bg-sage-soft", text: "text-forest", stroke: "#46604f", ring: "ring-sage/50" },
} as const;

/** Widoczne „lub” między drogami – to jedna z dróg, nie wszystkie naraz. */
function Or({ vertical = true, className }: { vertical?: boolean; className?: string }) {
  return (
    <span aria-hidden className={clsx("flex items-center justify-center gap-2", vertical ? "flex-row" : "flex-col", className)}>
      <span className={clsx("bg-sand-dark/70", vertical ? "h-px w-8" : "h-8 w-px")} />
      <span className="rounded-full bg-linen px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft ring-1 ring-sand">lub</span>
      <span className={clsx("bg-sand-dark/70", vertical ? "h-px w-8" : "h-8 w-px")} />
    </span>
  );
}

/** Ujawnianie przy przewinięciu (z poszanowaniem prefers-reduced-motion). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setInView(true);
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && (setInView(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/** Mapa w hero (desktop): krótka, interaktywna wersja przebiegu. */
export function HeroMap() {
  const [active, setActive] = useState<number | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>();
  const ends = [
    { y: 70, label: ROADS[0].short },
    { y: 190, label: ROADS[1].short },
    { y: 310, label: ROADS[2].short },
  ];
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-white via-ivory to-linen shadow-soft ring-1 ring-sand" aria-hidden />
      <svg viewBox="0 0 520 380" className="relative h-auto w-full" role="img" aria-label="Mapa Relacji: od miejsca, w którym jesteście dziś, przez zrozumienie sytuacji, do trzech możliwych dróg">
        <defs>
          <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#e2d4c2" />
          </pattern>
        </defs>
        <rect x="14" y="14" width="492" height="352" rx="28" fill="url(#grid)" opacity="0.7" />
        {/* od „Tu jesteście” do węzła */}
        <path d="M70 300 C 120 300, 140 190, 230 190" fill="none" stroke="#36493d" strokeWidth="2.5" strokeDasharray="6 7" className={clsx("map-line", inView && "map-line-on")} />
        {ends.map((e, k) => (
          <path
            key={k}
            d={`M262 190 C 320 190, 340 ${e.y}, 400 ${e.y}`}
            fill="none"
            stroke={[TONE.rose.stroke, TONE.clay.stroke, TONE.forest.stroke][k]}
            strokeWidth={active === k ? 4.5 : 3}
            strokeLinecap="round"
            className={clsx("map-line transition-[stroke-width]", inView && "map-line-on")}
            style={{ animationDelay: `${0.5 + k * 0.15}s` }}
          />
        ))}
        <circle cx="70" cy="300" r="9" fill="#a9512f" />
        <circle cx="70" cy="300" r="18" fill="#a9512f" opacity="0.15" className="motion-safe:animate-ping" style={{ transformOrigin: "70px 300px", animationDuration: "3s" }} />
        <circle cx="246" cy="190" r="32" fill="#fff" stroke="#36493d" strokeWidth="2.5" />
        <circle cx="246" cy="190" r="42" fill="none" stroke="#36493d" strokeOpacity="0.2" strokeWidth="1.5" />
        <svg x="221" y="182.5" width="50" height="15" viewBox="0 0 112 32">
          <MapaSymbol id="hero-node" />
        </svg>
        {ends.map((e, k) => (
          <circle key={k} cx="404" cy={e.y} r={active === k ? 9 : 7} fill={[TONE.rose.stroke, TONE.clay.stroke, TONE.forest.stroke][k]} className="transition-all" />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 text-[13px]">
        <span className="absolute left-[3%] top-[85%] -translate-y-1/2 rounded-full bg-white px-3 py-1.5 font-semibold uppercase tracking-[0.12em] text-[10.5px] text-clay shadow-soft ring-1 ring-sand">Tu jesteście dzisiaj</span>
        <span className="absolute left-[47.3%] top-[64%] -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-3.5 py-1.5 text-[12px] font-medium text-white shadow-soft">Mapa Relacji</span>
      </div>
      <ul className="absolute right-[2%] top-0 flex h-full flex-col justify-between py-[9%] text-[13px]">
        {ends.map((e, k) => (
          <li key={k} className="relative">
            {k > 0 && <span aria-hidden className="absolute -top-[2.1rem] left-1/2 -translate-x-1/2 rounded-full bg-linen px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft ring-1 ring-sand">lub</span>}
            <button
              type="button"
              onMouseEnter={() => setActive(k)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(k)}
              onBlur={() => setActive(null)}
              onClick={() => document.getElementById(`droga-${ROADS[k].key}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className={clsx("flex max-w-[9.5rem] items-center gap-2 rounded-xl bg-white/95 py-2 pl-2 pr-3 text-left leading-tight text-ink shadow-soft ring-1 transition", active === k ? "ring-forest" : "ring-sand")}
            >
              <span className={clsx("grid h-7 w-7 shrink-0 place-items-center rounded-full", TONE[ROADS[k].tone].soft)}>
                <RoadGlyph road={ROADS[k].key} id={`hero-${ROADS[k].key}`} className="h-4 w-4" />
              </span>
              <span>{e.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Sekcja „Mapa Relacji”: pełny przebieg – pionowo na telefonie, poziomo na desktopie. */
export function MapaFlow() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="relative">
      <ol className="grid items-center gap-0 lg:grid-cols-[1fr_auto_1.1fr_auto_1.2fr]">
        <li className={clsx("reveal rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand", inView && "reveal-on")}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay"><MapPin size={15} aria-hidden /> Tu jesteście dzisiaj</p>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Coś w relacji przestało działać. Być może trudno Wam rozmawiać, oddaliliście się od siebie albo nie wiecie, czy chcecie iść dalej razem.
          </p>
        </li>
        <li aria-hidden className="flex justify-center py-2 lg:px-3 lg:py-0">
          <span className={clsx("block h-12 w-0.5 origin-top bg-gradient-to-b from-clay to-forest lg:h-0.5 lg:w-12 lg:origin-left lg:bg-gradient-to-r", "grow-line", inView && "grow-line-on")} />
        </li>
        <li className={clsx("reveal relative mx-auto w-full max-w-sm rounded-[2rem] bg-forest p-7 text-center text-white shadow-soft", inView && "reveal-on")} style={{ transitionDelay: "0.15s" }}>
          <span className="absolute -inset-2 -z-10 rounded-[2.4rem] bg-forest/10" aria-hidden />
          <span className="mx-auto inline-flex items-center rounded-full bg-white px-4 py-2.5 shadow-soft">
            <MapaSymbol id="flow-node" className="h-6 w-auto" />
          </span>
          <p className="mt-4 font-display text-2xl uppercase tracking-[0.08em]">Mapa Relacji</p>
          <p className="mt-2 text-white/80">Zrozumienie. Perspektywa. Możliwe kierunki.</p>
        </li>
        <li aria-hidden className="flex justify-center py-2 lg:px-3 lg:py-0">
          <span className={clsx("block h-12 w-0.5 origin-top bg-gradient-to-b from-forest to-sand-dark lg:h-0.5 lg:w-12 lg:origin-left lg:bg-gradient-to-r", "grow-line", inView && "grow-line-on")} style={{ transitionDelay: "0.3s" }} />
        </li>
        <li>
          <ul className="grid gap-1.5">
            {ROADS.map((r, k) => {
              const t = TONE[r.tone];
              return (
                <Fragment key={r.key}>
                {k > 0 && <li role="presentation" className={clsx("reveal", inView && "reveal-on")} style={{ transitionDelay: `${0.3 + k * 0.12}s` }}><Or /></li>}
                <li className={clsx("reveal", inView && "reveal-on")} style={{ transitionDelay: `${0.35 + k * 0.12}s` }}>
                  <a href={`#droga-${r.key}`} className={clsx("flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-soft ring-1 transition hover:-translate-y-0.5", t.ring)}>
                    <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full", t.soft)}><RoadGlyph road={r.key} id={`flow-${r.key}`} className="h-5 w-5" /></span>
                    <span className="flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Droga {k + 1}</span>
                      <span className="font-medium text-ink">{r.short}</span>
                    </span>
                    <ArrowRight size={16} className="text-muted" aria-hidden />
                  </a>
                </li>
                </Fragment>
              );
            })}
          </ul>
        </li>
      </ol>
    </div>
  );
}

/** Sekcja „Trzy możliwe drogi”: karty rozwijane, bez wartościowania. */
export function Roads() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-2">
      {ROADS.map((r, k) => {
        const t = TONE[r.tone];
        const isOpen = open === r.key;
        return (
          <Fragment key={r.key}>
          {k > 0 && (
            <>
              <Or className="lg:hidden" />
              <Or vertical={false} className="hidden self-start pt-24 lg:flex" />
            </>
          )}
          <article id={`droga-${r.key}`} className={clsx("scroll-mt-24 flex flex-col rounded-3xl bg-white p-6 shadow-soft ring-1 transition", isOpen ? "ring-forest" : "ring-sand")}>
            <div className="flex items-center gap-3">
              <span className={clsx("grid h-12 w-12 place-items-center rounded-2xl", t.soft)}><RoadGlyph road={r.key} id={`road-${r.key}`} className="h-7 w-7" /></span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Droga {k + 1} · {r.short}</span>
            </div>
            <h3 className="mt-4 font-display text-[1.45rem] leading-snug text-ink">„{r.title}”</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{r.text}</p>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`droga-${r.key}-more`}
              onClick={() => setOpen(isOpen ? null : r.key)}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 self-start rounded-full px-1 text-[15px] font-medium text-forest"
            >
              {r.cta} <ChevronDown size={17} className={clsx("transition", isOpen && "rotate-180")} aria-hidden />
            </button>
            <div id={`droga-${r.key}-more`} hidden={!isOpen} className="mt-3 border-t border-sand pt-4">
              <p className="text-sm font-medium text-ink">Możliwe dalsze wsparcie</p>
              <ul className="mt-2 space-y-1.5">
                {r.services.map((s) => (
                  <li key={s} className="flex gap-2 text-[15px] text-ink-soft"><span className={clsx("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", t.dot)} aria-hidden />{s}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">To jedna z możliwości do rozważenia po konsultacji. Wybór drogi zawsze należy do Was.</p>
              <Link href="/start" className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-forest px-5 text-sm font-medium text-white">
                Zacznij od 6 krótkich pytań <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </article>
          </Fragment>
        );
      })}
    </div>
  );
}
