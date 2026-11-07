import clsx from "clsx";
import { Check, ClipboardList, FileText, MessagesSquare, PhoneCall, ShieldCheck, Users, X } from "lucide-react";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { absUrl, breadcrumbJsonLd, faqJsonLd, orgId, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { AskDialog } from "@/components/landing/ask-dialog";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { TherapistSection } from "@/components/landing/therapist";
import { LandingTracker, QuizCta, StickyCta } from "@/components/mapa/cta";
import { HeroMap, HeroMapVertical, Roads } from "@/components/mapa/flow";
import { MapaEyebrow } from "@/components/mapa/mark";
import { ReportPreview, SampleReportLink } from "@/components/mapa/report-preview";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const HEADLINE = "Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.";
const VALUE = "Mapa Relacji to proces z psychologiem, który pomaga zrozumieć Waszą sytuację i świadomiej wybrać kolejne kroki.";

/** Proces na podstawie rzeczywistego przebiegu w aplikacji (lejek → sprawa → kwestionariusz → sesja → podsumowanie). */
const STEPS = [
  { icon: Check, t: "Bezpłatny quiz", time: "ok. 2 minut", d: "6 krótkich pytań o to, gdzie dziś jesteście. Na końcu możesz zostawić numer telefonu." },
  { icon: PhoneCall, t: "Rozmowa z konsultantem DUO", time: "telefonicznie", d: "Konsultant wyjaśni, jak wygląda Mapa Relacji, czy pasuje do Waszej sytuacji, jaki wariant wybrać i ile kosztuje. Decydujesz po rozmowie." },
  { icon: ClipboardList, t: "Poufny kwestionariusz", time: "ok. 15–25 minut", d: "Na prywatnym linku z kodem dostępu. Przy konsultacji dla pary każde z Was wypełnia własny – druga osoba nie widzi Twoich odpowiedzi." },
  { icon: MessagesSquare, t: "Spotkania z psychologiem", time: "dla Ciebie 1 · dla Was 3", d: "Online. Dla Was: spotkanie z każdym z Was osobno i jedno wspólne. Psycholog zna już Wasze odpowiedzi, więc od razu rozmawiacie o tym, co najważniejsze." },
  { icon: FileText, t: "Twoja Mapa Relacji", time: "online i PDF", d: "Pisemne podsumowanie przygotowane przez psychologa – do przeczytania pod prywatnym linkiem z kodem i do pobrania jako PDF." },
];

export const metadata: Metadata = pageMeta({
  title: "Mapa Relacji – konsultacja z psychologiem dla par i osób w kryzysie | DUO®",
  description: "Nie wiesz, co dalej z Waszą relacją? Mapa Relacji: poufny kwestionariusz, spotkanie online z psychologiem i pisemne podsumowanie. Indywidualnie lub we dwoje.",
  path: "/mapa-relacji",
  ogTitle: "Nie wiesz, co dalej z Waszą relacją? Zacznij od Mapy Relacji",
  kicker: "Mapa Relacji z psychologiem",
});

const zl = (v: string) => Number(String(v).replace(/[^\d,.]/g, "").replace(",", ".")) || null;

export default async function Landing() {
  const s = await getSettings();
  const v = (await cookies()).get("duo_hero2")?.value ?? (await headers()).get("x-duo-hero");
  // A – nacisk na emocjonalny problem; B – nacisk na konkretną wartość Mapy Relacji. Nagłówek ten sam.
  const variant = v === "B" ? "B" : "A";
  // cena z ustawień strony; brak = cena oferty online (wariant indywidualny)
  const individual = s.site.priceIndividual || (s.offer.pricePln ? `${s.offer.pricePln} zł` : "");
  const prices = [individual && ["Dla Ciebie", individual], s.site.priceCouple && ["Dla Was", s.site.priceCouple]].filter(Boolean) as [string, string][];

  const offers = [
    { name: "Mapa Relacji dla Ciebie", desc: "Kwestionariusz, 1 spotkanie online z psychologiem (60 minut) i pisemne podsumowanie.", price: zl(individual) },
    { name: "Mapa Relacji dla Was", desc: "Dwa kwestionariusze, 3 spotkania online: z Tobą, z partnerem i wspólne, oraz pisemne podsumowanie.", price: zl(s.site.priceCouple) },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Mapa Relacji",
      serviceType: "Konsultacja psychologiczna dla par i osób w kryzysie związku",
      description: "Poufny kwestionariusz, spotkanie online z psychologiem i pisemne podsumowanie – żeby zrozumieć, co dzieje się w relacji, zanim podejmiecie decyzję.",
      url: absUrl("/mapa-relacji"),
      provider: { "@id": orgId() },
      areaServed: "PL",
      availableChannel: { "@type": "ServiceChannel", name: "Spotkania online" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Warianty Mapy Relacji",
        itemListElement: offers.map((o) => ({ "@type": "Offer", name: o.name, description: o.desc, ...(o.price ? { price: o.price, priceCurrency: "PLN" } : {}), url: absUrl("/mapa-relacji") })),
      },
    },
    breadcrumbJsonLd([["DUO", "/"], ["Mapa Relacji", "/mapa-relacji"]]),
    ...(s.site.faq.length ? [faqJsonLd(s.site.faq)] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingTracker />
      <SiteHeader variant="mapa" />

      <main id="main">
        {/* 1. HERO */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-20 md:pt-14">
            <div>
              <MapaEyebrow className="animate-rise" />
              <h1 className="animate-rise delay-1 mt-4 font-display text-[2.15rem] leading-[1.06] text-ink min-[400px]:text-[2.35rem] sm:mt-5 sm:text-5xl lg:text-[3.4rem]" data-variant={variant}>
                {HEADLINE}
              </h1>
              {variant === "A" ? (
                <div className="animate-rise delay-2 mt-4 max-w-xl space-y-3 text-[16.5px] leading-relaxed sm:mt-5 sm:text-lg">
                  <p className="text-ink-soft">Może chcesz jeszcze spróbować. Może myślisz o rozstaniu. A może po prostu nie wiesz, co dalej.</p>
                  <p className="font-medium text-ink">{VALUE}</p>
                </div>
              ) : (
                <div className="animate-rise delay-2 mt-4 max-w-xl sm:mt-5">
                  <p className="text-[16.5px] font-medium leading-relaxed text-ink sm:text-lg">{VALUE}</p>
                  <ul className="mt-3 space-y-1.5 text-[15px] text-ink-soft">
                    {["Poufny kwestionariusz online", "Konsultacja z psychologiem – sam lub sama albo we dwoje", "Pisemne podsumowanie z możliwymi kolejnymi krokami"].map((x) => (
                      <li key={x} className="flex items-start gap-2"><Check size={17} className="mt-0.5 shrink-0 text-forest" aria-hidden />{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="animate-rise delay-3 mt-6">
                <QuizCta hero id="hero-cta" className="w-full sm:w-auto">Zacznij od 6 krótkich pytań</QuizCta>
                <p className="mt-2.5 text-center text-sm text-muted sm:text-left">Bezpłatny quiz · około 2 minut</p>
              </div>
              <div className="animate-rise delay-3 mt-6 flex items-center gap-3 rounded-2xl bg-white/75 p-3 ring-1 ring-sand">
                <img src="/img/klaudia-bosek-avatar.jpg" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white" />
                <p className="text-[13.5px] leading-snug text-ink-soft">
                  <strong className="font-semibold text-ink">Klaudia Bosek</strong> – psycholog i psychoterapeutka relacji, pracuje pod regularną superwizją.{" "}
                  <a href="#o-mnie" className="whitespace-nowrap text-forest underline decoration-sand-dark underline-offset-2">Poznaj mnie</a>
                </p>
              </div>
              <ul className="animate-rise delay-3 mt-4 space-y-1.5 text-[13.5px] leading-snug text-ink-soft">
                <li className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />Możesz zacząć sam lub sama – bez zgody i udziału partnera.</li>
                <li className="flex gap-2"><FileText size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />Quiz to bezpłatny pierwszy krok. Pełna Mapa Relacji jest płatna – szczegóły poznasz w rozmowie.</li>
              </ul>
            </div>
            <div className="md:hidden">
              <HeroMapVertical />
            </div>
            <div className="hidden md:block">
              <HeroMap />
            </div>
          </div>
        </section>

        {/* 2. ROZPOZNANIE */}
        <section className="bg-forest text-white" aria-labelledby="rozp-h">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
            <h2 id="rozp-h" className="font-display text-[1.65rem] leading-tight sm:text-4xl">Czy któraś z tych myśli brzmi znajomo?</h2>
            <div className="mt-7 grid gap-3 md:grid-cols-3 md:gap-4">
              {["„Chcę walczyć o nas, ale nie wiem jak.”", "„Nie wiem, czy jeszcze się kochamy.”", "„Myślę o rozstaniu, ale boję się podjąć decyzję.”"].map((q) => (
                <blockquote key={q} className="rounded-2xl bg-white/[0.07] px-5 py-4 font-display text-lg leading-snug ring-1 ring-white/15 sm:p-6 sm:text-xl">{q}</blockquote>
              ))}
            </div>
            <p className="mt-7 font-display text-xl text-[#f3d9cb] sm:text-2xl">Nie musisz dziś wybierać żadnej z tych dróg.</p>
          </div>
        </section>

        {/* 3. CZYM JEST */}
        <section id="mapa" className="scroll-mt-20" aria-labelledby="mapa-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Mapa Relacji</p>
              <h2 id="mapa-h" className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Czym jest Mapa Relacji?</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
                To jednorazowy, uporządkowany proces z psychologiem – a nie terapia, na którą musisz się od razu zobowiązać. Najpierw odpowiadasz na pytania o Waszą
                relację, potem rozmawiasz z psychologiem, a na koniec dostajesz pisemne podsumowanie: co się między Wami dzieje, co Was wspiera, gdzie jest najtrudniej i
                jakie są możliwe kolejne kroki.
              </p>
            </div>
            <ol className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {(
                [
                  [ClipboardList, "Poufny kwestionariusz", "Twoja perspektywa – w Twoim tempie."],
                  [MessagesSquare, "Konsultacja z psychologiem", "Indywidualnie albo we dwoje, online."],
                  [FileText, "Pisemna Mapa Relacji", "Podsumowanie, do którego możesz wracać."],
                ] as const
              ).map(([Icon, t, d], k) => (
                <li key={t} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-sand sm:block sm:p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-clay-soft text-clay"><Icon size={20} aria-hidden /></span>
                  <span className="sm:mt-4 sm:block">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Krok {k + 1}</span>
                    <strong className="block font-display text-lg font-medium text-ink sm:text-xl">{t}</strong>
                    <span className="text-[15px] text-ink-soft">{d}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4" aria-label="Czym Mapa Relacji różni się od pojedynczej konsultacji">
              <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-sand sm:p-6">
                <p className="font-display text-lg text-ink-soft">Pojedyncza konsultacja</p>
                <ul className="mt-3 space-y-2 text-[15px] text-ink-soft">
                  {["Rozmowa zaczyna się od opowiadania całej historii", "Para opowiada swoje perspektywy przy sobie", "Po spotkaniu zostaje głównie to, co zapamiętacie"].map((x) => (
                    <li key={x} className="flex gap-2.5"><X size={16} className="mt-1 shrink-0 text-muted" aria-hidden />{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-forest/30 sm:p-6">
                <p className="font-display text-lg text-forest">Mapa Relacji</p>
                <ul className="mt-3 space-y-2 text-[15px] text-ink">
                  {[
                    "Psycholog zna Wasze odpowiedzi przed rozmową – od razu przechodzicie do sedna",
                    "Każde z Was wypełnia własny, poufny kwestionariusz",
                    "Dostajesz pisemne podsumowanie z możliwymi kolejnymi krokami",
                  ].map((x) => (
                    <li key={x} className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-forest" aria-hidden />{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Terapia to zwykle wiele spotkań i praca nad zmianą. Mapa Relacji pomaga najpierw zrozumieć sytuację – i dopiero wtedy zdecydować, czy i jaka dalsza praca ma sens.
            </p>
          </div>
        </section>

        {/* 4. CO OTRZYMASZ */}
        <section id="co-otrzymasz" className="scroll-mt-20 overflow-x-clip bg-linen" aria-labelledby="dost-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Rezultat</p>
              <h2 id="dost-h" className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Zobacz, co otrzymasz w swojej Mapie Relacji</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
                Nie tylko rozmowę. Po konsultacji psycholog przygotowuje pisemne podsumowanie, które pomaga lepiej zrozumieć Waszą sytuację. Tak wygląda jego struktura –
                przejdź przez sześć części przykładowej Mapy.
              </p>
            </div>
            <div className="mt-8 md:mt-10"><ReportPreview /></div>
            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <ul className="grid gap-2 text-[15px] text-ink-soft sm:grid-cols-2">
                {[
                  "Osobisty list od psychologa na początku podsumowania",
                  "Wersja online pod prywatnym linkiem z kodem i plik PDF",
                  "Dla pary: podsumowanie wspólne, a w razie potrzeby także osobne",
                  "Bez ocen, diagnoz i „wyniku” związku – opis tego, co zobaczyliście razem",
                ].map((x) => (
                  <li key={x} className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-forest" aria-hidden />{x}</li>
                ))}
              </ul>
              <div className="flex flex-col items-start gap-1 md:items-end">
                <SampleReportLink />
                <p className="text-xs text-muted">Przykład na fikcyjnych danych · otwiera się w nowej karcie</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. JAK TO DZIAŁA */}
        <section id="jak" className="scroll-mt-20" aria-labelledby="jak-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-24">
            <h2 id="jak-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Jak to działa?</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">Od pierwszego kliknięcia do gotowej Mapy Relacji – krok po kroku.</p>
            <ol className="relative mt-8 space-y-3 md:mt-10 md:grid md:grid-cols-5 md:gap-3 md:space-y-0">
              {STEPS.map((st, i) => (
                <li key={st.t} className="relative flex gap-3.5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sand sm:p-5 md:block">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest font-display text-white md:h-10 md:w-10 md:text-lg">{i + 1}</span>
                  <span className="block md:mt-4">
                    <strong className="block font-display text-[1.15rem] font-medium leading-snug text-ink">{st.t}</strong>
                    <span className="mt-1 inline-block rounded-full bg-linen px-2.5 py-0.5 text-xs font-medium text-ink-soft">{st.time}</span>
                    <span className="mt-1.5 block text-[14.5px] leading-snug text-ink-soft md:leading-relaxed">{st.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">Termin konsultacji i przekazania podsumowania ustalacie wspólnie z nami – w rozmowie, bez pośpiechu.</p>

            {/* Dwa warianty: dla Ciebie (1 spotkanie) i dla Was (3 spotkania). Cena pary wyłącznie z ustawień; brak = uczciwa informacja. */}
            <div className="mt-10" data-testid="mapa-variants">
              <h3 className="font-display text-2xl text-ink">Co obejmuje Mapa Relacji</h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[
                  {
                    key: "solo",
                    name: "Mapa Relacji dla Ciebie",
                    meetings: "1 spotkanie z Tobą",
                    price: `${s.offer.pricePln} zł`,
                    once: true,
                    items: ["Szczegółowy, poufny kwestionariusz", "1 spotkanie online z psychologiem (60 minut)", "Pisemne podsumowanie przygotowane przez psychologa – online i w PDF"],
                  },
                  {
                    key: "couple",
                    name: "Mapa Relacji dla Was",
                    meetings: "3 spotkania: z Tobą, z partnerem i wspólne",
                    price: s.site.priceCouple,
                    once: !!s.site.priceCouple,
                    items: ["Osobny, poufny kwestionariusz dla każdego z Was", "3 spotkania online z psychologiem: 1 z Tobą, 1 z partnerem i 1 wspólne", "Pisemne podsumowanie przygotowane przez psychologa – online i w PDF"],
                  },
                ].map((v) => (
                  <div key={v.key} className={v.key === "solo" ? "flex flex-col rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-7" : "flex flex-col rounded-[2rem] bg-white p-6 shadow-soft ring-2 ring-forest/25 sm:p-7"} data-testid={`variant-${v.key}`}>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">{v.key === "solo" ? "Sam / sama" : "We dwoje"}</p>
                    <p className="mt-2 font-display text-[1.6rem] leading-tight text-ink">{v.name}</p>
                    <p className="mt-1 font-medium text-forest">{v.meetings}</p>
                    <ul className="mt-4 flex-1 space-y-2.5 text-[15px] text-ink-soft">
                      {v.items.map((x) => <li key={x} className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-forest" aria-hidden />{x}</li>)}
                    </ul>
                    <div className="mt-5 rounded-2xl bg-linen p-4">
                      {v.price ? (
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-display text-[2.2rem] leading-none text-ink">{v.price}</span>
                          {v.once && <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-forest ring-1 ring-sand" data-testid={v.key === "solo" ? "price-once" : undefined}>jednorazowo</span>}
                        </p>
                      ) : (
                        <p className="text-[15px] font-medium text-ink">Cenę omówisz z konsultantem</p>
                      )}
                      <p className="mt-1.5 text-[13px] text-muted">{v.price ? "Płacisz raz – to nie jest abonament." : "Konsultant dopasuje termin trzech spotkań do Was obojga."}</p>
                    </div>
                    {/* wybór wariantu → quiz z zaznaczoną formą (samodzielnie / razem) */}
                    <div className="relative mt-5">
                      {v.key === "couple" && (
                        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-soft" data-testid="variant-recommended">Rekomendowana</span>
                      )}
                      <QuizCta href={`/start?forma=${v.key === "solo" ? "solo" : "together"}`} id={`cta-${v.key}`} className={clsx("min-h-16 w-full gap-3 py-2.5", v.key === "couple" && "ring-2 ring-forest/30 ring-offset-2")}>
                        <span className="flex flex-col items-center leading-tight">
                          <span className="text-[17px] font-semibold">{v.key === "solo" ? "Wybieram 1 spotkanie" : "Wybieram 3 spotkania"}</span>
                          <span className="mt-0.5 text-[13px] font-medium text-white/80">{v.key === "solo" ? "Ścieżka dla Ciebie" : "Ścieżka dla Was"}</span>
                        </span>
                      </QuizCta>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex gap-2.5 text-[15px] text-ink-soft">
                <Check size={16} className="mt-1 shrink-0 text-forest" aria-hidden />
                Przed zakupem rozmowa z konsultantem – bez zobowiązań. Quiz na stronie jest bezpłatny i do niczego nie zobowiązuje.
              </p>
            </div>
          </div>
        </section>

        {/* 5b. DLA KOGO */}
        <section id="dla-kogo" className="scroll-mt-20 bg-linen" aria-labelledby="dla-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <h2 id="dla-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Czy Mapa Relacji jest dla Ciebie?</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand sm:p-7">
                <h3 className="font-display text-xl text-forest">Dla kogo to jest</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-snug text-ink">
                  {[
                    "Czujesz, że w relacji coś się zmieniło, i chcesz zrozumieć co – zanim podejmiesz decyzję.",
                    "Zastanawiasz się, czy ratować związek, dać sobie czas czy się rozstać, i nie chcesz decydować pod wpływem emocji.",
                    "Wracacie do tych samych kłótni i chcesz zobaczyć, jak działa Wasz konflikt.",
                    "Chcesz zacząć sam lub sama, bo partner nie jest jeszcze gotowy na wspólne spotkania.",
                    "Szukasz konkretnego, zamkniętego procesu z psychologiem, a nie od razu wielomiesięcznej terapii.",
                  ].map((x) => (
                    <li key={x} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={13} aria-hidden /></span>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white/60 p-6 ring-1 ring-sand sm:p-7">
                <h3 className="font-display text-xl text-ink-soft">Dla kogo to nie jest</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-snug text-ink-soft">
                  {[
                    "Gdy w relacji jest przemoc albo nie czujesz się bezpiecznie – wtedy pierwsze jest bezpieczeństwo i specjalistyczna pomoc.",
                    "Gdy przeżywasz ostry kryzys psychiczny – Mapa Relacji nie jest pomocą kryzysową.",
                    "Gdy oczekujesz, że psycholog zdecyduje za Ciebie, czy się rozstać – decyzja zawsze należy do Ciebie.",
                    "Gdy potrzebujesz diagnozy, opinii do sądu albo porady prawnej.",
                    "Gdy szukasz długoterminowej terapii – Mapa może być dobrym początkiem, ale nią nie jest.",
                  ].map((x) => (
                    <li key={x} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-linen text-muted"><X size={13} aria-hidden /></span>{x}</li>
                  ))}
                </ul>
                <p className="mt-5 text-sm"><Link href="/pomoc" className="inline-flex items-center gap-1.5 font-medium text-forest underline underline-offset-2"><ShieldCheck size={15} aria-hidden /> Gdzie szukać pomocy, gdy nie czujesz się bezpiecznie</Link></p>
              </div>
            </div>
          </div>
        </section>

        {s.site.vslUrl && /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(s.site.vslUrl) && (
          <section className="mx-auto max-w-4xl px-5 pb-16" aria-labelledby="vsl">
            <h2 id="vsl" className="text-center font-display text-3xl text-ink">Zobacz, jak wygląda Mapa Relacji</h2>
            <div className="mt-8 aspect-video overflow-hidden rounded-2xl shadow-soft ring-1 ring-sand">
              <iframe src={s.site.vslUrl} title="Film: jak wygląda Mapa Relacji" className="h-full w-full" allow="fullscreen; picture-in-picture" loading="lazy" referrerPolicy="no-referrer" />
            </div>
          </section>
        )}

        {/* 6. TRZY DROGI */}
        <section id="drogi" className="scroll-mt-20" aria-labelledby="drogi-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-24">
            <h2 id="drogi-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Trzy możliwe drogi</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
              Mapa Relacji pomaga uporządkować sytuację, ale nie wybiera drogi za Was. Żadna nie jest „lepsza” – liczy się ta, która naprawdę jest Wasza.
            </p>
            <div className="mt-8 md:mt-10"><Roads /></div>
          </div>
        </section>

        {/* 7. KTO POMAGA */}
        <TherapistSection />

        {/* 8. FAQ */}
        <section id="faq" className="scroll-mt-20" aria-labelledby="faq-h">
          <div className="mx-auto max-w-3xl px-5 py-14 md:py-24">
            <h2 id="faq-h" className="font-display text-[1.9rem] text-ink sm:text-4xl">Najczęstsze pytania</h2>
            <div className="mt-8 divide-y divide-sand rounded-3xl bg-white shadow-soft ring-1 ring-sand">
              {s.site.faq.map((f) => (
                <details key={f.q} className="group px-5 py-4 sm:px-6 sm:py-5">
                  <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                    {f.q}
                    <span className="text-xl text-clay transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <SampleReportLink className="text-[15px]" />
              {prices.length > 0 && <p className="text-sm text-ink-soft">Cena Mapy Relacji – {prices.map(([k, val]) => `${k.toLowerCase()}: ${val}`).join(" · ")}.</p>}
            </div>
          </div>
        </section>

        {/* 9. OSTATNIE CTA */}
        <section className="px-5 py-16 md:py-20" aria-labelledby="end-h">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 px-6 py-12 text-center text-white shadow-soft sm:px-12 sm:py-14">
            <h2 id="end-h" className="font-display text-[1.9rem] leading-tight sm:text-4xl">Nie musisz dziś decydować o całym swoim życiu.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/85">Wystarczy pierwszy krok: sześć pytań, które pomogą zobaczyć, gdzie dziś jesteś.</p>
            <QuizCta className="mt-8 w-full sm:w-auto">Zacznij od 6 krótkich pytań</QuizCta>
            <p className="mt-3 text-sm text-white/70">Bezpłatny quiz · około 2 minut · bez rejestracji</p>
          </div>
          <div className="mt-8 text-center"><AskDialog consentText={s.legal.inquiryConsent} /></div>
        </section>
      </main>

      <SiteFooter contactEmail={s.site.contactEmail} />
      <StickyCta />
    </>
  );
}
