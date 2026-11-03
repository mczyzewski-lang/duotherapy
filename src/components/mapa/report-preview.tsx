"use client";

// „Zobacz, co otrzymasz”: podgląd rzeczywistej struktury podsumowania (sekcje 1–6 z renderReportHtml)
// na danych FIKCYJNYCH z SAMPLE_REPORT. Bez nowej metodologii – te same sekcje, które psycholog wypełnia w panelu.
import clsx from "clsx";
import { ExternalLink, FileText } from "lucide-react";
import { Fragment } from "react";
import { RoadGlyph } from "@/components/brand";
import { SectionGraphic, SectionIcon } from "./report-graphics";
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

function SectionBody({ k, compact }: { k: (typeof SECTIONS)[number]["key"]; compact?: boolean }) {
  if (compact) return <CompactBody k={k} />;
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

/** Skrócona treść sekcji – do kart na telefonie (każda karta mieści się na ekranie). */
function CompactBody({ k }: { k: (typeof SECTIONS)[number]["key"] }) {
  switch (k) {
    case "summary":
      return (
        <div className="space-y-2">
          <p>{R.summary.text}</p>
          <p><strong className="font-semibold text-ink">Gdzie jesteście z decyzją:</strong> {R.summary.decisionStage}</p>
        </div>
      );
    case "strengths":
      return (
        <ul className="space-y-2">
          {R.strengths.map((x) => (
            <li key={x} className="flex gap-2.5"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-forest" aria-hidden />{x}</li>
          ))}
        </ul>
      );
    case "tensions":
      return (
        <ul className="divide-y divide-sand/70">
          {R.tensions.slice(0, 4).map((t) => (
            <li key={t.area} className="flex items-center justify-between gap-3 py-2 first:pt-0">
              <span className="font-medium text-ink">{t.label}</span>
              <SeverityDots v={t.severity} />
            </li>
          ))}
          <li className="pt-2 text-[12.5px] text-muted">+ opis każdego z 6 obszarów</li>
        </ul>
      );
    case "mechanism":
      return (
        <div className="space-y-2.5">
          <p className="rounded-xl bg-linen/70 p-3 text-[13.5px]">{R.mechanism.oneLiner}</p>
          <dl className="grid grid-cols-[6.5rem_1fr_1fr] gap-x-2 gap-y-1.5 text-[12.5px] leading-snug">
            <span />
            {R.mechanism.columns.map((c) => <span key={c} className="font-semibold uppercase tracking-wide text-muted">{c}</span>)}
            {R.mechanism.rows.filter((r) => ["trigger", "behavior", "need"].includes(r.key)).map((r) => (
              <Fragment key={r.key}>
                <dt className="font-medium text-ink">{r.label}</dt>
                {r.values.map((v, i) => <dd key={i}>{v}</dd>)}
              </Fragment>
            ))}
          </dl>
        </div>
      );
    case "recommendations":
      return (
        <div className="space-y-2.5">
          <ol className="list-decimal space-y-1.5 pl-5 marker:text-clay">
            {R.recommendations.slice(0, 2).map((r) => <li key={r}>{r}</li>)}
          </ol>
          <p className="flex items-center gap-2 rounded-lg bg-sage-soft/70 px-2.5 py-1.5 font-medium text-forest">
            <RoadGlyph road="rebuild" id="pvc-path" className="h-4 w-4" /> Możliwa dalsza droga: {PATH_OPTIONS.rebuild.label.toLowerCase()}
          </p>
        </div>
      );
    case "nextSteps":
      return (
        <ul className="space-y-2">
          {R.nextSteps.map((n) => (
            <li key={n.what} className="rounded-xl bg-linen/70 p-2.5">
              <p className="font-medium text-ink">{n.what}</p>
              <p className="text-[12px] text-muted">{n.who} · {n.when}</p>
            </li>
          ))}
        </ul>
      );
  }
}

/**
 * Sekcje jako kartki, które zatrzymują się i nachodzą na siebie podczas przewijania (telefon i komputer).
 * Każda kartka: ikona części, co zawiera, poziomy schemat logiki części oraz fragment przykładu (dane fikcyjne).
 */
export function ReportPreview() {
  return (
    <div data-testid="pv-stack">
      {SECTIONS.map((x, k) => (
        <article
          key={x.key}
          className="sticky top-[var(--pv-top)] mb-5 rounded-[1.4rem] bg-white px-4 pb-4 pt-3.5 shadow-[0_-12px_30px_-18px_rgba(54,73,61,0.35),0_10px_30px_-20px_rgba(54,73,61,0.3)] ring-1 ring-sand lg:top-[var(--pv-top-lg)] lg:mb-8 lg:rounded-[1.75rem] lg:px-8 lg:pb-7 lg:pt-6"
          style={{ "--pv-top": `${76 + k * 10}px`, "--pv-top-lg": `${96 + k * 14}px` } as React.CSSProperties}
          aria-labelledby={`pvs-${x.key}`}
          data-testid="pv-card"
        >
          <header className="flex items-center justify-between gap-2 border-b border-sand pb-2 lg:pb-3">
            <span className="flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linen ring-1 ring-sand lg:h-11 lg:w-11 lg:rounded-2xl">
                <SectionIcon k={x.key} id={`pvi-${x.key}`} className="h-5 w-5 lg:h-6 lg:w-6" />
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-forest font-display text-[11px] text-white">{k + 1}</span>
              </span>
              <h3 id={`pvs-${x.key}`} className="font-display text-[1.1rem] leading-tight text-forest lg:text-[1.45rem]">{x.title}</h3>
            </span>
            <span className="whitespace-nowrap rounded-full bg-clay-soft px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-clay lg:text-[10.5px]">Przykład<span className="hidden lg:inline"> · dane fikcyjne</span></span>
          </header>
          <div className="lg:mt-5 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <div>
              <p className="mt-2 text-[13px] leading-snug text-clay lg:mt-0 lg:text-[16px] lg:leading-relaxed lg:text-ink-soft">{x.benefit}</p>
              <div className="mt-3 rounded-2xl bg-linen/60 px-2 py-2 ring-1 ring-sand/70 lg:mt-5 lg:px-4 lg:py-3">
                <SectionGraphic k={x.key} id={`pvg-${x.key}`} className="mx-auto h-auto w-full max-w-[340px] lg:max-w-[400px]" />
              </div>
            </div>
            <div className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft lg:mt-0 lg:text-[14.5px]">
              <p className="mb-2 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-muted lg:block">Tak to wygląda w przykładowej Mapie</p>
              <div className="lg:hidden"><SectionBody k={x.key} compact /></div>
              <div className="hidden lg:block"><SectionBody k={x.key} /></div>
            </div>
          </div>
        </article>
      ))}
      <p className="text-center text-xs text-muted">Przykład na fikcyjnych danych (Anna i Marek). Pełna wersja – link poniżej.</p>
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
      className={clsx("inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[15px] font-semibold text-white shadow-soft transition hover:brightness-110", className)}
    >
      <FileText size={17} aria-hidden /> {children} <ExternalLink size={14} className="opacity-70" aria-hidden />
    </a>
  );
}
