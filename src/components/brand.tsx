// Znak marki DUO®: dwie postaci i misa między nimi (przestrzeń wspólnej rozmowy).
// Wektorowe odwzorowanie logo – ostre w każdym rozmiarze (nagłówek, favicon, PDF).
import clsx from "clsx";
import { BODY_LEFT, BOWL, BRAND, MAPA, MAPA_ARROW_LEFT, MAPA_ARROW_RIGHT, MAPA_GLASS_BOTTOM, MAPA_GLASS_TOP, MAPA_HEART, roadFor, type Road } from "@/lib/brand-mark";

export { mapaSymbolSvg, symbolSvg } from "@/lib/brand-mark";

export function BrandSymbol({ className, id = "duo", title }: { className?: string; id?: string; title?: string }) {
  return (
    <svg viewBox="0 0 71 42" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        {(
          [
            ["t", BRAND.terracotta],
            ["th", BRAND.terracottaHead],
            ["s", BRAND.sand],
            ["g", BRAND.green],
            ["gh", BRAND.greenHead],
          ] as const
        ).map(([n, [a, b]]) => (
          <linearGradient key={n} id={`${id}-${n}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
      </defs>
      <circle cx="7" cy="4.9" r="4.8" fill={`url(#${id}-th)`} />
      <path d={BODY_LEFT} fill={`url(#${id}-t)`} />
      <path d={BOWL} fill={`url(#${id}-s)`} />
      <circle cx="64" cy="4.9" r="4.8" fill={`url(#${id}-gh)`} />
      <path d={BODY_LEFT} transform="matrix(-1 0 0 1 71 0)" fill={`url(#${id}-g)`} />
    </svg>
  );
}

/** Logo poziome: symbol + DUO® + „Terapia małżeństw”. */
export function Logo({ className, light, compact, id = "logo" }: { className?: string; light?: boolean; compact?: boolean; id?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <BrandSymbol id={id} className={compact ? "h-6 w-auto" : "h-8 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className={clsx("font-wordmark font-medium", compact ? "text-xl" : "text-[1.65rem]", light ? "text-white" : "text-forest")}>
          DUO<sup className="ml-0.5 align-super font-sans text-[0.4em] font-normal">®</sup>
        </span>
        {!compact && (
          <span className={clsx("mt-1 whitespace-nowrap text-[0.5rem] font-medium uppercase tracking-[0.3em] sm:text-[0.55rem] sm:tracking-[0.32em]", light ? "text-white/70" : "text-ink-soft")}>Terapia małżeństw</span>
        )}
      </span>
    </span>
  );
}

/** Znak „Mapy Relacji”: serce · klepsydra · strzałki w dwie strony – trzy możliwe drogi. */
export function MapaSymbol({ className, id = "mapa", title }: { className?: string; id?: string; title?: string }) {
  const grad = (n: string, [a, b]: string[]) => (
    <linearGradient key={n} id={`${id}-${n}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return (
    <svg viewBox="0 0 112 32" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        {grad("h", MAPA.heart)}
        {grad("g", MAPA.hourglass)}
        {grad("s", MAPA.split)}
      </defs>
      <path d={MAPA_HEART} fill={`url(#${id}-h)`} />
      <g transform="translate(40 0)">
        <path d={MAPA_GLASS_TOP} fill={`url(#${id}-g)`} />
        <path d={MAPA_GLASS_BOTTOM} fill={`url(#${id}-g)`} opacity={0.85} />
      </g>
      <g transform="translate(80 0)" strokeLinejoin="round" strokeWidth={1.6}>
        <path d={MAPA_ARROW_LEFT} fill={`url(#${id}-s)`} stroke={`url(#${id}-s)`} />
        <path d={MAPA_ARROW_RIGHT} fill={`url(#${id}-s)`} stroke={`url(#${id}-s)`} />
      </g>
    </svg>
  );
}

/** Logo produktu: znak + „Mapa Relacji” + „od DUO®” (w tym samym stylu co logo DUO). */
export function MapaLogo({ className, light, compact, id = "mapa-logo" }: { className?: string; light?: boolean; compact?: boolean; id?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <MapaSymbol id={id} className={compact ? "h-5 w-auto" : "h-7 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className={clsx("font-wordmark font-medium", compact ? "text-lg" : "text-[1.45rem]", light ? "text-white" : "text-forest")}>Mapa Relacji</span>
        {!compact && (
          <span className={clsx("mt-1 whitespace-nowrap text-[0.5rem] font-medium uppercase tracking-[0.3em] sm:text-[0.55rem]", light ? "text-white/70" : "text-ink-soft")}>
            od DUO<sup className="text-[0.8em]">®</sup> · terapia małżeństw
          </span>
        )}
      </span>
    </span>
  );
}

/** Pojedyncze symbole trzech dróg (do kart i ikon). */
export function RoadGlyph({ road, className, id }: { road: Road; className?: string; id?: string }) {
  const gid = `${id ?? "road"}-${road}`;
  const [a, b] = road === "rebuild" ? MAPA.heart : road === "clarity" ? MAPA.hourglass : MAPA.split;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {road === "rebuild" && <path d={MAPA_HEART} fill={`url(#${gid})`} />}
      {road === "clarity" && (
        <>
          <path d={MAPA_GLASS_TOP} fill={`url(#${gid})`} />
          <path d={MAPA_GLASS_BOTTOM} fill={`url(#${gid})`} opacity={0.85} />
        </>
      )}
      {road === "separate" && (
        <g strokeLinejoin="round" strokeWidth={1.6}>
          <path d={MAPA_ARROW_LEFT} fill={`url(#${gid})`} stroke={`url(#${gid})`} />
          <path d={MAPA_ARROW_RIGHT} fill={`url(#${gid})`} stroke={`url(#${gid})`} />
        </g>
      )}
    </svg>
  );
}

/** Znak drogi przy zgłoszeniu (segment z pyt. 1 quizu lub intencja); brak znaku, gdy nie ma odpowiednika. */
export function LeadRoad({ lead, className = "h-3.5 w-3.5 shrink-0" }: { lead: { segment?: string | null; intent?: string | null }; className?: string }) {
  const road = roadFor(lead.segment) ?? roadFor(lead.intent);
  return road ? <RoadGlyph road={road} id={`lead-${road}`} className={className} /> : null;
}
