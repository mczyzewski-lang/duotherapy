// Strona po quizie: wiadomość wideo od Klaudii i zakup Mapy Relacji (jedna oferta, jedna cena).
// Skupiona na decyzji – bez menu strony głównej. Personalizacja wyłącznie imieniem z prośby o kontakt.
import { CalendarCheck, CheckCircle2, ClipboardList, FileText, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandSymbol, MapaLogo } from "@/components/brand";
import { ReportPreview, SampleReportLink } from "@/components/mapa/report-preview";
import { FinalOrderButton, OfferCard, VslSticky } from "@/components/vsl/offer";
import { VslPlayer, VslTracker } from "@/components/vsl/player";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { leadFromCookie, ORDER_COOKIE, readCookie } from "@/lib/lead-session";
import { salesAvailable } from "@/lib/payments";
import { readSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Twoja Mapa Relacji – DUO®",
  description: "Wiadomość od Klaudii z DUO i zakup Mapy Relacji.",
  robots: { index: false, follow: false },
};

const STEPS = [
  { icon: CalendarCheck, t: "Wybierasz termin", d: "Zaraz po zapłacie rezerwujesz konsultację online w jednym z dostępnych terminów i wybierasz wersję kwestionariusza." },
  { icon: ClipboardList, t: "Wypełniasz kwestionariusz", d: "Od razu dostajesz prywatny link i kod. Wypełnij go przed konsultacją – zajmuje ok. 15–25 minut i można robić przerwy." },
  { icon: MessagesSquare, t: "Rozmawiasz z psychologiem", d: "Godzinna konsultacja online. Psycholog zna już Twoje odpowiedzi, więc od razu rozmawiacie o tym, co najważniejsze." },
  { icon: FileText, t: "Otrzymujesz Mapę Relacji", d: "Pisemne podsumowanie przygotowane przez psychologa po konsultacji – pod prywatnym linkiem z kodem i do pobrania w PDF." },
];

const FAQ = [
  ["Czy mogę rozpocząć bez udziału partnera?", "Tak. Zamówienie na tej stronie to Mapa Relacji w wariancie indywidualnym – nie potrzebujesz zgody ani udziału drugiej osoby. Pracujemy wtedy na Twojej perspektywie, a podsumowanie jasno zaznacza, że opisy zachowań i intencji partnera to Twoja perspektywa, a nie ocena osoby nieobecnej. Jeśli chcecie przejść Mapę Relacji we dwoje, ustal ten wariant z konsultantem."],
  ["Czy Mapa Relacji jest terapią?", "Nie. Psychoterapia to zwykle wiele spotkań i praca nad zmianą. Mapa Relacji to zamknięta usługa z początkiem i końcem: kwestionariusz, jedna konsultacja z psychologiem i pisemne podsumowanie. Pomaga zrozumieć sytuację i zobaczyć możliwe dalsze kroki – terapia może być jednym z nich, ale nie musi."],
  ["Czy psycholog powie mi, czy mam się rozwieść?", "Nie. Rolą psychologa jest pomóc Ci zrozumieć, co dzieje się w relacji, co ją wspiera i jakie widzi możliwe kierunki. Decyzja zawsze należy do Ciebie."],
  ["Co dokładnie otrzymam za 670 zł?", "Szczegółowy kwestionariusz, godzinną konsultację online z psychologiem i pisemną Mapę Relacji: krótki list od psychologa, najważniejsze w skrócie, co wspiera relację, gdzie jest najtrudniej (sześć obszarów), jak działa konflikt, propozycje psychologa z możliwą dalszą drogą i plan kolejnych kroków. Podsumowanie jest dostępne online pod prywatnym linkiem z kodem i do pobrania w PDF."],
  ["Czy mogę porozmawiać z kimś przed zakupem?", "Tak. Zostawiłeś lub zostawiłaś prośbę o kontakt – konsultant DUO zadzwoni w godzinach pracy i odpowie na pytania. Nie musisz kupować teraz."],
  ["Co z poufnością moich informacji?", "Kwestionariusz wypełniasz na własnym linku z kodem dostępu. Odpowiedzi są szyfrowane i widzi je tylko psycholog prowadzący oraz – w zakresie organizacji – administrator usługi. Nie przekazujemy ich drugiej osobie bez Twojej zgody. Odpowiedzi z quizu nie trafiają do narzędzi reklamowych ani analitycznych. Wyjątki od tajemnicy przewiduje prawo (np. bezpośrednie zagrożenie życia)."],
] as const;

