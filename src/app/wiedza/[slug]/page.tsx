// Landing bezpłatnego materiału – wspólny szablon dla wszystkich materiałów (treść z rejestru).
import { ArrowRight, Check, Clock, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapaSymbol } from "@/components/brand";
import { KTrack, LeadMagnetForm, MagnetStickyBar } from "@/components/knowledge/client";
import { BlockView, Cover } from "@/components/knowledge/doc";
import { MagnetIcon } from "@/components/knowledge/icons";
import { ReportPreview } from "@/components/mapa/report-preview";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { MAGNETS, magnetBySlug, mapaHref } from "@/knowledge/registry";

// formularz i zgody zależą od ustawień w bazie – renderowanie przy żądaniu (nieznany adres → 404)
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = magnetBySlug((await params).slug);
  if (!m) return {};
  const url = `${env.appUrl}/wiedza/${m.slug}`;
  return {
    title: { absolute: m.seo.title },
    description: m.seo.description,
    alternates: { canonical: url },
    openGraph: { title: m.seo.title, description: m.seo.description, url, type: "article", locale: "pl_PL", siteName: "DUO® – Mapa Relacji" },
    robots: { index: true, follow: true },
  };
}

export default async function MagnetLanding({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m) notFound();
  const s = await getSettings();
  const related = MAGNETS.filter((x) => x.slug !== m.slug && x.category === m.category).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: m.title,
    description: m.seo.description,
    inLanguage: "pl",
    isAccessibleForFree: true,
    learningResourceType: m.format,
    url: `${env.appUrl}/wiedza/${m.slug}`,
    publisher: { "@type": "Organization", name: "DUO" },
  };

  return (
    <>
      <KTrack event="lead_magnet_landing_view" step={m.n} />
      <SiteHeader variant="magnet" />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* 1. HERO */}
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 pt-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-16 md:pt-12">
            <div>
              <nav aria-label="Ścieżka" className="text-xs text-muted"><Link href="/wiedza" className="hover:text-forest">Wiedza</Link> / {m.short}</nav>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-clay shadow-soft ring-1 ring-sand">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-linen"><MagnetIcon icon={m.icon} id={`h-${m.id}`} className="h-4 w-4" /></span>
                Bezpłatny materiał DUO
              </p>
              <h1 className="mt-4 font-display text-[2.1rem] leading-[1.08] text-ink sm:text-5xl">{m.hero.h1}</h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-soft sm:text-lg">{m.hero.sub}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#odbierz" className="inline-flex min-h-14 shrink-0 items-center whitespace-nowrap justify-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(169,81,47,0.7)]">
                  Pobierz bezpłatnie <ArrowRight size={18} aria-hidden />
                </a>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5"><FileText size={15} aria-hidden /> {m.format}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={15} aria-hidden /> {m.minutes}</span>
                </p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[22rem] md:max-w-sm">
              <div className="rotate-[1.5deg] rounded-[1.4rem] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(54,73,61,0.5)] ring-1 ring-sand">
                <Cover m={m} mode="screen" compact hero />
              </div>
            </div>
          </div>
        </section>

        {/* 2. CO OTRZYMASZ */}
        <section className="bg-linen" aria-labelledby="co-h">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <h2 id="co-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Co otrzymasz?</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {m.gets.map((g) => (
                <li key={g} className="flex gap-3 rounded-2xl bg-white p-4 text-[15px] leading-snug text-ink shadow-soft ring-1 ring-sand">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={14} aria-hidden /></span>{g}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. PRAWDZIWY PODGLĄD */}
        <section className="overflow-x-clip" aria-labelledby="pv-h">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <h2 id="pv-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Zajrzyj do środka</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">Fragmenty pochodzą z materiału, który otrzymasz. {m.previewNote}</p>
            <div className="mt-7">
              {m.special === "sample-report" ? (
                <ReportPreview />
              ) : (
                <div className="relative z-10 mx-auto -mb-40 max-w-3xl" data-testid="lm-preview">
                  {/* fragment urywa się rozmyciem, które wychodzi poza sekcję – w pełnej wersji jest dalszy ciąg */}
                  <div className="relative max-h-[36rem] overflow-hidden rounded-t-[1.75rem] bg-linen/60 p-3 ring-1 ring-sand [mask-image:linear-gradient(to_bottom,black_40%,transparent_80%)] sm:max-h-[40rem] sm:p-5">
                    <p className="mb-1 px-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">Fragment materiału</p>
                    {m.preview.map((i) => (
                      <div key={i} className="[&>*:first-child]:mt-2"><BlockView b={m.blocks[i]} mode="screen" i={i} first={false} /></div>
                    ))}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,transparent,black_55%)]" aria-hidden />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-ivory/70 to-linen" aria-hidden />
                  </div>
                  <div className="absolute inset-x-3 bottom-6 z-10 mx-auto max-w-md rounded-3xl bg-white/95 p-5 text-center shadow-[0_24px_50px_-24px_rgba(54,73,61,0.55)] ring-1 ring-sand backdrop-blur sm:p-6">
                    <p className="font-display text-[1.3rem] leading-snug text-ink">To dopiero fragment – dalej jest więcej</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{m.previewNote}</p>
                    <a href="#odbierz" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-clay px-6 text-[15px] font-semibold text-white">
                      Czytam dalej – odbieram za darmo <ArrowRight size={17} aria-hidden />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. DLA KOGO + 5. FORMULARZ */}
        <section id="odbierz" className="scroll-mt-4 bg-linen" aria-labelledby="form-h">
          <div className={`mx-auto grid max-w-6xl gap-8 px-5 pb-12 md:grid-cols-2 md:gap-12 md:pb-16 ${m.special ? "pt-12 md:pt-16" : "pt-52"}`}>
            <div>
              <h2 className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Dla kogo to jest?</h2>
              <ul className="mt-5 space-y-3">
                {m.forWho.map((x) => (
                  <li key={x} className="flex gap-3 leading-relaxed text-ink-soft">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden />{x}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl bg-white/70 p-4 text-sm leading-relaxed text-muted ring-1 ring-sand">
                Materiał ma charakter edukacyjny. Nie jest diagnozą ani terapią i nie zastępuje pomocy specjalisty.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-soft ring-1 ring-sand sm:p-7">
              <h2 id="form-h" className="font-display text-[1.6rem] leading-tight text-ink">Odbierz bezpłatny materiał</h2>
              <p className="mb-5 mt-2 text-[15px] leading-relaxed text-ink-soft">Podaj adres e-mail, a wyślemy Ci link do pobrania.</p>
              <LeadMagnetForm
                slug={m.slug}
                n={m.n}
                title={m.title}
                deliveryInfo={s.legal.contentDeliveryInfo}
                marketingText={s.legal.contentMarketingConsent}
                seriesText={m.slug === "7-dni-lepszych-rozmow" ? s.legal.contentSeriesConsent : undefined}
              />
            </div>
          </div>
        </section>

        {/* 6. AUTORYTET */}
        <section aria-labelledby="kto-h">
          <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
            <div className="flex flex-col gap-5 rounded-[1.75rem] bg-white p-5 shadow-soft ring-1 ring-sand sm:flex-row sm:items-center sm:p-7">
              <img src="/img/klaudia-bosek-avatar.jpg" alt="Klaudia Bosek" width={96} height={96} loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-linen" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Kto przygotował materiał</p>
                <h2 id="kto-h" className="mt-1 font-display text-xl text-ink">DUO · Klaudia Bosek, psycholog i psychoterapeutka relacji</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  Pracuje z osobami w kryzysie związku, przed rozstaniem i po nim. Ukończyła 4-letnie szkolenie psychoterapeutyczne rekomendowane przez Polskie Towarzystwo
                  Psychiatryczne (w trakcie certyfikacji) i pracuje pod regularną superwizją.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. MAPA RELACJI */}
        <section className="px-5 pb-12 md:pb-16" aria-labelledby="mapa-h">
          <div className="mx-auto max-w-4xl rounded-[1.75rem] bg-gradient-to-br from-forest to-forest-800 p-6 text-white shadow-soft sm:p-9">
            <div className="flex items-center gap-2"><MapaSymbol id={`lmm-${m.id}`} className="h-5 w-auto" /><span className="font-wordmark text-lg">Mapa Relacji</span></div>
            <h2 id="mapa-h" className="sr-only">Mapa Relacji</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90">
              {m.special === "sample-report" ? m.mapaText : `Ten materiał może pomóc Ci uporządkować jeden obszar relacji. ${m.mapaText}`}
            </p>
            <a href={mapaHref(m, "landing")} data-mapa-cta className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-white underline underline-offset-4">
              {m.special ? "Poznaj pełną usługę – 670 zł" : "Poznaj Mapę Relacji"} <ArrowRight size={17} aria-hidden />
            </a>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 pb-16" aria-labelledby="inne-h">
            <h2 id="inne-h" className="font-display text-2xl text-ink">Inne materiały z tej kategorii</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/wiedza/${r.slug}`} className="flex h-full items-start gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-sand hover:ring-forest/40">
                    <MagnetIcon icon={r.icon} id={`rel-${r.id}`} className="h-6 w-6 shrink-0" />
                    <span><span className="block font-medium text-ink">{r.short}</span><span className="text-[13.5px] text-muted">{r.menuDesc}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
      <MagnetStickyBar title={m.short} />
    </>
  );
}
