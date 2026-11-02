"use client";

// „Zobacz, co otrzymasz”: podgląd rzeczywistej struktury podsumowania (sekcje 1–6 z renderReportHtml)
// na danych FIKCYJNYCH z SAMPLE_REPORT. Bez nowej metodologii – te same sekcje, które psycholog wypełnia w panelu.
import clsx from "clsx";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { BrandSymbol, RoadGlyph } from "@/components/brand";
import { roadFor } from "@/lib/brand-mark";
import { PATH_OPTIONS, sectionTitles, type Severity } from "@/lib/report";
import { SAMPLE_REPORT as R } from "@/lib/report-sample";
import { track } from "@/lib/track-client";

const T = sectionTitles(R);
const strip = (s: string) => s.replace(/^\d+\.\s*/, "");

const SECTIONS = [
  { key: "summary", short: "W skrócie", title: strip(T.summary), benefit: "Z czym przyszliście i gdzie dziś jesteście z decyzją – opisane przez psychologa po rozmowie, nie przez algorytm." },
  { key: "strengths", short: "Co wspiera", title: strip(T.strengths), benefit: "Na czym możecie się oprzeć – niezależnie od tego, jaką drogę wybierzecie." },
  { key: "tensions", short: "Najtrudniej", title: strip(T.tensions), benefit: "Sześć obszarów relacji – od komunikacji po stres i obowiązki – z opisem i nasileniem trudności." },
  { key: "mechanism", short: "Konflikt", title: strip(T.mechanism), benefit: "Jak przebiega Wasz konflikt krok po kroku: wyzwalacz, myśl, emocja, zachowanie i niezaspokojona potrzeba – osobno dla każdej osoby." },
  { key: "recommendations", short: "Propozycje", title: strip(T.recommendations), benefit: "Konkretne propozycje na najbliższy czas i możliwe dalsze drogi – z uzasadnieniem. Decyzja zawsze należy do Was." },
  { key: "nextSteps", short: "Kolejne kroki", title: strip(T.nextSteps), benefit: "Plan: co, kto i kiedy – żebyście po konsultacji wiedzieli, od czego zacząć." },
] as const;

const SEV: Record<Exclude<Severity, null>, [string, number]> = { low: ["niskie", 1], moderate: ["umiarkowane", 2], high: ["wysokie", 3] };

function SeverityDots({ v }: { v: Severity }) {
  if (!v) return null;
  const [label, n] = SEV[v];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted" title={`Nasilenie: ${label}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={clsx("h-1.5 w-3 rounded-full", i <= n ? "bg-clay" : "bg-sand")} />
        ))}
      </span>
      {label}
    </span>
  );
}

