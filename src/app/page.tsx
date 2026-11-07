// Strona główna DUO: marka i struktura pomocy – Mapa Relacji jako start, nad trzema ścieżkami.
import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import { MagnetCard, MagnetRail } from "@/components/knowledge/magnet-card";
import { coverPhotoMap } from "@/lib/cover-photos";
import { AskDialog } from "@/components/landing/ask-dialog";
import { TherapistSection } from "@/components/landing/therapist";
import { HeroMap, HeroMapVertical } from "@/components/mapa/flow";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { PATHS } from "@/content/paths";
import { faqJsonLd, orgJsonLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { getSettings } from "@/lib/settings";
import { MAGNETS, magnetBySlug } from "@/knowledge/registry";
import { hiddenMagnets } from "@/lib/magnet-visibility";
import { StickyStart } from "@/components/site/sticky-start";
import { GoogleRating } from "@/components/google-rating";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta({
  title: "DUO® – terapia małżeństw i par | Odbudowa, decyzja, świadome rozstanie",
  description: "DUO pomaga parom i osobom w kryzysie związku zrozumieć, co dalej: Mapa Relacji z psychologiem, a potem odbudowa relacji, wsparcie w decyzji albo świadome rozstanie.",
  path: "/",
  ogTitle: "Pomagamy zrozumieć, co dalej z Waszym związkiem",
  kicker: "Terapia małżeństw i par",
});

const FAQ: [string, string][] = [
  ["Od czego zacząć?", "Od Mapy Relacji. To jednorazowy proces z psychologiem – kwestionariusz, konsultacja i pisemne podsumowanie – który pomaga zrozumieć Waszą sytuację i wybrać drogę. Możesz zacząć sam lub sama."],
  ["Czy muszę wiedzieć, czego chcę?", "Nie. Wiele osób przychodzi z „nie wiem”. Właśnie po to zaczynamy od zrozumienia, a nie od decyzji."],
  ["Czy pomagacie tylko parom, które chcą zostać razem?", "Nie. Pomagamy w każdej z trzech dróg: odbudowie relacji, spokojnym podjęciu decyzji i świadomym rozstaniu – także z myślą o dzieciach."],
  ["Czy partner musi brać udział?", "Nie musi. Możesz zacząć samodzielnie. Wspólna praca jest możliwa, gdy obie osoby są gotowe i czują się bezpiecznie."],
  ["Jak wygląda współpraca?", "Spotkania odbywają się online. Zakres, terminy i koszt poznajesz przed decyzją – w rozmowie albo na stronie Mapy Relacji."],
];

const FEATURED = ["mapa-trzech-drog", "petla-konfliktu", "21-pytan-o-relacji"];

export default async function Home() {
  const s = await getSettings();
  const photos = await coverPhotoMap();
  const hidden = await hiddenMagnets();
  const magnets = MAGNETS.filter((m) => !hidden.has(m.slug));
  return (
    <>
      <SiteHeader />
      <main id="main">
        <JsonLd data={[...orgJsonLd({ email: s.site.contactEmail || undefined, phone: s.site.contactPhone || undefined }), faqJsonLd(FAQ.map(([q, a]) => ({ q, a })))]} />
        {/* HERO */}
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-20 md:pt-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">DUO® · Terapia małżeństw i par</p>
              <h1 className="mt-4 font-display text-[2.15rem] leading-[1.07] text-ink min-[400px]:text-[2.35rem] sm:text-5xl lg:text-[3.3rem]">
                Pomagamy zrozumieć, co dalej z Waszym związkiem – i przejść tę drogę z psychologiem
              </h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-soft sm:text-lg">
                Odbudowa relacji, czas na spokojną decyzję albo rozstanie z szacunkiem. Zaczynamy od Mapy Relacji, a potem wspieramy Was na drodze, którą wybierzecie.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/mapa-relacji" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(169,81,47,0.7)]">
                  Zacznij od Mapy Relacji <ArrowRight size={18} aria-hidden />
                </Link>
                <a href="#jak-pomagamy" className="inline-flex min-h-12 items-center justify-center text-[15px] font-medium text-forest underline decoration-sand-dark underline-offset-4">Zobacz, jak pomagamy</a>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/75 p-3 ring-1 ring-sand">
                <img src="/img/klaudia-bosek-avatar.jpg" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white" />
                <p className="text-[13.5px] leading-snug text-ink-soft">
                  <strong className="font-semibold text-ink">Klaudia Bosek</strong> – psycholog i psychoterapeutka relacji, pracuje pod regularną superwizją.{" "}
                  <a href="#o-mnie" className="whitespace-nowrap text-forest underline decoration-sand-dark underline-offset-2">Poznaj mnie</a>
                </p>
              </div>
              <GoogleRating rating={s.site.googleRating} reviews={s.site.googleReviews} url={s.site.googleReviewsUrl} className="mt-3" />
            </div>
            <div className="md:hidden"><HeroMapVertical toPaths /></div>
            <div className="hidden md:block"><HeroMap toPaths /></div>
          </div>
        </section>

        {/* JAK POMAGAMY – Mapa Relacji nad trzema drogami */}
        <section id="jak-pomagamy" className="scroll-mt-20 bg-linen" aria-labelledby="jp-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <h2 id="jp-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Jak pomagamy</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">Najpierw zrozumienie, potem droga. Nie musicie dziś wiedzieć, którą wybierzecie.</p>

            <Link href="/mapa-relacji" className="group mt-8 grid gap-5 rounded-[2rem] bg-forest p-6 text-white shadow-soft transition hover:brightness-110 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span className="grid h-7 w-9 place-items-center rounded-lg bg-white"><MapaSymbol id="home-mapa" className="h-2.5 w-auto" /></span> Krok 1 · Zacznij tutaj
                </p>
                <h3 className="mt-3 font-display text-[1.9rem] leading-tight">Mapa Relacji</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-white/85">Jednorazowy proces z psychologiem, który pomaga zrozumieć Waszą sytuację i wybrać kierunek.</p>
                <ul className="mt-4 grid gap-1.5 text-[15px] text-white/90 sm:grid-cols-3">
                  {["Szczegółowy kwestionariusz", "Konsultacja online z psychologiem", "Pisemne podsumowanie"].map((x) => (
                    <li key={x} className="flex items-center gap-2"><Check size={15} aria-hidden />{x}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-4 md:flex-col md:items-end">
                <p className="font-display text-3xl">{s.offer.pricePln} zł</p>
                <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-forest">Poznaj Mapę Relacji <ArrowRight size={17} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
              </div>
            </Link>

            <div className="mx-auto h-10 w-0.5 bg-gradient-to-b from-forest to-sand-dark" aria-hidden />
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-clay">Krok 2 · Wybieracie drogę</p>
            <ul className="mt-5 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-2">
              {PATHS.map((p, i) => (
                <li key={p.slug} className="contents">
                  {i > 0 && (
                    <span aria-hidden className="flex items-center justify-center">
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft ring-1 ring-sand">lub</span>
                    </span>
                  )}
                  <Link href={`/${p.slug}`} className="group flex flex-col rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linen"><RoadGlyph road={p.key} id={`home-${p.key}`} className="h-7 w-7" /></span>
                    <h3 className="mt-4 font-display text-[1.4rem] leading-snug text-ink">{p.short}</h3>
                    <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-ink-soft">{p.menuDesc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">Poznaj tę drogę <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">Żadna droga nie jest „lepsza”. Psycholog nie decyduje za Was – pomaga zobaczyć, która odpowiada temu, czego naprawdę potrzebujecie.</p>
          </div>
        </section>

        <TherapistSection />

        {/* WIEDZA */}
        <section aria-labelledby="wh-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="wh-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Wiedza za darmo</h2>
                <p className="mt-2 max-w-xl text-ink-soft">Poradniki, pytania i ćwiczenia, z których możesz skorzystać już dziś.</p>
              </div>
              <Link href="/wiedza" className="text-sm font-semibold text-forest hover:underline">Wszystkie materiały →</Link>
            </div>
            <div className="mt-6"><MagnetRail items={magnets} photos={photos} label="Bezpłatne materiały" /></div>
            <ul className="mt-6 hidden gap-6 md:grid md:grid-cols-3">
              {[...FEATURED.map((slug) => magnetBySlug(slug)!).filter((m) => !hidden.has(m.slug)), ...magnets.filter((m) => !FEATURED.includes(m.slug))].slice(0, 3).map((m) => (
                <li key={m.slug}>
                  <MagnetCard m={m} photo={photos[m.slug]} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-linen" aria-labelledby="faq-h">
          <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
            <h2 id="faq-h" className="font-display text-[1.9rem] text-ink sm:text-4xl">Najczęstsze pytania</h2>
            <div className="mt-8 divide-y divide-sand rounded-3xl bg-white shadow-soft ring-1 ring-sand">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group px-5 py-4 sm:px-6 sm:py-5">
                  <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                    {q}<span className="text-xl text-clay transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* KOŃCOWE CTA */}
        <section className="px-5 py-16" aria-labelledby="end-h">
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 px-6 py-12 text-center text-white shadow-soft sm:px-12">
            <h2 id="end-h" className="font-display text-[1.9rem] leading-tight sm:text-4xl">Nie musisz dziś wiedzieć, która droga jest Twoja</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/85">Zacznij od zrozumienia – Mapa Relacji pomoże zobaczyć, gdzie jesteście i co dalej.</p>
            <Link href="/mapa-relacji" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white">
              Zacznij od Mapy Relacji <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
          <div className="mt-8 text-center"><AskDialog consentText={s.legal.inquiryConsent} /></div>
        </section>
      </main>
      <StickyStart />
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
