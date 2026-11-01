// Etykieta produktu „Mapa Relacji” ze znakiem trzech dróg (serce · klepsydra · rozstanie).
import clsx from "clsx";
import { MapaSymbol } from "@/components/brand";

/** Etykieta produktu: „DUO | MAPA RELACJI”. */
export function MapaEyebrow({ className }: { className?: string }) {
  return (
    <p className={clsx("inline-flex items-center gap-2.5 rounded-full bg-white/80 py-1.5 pl-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft shadow-soft ring-1 ring-sand", className)}>
      <MapaSymbol id="eyebrow" className="h-4 w-auto" />
      <span>DUO <span className="mx-1 text-sand-dark">|</span> <span className="text-clay">Mapa Relacji</span></span>
    </p>
  );
}