export default async function VslPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const orderToken = await readCookie(ORDER_COOKIE);
  const d = await system(async (tx) => {
    const s = await readSettings(tx);
    const lead = await leadFromCookie(tx);
    let orderPath: string | null = null;
    if (lead && orderToken) {
      const [o] = await tx`select status from orders where lead_id = ${lead.id} and status in ('paid', 'pending') order by created_at desc limit 1`;
      if (o) orderPath = `/zamowienie/${orderToken}`;
    }
    return { s, lead, orderPath };
  });
  const { s, lead } = d;
  const price = s.offer.pricePln;
  const available = salesAvailable(s);

  return (
    <div className="min-h-dvh bg-ivory">
      <VslTracker />
      <header className="border-b border-sand/50 bg-ivory/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="DUO – strona główna">
            <BrandSymbol id="vsl" className="h-5 w-auto" />
            <span className="h-5 w-px bg-sand-dark" aria-hidden />
            <MapaLogo compact id="vsl-logo" />
          </Link>
        </div>
      </header>

      <main id="main" className="pb-16">
        <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-5 sm:pt-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-forest">
              <CheckCircle2 size={14} aria-hidden /> Quiz ukończony{lead ? " · prośba o kontakt zapisana" : ""}
            </p>
            <h1 className="mt-3 font-display text-[1.9rem] leading-[1.1] text-ink sm:text-[2.6rem]">
              Dziękujemy za Twoje odpowiedzi{lead?.firstName ? `, ${lead.firstName}` : ""}
            </h1>
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft sm:text-lg">
              Pierwszy krok już za Tobą. Zobacz, jak z pomocą psychologa możesz lepiej zrozumieć swoją relację.
            </p>
            <p className="mt-3 text-sm font-medium text-forest">Klaudia z DUO przygotowała dla Ciebie krótką wiadomość.</p>
          </div>

          <div className="mt-4 grid items-start gap-6 lg:mt-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
            <div>
              <VslPlayer videoUrl={s.offer.vslVideoUrl} posterUrl={s.offer.vslPosterUrl} captionsUrl={s.offer.vslCaptionsUrl} />
              <a href="#oferta" className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-white text-[15px] font-medium text-forest ring-1 ring-sand lg:hidden">
                Zobacz ofertę – {price} zł ↓
              </a>
            </div>
            <div className="lg:sticky lg:top-6">
              <OfferCard
                price={price}
                productName={s.offer.productName}
                sellerInfo={s.offer.sellerInfo}
                termsVersion={s.offer.termsVersion}
                startConsentText={s.offer.startConsentText}
                available={available}
                hasLead={!!lead}
                firstName={lead?.firstName ?? null}
                orderPath={d.orderPath}
                cancelled={sp.platnosc === "przerwana"}
                demo={env.demoMode}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="pv-h" className="mt-14 overflow-x-clip bg-linen py-12 sm:mt-20 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            <h2 id="pv-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Zobacz, jak wygląda Mapa Relacji</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
              To prawdziwy szablon podsumowania, które psycholog przygotowuje po konsultacji – tutaj wypełniony fikcyjnymi danymi. Przejdź przez sześć części.
            </p>
            <div className="mt-7"><ReportPreview /></div>
            <div className="mt-6"><SampleReportLink /></div>
          </div>
        </section>

        <section aria-labelledby="po-h" className="mx-auto max-w-6xl px-4 pt-12 sm:px-5 sm:pt-16">
          <h2 id="po-h" className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">Co wydarzy się po zamówieniu?</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-4">
            {STEPS.map((st, i) => (
              <li key={st.t} className="flex gap-3.5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sand sm:p-5 md:block">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest font-display text-white">{i + 1}</span>
                <span className="block md:mt-3">
                  <strong className="flex items-center gap-2 font-display text-lg font-medium text-ink"><st.icon size={17} className="text-clay" aria-hidden />{st.t}</strong>
                  <span className="mt-1 block text-[14.5px] leading-snug text-ink-soft">{st.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">Jeśli żaden z dostępnych terminów Ci nie pasuje, konsultant DUO zadzwoni i ustali go z Tobą.</p>
        </section>

        <section aria-labelledby="faq-h" className="mx-auto max-w-3xl px-4 pt-12 sm:px-5 sm:pt-16">
          <h2 id="faq-h" className="font-display text-[1.75rem] text-ink sm:text-4xl">Najczęstsze wątpliwości</h2>
          <div className="mt-6 divide-y divide-sand rounded-3xl bg-white shadow-soft ring-1 ring-sand">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-5 py-4 sm:px-6">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {q}
                  <span className="text-xl text-clay transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{q.startsWith("Co dokładnie") ? a.replace("670 zł", `${price} zł`) : a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="final-cta" aria-labelledby="end-h" className="px-4 pt-12 sm:px-5 sm:pt-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 px-6 py-10 text-center text-white shadow-soft sm:px-12 sm:py-12">
            <h2 id="end-h" className="font-display text-[1.75rem] leading-tight sm:text-4xl">Nie musisz dziś znać wszystkich odpowiedzi</h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/85">
              Możesz zacząć od lepszego zrozumienia swojej sytuacji – z pomocą psychologa i w swoim tempie.
            </p>
            <p className="mt-5 font-display text-2xl">Mapa Relacji — {price} zł</p>
            <div className="mt-5">
              {lead && available ? (
                <FinalOrderButton label="Rozpoczynam swoją Mapę Relacji" />
              ) : (
                <Link href={lead ? "#oferta" : "/start"} className="inline-flex min-h-14 items-center justify-center rounded-full bg-clay px-7 text-[16px] font-semibold text-white">
                  {lead ? "Zobacz ofertę" : "Zacznij od 6 krótkich pytań"}
                </Link>
              )}
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Wolisz najpierw porozmawiać? {lead ? "Zostawiłeś lub zostawiłaś prośbę o kontakt – konsultant DUO zadzwoni i wyjaśni szczegóły." : "Zostaw prośbę o kontakt na końcu quizu – konsultant DUO zadzwoni i wyjaśni szczegóły."}
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted">
            DUO® · Mapa Relacji – konsultacja psychologiczna, nie terapia, nie diagnoza i nie pomoc kryzysowa.{" "}
            <Link href="/regulamin" className="underline">Regulamin</Link> · <Link href="/prywatnosc" className="underline">Prywatność</Link> ·{" "}
            <Link href="/pomoc" className="underline">Gdy nie czujesz się bezpiecznie</Link>
          </p>
        </section>
      </main>
      <VslSticky price={price} enabled={!!lead && available} />
    </div>
  );
}