function SectionBody({ k }: { k: (typeof SECTIONS)[number]["key"] }) {
  switch (k) {
    case "summary":
      return (
        <div className="space-y-3">
          <p>{R.summary.text}</p>
          <p><strong className="font-semibold text-ink">Z czym przyszliście:</strong> {R.summary.reason}</p>
          <p><strong className="font-semibold text-ink">Gdzie jesteście teraz z decyzją:</strong> {R.summary.decisionStage}</p>
        </div>
      );
    case "strengths":
      return (
        <ul className="space-y-2.5">
          {R.strengths.map((s) => (
            <li key={s} className="flex gap-2.5"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-forest" aria-hidden />{s}</li>
          ))}
        </ul>
      );
    case "tensions":
      return (
        <ul className="divide-y divide-sand/70">
          {R.tensions.map((t) => (
            <li key={t.area} className="py-2.5 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="font-semibold text-ink">{t.label}</span>
                <SeverityDots v={t.severity} />
              </div>
              <p className="mt-0.5">{t.text}</p>
            </li>
          ))}
        </ul>
      );
    case "mechanism":
      return (
        <div className="space-y-3">
          <p className="rounded-xl bg-linen/70 p-3"><strong className="font-semibold text-ink">Wasz cykl w jednym zdaniu:</strong> {R.mechanism.oneLiner}</p>
          <table className="w-full table-fixed border-collapse text-[12.5px] leading-snug sm:text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="w-[30%] pb-1.5 font-semibold">Element</th>
                {R.mechanism.columns.map((c) => <th key={c} className="pb-1.5 pl-2 font-semibold">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {R.mechanism.rows.map((r) => (
                <tr key={r.key} className="border-t border-sand/70 align-top">
                  <td className="py-1.5 pr-1 font-medium text-ink">{r.label}</td>
                  {r.values.map((v, i) => <td key={i} className="py-1.5 pl-2">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "recommendations":
      return (
        <div className="space-y-3">
          <ol className="list-decimal space-y-1.5 pl-5 marker:text-clay">
            {R.recommendations.map((r) => <li key={r}>{r}</li>)}
          </ol>
          <p className="pt-1 font-semibold text-ink">Możliwa dalsza droga</p>
          <ul className="space-y-1.5">
            {(Object.keys(PATH_OPTIONS) as (keyof typeof PATH_OPTIONS)[]).map((k) => {
              const on = R.path.main === k;
              const road = roadFor(k);
              return (
                <li key={k} className={clsx("flex items-center gap-2 rounded-lg px-2.5 py-1.5", on ? "bg-sage-soft/70 font-medium text-forest" : "text-muted")}>
                  <span aria-hidden>{on ? "●" : "○"}</span>
                  <span className="flex-1">{PATH_OPTIONS[k].label}{on && `: ${PATH_OPTIONS[k].options.filter(([o]) => R.path.options.includes(o)).map(([, l]) => l).join(", ")}`}</span>
                  {road && <RoadGlyph road={road} id={`pv-${k}`} className="h-4 w-4" />}
                </li>
              );
            })}
          </ul>
          <p className="text-[12.5px] text-muted">To propozycja, nie zobowiązanie. Decyzja o dalszej drodze zawsze należy do Was.</p>
        </div>
      );
    case "nextSteps":
      return (
        <ul className="space-y-2.5">
          {R.nextSteps.map((n) => (
            <li key={n.what} className="rounded-xl bg-linen/70 p-3">
              <p className="font-medium text-ink">{n.what}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{n.who} · {n.when}</p>
            </li>
          ))}
        </ul>
      );
  }
}

export function ReportPreview() {
  const [i, setI] = useState(0);
  const s = SECTIONS[i];
  const go = (d: number) => setI((x) => (x + d + SECTIONS.length) % SECTIONS.length);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
      {/* Spis treści = prawdziwe sekcje podsumowania */}
      <div>
        <div role="tablist" aria-label="Sekcje Mapy Relacji" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-1.5">
          {SECTIONS.map((x, k) => (
            <button
              key={x.key}
              role="tab"
              id={`pv-tab-${x.key}`}
              aria-selected={k === i}
              aria-controls="pv-panel"
              onClick={() => setI(k)}
              className={clsx(
                "flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] leading-tight transition lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-[15px]",
                k === i ? "bg-forest text-white shadow-soft" : "bg-white text-ink-soft ring-1 ring-sand hover:ring-forest/40",
              )}
            >
              <span className={clsx("grid h-6 w-6 shrink-0 place-items-center rounded-full font-display text-[13px] lg:h-7 lg:w-7", k === i ? "bg-white/15" : "bg-linen text-forest")}>{k + 1}</span>
              <span className="lg:hidden">{x.short}</span>
              <span className="hidden lg:inline">{x.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-[15px] leading-relaxed text-ink-soft ring-1 ring-sand lg:mt-5 lg:py-4" aria-live="polite">
          <strong className="mb-1 hidden font-display text-lg font-medium text-ink lg:block">{s.title}</strong>
          {s.benefit}
        </p>
      </div>

      {/* Podgląd dokumentu – kartki ułożone jedna na drugiej */}
      <div className="relative">
        <div className="absolute inset-x-6 -bottom-3 top-6 rotate-[2deg] rounded-[1.6rem] bg-white/70 shadow-soft ring-1 ring-sand" aria-hidden />
        <div className="absolute inset-x-3 -bottom-1.5 top-3 -rotate-[1.2deg] rounded-[1.6rem] bg-white/85 shadow-soft ring-1 ring-sand" aria-hidden />
        <article
          id="pv-panel"
          role="tabpanel"
          aria-labelledby={`pv-tab-${s.key}`}
          className="relative overflow-hidden rounded-[1.6rem] bg-white px-5 pb-5 pt-4 shadow-soft ring-1 ring-sand sm:px-7 sm:pb-7 sm:pt-5"
        >
          <header className="flex items-center justify-between gap-3 border-b border-sand pb-3">
            <span className="flex items-center gap-2">
              <BrandSymbol id="pv-brand" className="h-4 w-auto" />
              <span className="whitespace-nowrap font-wordmark text-[15px] text-forest">Mapa Relacji</span>
            </span>
            <span className="whitespace-nowrap rounded-full bg-clay-soft px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-clay">Przykład<span className="hidden sm:inline"> · dane fikcyjne</span></span>
          </header>
          <p className="mt-2 text-[11.5px] text-muted">Podsumowanie sesji · konsultacja dla pary · Anna i Marek <span className="sm:hidden">· dane fikcyjne</span></p>
          <h3 className="mt-4 border-b border-sand/70 pb-1.5 font-display text-[1.2rem] text-forest">{i + 1}. {s.title}</h3>
          <div key={s.key} className="mt-3 animate-rise text-[14px] leading-relaxed text-ink-soft sm:text-[14.5px]">
            <SectionBody k={s.key} />
          </div>
          <footer className="mt-5 flex items-center justify-between border-t border-sand pt-3">
            <button type="button" onClick={() => go(-1)} className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm text-forest" aria-label="Poprzednia sekcja">
              <ArrowLeft size={16} aria-hidden /> <span className="max-[359px]:hidden">Wstecz</span>
            </button>
            <span className="text-xs text-muted">{i + 1} / {SECTIONS.length}</span>
            <button type="button" onClick={() => go(1)} className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-forest" aria-label="Następna sekcja">
              <span className="max-[359px]:hidden">Dalej</span> <ArrowRight size={16} aria-hidden />
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}

/** Link do pełnego przykładu (prawdziwy szablon podsumowania, dane fikcyjne). */
export function SampleReportLink({ className, children = "Zobacz przykładową Mapę Relacji" }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href="/mapa-relacji-przyklad"
      target="_blank"
      rel="noopener"
      onClick={() => track("sample_report_open")}
      className={clsx("inline-flex min-h-11 items-center gap-1.5 font-medium text-forest underline decoration-sand-dark underline-offset-4 hover:decoration-forest", className)}
    >
      {children} <ExternalLink size={15} aria-hidden />
    </a>
  );
}
