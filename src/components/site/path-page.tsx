// Podstrona ścieżki (Odbudowa / Czas na decyzję / Świadome rozstanie) – wspólny szablon, treść z src/content/paths.ts.
// Jedno główne CTA: rozmowa o tej ścieżce (formularz kontaktu z tematem). Mapa Relacji jako punkt startu – link drugorzędny.
import { Check, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import { AskDialog } from "@/components/landing/ask-dialog";
import { PATHS, type PathContent } from "@/content/paths";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./header";

export function PathPage({ p, consentText, contactEmail }: { p: PathContent; consentText: string; contactEmail?: string }) {
  const cta = <AskDialog consentText={consentText} trigger="button" label={p.cta} title={p.cta} topic={p.topic} />;
  const others = PATHS.filter((x) => x.key !== p.key);
  return (
    <>
      <SiteHeader variant="path" cta={{ href: "#kontakt", label: p.cta, short: "Porozmawiajmy" }} />
      <main id="main">
        {/* HERO */}
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-6 md:grid-cols-[1.15fr_0.85fr] md:pb-20 md:pt-12">
            <div>
              <nav aria-label="Ścieżka" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <Link href="/" className="hover:text-forest">DUO</Link> /
                <Link href="/mapa-relacji" className="hover:text-forest">Mapa Relacji</Link> /
                <span className="text-ink-soft">{p.short}</span>
              </nav>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay shadow-soft ring-1 ring-sand">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-linen"><RoadGlyph road={p.key} id={`ph-${p.key}`} className="h-4 w-4" /></span>
                {p.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-[2.05rem] leading-[1.08] text-ink sm:text-5xl">{p.h1}</h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-soft sm:text-lg">{p.sub}</p>
              <div className="mt-6">{cta}</div>
              <p className="mt-2.5 max-w-md text-sm text-muted">{p.ctaNote}</p>
            </div>
            {/* gdzie jest ta droga: pod Mapą Relacji */}
            <aside className="rounded-[1.75rem] bg-gradient-to-br from-white via-ivory to-linen p-5 shadow-soft ring-1 ring-sand sm:p-6" aria-label="Miejsce tej ścieżki w procesie DUO">
              <Link href="/mapa-relacji" className="flex items-center gap-3 rounded-2xl bg-forest p-3.5 text-white">
                <span className="grid h-10 w-12 place-items-center rounded-xl bg-white"><MapaSymbol id={`pha-${p.key}`} className="h-3.5 w-auto" /></span>
                <span>
                  <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70">Start</span>
                  <span className="font-display text-lg">Mapa Relacji</span>
                </span>
              </Link>
              <ul className="ml-7 mt-2 space-y-2 border-l-2 border-dashed border-sand-dark pl-4 pt-1">
                {PATHS.map((x) => (
                  <li key={x.key}>
                    {x.key === p.key ? (
                      <span className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-2 ring-clay/40">
                        <RoadGlyph road={x.key} id={`phl-${x.key}`} className="h-6 w-6" />
                        <span className="font-medium text-ink">{x.short}</span>
                        <span className="ml-auto rounded-full bg-clay-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-clay">Ta droga</span>
                      </span>
                    ) : (
                      <Link href={`/${x.slug}`} className="flex items-center gap-3 rounded-2xl p-3 text-ink-soft hover:bg-white">
                        <RoadGlyph road={x.key} id={`phl-${x.key}`} className="h-6 w-6 opacity-70" />
                        <span>{x.short}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted">Nie wiecie jeszcze, która droga jest Wasza? Mapa Relacji pomaga to zobaczyć – zanim cokolwiek zdecydujecie.</p>
            </aside>
          </div>
        </section>

        {/* WYNIK */}
        <section className="bg-forest text-white" aria-labelledby="out-h">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <h2 id="out-h" className="font-display text-[1.75rem] leading-tight sm:text-4xl">{p.outcome.title}</h2>
            <ul className="mt-7 grid gap-3 md:grid-cols-2">
              {p.outcome.items.map((x) => (
                <li key={x} className="flex gap-3 rounded-2xl bg-white/[0.07] p-4 leading-snug ring-1 ring-white/15">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15"><Check size={14} aria-hidden /></span>{x}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-white/70">To kierunek pracy, nie obietnica efektu. Każda para i każda sytuacja jest inna.</p>
          </div>
        </section>

        {/* DLACZEGO TO DZIAŁA */}
        <section aria-labelledby="why-h">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <h2 id="why-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Dlaczego ten sposób pracy</h2>
            <ul className={`mt-7 grid gap-4 sm:grid-cols-2 ${p.why.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              {p.why.map((w) => (
                <li key={w.title} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand">
                  <p className="font-display text-xl leading-snug text-ink">{w.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{w.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PLAN */}
        <section className="bg-linen" aria-labelledby="plan-h">
          <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
            <h2 id="plan-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">{p.planTitle}</h2>
            <ol className="relative mt-8 space-y-4 border-l-2 border-sand-dark pl-6 sm:pl-8">
              {p.plan.map((s) => (
                <li key={s.label} className="relative rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand">
                  <span className="absolute -left-[2.15rem] top-5 grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-semibold text-white sm:-left-[2.65rem]" aria-hidden>
                    {s.label.replace(/\D/g, "") || "•"}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{s.label}</p>
                  <h3 className="mt-1 font-display text-xl text-ink">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{s.text}</p>
                  {s.homework && <p className="mt-3 rounded-2xl bg-linen/70 p-3 text-[14.5px] text-ink-soft"><span className="font-semibold text-ink">Między spotkaniami: </span>{s.homework}</p>}
                </li>
              ))}
            </ol>
            {p.planNote && <p className="mt-5 text-sm leading-relaxed text-muted">{p.planNote}</p>}
          </div>
        </section>

        {/* CO DOSTAJECIE */}
        <section aria-labelledby="stack-h">
          <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-9">
              <h2 id="stack-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-3xl">Co dostajecie</h2>
              <ul className="mt-5 divide-y divide-sand">
                {p.stack.map((x) => (
                  <li key={x} className="flex gap-3 py-3 text-[16px] leading-snug text-ink">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={14} aria-hidden /></span>{x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-muted">Cenę i dokładny zakres poznacie w bezpłatnej rozmowie – zanim cokolwiek zdecydujecie.</p>
            </div>
          </div>
        </section>

        {/* DLA KOGO */}
        <section className="bg-linen" aria-labelledby="who-h">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-2 md:py-16">
            <h2 id="who-h" className="sr-only">Dla kogo</h2>
            <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand">
              <h3 className="font-display text-xl text-forest">Dla kogo to jest</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-snug text-ink">
                {p.forWho.map((x) => <li key={x} className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />{x}</li>)}
              </ul>
            </div>
            <div className="rounded-3xl bg-white/60 p-6 ring-1 ring-sand">
              <h3 className="font-display text-xl text-ink-soft">Dla kogo to nie jest</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-snug text-ink-soft">
                {p.notFor.map((x) => <li key={x} className="flex gap-3"><X size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />{x}</li>)}
              </ul>
              {p.safety && (
                <p className="mt-5 flex gap-2 rounded-2xl bg-alert-soft p-3 text-sm leading-relaxed text-ink-soft"><ShieldAlert size={16} className="mt-0.5 shrink-0 text-alert" aria-hidden />{p.safety}</p>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-12 md:py-16" aria-labelledby="pfaq-h">
          <h2 id="pfaq-h" className="font-display text-[1.75rem] text-ink sm:text-4xl">Pytania</h2>
          <div className="mt-6 divide-y divide-sand rounded-3xl bg-white shadow-soft ring-1 ring-sand">
            {p.faq.map(([q, a]) => (
              <details key={q} className="group px-5 py-4 sm:px-6">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {q}<span className="text-xl text-clay transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* KONTAKT */}
        <section id="kontakt" className="scroll-mt-20 px-5 pb-16" aria-labelledby="k-h">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 px-6 py-11 text-center text-white shadow-soft sm:px-12">
            <RoadGlyph road={p.key} id={`pk-${p.key}`} className="mx-auto h-9 w-9" />
            <h2 id="k-h" className="mt-3 font-display text-[1.75rem] leading-tight sm:text-4xl">Porozmawiajmy, czy ta droga jest dla Was</h2>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-white/85">{p.ctaNote}</p>
            <div className="mt-6">{cta}</div>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-ink-soft">
            Nie wiecie, która droga jest Wasza? <Link href="/mapa-relacji" className="font-medium text-forest underline underline-offset-2">Zacznijcie od Mapy Relacji</Link>
            {" · "}Inne drogi: {others.map((o, i) => <span key={o.key}>{i > 0 && ", "}<Link href={`/${o.slug}`} className="text-forest underline underline-offset-2">{o.short.toLowerCase()}</Link></span>)}
          </p>
        </section>
      </main>
      <SiteFooter contactEmail={contactEmail} />
    </>
  );
}


