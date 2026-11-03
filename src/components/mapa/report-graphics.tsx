// Ikony i poziome schematy sześciu części Mapy Relacji – w stylu znaku DUO (pełne kształty, gradienty, bez obrysów).
// Schematy pokazują LOGIKĘ części (jak jest zbudowana), a nie dane konkretnej pary.
import { MAPA } from "@/lib/brand-mark";

export type SectionKey = "summary" | "strengths" | "tensions" | "mechanism" | "recommendations" | "nextSteps";

const FOREST = "#36493d";
const CLAY = "#a9512f";
const SAND = "#eadccb";
const SAND_D = "#d5c2ad";
const INK = "#4d4540";
const MUTED = "#6a605a";

function Defs({ id }: { id: string }) {
  const g = (n: string, [a, b]: string[]) => (
    <linearGradient id={`${id}-${n}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return <defs>{g("h", MAPA.heart)}{g("c", MAPA.hourglass)}{g("f", MAPA.split)}{g("s", ["#f4eee6", SAND_D])}</defs>;
}

/** Ikona części (32×32). */
export function SectionIcon({ k, id, className = "h-6 w-6" }: { k: SectionKey; id: string; className?: string }) {
  const u = (n: string) => `url(#${id}-${n})`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <Defs id={id} />
      {k === "summary" && (
        <>
          <rect x="4" y="3" width="20" height="26" rx="4" fill={u("s")} />
          <path d="M22 9.5c-4.1 0-7.5 3.3-7.5 7.4 0 5.3 7.5 12.1 7.5 12.1s7.5-6.8 7.5-12.1c0-4.1-3.4-7.4-7.5-7.4Z" fill={u("c")} />
          <circle cx="22" cy="17" r="2.8" fill="#fff" />
        </>
      )}
      {k === "strengths" && (
        <>
          <rect x="2" y="25" width="28" height="5" rx="2.5" fill={u("f")} />
          <rect x="5" y="12" width="6" height="12" rx="3" fill={u("f")} opacity="0.75" />
          <rect x="13" y="8" width="6" height="16" rx="3" fill={u("f")} />
          <rect x="21" y="12" width="6" height="12" rx="3" fill={u("f")} opacity="0.75" />
          <circle cx="16" cy="4.5" r="2.5" fill={u("h")} />
        </>
      )}
      {k === "tensions" && (
        <>
          <circle cx="11" cy="17" r="9" fill={u("h")} />
          <circle cx="21" cy="17" r="9" fill={u("c")} opacity="0.8" />
          <path d="M16 3.5 17.4 7 21 7.4 18.2 9.7 19 13 16 11.2 13 13l.8-3.3L11 7.4l3.6-.4Z" fill={CLAY} />
        </>
      )}
      {k === "mechanism" && (
        <>
          <path d="M16 4a12 12 0 1 1-11.3 8H9a8 8 0 1 0 7-4.1Z" fill={u("c")} />
          <path d="M16 1v11l-6-5.5Z" fill={u("c")} />
          <circle cx="16" cy="16" r="3.2" fill={u("h")} />
        </>
      )}
      {k === "recommendations" && (
        <>
          <path d="M14 30V18.5L5 9.4l2.8-2.8L16 14.8l8.2-8.2L27 9.4l-9 9.1V30Z" fill={u("f")} />
          <circle cx="5.5" cy="6" r="3.5" fill={u("h")} />
          <circle cx="16" cy="4.5" r="3.5" fill={u("c")} />
          <circle cx="26.5" cy="6" r="3.5" fill={u("f")} />
        </>
      )}
      {k === "nextSteps" && (
        <>
          <rect x="2" y="21" width="9" height="9" rx="2.5" fill={u("s")} />
          <rect x="11.5" y="14" width="9" height="16" rx="2.5" fill={u("c")} opacity="0.8" />
          <rect x="21" y="7" width="9" height="23" rx="2.5" fill={u("f")} />
          <path d="M22.5 3.5 25 6l4-4.5" fill="none" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

const T = ({ x, y, children, a = "middle", c = INK, w = 500, s = 10.5 }: { x: number; y: number; children: string; a?: "start" | "middle" | "end"; c?: string; w?: number; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={w} fill={c} fontFamily="inherit">{children}</text>
);

/** Poziomy schemat logiki części (340×86). */
export function SectionGraphic({ k, id, className }: { k: SectionKey; id: string; className?: string }) {
  const u = (n: string) => `url(#${id}-${n})`;
  const label: Record<SectionKey, string> = {
    summary: "Od powodu wizyty do miejsca, w którym jesteście z decyzją",
    strengths: "Zasoby, na których możecie się oprzeć – na każdej drodze",
    tensions: "Sześć obszarów relacji i skala nasilenia trudności",
    mechanism: "Cykl konfliktu krok po kroku – osobno dla każdej osoby",
    recommendations: "Propozycje na teraz i możliwe drogi – decyzja należy do Was",
    nextSteps: "Plan: co, kto i kiedy",
  };
  return (
    <svg viewBox="0 0 340 86" className={className} role="img" aria-label={`Schemat: ${label[k]}`}>
      <Defs id={id} />
      {k === "summary" && (
        <>
          <line x1="44" y1="34" x2="296" y2="34" stroke={SAND_D} strokeWidth="2" strokeDasharray="5 6" />
          <circle cx="44" cy="34" r="9" fill={u("s")} />
          <circle cx="170" cy="34" r="13" fill={u("c")} />
          <circle cx="170" cy="34" r="5" fill="#fff" />
          <rect x="282" y="20" width="28" height="28" rx="8" fill={u("f")} opacity="0.35" />
          <path d="M291 34h10m-4-4 4 4-4 4" stroke={FOREST} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <T x={44} y={66}>Z czym</T><T x={44} y={78}>przyszliście</T>
          <T x={170} y={66} c={CLAY} w={600}>Gdzie jesteście</T><T x={170} y={78} c={CLAY} w={600}>dziś</T>
          <T x={296} y={66}>Decyzja</T><T x={296} y={78}>przed Wami</T>
        </>
      )}
      {k === "strengths" && (
        <>
          <rect x="20" y="60" width="300" height="10" rx="5" fill={u("f")} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={46 + i * 70} y={i % 2 ? 22 : 30} width="38" height={i % 2 ? 36 : 28} rx="10" fill={u("f")} opacity={i % 2 ? 0.85 : 0.55} />
          ))}
          {[[60, "h"], [130, "c"], [200, "h"], [270, "c"]].map(([x, g]) => <circle key={x} cx={Number(x) + 5} cy={14} r="4" fill={u(String(g))} opacity="0.85" />)}
          <T x={170} y={84} c={MUTED} s={10}>fundament niezależny od wybranej drogi</T>
        </>
      )}
      {k === "tensions" && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${12 + i * 44} 8)`}>
              <rect width="30" height="50" rx="9" fill="#fff" stroke={SAND} />
              {[0, 1, 2].map((j) => <rect key={j} x="8" y={36 - j * 12} width="14" height="8" rx="4" fill={j === 0 ? u("h") : j === 1 ? u("c") : CLAY} opacity={0.35 + j * 0.25} />)}
            </g>
          ))}
          <g transform="translate(278 12)">
            {[["wysokie", CLAY], ["umiark.", MAPA.hourglass[1]], ["niskie", MAPA.heart[1]]].map(([t, c], j) => (
              <g key={t} transform={`translate(0 ${j * 15})`}><rect width="10" height="6" rx="3" y="-5" fill={c} opacity={0.85 - j * 0.2} /><T x={14} y={0} a="start" s={9} c={MUTED}>{t}</T></g>
            ))}
          </g>
          <T x={138} y={78} c={MUTED} s={10}>6 obszarów · nasilenie w 3 stopniach</T>
        </>
      )}
      {k === "mechanism" && (
        <>
          {/* powrót do początku – łuk pod etykietami */}
          <path d="M306 62 C 306 80, 34 80, 34 62" fill="none" stroke={SAND_D} strokeWidth="2" strokeDasharray="5 5" />
          <path d="M28 68 34 61 40 68" fill="none" stroke={SAND_D} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {["Wyzwalacz", "Myśl", "Emocja", "Zachowanie", "Potrzeba"].map((t, i) => (
            <g key={t}>
              {i > 0 && <path d={`M${34 + (i - 1) * 68 + 19} 24h${68 - 38}`} stroke={SAND_D} strokeWidth="2" />}
              <circle cx={34 + i * 68} cy="24" r="15" fill={i === 4 ? u("h") : u("c")} opacity={0.45 + i * 0.12} />
              <T x={34 + i * 68} y={28} c="#fff" w={700} s={11}>{String(i + 1)}</T>
              <T x={34 + i * 68} y={53} s={10}>{t}</T>
            </g>
          ))}
          <T x={170} y={84} c={MUTED} s={9.5}>i od nowa – dopóki nie zobaczycie cyklu</T>
        </>
      )}
      {k === "recommendations" && (
        <>
          <rect x="14" y="20" width="76" height="30" rx="15" fill={u("c")} />
          <T x={52} y={39} c="#fff" w={600}>Propozycje</T>
          {[[16, "h", "Odbudowa", MAPA.heart[1]], [36, "c", "Czas na decyzję", MAPA.hourglass[1]], [56, "f", "Świadome rozstanie", MAPA.split[1]]].map(([y, g, t, col]) => (
            <g key={String(t)}>
              <path d={`M90 35 C 130 35, 130 ${y}, 172 ${y}`} fill="none" stroke={String(col)} strokeWidth="3" strokeLinecap="round" />
              <circle cx="178" cy={Number(y)} r="6" fill={u(String(g))} />
              <T x={192} y={Number(y) + 4} a="start">{String(t)}</T>
            </g>
          ))}
          <T x={170} y={82} c={MUTED} s={10}>propozycja, nie zobowiązanie – wybieracie Wy</T>
        </>
      )}
      {k === "nextSteps" && (
        <>
          <line x1="44" y1="30" x2="300" y2="30" stroke={SAND_D} strokeWidth="2" strokeDasharray="5 5" />
          {[["Co", "s"], ["Kto", "c"], ["Kiedy", "f"]].map(([t, g], i) => (
            <g key={t}>
              <rect x={14 + i * 110} y="12" width="60" height="36" rx="12" fill={u(g)} opacity={g === "s" ? 1 : 0.85} />
              <T x={44 + i * 110} y={35} c={g === "s" ? FOREST : "#fff"} w={600} s={12}>{t}</T>
            </g>
          ))}
          <circle cx="314" cy="30" r="13" fill={u("h")} opacity="0.3" />
          <path d="M308 30l4 4 8-9" fill="none" stroke={CLAY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <T x={170} y={72} c={MUTED} s={10}>wiecie, od czego zacząć po konsultacji</T>
        </>
      )}
    </svg>
  );
}
