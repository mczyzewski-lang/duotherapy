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
      {icon === "money" && (
        <>
          <ellipse cx="13" cy="22" rx="10" ry="4.5" fill={g("f")} />
          <path d="M3 18.5c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5V22c0 2.5-4.5 4.5-10 4.5S3 24.5 3 22Z" fill={g("f")} opacity="0.7" />
          <circle cx="20" cy="11" r="9" fill={g("c")} />
          <circle cx="20" cy="11" r="5.2" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.8" />
          <path d="M20 8.6v4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {icon === "home" && (
        <>
          <path d="M16 3 2.5 14.2c-.9.8-.3 2.3.9 2.3H5V27c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V16.5h1.6c1.2 0 1.8-1.5.9-2.3Z" fill={g("f")} />
          <rect x="12.5" y="19" width="7" height="10" rx="1.5" fill={g("c")} />
          <circle cx="16" cy="12.5" r="2.6" fill={g("h")} />
        </>
      )}
      {icon === "together" && (
        <>
          <circle cx="11.5" cy="16" r="9" fill={g("f")} />
          <circle cx="20.5" cy="16" r="9" fill={g("c")} opacity="0.85" />
          <path d="M16 22.5c-3-2.3-4.6-4.1-4.6-6 0-1.4 1.1-2.5 2.4-2.5.9 0 1.7.5 2.2 1.3.5-.8 1.3-1.3 2.2-1.3 1.3 0 2.4 1.1 2.4 2.5 0 1.9-1.6 3.7-4.6 6Z" fill="#fff" />
        </>
      )}
      {icon === "family" && (
        <>
          <circle cx="9" cy="7" r="4" fill={g("f")} />
          <circle cx="23" cy="7" r="4" fill={g("c")} />
          <path d="M2.5 22c0-5 2.9-9 6.5-9s6.5 4 6.5 9Z" fill={g("f")} />
          <path d="M16.5 22c0-5 2.9-9 6.5-9s6.5 4 6.5 9Z" fill={g("c")} />
          <circle cx="16" cy="20" r="3" fill={g("h")} />
          <path d="M11.5 30c0-3.3 2-5.5 4.5-5.5s4.5 2.2 4.5 5.5Z" fill={g("h")} />
        </>
      )}
      {icon === "needs" && (
        <>
          <path d="M4 7c0-2.8 2.2-5 5-5h14c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5h-9l-6.5 6v-6C5.8 21.7 4 19.6 4 17Z" fill={g("f")} />
          <path d="M16 18.5c-3.6-2.8-5.5-5-5.5-7.2 0-1.7 1.3-3 2.9-3 1.1 0 2 .6 2.6 1.5.6-.9 1.5-1.5 2.6-1.5 1.6 0 2.9 1.3 2.9 3 0 2.2-1.9 4.4-5.5 7.2Z" fill={g("h")} />
        </>
      )}
      {icon === "silence" && (
        <>
          <path d="M3 7c0-2.8 2.2-5 5-5h16c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5H14l-6.5 6v-6C5 21.6 3 19.5 3 17Z" fill={g("c")} />
          {[10.5, 16, 21.5].map((x) => <circle key={x} cx={x} cy="12" r="1.8" fill="#fff" opacity="0.55" />)}
          <path d="M5 26 27 3.5" stroke="#2D4939" strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {icon === "kids" && (
        <>
          <path d="M3 17C3 9.8 8.8 4 16 4s13 5.8 13 13" fill="none" stroke={g("f")} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="16" cy="15" r="3.6" fill={g("h")} />
          <path d="M10 29c0-4.7 2.7-8 6-8s6 3.3 6 8Z" fill={g("c")} />
        </>
      )}
      {icon === "boundary" && (
        <>
          <path d="M9 5 2 11v15.5c0 .8.7 1.5 1.5 1.5h11V11Z" fill={g("f")} />
          <path d="M23 5 30 11v15.5c0 .8-.7 1.5-1.5 1.5h-11V11Z" fill={g("c")} />
          <rect x="14.6" y="3" width="2.8" height="27" rx="1.4" fill={g("h")} />
        </>
      )}
      {icon === "signals" && (
        <>
          <rect x="2" y="4" width="28" height="24" rx="6" fill={g("f")} />
          <path d="M5 17h5l2.5-6 4 12 3-9 2 3H27" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {icon === "therapy" && (
        <>
          <path d="M5 12c0-2.8 2.2-5 5-5h12c2.8 0 5 2.2 5 5v5H5Z" fill={g("c")} />
          <path d="M2 16c0-1.7 1.3-3 3-3s3 1.3 3 3v2h16v-2c0-1.7 1.3-3 3-3s3 1.3 3 3v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2Z" fill={g("f")} />
          <path d="M6 26v3M26 26v3" stroke="#2D4939" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {icon === "hourglass" && (
        <>
          <rect x="6" y="2" width="20" height="3.5" rx="1.75" fill={g("f")} />
          <rect x="6" y="26.5" width="20" height="3.5" rx="1.75" fill={g("f")} />
          <path d="M8 5.5h16c0 5.5-4.5 7.8-6 10.5 1.5 2.7 6 5 6 10.5H8c0-5.5 4.5-7.8 6-10.5-1.5-2.7-6-5-6-10.5Z" fill={g("c")} />
          <path d="M12 24.5c.6-2.6 2.6-4.2 4-4.2s3.4 1.6 4 4.2Z" fill={g("h")} />
        </>
      )}
      {icon === "distance" && (
        <>
          <circle cx="6.5" cy="9" r="3.8" fill={g("f")} />
          <path d="M1 22c0-4.6 2.5-8 5.5-8s5.5 3.4 5.5 8Z" fill={g("f")} />
          <circle cx="25.5" cy="9" r="3.8" fill={g("c")} />
          <path d="M20 22c0-4.6 2.5-8 5.5-8s5.5 3.4 5.5 8Z" fill={g("c")} />
          <path d="M13.5 26h5" stroke={g("h")} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 3.2" />
          <path d="M2 27.5h8M22 27.5h8" stroke="#2D4939" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        </>
      )}
      {icon === "stop" && (
        <>
          <path d="M10.6 2h10.8L30 10.6v10.8L21.4 30H10.6L2 21.4V10.6Z" fill={g("h")} />
          <rect x="11" y="10" width="3.6" height="12" rx="1.8" fill="#fff" />
          <rect x="17.4" y="10" width="3.6" height="12" rx="1.8" fill="#fff" />
        </>
      )}
      {icon === "repair" && (
        <>
          <rect x="2" y="7" width="28" height="19" rx="4" fill={g("f")} />
          <path d="M3.5 9 16 18l12.5-9" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
          <circle cx="24.5" cy="7.5" r="6" fill={g("c")} />
          <path d="M24.5 4.5v3.2l2.1 1.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {icon === "three" && (
        <>
          <path d="M2 5.5C2 3.6 3.6 2 5.5 2h9C16.4 2 18 3.6 18 5.5v4c0 1.9-1.6 3.5-3.5 3.5H9l-4 3.5V13c-1.7-.2-3-1.7-3-3.5Z" fill={g("f")} />
          <path d="M14 15.5c0-1.9 1.6-3.5 3.5-3.5h9c1.9 0 3.5 1.6 3.5 3.5v4c0 1.8-1.3 3.3-3 3.5v3.5L23 23h-5.5c-1.9 0-3.5-1.6-3.5-3.5Z" fill={g("c")} />
          <path d="M4 24c0-1.4 1.1-2.5 2.5-2.5h6c1.4 0 2.5 1.1 2.5 2.5v2.5c0 1.4-1.1 2.5-2.5 2.5H9l-3 2.5v-2.6c-1.2-.2-2-1.2-2-2.4Z" fill={g("h")} />
        </>
      )}
      {icon === "scale" && (
        <>
          <rect x="14.6" y="4" width="2.8" height="22" rx="1.4" fill="#2D4939" />
          <rect x="9" y="26" width="14" height="3.5" rx="1.75" fill={g("f")} />
          <path d="M5 8h22" stroke="#2D4939" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M5 8 1 17h8Z" fill="none" stroke="#2D4939" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5" />
          <path d="M27 8 23 17h8Z" fill="none" stroke="#2D4939" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5" />
          <path d="M1 17h8a4 4 0 0 1-8 0Z" fill={g("h")} />
          <path d="M23 17h8a4 4 0 0 1-8 0Z" fill={g("c")} />
        </>
      )}
      {icon === "flag" && (
        <>
          <rect x="4" y="2" width="3" height="28" rx="1.5" fill="#2D4939" />
          <path d="M7 4h18.5c1 0 1.6 1.1 1 1.9L22.5 11l4 5.1c.6.8 0 1.9-1 1.9H7Z" fill={g("h")} />
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
