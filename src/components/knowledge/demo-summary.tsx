"use client";

// Mini-podsumowanie z podglądu /demo: odpowiedzi czytane z pamięci tej przeglądarki, CTA do quizu z dołączeniem odpowiedzi.
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapaSymbol } from "@/components/brand";
import { groupAnswers, missingRequirements, type Field, type Requirement, type SummaryGroup } from "@/knowledge/fields";
import { track } from "@/lib/track-client";
import { readDemoAnswers } from "./answers";
import { AttachBar } from "./summary-actions";
import { MaterialTopBar, SummaryTabs } from "./tabs";

export function DemoSummary({ slug, n, short, icon, fields, requirements }: {
  slug: string;
  n: number;
  short: string;
  icon: React.ReactNode;
  fields: Field[];
  requirements: Requirement[];
}) {
  const [state, setState] = useState<{ groups: SummaryGroup[]; complete: boolean } | null>(null);
  useEffect(() => {
    const a = readDemoAnswers(slug);
    setState({ groups: groupAnswers(fields, a), complete: missingRequirements(requirements, a).length === 0 });
  }, [slug, fields, requirements]);

  return (
    <div className="min-h-dvh bg-linen/60">
      <MaterialTopBar kicker="Podgląd materiału DUO" title={short}
        tabs={state?.complete ? <SummaryTabs materialHref={`/wiedza/${slug}/demo`} summaryHref={`/wiedza/${slug}/demo/podsumowanie`} active="summary" /> : undefined} />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-36 pt-6 sm:px-5">

        <header className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">{icon} {short}</p>
          <h1 className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Twoje podsumowanie</h1>
          <p className="mt-3 flex gap-2 text-sm text-ink-soft">
            <Lock size={15} className="mt-0.5 shrink-0" aria-hidden /> Odpowiedzi są zapisane tylko na tym urządzeniu. Nikt z DUO ich nie widzi, dopóki sam / sama ich nie dołączysz.
          </p>
        </header>

        {state === null ? null : state.groups.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-white p-6 leading-relaxed text-ink-soft ring-1 ring-sand" data-testid="demo-summary-empty">
            Nie ma jeszcze żadnych odpowiedzi. <Link href={`/wiedza/${slug}/demo`} className="font-medium text-forest underline">Wróć do materiału</Link> i uzupełnij pola – podsumowanie pojawi się tutaj od razu.
          </p>
        ) : (
          <>
            {!state.complete && (
              <p className="mt-6 rounded-2xl bg-clay-soft/60 p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-clay/20" data-testid="demo-summary-partial">
                To podsumowanie dotychczasowych odpowiedzi. <Link href={`/wiedza/${slug}/demo`} className="font-medium text-forest underline">Uzupełnij resztę materiału</Link>, żeby obraz był pełniejszy.
              </p>
            )}
            <div className="mt-6 space-y-4" data-testid="summary">
              {state.groups.map((g) => (
                <section key={g.section} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand sm:p-6">
                  <h2 className="font-display text-xl text-forest">{g.section}</h2>
                  <dl className="mt-3 space-y-3">
                    {g.items.map((it) => (
                      <div key={it.label} className="border-t border-sand pt-3 first:border-0 first:pt-0">
                        <dt className="text-sm font-medium text-ink">{it.label}</dt>
                        <dd className="mt-1 whitespace-pre-line leading-relaxed text-ink-soft">{it.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>

            <section className="mt-10 rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 p-6 text-white shadow-soft sm:p-9" aria-labelledby="att-h" data-testid="demo-summary-cta">
              <div className="flex items-center gap-2"><MapaSymbol id={`dsum-m-${n}`} className="h-5 w-auto" /><span className="font-wordmark text-lg">Mapa Relacji™</span></div>
              <h2 id="att-h" className="mt-3 font-display text-[1.6rem] leading-tight sm:text-3xl">Możesz teraz załączyć te odpowiedzi, żeby otrzymać Mapę Relacji™</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-white/85">
                Wystarczy kliknąć poniżej i odpowiedzieć na kilka krótkich pytań. Psycholog DUO zobaczy Twoje odpowiedzi przy zgłoszeniu – nie zaczniesz od zera.
              </p>
              <Link href={`/start?dolacz=${slug}`} onClick={() => track("mapa_relacji_cta_click", n)}
                className="mt-5 inline-flex min-h-14 items-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white">
                Kliknij tutaj i odpowiedz na kilka pytań <ArrowRight size={18} aria-hidden />
              </Link>
              <p className="mt-3 text-sm text-white/70">Dołączenie jest dobrowolne – zdecydujesz o nim na końcu quizu.</p>
            </section>
          </>
        )}
      </main>
      {state && state.groups.length > 0 && <AttachBar slug={slug} n={n} />}
    </div>
  );
}
