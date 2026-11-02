"use client";

// Wizualizacja Mapy Relacji: TU JESTEŚCIE → MAPA RELACJI → trzy możliwe drogi.
// Drogi to możliwości do rozważenia po konsultacji – nie wynik quizu i nie rekomendacja.
import clsx from "clsx";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import { pathHref } from "@/content/paths";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

export const ROADS = [
  {
    key: "rebuild",
    short: "Odbudowa relacji",
    title: "Chcemy spróbować jeszcze raz",
    tone: "rose",
    text: "Pomagamy zrozumieć trudności i zacząć pracę nad komunikacją, zaufaniem i bliskością.",
    services: ["Terapia par", "Program Odbudowa Więzi", "Indywidualne wsparcie psychologiczne"],
    cta: "Poznaj drogę odbudowy",
  },
  {
    key: "clarity",
    short: "Czas na zrozumienie i decyzję",
    title: "Jeszcze nie wiemy, co dalej",
    tone: "clay",
    text: "Bez presji porządkujemy emocje, potrzeby i możliwości – żeby decyzja była naprawdę Wasza.",
    services: ["Konsultacje decyzyjne", "Rozmowa z psychologiem", "Indywidualna lub wspólna praca nad zrozumieniem relacji"],
    cta: "Zobacz, jak uzyskać jasność",
  },
  {
    key: "separate",
    short: "Świadome rozstanie",
    title: "Chcemy rozstać się z szacunkiem",
    tone: "forest",
    text: "Pomożemy wskazać najlepszą dla Was drogę rozstania lub rozwodu – spokojniej i bez niepotrzebnej eskalacji konfliktu.",
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
export function HeroMap({ toPaths }: { toPaths?: boolean } = {}) {
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
              onClick={() => {
                if (toPaths) window.location.assign(pathHref(ROADS[k].key));
                else document.getElementById(`droga-${ROADS[k].key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
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

/** Mapa w hero (telefon): ta sama mapa pionowo – ścieżka w dół i rozwidlenie na trzy drogi. */
export function HeroMapVertical({ toPaths }: { toPaths?: boolean } = {}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const xs = [56, 170, 284];
  const tones = [TONE.rose.stroke, TONE.clay.stroke, TONE.forest.stroke];
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[420px] rounded-[2rem] bg-gradient-to-br from-white via-ivory to-linen p-3 pb-4 shadow-soft ring-1 ring-sand">
      <div className="relative">
        <svg viewBox="0 0 340 300" className="h-auto w-full" role="img" aria-label="Mapa Relacji: od miejsca, w którym jesteście dziś, przez zrozumienie sytuacji, do jednej z trzech możliwych dróg">
          <defs>
            <pattern id="grid-v" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e2d4c2" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="340" height="300" rx="20" fill="url(#grid-v)" opacity="0.7" />
          <path d="M170 64 C 130 88, 210 108, 170 128" fill="none" stroke="#36493d" strokeWidth="2.5" strokeDasharray="6 7" />
          {xs.map((x, k) => (
            <path
              key={k}
              d={`M170 190 C 170 236, ${x} 228, ${x} 282`}
              fill="none"
              stroke={tones[k]}
              strokeWidth={3}
              strokeLinecap="round"
              className={clsx("map-line", inView && "map-line-on")}
              style={{ animationDelay: `${0.3 + k * 0.15}s` }}
            />
          ))}
          <circle cx="170" cy="56" r="8" fill="#a9512f" />
          <circle cx="170" cy="56" r="16" fill="#a9512f" opacity="0.15" className="motion-safe:animate-ping" style={{ transformOrigin: "170px 56px", animationDuration: "3s" }} />
          <circle cx="170" cy="160" r="30" fill="#fff" stroke="#36493d" strokeWidth="2.5" />
          <circle cx="170" cy="160" r="40" fill="none" stroke="#36493d" strokeOpacity="0.2" strokeWidth="1.5" />
          <svg x="146" y="153" width="48" height="14" viewBox="0 0 112 32">
            <MapaSymbol id="hero-v-node" />
          </svg>
          {xs.map((x, k) => (
            <circle key={k} cx={x} cy="284" r="6" fill={tones[k]} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-1/2 top-[3%] -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-clay shadow-soft ring-1 ring-sand">Tu jesteście dzisiaj</span>
          <span className="absolute left-[62%] top-[53.3%] -translate-y-1/2 whitespace-nowrap rounded-full bg-forest px-2.5 py-1 text-[11px] max-[359px]:px-2 max-[359px]:text-[10px] font-medium text-white shadow-soft">Mapa Relacji</span>
          {[33.5, 66.5].map((l) => (
            <span key={l} aria-hidden className="absolute top-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linen px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-soft ring-1 ring-sand" style={{ left: `${l}%` }}>lub</span>
          ))}
        </div>
      </div>
      <ul className="-mt-1 grid grid-cols-3 gap-2">
        {ROADS.map((r) => (
          <li key={r.key}>
            <a
              href={toPaths ? pathHref(r.key) : `#droga-${r.key}`}
              className={clsx("flex h-full flex-col items-center gap-1.5 rounded-2xl bg-white px-1.5 py-2.5 text-center text-[12.5px] leading-tight text-ink shadow-soft ring-1", TONE[r.tone].ring)}
            >
              <span className={clsx("grid h-8 w-8 place-items-center rounded-full", TONE[r.tone].soft)}>
                <RoadGlyph road={r.key} id={`hero-v-${r.key}`} className="h-4 w-4" />
              </span>
              {r.short}
            </a>
          </li>
        ))}
      </ul>
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
              <Link href={pathHref(r.key)} className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-forest px-5 text-sm font-medium text-white">
                Więcej o tej drodze <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </article>
          </Fragment>
        );
      })}
    </div>
  );
}
