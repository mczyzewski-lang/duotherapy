// Renderer materiałów „Wiedza” – jedno źródło treści (bloki) dla wersji online, /demo, podglądu na landingu i PDF.
// Tryb „print” = ten sam układ z podziałem na strony A4 (PDF drukuje dokładnie tę stronę).
import clsx from "clsx";
import { Check, Info, Lightbulb, ShieldAlert } from "lucide-react";
import { BrandSymbol, MapaSymbol, RoadGlyph } from "@/components/brand";
import type { Block, LeadMagnet } from "@/knowledge/types";
import { CATEGORY_LABEL } from "@/knowledge/types";
import { DayDone } from "./day-done";
import { MagnetIcon } from "./icons";

type Mode = "screen" | "print";

/** **pogrubienie** w tekście */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((x, i) => (x.startsWith("**") ? <strong key={i} className="font-semibold text-ink">{x.slice(2, -2)}</strong> : x))}</>;
}

function Lines({ n = 3, className }: { n?: number; className?: string }) {
  return (
    <div className={clsx("mt-2 space-y-0", className)} aria-hidden>
      {Array.from({ length: n }).map((_, i) => <div key={i} className="h-8 border-b border-dashed border-sand-dark/80" />)}
    </div>
  );
}

export function Cover({ m, mode, compact }: { m: LeadMagnet; mode: Mode; compact?: boolean }) {
  return (
    <section
      className={clsx(
        "relative flex flex-col overflow-hidden bg-gradient-to-br from-ivory via-white to-linen text-ink",
        mode === "print" ? "h-[257mm] break-after-page rounded-none p-[14mm]" : compact ? "aspect-[3/4] rounded-2xl p-5 ring-1 ring-sand" : "rounded-[1.75rem] p-7 shadow-soft ring-1 ring-sand sm:p-10",
      )}
      aria-label="Okładka materiału"
    >
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-clay-soft/70" aria-hidden />
      <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-sage-soft/80" aria-hidden />
      <div className="relative flex items-center gap-2">
        <BrandSymbol id={`cv-${m.id}-${compact ? "c" : mode}`} className={compact ? "h-4 w-auto" : "h-6 w-auto"} />
        <span className={clsx("font-wordmark font-medium text-forest", compact ? "text-sm" : "text-lg")}>DUO®</span>
        <span className={clsx("ml-auto rounded-full bg-white/80 font-semibold uppercase tracking-[0.16em] text-clay ring-1 ring-sand", compact ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]")}>
          Bezpłatny materiał
        </span>
      </div>
      <div className={clsx("relative mt-auto", compact ? "pt-4" : "pt-16")}>
        <span className={clsx("grid place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-sand", compact ? "h-11 w-11" : "h-16 w-16")}>
          <MagnetIcon icon={m.icon} id={`cv-${m.id}-${compact ? "c" : mode}`} className={compact ? "h-6 w-6" : "h-9 w-9"} />
        </span>
        <p className={clsx("font-semibold uppercase tracking-[0.18em] text-clay", compact ? "mt-3 text-[8.5px]" : "mt-6 text-xs")}>{m.cover.kicker} · {CATEGORY_LABEL[m.category]}</p>
        {(() => {
          // miniatura okładki (landing, karty) nie jest nagłówkiem strony – jeden H1 na stronę
          const T = compact ? "p" : "h1";
          return <T className={clsx("font-display leading-[1.08] text-ink", compact ? "mt-1.5 text-[1.05rem]" : mode === "print" ? "mt-3 text-[34pt]" : "mt-3 text-[2rem] sm:text-[2.6rem]")}>{m.title}</T>;
        })()}
        <p className={clsx("text-ink-soft", compact ? "mt-1.5 text-[10px] leading-snug" : "mt-4 max-w-xl text-lg leading-relaxed")}>{m.cover.subtitle}</p>
      </div>
      <div className={clsx("relative flex items-end justify-between", compact ? "mt-4" : "mt-14")}>
        <MapaSymbol id={`cvm-${m.id}-${compact ? "c" : mode}`} className={compact ? "h-3.5 w-auto" : "h-6 w-auto"} />
        {!compact && <span className="text-xs text-muted">duo · Mapa Relacji</span>}
      </div>
    </section>
  );
}

/** Rozwidlenie trzech dróg – statyczna wersja wizualizacji ze strony głównej. */
function RoadsFigure() {
  const ends = [
    { x: 60, road: "rebuild" as const, label: "Odbudowa relacji", c: "#e07f78" },
    { x: 200, road: "clarity" as const, label: "Czas na zrozumienie", c: "#a9512f" },
    { x: 340, road: "separate" as const, label: "Świadome rozstanie", c: "#46604f" },
  ];
  return (
    <figure className="my-6 break-inside-avoid rounded-3xl bg-gradient-to-br from-white via-ivory to-linen p-4 ring-1 ring-sand">
      <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label="Od miejsca, w którym jesteś dziś, przez zrozumienie, do jednej z trzech dróg">
        <path d="M200 46 C 170 70, 230 88, 200 108" fill="none" stroke="#36493d" strokeWidth="2.5" strokeDasharray="6 7" />
        {ends.map((e) => <path key={e.x} d={`M200 168 C 200 210, ${e.x} 200, ${e.x} 246`} fill="none" stroke={e.c} strokeWidth="3.5" strokeLinecap="round" />)}
        <circle cx="200" cy="38" r="9" fill="#a9512f" />
        <circle cx="200" cy="138" r="30" fill="#fff" stroke="#36493d" strokeWidth="2.5" />
        <svg x="176" y="131" width="48" height="14" viewBox="0 0 112 32"><MapaSymbol id="rf-node" /></svg>
        {ends.map((e) => <circle key={e.x} cx={e.x} cy="248" r="6" fill={e.c} />)}
        <text x="200" y="18" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#a9512f">TU JESTEŚ DZISIAJ</text>
        {[130, 270].map((x) => <text key={x} x={x} y="230" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6a605a">LUB</text>)}
      </svg>
      <div className="-mt-2 grid grid-cols-3 gap-2 text-center text-[12.5px] leading-tight text-ink">
        {ends.map((e) => (
          <span key={e.x} className="flex flex-col items-center gap-1.5">
            <RoadGlyph road={e.road} id={`rf-${e.road}`} className="h-6 w-6" />
            {e.label}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">Żadna droga nie jest „lepsza”. Ważne, żeby była świadomie wybrana.</figcaption>
    </figure>
  );
}

const LOOP_STEPS = ["Wyzwalacz", "Interpretacja", "Emocje", "Reakcja A", "Reakcja B", "Eskalacja"];

function LoopFigure() {
  const r = 108;
  const pts = LOOP_STEPS.map((_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return { x: 160 + r * Math.cos(a), y: 150 + r * Math.sin(a) };
  });
  return (
    <figure className="my-6 break-inside-avoid rounded-3xl bg-white p-4 ring-1 ring-sand">
      <svg viewBox="0 0 320 300" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Pętla konfliktu: wyzwalacz, interpretacja, emocje, reakcja jednej osoby, reakcja drugiej osoby, eskalacja – i z powrotem">
        <defs>
          <marker id="lp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#a9512f" /></marker>
        </defs>
        <circle cx="160" cy="150" r={r} fill="none" stroke="#eadccb" strokeWidth="14" />
        {pts.map((p, i) => {
          const q = pts[(i + 1) % pts.length];
          const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
          const dx = mx - 160, dy = my - 150, len = Math.hypot(dx, dy);
          return <path key={i} d={`M${p.x} ${p.y} Q ${160 + (dx / len) * (r + 26)} ${150 + (dy / len) * (r + 26)} ${q.x} ${q.y}`} fill="none" stroke="#a9512f" strokeWidth="1.6" markerEnd="url(#lp-arrow)" opacity="0.7" />;
        })}
        {pts.map((p, i) => (
          <g key={LOOP_STEPS[i]}>
            <circle cx={p.x} cy={p.y} r="27" fill={i === 5 ? "#a9512f" : "#fff"} stroke={i === 5 ? "#a9512f" : "#36493d"} strokeWidth="2" />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="8.4" fontWeight="600" fill={i === 5 ? "#fff" : "#36493d"}>{LOOP_STEPS[i]}</text>
          </g>
        ))}
        <circle cx="160" cy="150" r="40" fill="#e5ece6" />
        <text x="160" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#36493d">PUNKT</text>
        <text x="160" y="160" textAnchor="middle" fontSize="10" fontWeight="700" fill="#36493d">PRZERWANIA</text>
      </svg>
      <figcaption className="text-center text-xs text-muted">Pętla przyspiesza z każdym obiegiem. Przerwać ją można w każdym miejscu – najłatwiej przy interpretacji i reakcji.</figcaption>
    </figure>
  );
}

/** W druku nowa strona tylko przed częściami do wypełnienia (ćwiczenia, arkusze, karty, checklisty). */
const PAGE_START = /^(Ćwiczenie|Twój arkusz|Karta|Checklista|Podsumowanie tygodnia|\d+\. Ćwiczenie)/;

function H2({ text, mode, first, noBreak }: { text: string; mode: Mode; first: boolean; noBreak?: boolean }) {
  const pageBreak = mode === "print" && !first && !noBreak && PAGE_START.test(text);
  return (
    <h2 className={clsx("break-after-avoid font-display text-[1.6rem] leading-tight text-forest sm:text-[1.85rem]", first ? "mt-0" : "mt-12", mode === "print" && !first && "mt-9", pageBreak && "break-before-page !mt-0")}>
      {text}
    </h2>
  );
}

export function BlockView({ b, mode, i, first }: { b: Block; mode: Mode; i: number; first?: boolean }) {
  switch (b.t) {
    case "h2":
      return <H2 text={b.text} mode={mode} first={!!first} noBreak={b.noBreak} />;
    case "h3":
      return <h3 className="mt-6 font-display text-xl text-ink">{b.text}</h3>;
    case "lead":
      return <p className="mt-4 text-[1.1rem] leading-relaxed text-ink"><Rich text={b.text} /></p>;
    case "p":
      return <p className="mt-3 leading-relaxed text-ink-soft"><Rich text={b.text} /></p>;
    case "list":
      return b.ordered ? (
        <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed text-ink-soft marker:font-semibold marker:text-clay">{b.items.map((x) => <li key={x}><Rich text={x} /></li>)}</ol>
      ) : (
        <ul className="mt-3 space-y-2 leading-relaxed text-ink-soft">
          {b.items.map((x) => <li key={x} className="flex gap-3"><span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden /><span><Rich text={x} /></span></li>)}
        </ul>
      );
    case "callout": {
      const tone = { info: ["bg-sage-soft/70 ring-sage/40", Info, "text-forest"], tip: ["bg-clay-soft/60 ring-clay/20", Lightbulb, "text-clay"], safety: ["bg-alert-soft ring-alert/20", ShieldAlert, "text-alert"] } as const;
      const [cls, Icon, ic] = tone[b.tone];
      return (
        <aside className={clsx("mt-5 break-inside-avoid rounded-2xl p-4 ring-1 sm:p-5", cls)}>
          {b.title && <p className={clsx("flex items-center gap-2 font-semibold", ic)}><Icon size={17} aria-hidden /> {b.title}</p>}
          <p className="mt-1.5 leading-relaxed text-ink-soft"><Rich text={b.text} /></p>
        </aside>
      );
    }
    case "question":
      return (
        <article className="mt-5 break-inside-avoid rounded-2xl bg-white p-4 shadow-soft ring-1 ring-sand sm:p-5" data-block="question">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest font-display text-white">{b.n}</span>
            <div className="min-w-0 flex-1">
              {b.area && <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay">{b.area}</p>}
              <p className="font-display text-[1.15rem] leading-snug text-ink">{b.q}</p>
              {b.why && <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">{b.why}</p>}
              {b.deeper && <p className="mt-2 text-[14px] text-forest"><span className="font-semibold">Pogłębiająco: </span>{b.deeper}</p>}
              <Lines n={b.lines ?? 2} />
            </div>
          </div>
        </article>
      );
    case "exercise":
      return (
        <article className="mt-5 break-inside-avoid rounded-3xl bg-linen/70 p-5 ring-1 ring-sand sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-xl text-ink">{b.title}</p>
            {b.time && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-sand">{b.time}</span>}
          </div>
          {b.intro && <p className="mt-2 leading-relaxed text-ink-soft">{b.intro}</p>}
          {b.steps && <ol className="mt-3 list-decimal space-y-1.5 pl-6 text-ink-soft">{b.steps.map((x) => <li key={x}>{x}</li>)}</ol>}
          {b.prompts?.map((q) => (
            <div key={q} className="mt-4">
              <p className="font-medium text-ink">{q}</p>
              <Lines n={b.lines ?? 2} />
            </div>
          ))}
        </article>
      );
    case "columns":
      return (
        <div className="mt-5 break-inside-avoid">
          {b.title && <p className="mb-2 font-display text-lg text-ink">{b.title}</p>}
          <div className="overflow-hidden rounded-2xl ring-1 ring-sand">
            <table className="w-full table-fixed border-collapse text-[14.5px]">
              <thead><tr>{b.cols.map((c) => <th key={c} className="bg-linen px-3 py-2.5 text-left font-semibold text-ink">{c}</th>)}</tr></thead>
              <tbody>
                {b.rows?.map((r, k) => (
                  <tr key={k} className="border-t border-sand align-top">
                    {r.map((c, j) => <td key={j} className="px-3 py-2.5 text-ink-soft">{c || <span className="block h-6 border-b border-dashed border-sand-dark/80" aria-hidden />}</td>)}
                  </tr>
                ))}
                {Array.from({ length: b.blankRows ?? 0 }).map((_, k) => (
                  <tr key={`b${k}`} className="h-11 border-t border-sand"><td className="border-r border-sand" /><td /></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "day":
      return (
        <article className={clsx("mt-6 break-inside-avoid rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand sm:p-6", mode === "print" && b.n > 1 && "break-before-page")} data-block="day">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Dzień {b.n} · {b.minutes}</p>
              <h3 className="mt-1 font-display text-[1.6rem] leading-tight text-ink">{b.title}</h3>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest font-display text-xl text-white">{b.n}</span>
          </div>
          <p className="mt-3 leading-relaxed text-ink">{b.intro}</p>
          <p className="mt-4 text-sm font-semibold text-ink">Ćwiczenie</p>
          <ol className="mt-1.5 list-decimal space-y-1.5 pl-6 leading-relaxed text-ink-soft">{b.task.map((x) => <li key={x}>{x}</li>)}</ol>
          <p className="mt-4 rounded-2xl bg-linen/70 p-3.5 text-[14.5px] leading-relaxed text-ink-soft"><span className="font-semibold text-ink">Przykład: </span>{b.example}</p>
          <p className="mt-3 rounded-2xl bg-sage-soft/60 p-3.5 text-[14.5px] leading-relaxed text-ink-soft"><span className="font-semibold text-forest">Wariant indywidualny: </span>{b.solo}</p>
          <p className="mt-4 text-sm font-semibold text-ink">Moja notatka</p>
          <Lines n={b.lines ?? 3} />
          {mode === "screen" && <DayDone n={b.n} />}
        </article>
      );
    case "dialog":
      return (
        <article className={clsx("mt-5 break-inside-avoid rounded-3xl p-5 ring-1", b.tone === "escalate" ? "bg-alert-soft/50 ring-alert/15" : "bg-sage-soft/50 ring-sage/40")}>
          <p className={clsx("font-display text-lg", b.tone === "escalate" ? "text-alert" : "text-forest")}>{b.title}</p>
          <div className="mt-3 space-y-2">
            {b.lines.map((l, k) => (
              <p key={k} className={clsx("max-w-[90%] rounded-2xl bg-white px-3.5 py-2.5 text-[14.5px] leading-snug text-ink-soft shadow-soft", k % 2 && "ml-auto")}>
                <span className="mr-1 font-semibold text-ink">{l.who}:</span>{l.text}
              </p>
            ))}
          </div>
          {b.note && <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft"><span className="font-semibold">Co się stało: </span>{b.note}</p>}
        </article>
      );
    case "checklist":
      return (
        <div className="mt-5 break-inside-avoid rounded-3xl bg-white p-5 ring-1 ring-sand">
          {b.title && <p className="font-display text-lg text-ink">{b.title}</p>}
          <ul className="mt-2 space-y-2.5">
            {b.items.map((x) => (
              <li key={x} className="flex gap-3 leading-snug text-ink-soft">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-forest/60 bg-white" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      );
    case "cards":
      return (
        <div className="mt-5 break-inside-avoid">
          {b.title && <p className="mb-2 font-display text-lg text-ink">{b.title}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {b.items.map((c) => (
              <div key={c.title} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-sand">
                {c.label && <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">{c.label}</p>}
                <p className="mt-0.5 font-display text-[1.05rem] leading-snug text-ink">{c.title}</p>
                {c.text && <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{c.text}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case "roads":
      return <RoadsFigure />;
    case "loop":
      return <LoopFigure />;
    case "loopExample":
      return (
        <article className="mt-5 break-inside-avoid rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand">
          <p className="font-display text-lg text-ink">{b.title}</p>
          <ol className="mt-3 space-y-2">
            {b.steps.map(([k, v], j) => (
              <li key={k} className="grid grid-cols-[1.75rem_1fr] gap-x-3">
                <span className={clsx("grid h-7 w-7 place-items-center rounded-full text-xs font-semibold", j === b.steps.length - 1 ? "bg-clay text-white" : "bg-linen text-forest")}>{j + 1}</span>
                <span className="text-[14.5px] leading-snug text-ink-soft"><span className="font-semibold text-ink">{k}: </span>{v}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-2xl bg-sage-soft/70 p-3.5 text-[14.5px] leading-relaxed text-ink-soft"><span className="font-semibold text-forest">Możliwy punkt przerwania: </span>{b.breakPoint}</p>
        </article>
      );
    case "loopBlank":
      return (
        <div className="mt-5 grid break-inside-avoid gap-3 sm:grid-cols-2">
          {["1. Wyzwalacz – co się wydarzyło?", "2. Moja interpretacja – co sobie pomyślałem / pomyślałam?", "3. Emocje – co czułem / czułam pod spodem?", "4. Moja reakcja – co zrobiłem / zrobiłam?", "5. Reakcja drugiej osoby", "6. Eskalacja – jak to się potoczyło?", "7. Punkt przerwania – co mogę zrobić inaczej?"].map((x, k) => (
            <div key={x} className={clsx("rounded-2xl bg-white p-4 ring-1", k === 6 ? "ring-forest/40 sm:col-span-2" : "ring-sand")}>
              <p className="text-[14px] font-semibold text-ink">{x}</p>
              <Lines n={3} />
            </div>
          ))}
        </div>
      );
    case "break":
      return mode === "print" ? <div className="break-after-page" /> : null;
  }
  return i ? null : null;
}

/** Stopka materiału: naturalny kolejny krok (Mapa Relacji) i nota o charakterze materiału. */
function Closing({ m, mapaUrl }: { m: LeadMagnet; mapaUrl: string }) {
  return (
    <section className="mt-12 break-inside-avoid rounded-3xl bg-forest p-6 text-white sm:p-8">
      <div className="flex items-center gap-2"><MapaSymbol id={`cl-${m.id}`} className="h-5 w-auto" /><span className="font-wordmark text-lg">Mapa Relacji</span></div>
      <p className="mt-3 leading-relaxed text-white/90">{m.mapaText}</p>
      <a href={mapaUrl} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-forest" data-mapa-cta>Poznaj Mapę Relacji</a>
      <p className="mt-6 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/70">
        Materiał edukacyjny DUO®. Nie jest psychoterapią, diagnozą ani poradą prawną. Gdy nie czujesz się bezpiecznie: 112 · Kryzysowy Telefon Zaufania 116 123 · Centrum Wsparcia 800 70 2222 · Niebieska Linia 800 120 002.
      </p>
    </section>
  );
}

export function MaterialDoc({ m, mode, mapaUrl }: { m: LeadMagnet; mode: Mode; mapaUrl: string }) {
  const firstH2 = m.blocks.findIndex((b) => b.t === "h2");
  return (
    <div className={clsx("text-[15.5px]", mode === "print" && "print-doc")}>
      <Cover m={m} mode={mode} />
      <div className={clsx(mode === "screen" ? "mt-8" : "")}>
        {m.blocks.map((b, i) => <BlockView key={i} b={b} mode={mode} i={i} first={i === firstH2} />)}
      </div>
      <Closing m={m} mapaUrl={mapaUrl} />
    </div>
  );
}

export function CheckIcon() {
  return <Check size={14} aria-hidden />;
}
