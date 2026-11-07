// Renderer materiałów „Wiedza” – jedno źródło treści (bloki) dla wersji online, /demo, podglądu na landingu i PDF.
// Tryb „print” = ten sam układ z podziałem na strony A4 (PDF drukuje dokładnie tę stronę).
import clsx from "clsx";
import { Check, Info, Lightbulb, ShieldAlert } from "lucide-react";
import { BrandSymbol, MapaSymbol, RoadGlyph } from "@/components/brand";
import type { Block, LeadMagnet } from "@/knowledge/types";
import { CATEGORY_LABEL } from "@/knowledge/types";
import { DayDone } from "./day-done";
import { AnswerCheck, AnswerText } from "./answers";
import { Reveal } from "./reveal";
import { fid, LOOP_STEPS } from "@/knowledge/fields";
import { MagnetIcon } from "./icons";
import { coverOf } from "@/knowledge/covers";
import { MapaExplainer } from "./mapa-explainer";
import { isIllustrationCover } from "@/lib/cover-url";

type Mode = "screen" | "print";

/** **pogrubienie** w tekście */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((x, i) => (x.startsWith("**") ? <strong key={i} className="font-semibold text-ink">{x.slice(2, -2)}</strong> : x))}</>;
}


const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";

/**
 * Okładka: nastrój zamiast „techniki” – światło, ciepłe barwy, cytat z życia. Jeśli dostarczono zdjęcie
 * (public/img/wiedza/<slug>.jpg, covers.ts → photo: true), jest ono tłem okładki.
 */
