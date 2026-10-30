// Autorskie ilustracje DUO™ – abstrakcyjne, spokojne formy (dwa okręgi = dwie perspektywy).

export function HeroArt() {
  return (
    <svg viewBox="0 0 480 420" className="h-auto w-full" role="img" aria-label="Dwa przenikające się okręgi – dwie perspektywy jednej relacji">
      <defs>
        <radialGradient id="ga" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#e3ebe6" />
          <stop offset="100%" stopColor="#c9d8cf" />
        </radialGradient>
        <radialGradient id="gb" cx="60%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#f6e7df" />
          <stop offset="100%" stopColor="#ecd5cb" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="480" height="420" rx="36" fill="#f3ece2" />
      <g className="animate-breathe">
        <circle cx="185" cy="210" r="128" fill="url(#ga)" opacity="0.95" />
      </g>
      <g className="animate-breathe-rev">
        <circle cx="295" cy="210" r="128" fill="url(#gb)" opacity="0.85" style={{ mixBlendMode: "multiply" }} />
      </g>
      <path d="M240 108 C 270 150, 270 270, 240 312 C 210 270, 210 150, 240 108 Z" fill="#1f4a44" opacity="0.12" />
      <circle cx="185" cy="210" r="128" fill="none" stroke="#1f4a44" strokeWidth="1.5" opacity="0.5" />
      <circle cx="295" cy="210" r="128" fill="none" stroke="#a7573a" strokeWidth="1.5" opacity="0.55" />
      <g fontFamily="Inter Variable, sans-serif" fontSize="13" fill="#1d2827">
        <rect x="40" y="52" rx="14" width="150" height="40" fill="#fff" opacity="0.92" />
        <text x="58" y="77">Twoja perspektywa</text>
        <rect x="292" y="330" rx="14" width="150" height="40" fill="#fff" opacity="0.92" />
        <text x="310" y="355">Jego / jej perspektywa</text>
        <rect x="178" y="190" rx="14" width="124" height="40" fill="#1f4a44" />
        <text x="199" y="215" fill="#fff">Wspólna mapa</text>
      </g>
    </svg>
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
  const c = { forest: "#1f4a44", clay: "#a7573a", alert: "#8a2c1d" }[tone];
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
