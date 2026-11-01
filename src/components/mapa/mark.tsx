// Znak produktu „Mapa Relacji”: punkt „tu jesteście” → węzeł mapy → trzy drogi (kolory DUO).
import clsx from "clsx";

export function MapaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" className={clsx("h-6 w-auto", className)} aria-hidden>
      <circle cx="4" cy="14" r="3" fill="#a9512f" />
      <path d="M7 14h9" stroke="#36493d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="14" r="3.4" fill="none" stroke="#36493d" strokeWidth="2" />
      <path d="M22 12.5 C27 10, 29 5, 36 4" stroke="#a9512f" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22.4 14 H36" stroke="#c4a98d" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 15.5 C27 18, 29 23, 36 24" stroke="#46604f" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="36.5" cy="4" r="1.8" fill="#a9512f" />
      <circle cx="36.5" cy="14" r="1.8" fill="#c4a98d" />
      <circle cx="36.5" cy="24" r="1.8" fill="#46604f" />
    </svg>
  );
}

/** Etykieta produktu: „DUO | MAPA RELACJI”. */
export function MapaEyebrow({ className }: { className?: string }) {
  return (
    <p className={clsx("inline-flex items-center gap-2.5 rounded-full bg-white/80 py-1.5 pl-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft shadow-soft ring-1 ring-sand", className)}>
      <MapaIcon className="h-5" />
      <span>DUO <span className="mx-1 text-sand-dark">|</span> <span className="text-clay">Mapa Relacji</span></span>
    </p>
  );
}