export function Cover({ m, mode, compact, hero, photo, idSuffix = "" }: { m: LeadMagnet; mode: Mode; compact?: boolean; hero?: boolean; photo?: string | null; idSuffix?: string }) {
  const c = coverOf(m.slug) ?? { hook: "", mood: ["#f3e2d3", "#a9512f", "#36493d"] as [string, string, string], photo: false };
  const uid = `${m.id}-${compact ? "c" : mode}${idSuffix}`; // unikalne id gradientów SVG, gdy ta sama okładka jest na stronie kilka razy
  const sm = compact && !hero; // mała miniatura (karty); okładka w hero landingu jest większa
  const T = compact ? "p" : "h1"; // miniatura okładki nie jest nagłówkiem strony – jeden H1 na stronę
  // zdjęcie: wygenerowane w panelu (z bazy) albo plik w public/img/wiedza (photo: true w covers.ts)
  const photoSrc = photo ?? (c.photo ? `/img/wiedza/${m.slug}.jpg` : null);
  // grafika 2D (maskotki) ma jasne tło – tytuł zostaje ciemny; zdjęcie – ciemna nakładka i biały tekst
  const art = isIllustrationCover(photoSrc);
  const dark = !!photoSrc && !art;
  return (
    <section
      className={clsx(
        "relative isolate flex flex-col overflow-hidden",
        dark ? "text-white" : "text-ink",
        mode === "print" ? "h-[255mm] break-after-page rounded-none p-[14mm]" : compact ? "aspect-[3/4] rounded-2xl p-4" : "min-h-[30rem] rounded-[1.75rem] p-7 shadow-soft sm:p-10",
      )}
      style={{ background: art ? "#fbf9f5" : `linear-gradient(160deg, ${c.mood[0]} 0%, #fbf9f5 55%, ${c.mood[0]} 100%)` }}
      aria-label="Okładka materiału"
    >
      {photoSrc && !art ? (
        <>
          <img src={photoSrc} alt="" loading={hero ? "eager" : "lazy"} className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/5 to-black/70" aria-hidden />
        </>
      ) : art ? (
        // grafika 2D: jasne, jednolite tło (jak tło rysunku) z delikatnym ziarnem
        <div className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-multiply" style={{ backgroundImage: GRAIN }} aria-hidden />
      ) : (
        <div className="absolute inset-0 -z-10" aria-hidden>
          {/* miękkie światło jak z okna i dwa „ciepłe” punkty – bez stockowych zdjęć */}
          <div className="absolute -right-[20%] -top-[15%] h-[70%] w-[80%] rounded-full opacity-40 blur-3xl" style={{ background: c.mood[1] }} />
          <div className="absolute -bottom-[20%] -left-[25%] h-[65%] w-[75%] rounded-full opacity-30 blur-3xl" style={{ background: c.mood[2] }} />
          <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,.55) 32%, transparent 44%, rgba(255,255,255,.35) 56%, transparent 66%)" }} />
          <div className="absolute inset-0 opacity-[0.18] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <BrandSymbol id={`cv-${uid}`} className={compact ? "h-3.5 w-auto" : "h-5 w-auto"} />
        <span className={clsx("font-wordmark font-medium", dark ? "text-white" : "text-forest", compact ? "text-xs" : "text-base")}>DUO®</span>
        <span className={clsx("ml-auto rounded-full font-bold uppercase tracking-[0.16em] backdrop-blur", dark ? "bg-white/20 text-white" : art ? "bg-clay-soft text-clay" : "bg-white/70 text-clay", compact ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-[11px]")}>
          Bezpłatnie
        </span>
      </div>
      {/* nazwa materiału – najważniejsza na okładce, od razu pod znakiem */}
      <div className={clsx(sm ? "mt-3" : "mt-8")}>
        {!(art && photoSrc) && (
          <p className={clsx("flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em]", dark ? "text-white/85" : "text-clay", sm ? "text-[7.5px]" : "text-[11px]")}>
            <span className={clsx("grid shrink-0 place-items-center rounded-lg bg-white/85 shadow-soft", sm ? "h-5 w-5" : "h-8 w-8")}>
              <MagnetIcon icon={m.icon} id={`cv-${uid}`} className={sm ? "h-3 w-3" : "h-5 w-5"} />
            </span>
            {m.cover.kicker}
          </p>
        )}
        <T
          className={clsx(
            "text-balance font-display font-semibold leading-[1.02] tracking-[-0.01em]",
            dark ? "text-white [text-shadow:0_1px_18px_rgba(0,0,0,.35)]" : "text-ink",
            hero ? "mt-3 text-[2.1rem] sm:text-[2.5rem]" : sm ? (art && photoSrc ? "text-[1.3rem]" : "mt-1.5 text-[1.3rem]") : mode === "print" ? "mt-4 text-[34pt]" : "mt-4 text-[2.4rem] sm:text-[3.1rem]",
          )}
          data-testid="cover-title"
        >
          {m.short}
        </T>
        <span className={clsx("block rounded-full", dark ? "bg-white/70" : "bg-clay", sm ? "mt-2 h-[2px] w-8" : "mt-4 h-[3px] w-14")} aria-hidden />
      </div>
      {/* grafika 2D: duży, jasny pas między tytułem a cytatem; kategoria w jasnej plakietce na dolnej krawędzi grafiki */}
      {art && photoSrc && (
        <div className={clsx("relative flex flex-1 flex-col", sm ? "-mx-4 mt-1 min-h-[6.5rem]" : "-mx-7 mt-3 min-h-[13rem] sm:-mx-10")}>
          <div className="relative flex-1 overflow-hidden" data-testid="cover-art">
            <img
              src={photoSrc}
              alt=""
              loading={hero ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)]"
            />
          </div>
          <p className={clsx(
            "relative z-10 mx-auto flex items-center gap-1.5 rounded-full bg-white/95 font-semibold uppercase tracking-[0.14em] text-clay shadow-soft ring-1 ring-sand",
            sm ? "-mt-3 px-2 py-1 text-[7px]" : "-mt-5 px-3.5 py-1.5 text-[11px]",
          )} data-testid="cover-kicker">
            <MagnetIcon icon={m.icon} id={`cv-${uid}`} className={sm ? "h-3 w-3" : "h-4 w-4"} />
            {m.cover.kicker}
          </p>
        </div>
      )}
      <div className={clsx(art && photoSrc ? "" : "mt-auto", sm ? (art && photoSrc ? "pt-2" : "pt-3") : art && photoSrc ? "pt-4" : "pt-10")}>
        {c.hook && (
          <p className={clsx("font-display italic leading-[1.15]", dark ? "text-white/95" : "text-ink-soft", hero ? "text-[1.15rem] sm:text-[1.3rem]" : sm ? "text-[0.8rem]" : mode === "print" ? "text-[18pt]" : "text-[1.3rem] sm:text-[1.55rem]")}>{c.hook}</p>
        )}
        {!sm && (
          <>
            <p className={clsx("mt-5 font-display leading-snug", dark ? "text-white" : "text-ink", mode === "print" ? "text-[14pt]" : "text-[1.05rem] sm:text-[1.15rem]")}>{m.title}</p>
            <p className={clsx("mt-1.5 max-w-xl text-[14px] leading-relaxed", dark ? "text-white/80" : "text-muted")}>{m.cover.subtitle} · {CATEGORY_LABEL[m.category]}</p>
          </>
        )}
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
        <path d="M200 46 C 170 70, 230 88, 200 108" fill="none" stroke="#36493d" strokeWidth="2.5" strokeDasharray="6 7" className="fade" />
        {ends.map((e, k) => <path key={e.x} d={`M200 168 C 200 210, ${e.x} 200, ${e.x} 246`} fill="none" stroke={e.c} strokeWidth="3.5" strokeLinecap="round" className="draw" style={{ animationDelay: `${0.35 + k * 0.18}s` }} />)}
        <circle cx="200" cy="38" r="9" fill="#a9512f" />
        <circle cx="200" cy="138" r="30" fill="#fff" stroke="#36493d" strokeWidth="2.5" />
        <svg x="176" y="131" width="48" height="14" viewBox="0 0 112 32"><MapaSymbol id="rf-node" /></svg>
        {ends.map((e, k) => <circle key={e.x} cx={e.x} cy="248" r="6" fill={e.c} className="pop" style={{ transitionDelay: `${0.9 + k * 0.18}s` }} />)}
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

const LOOP_STEPS_SHORT = ["Wyzwalacz", "Interpretacja", "Emocje", "Reakcja A", "Reakcja B", "Eskalacja"];

function LoopFigure() {
  const r = 108;
  const pts = LOOP_STEPS_SHORT.map((_, i) => {
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
          return <path key={i} d={`M${p.x} ${p.y} Q ${160 + (dx / len) * (r + 26)} ${150 + (dy / len) * (r + 26)} ${q.x} ${q.y}`} fill="none" stroke="#a9512f" strokeWidth="1.6" markerEnd="url(#lp-arrow)" opacity="0.7" className="draw" style={{ animationDelay: `${0.2 + i * 0.22}s` }} />;
        })}
        {pts.map((p, i) => (
          <g key={LOOP_STEPS_SHORT[i]} className="pop" style={{ transitionDelay: `${0.1 + i * 0.22}s` }}>
            <circle cx={p.x} cy={p.y} r="27" fill={i === 5 ? "#a9512f" : "#fff"} stroke={i === 5 ? "#a9512f" : "#36493d"} strokeWidth="2" />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="8.4" fontWeight="600" fill={i === 5 ? "#fff" : "#36493d"}>{LOOP_STEPS_SHORT[i]}</text>
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
              <AnswerText id={fid.question(i)} lines={b.lines ?? 2} label={b.q} />
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
          {b.prompts?.map((q, k) => (
            <div key={q} className="mt-4">
              <p className="font-medium text-ink">{q}</p>
              <AnswerText id={fid.prompt(i, k)} lines={b.lines ?? 2} label={q} />
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
                    {r.map((c, j) => <td key={j} className="px-3 py-2.5 text-ink-soft">{c || <AnswerText id={fid.cell(i, k)} lines={1} label={r[0]} compact />}</td>)}
                  </tr>
                ))}
                {Array.from({ length: b.blankRows ?? 0 }).map((_, k) => (
                  <tr key={`b${k}`} className="h-11 border-t border-sand align-top">
                    {b.cols.map((c, col) => <td key={col} className={clsx("px-2 py-1", col === 0 && "border-r border-sand")}><AnswerText id={fid.blankCell(i, k, col)} lines={1} label={`${c} ${k + 1}`} compact /></td>)}
                  </tr>
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
          <AnswerText id={fid.day(i)} lines={b.lines ?? 3} label={`Dzień ${b.n} – moja notatka`} />
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
            {b.items.map((x, k) => (
              <li key={x}>
                <label className="flex gap-3 leading-snug text-ink-soft">
                  <AnswerCheck id={fid.check(i, k)} label={x} />
                  {x}
                </label>
              </li>
            ))}
          </ul>
        </div>
      );
    case "cards":
      return (
        <Reveal off={mode === "print"} className="mt-5 break-inside-avoid">
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
        </Reveal>
      );
    case "roads":
      return mode === "print" ? <RoadsFigure /> : <Reveal><RoadsFigure /></Reveal>;
    case "loop":
      return mode === "print" ? <LoopFigure /> : <Reveal><LoopFigure /></Reveal>;
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
          {LOOP_STEPS.map((x, k) => (
            <div key={x} className={clsx("rounded-2xl bg-white p-4 ring-1", k === 6 ? "ring-forest/40 sm:col-span-2" : "ring-sand")}>
              <p className="text-[14px] font-semibold text-ink">{x}</p>
              <AnswerText id={fid.loop(i, k)} lines={3} label={x} />
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
function Closing({ m, mapaUrl, mode }: { m: LeadMagnet; mapaUrl: string; mode: Mode }) {
  if (mode === "screen")
    return (
      <section className="mt-12 break-inside-avoid">
        <MapaExplainer id={`cl-${m.id}`} lead="Ten materiał pomaga uporządkować jeden obszar relacji." href={mapaUrl} compact />
        <p className="mt-4 px-1 text-xs leading-relaxed text-muted">
          Materiał edukacyjny DUO®. Nie jest psychoterapią, diagnozą ani poradą prawną. Gdy nie czujesz się bezpiecznie: 112 · Kryzysowy Telefon Zaufania 116 123 · Centrum Wsparcia 800 70 2222 · Niebieska Linia 800 120 002.
        </p>
      </section>
    );
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
      <Closing m={m} mapaUrl={mapaUrl} mode={mode} />
    </div>
  );
}

export function CheckIcon() {
  return <Check size={14} aria-hidden />;
}
