// Znak marki DUO®: dwie postaci i misa między nimi (przestrzeń wspólnej rozmowy).
// Wektorowe odwzorowanie logo – ostre w każdym rozmiarze (nagłówek, favicon, PDF).
import clsx from "clsx";
import { BODY_LEFT, BOWL, BRAND } from "@/lib/brand-mark";

export { symbolSvg } from "@/lib/brand-mark";

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
        <span className={clsx("font-wordmark tracking-[0.06em]", compact ? "text-xl" : "text-[1.65rem]", light ? "text-white" : "text-forest")}>
          DUO<sup className="ml-0.5 align-super font-sans text-[0.4em] font-normal">®</sup>
        </span>
        {!compact && (
          <span className={clsx("mt-1 whitespace-nowrap text-[0.5rem] font-medium uppercase tracking-[0.3em] sm:text-[0.55rem] sm:tracking-[0.32em]", light ? "text-white/70" : "text-ink-soft")}>Terapia małżeństw</span>
        )}
      </span>
    </span>
  );
}
