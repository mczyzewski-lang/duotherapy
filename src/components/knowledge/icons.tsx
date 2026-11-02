// Ikony materiałów „Wiedza” – w stylu znaku Mapy Relacji (pełne kształty, gradienty DUO, bez obrysów).
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import { MAPA } from "@/lib/brand-mark";
import type { IconKey } from "@/knowledge/types";

const G = ({ id, c }: { id: string; c: string[] }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor={c[0]} />
    <stop offset="1" stopColor={c[1]} />
  </linearGradient>
);

export function MagnetIcon({ icon, id, className = "h-6 w-6" }: { icon: IconKey; id: string; className?: string }) {
  if (icon === "roads")
    return (
      <svg viewBox="0 0 112 112" className={className} aria-hidden>
        <MapaSymbol id={`mi-${id}`} />
      </svg>
    );
  if (icon === "separation") return <RoadGlyph road="separate" id={`mi-${id}`} className={className} />;
  const g = (n: string) => `url(#mi-${id}-${n})`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <G id={`mi-${id}-h`} c={MAPA.heart} />
        <G id={`mi-${id}-c`} c={MAPA.hourglass} />
        <G id={`mi-${id}-f`} c={MAPA.split} />
      </defs>
      {icon === "questions" && (
        <>
          <path d="M4 6.5C4 4 6 2 8.5 2h15C26 2 28 4 28 6.5v11c0 2.5-2 4.5-4.5 4.5H14l-6.5 6v-6h0C5.6 22 4 20 4 17.5Z" fill={g("c")} />
          <path d="M13 9.6c.4-2 2-3.1 3.8-3.1 2.2 0 3.7 1.4 3.7 3.2 0 2.6-3.4 2.7-3.4 5.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="17.1" cy="18.2" r="1.4" fill="#fff" />
        </>
      )}
      {icon === "crisis" && (
        <>
          <path d="M15.2 28C7 21.5 2 16.3 2 10.6 2 6.2 5.3 3 9.3 3c2.5 0 4.5 1.3 5.9 3.3l-2 5.2 3.4 3.5-2.4 4.6 1.6 8.4Z" fill={g("h")} />
          <path d="M17.6 6.2C19 4.3 21 3 23.4 3 27.5 3 30 6.2 30 10.6c0 5.7-5 11-12.2 17.4l-1.5-8 2.6-4.9-3.6-3.6Z" fill={g("h")} opacity="0.75" />
        </>
      )}
      {icon === "report" && (
        <>
          <path d="M7 2h12l7 7v18.5c0 1.4-1.1 2.5-2.5 2.5h-16C6.1 30 5 28.9 5 27.5v-23C5 3.1 6.1 2 7 2Z" fill={g("f")} />
          <path d="M19 2v5.5C19 8.3 19.7 9 20.5 9H26Z" fill="#fff" opacity="0.45" />
          <path d="M9.5 15h12M9.5 19.5h12M9.5 24h7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {icon === "days" && (
        <>
          <rect x="3" y="5" width="26" height="24" rx="5" fill={g("f")} />
          <rect x="3" y="5" width="26" height="7" rx="3.5" fill={g("c")} />
          <path d="M10 2.5v5M22 2.5v5" stroke="#2D4939" strokeWidth="2.4" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={9 + i * 4.7} cy="18" r="1.6" fill="#fff" />)}
          {[0, 1, 2].map((i) => <circle key={i} cx={9 + i * 4.7} cy="23.5" r="1.6" fill="#fff" opacity="0.85" />)}
        </>
      )}
      {icon === "talk" && (
        <>
          <path d="M2 7c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v7c0 2.2-1.8 4-4 4h-7l-5 4.5V18h0c-2.2 0-4-1.8-4-4Z" fill={g("c")} />
          <path d="M30 15.5c0-2.2-1.8-4-4-4h-2.5V14c0 3.6-2.9 6.5-6.5 6.5h-4.3c.5 1.7 2.1 3 4 3H22l5 4.5v-4.5c1.7-.3 3-1.8 3-3.6Z" fill={g("f")} />
        </>
      )}
      {icon === "solo" && (
        <>
          <circle cx="16" cy="7.5" r="5" fill={g("c")} />
          <path d="M4 17.5h24A12 12 0 0 1 4 17.5Z" fill={g("f")} />
          <path d="M16 31c-2.9-2.3-4.5-4.1-4.5-6 0-1.4 1.1-2.5 2.4-2.5.9 0 1.6.5 2.1 1.2.5-.7 1.2-1.2 2.1-1.2 1.3 0 2.4 1.1 2.4 2.5 0 1.9-1.6 3.7-4.5 6Z" fill={g("h")} />
        </>
      )}
      {icon === "loop" && (
        <>
          <path d="M16 3.5A12.5 12.5 0 1 1 3.9 19.2l4.3-1.2A8 8 0 1 0 16 8Z" fill={g("c")} />
          <path d="M16 0.5v11l-6.5-5.5Z" fill={g("f")} />
        </>
      )}
      {icon === "betrayal" && (
        <>
          <path d="M16 29.5C6.5 22 1.5 16.2 1.5 10.2 1.5 5.6 5 2.2 9.2 2.2c2.9 0 5.3 1.6 6.8 4.1 1.5-2.5 3.9-4.1 6.8-4.1 4.2 0 7.7 3.4 7.7 8 0 6-5 11.8-14.5 19.3Z" fill={g("h")} />
          <rect x="6" y="11.5" width="20" height="6" rx="3" transform="rotate(-30 16 14.5)" fill={g("f")} opacity="0.9" />
        </>
      )}
    </svg>
  );
}
