import { BrandSymbol } from "@/components/brand";

// Ilustracje DUO® oparte na znaku marki (dwie osoby i wspólna przestrzeń rozmowy).

export function HeroArt() {
  return (
    <figure className="relative mx-auto aspect-[480/420] w-full max-w-[520px]" aria-label="Znak DUO: dwie osoby i wspólna przestrzeń rozmowy między nimi">
      <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-linen via-ivory to-sage-soft/70" aria-hidden />
      <div className="absolute left-[14%] top-[12%] h-[45%] w-[45%] rounded-full bg-clay-soft/70 blur-3xl" aria-hidden />
      <div className="absolute bottom-[12%] right-[10%] h-[40%] w-[40%] rounded-full bg-sage-soft blur-3xl" aria-hidden />
      <div className="absolute inset-x-[12%] top-[24%]">
        <BrandSymbol id="hero" className="animate-breathe-slow h-auto w-full drop-shadow-[0_18px_30px_rgba(54,73,61,0.12)]" />
      </div>
      <figcaption className="pointer-events-none absolute inset-0 text-[13px] text-ink">
        <span className="absolute left-[6%] top-[9%] rounded-full bg-white/90 px-3.5 py-1.5 shadow-soft">Twoja perspektywa</span>
        <span className="absolute right-[6%] top-[9%] rounded-full bg-white/90 px-3.5 py-1.5 shadow-soft">Jej / jego perspektywa</span>
        <span className="absolute bottom-[10%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-4 py-1.5 text-white shadow-soft">Wspólna przestrzeń rozmowy</span>
      </figcaption>
    </figure>
  );
}

export function StepIcon({ n }: { n: number }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-forest font-display text-lg text-white" aria-hidden>
      {n}
    </span>
  );
}

export function PathArt({ tone }: { tone: "forest" | "clay" | "alert" }) {
  const c = { forest: "#36493d", clay: "#a9512f", alert: "#8a2c1d" }[tone];
  return (
    <svg viewBox="0 0 64 32" className="h-8 w-16" aria-hidden>
      {tone === "forest" && (
        <>
          <circle cx="24" cy="16" r="12" fill="none" stroke={c} strokeWidth="2" />
          <circle cx="40" cy="16" r="12" fill="none" stroke={c} strokeWidth="2" />
        </>
      )}
      {tone === "clay" && (
        <>
          <circle cx="16" cy="16" r="12" fill="none" stroke={c} strokeWidth="2" />
          <circle cx="48" cy="16" r="12" fill="none" stroke={c} strokeWidth="2" />
          <path d="M28 16h8" stroke={c} strokeWidth="2" strokeDasharray="2 3" />
        </>
      )}
      {tone === "alert" && (
        <>
          <path d="M32 4 L52 12 V18 C52 24 43 29 32 30 C21 29 12 24 12 18 V12 Z" fill="none" stroke={c} strokeWidth="2" />
          <path d="M25 17l5 5 9-10" fill="none" stroke={c} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
