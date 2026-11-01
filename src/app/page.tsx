import { ClipboardList, FileText, MessageCircle, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { AskDialog } from "@/components/landing/ask-dialog";
import { TherapistSection } from "@/components/landing/therapist";
import { LandingTracker, QuizCta } from "@/components/mapa/cta";
import { HeroMap, MapaFlow, Roads } from "@/components/mapa/flow";
import { MapaEyebrow } from "@/components/mapa/mark";
import { Logo } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const HEADLINES = {
  A: "Nie wiesz, co dalej z Waszą relacją?",
  B: "Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.",
} as const;

const STEPS = [
  { icon: MessageCircle, t: "Powiedz nam, gdzie jesteś", d: "Krótki quiz na stronie i rozmowa telefoniczna z konsultantem DUO, który wyjaśni, jak wygląda proces i ile kosztuje." },
  { icon: ClipboardList, t: "Przyjrzyjmy się Waszej relacji", d: "Szczegółowy, poufny kwestionariusz – dla Ciebie albo dla każdego z Was osobno. Około 15–25 minut, w Twoim tempie." },
  { icon: MessagesSquare, t: "Porozmawiaj z psychologiem", d: "Konsultacja online – indywidualnie albo wspólnie. Psycholog zna już Twoje odpowiedzi, więc od razu przechodzicie do sedna." },
  { icon: FileText, t: "Otrzymaj Mapę Relacji", d: "Pisemne podsumowanie: co się dzieje, co Was wspiera, gdzie jest najtrudniej i jakie są możliwe kolejne kroki." },
];

export default async function Landing() {
  const s = await getSettings();
  const v = (await cookies()).get("duo_hero")?.value ?? (await headers()).get("x-duo-hero");
  const variant = v === "B" ? "B" : "A";
  const price = [s.site.priceIndividual && `indywidualnie: ${s.site.priceIndividual}`, s.site.priceCouple && `dla pary: ${s.site.priceCouple}`].filter(Boolean).join(" · ");

  return (
    <>
      <LandingTracker />
      <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3" aria-label="Główna">
          <Link href="/" aria-label="DUO – strona główna"><Logo /></Link>
          <div className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
            <a href="#mapa" className="hover:text-forest">Mapa Relacji</a>
            <a href="#jak" className="hover:text-forest">Jak to działa</a>
            <a href="#drogi" className="hover:text-forest">Możliwe drogi</a>
            <a href="#o-mnie" className="hover:text-forest">Kto pomaga</a>
            <a href="#faq" className="hover:text-forest">Pytania</a>
          </div>
          <QuizCta size="sm" className="whitespace-nowrap max-[359px]:hidden">Zacznij</QuizCta>
        </nav>
      </header>

      <main id="main">
        {/* 1. HERO */}
        <section className="relative overflow-hidden">
          <svg className="pointer-events-none absolute -right-28 -top-6 h-[260px] w-[260px] opacity-[0.22] md:hidden" viewBox="0 0 200 200" aria-hidden>
            <path d="M10 170 C 60 170, 70 100, 110 100 C 140 100, 150 40, 195 30" fill="none" stroke="#a9512f" strokeWidth="1.5" strokeDasharray="4 6" />
            <path d="M110 100 C 140 100, 160 100, 195 100" fill="none" stroke="#c4a98d" strokeWidth="1.5" />
            <path d="M110 100 C 140 100, 150 160, 195 170" fill="none" stroke="#46604f" strokeWidth="1.5" />
          </svg>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-14 pt-8 md:grid-cols-[1.05fr_0.95fr] md:pb-20 md:pt-16">
            <div>
              <MapaEyebrow className="animate-rise" />
              <h1 className="animate-rise delay-1 mt-5 font-display text-[2.35rem] leading-[1.06] text-ink sm:text-5xl lg:text-[3.5rem]" data-variant={variant}>
                {HEADLINES[variant]}
              </h1>
              <p className="animate-rise delay-2 mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft sm:text-lg">
                Może chcesz jeszcze spróbować. Może myślisz o rozstaniu. A może po prostu nie wiesz, co czujesz i co zrobić dalej. Zacznij od zrozumienia, w jakim miejscu
                jesteście.
              </p>
              <div className="animate-rise delay-3 mt-7">
                <QuizCta hero className="w-full sm:w-auto">Sprawdź, gdzie dziś jesteście</QuizCta>
                <p className="mt-3 text-center text-sm text-muted sm:text-left">6 krótkich pytań · około 2 minut · bez oceniania</p>
              </div>
              <p className="animate-rise delay-3 mt-6 flex gap-2.5 rounded-2xl bg-white/70 p-3.5 text-sm leading-snug text-ink-soft ring-1 ring-sand">
                <Users size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden />
                Możesz zacząć samodzielnie. Nie potrzebujesz zgody ani udziału partnera do wypełnienia wstępnego quizu.
              </p>
            </div>
            <div className="hidden md:block">
              <HeroMap />
            </div>
          </div>
        </section>

        {/* 2. ROZPOZNANIE */}
        <section className="bg-forest text-white" aria-labelledby="rozp-h">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <h2 id="rozp-h" className="max-w-3xl font-display text-[1.8rem] leading-tight sm:text-4xl">
              Czasem najtrudniejsze jest nie to, co dzieje się między Wami. Tylko niewiedza, co zrobić dalej.
            </h2>
            <div className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
              {["„Chcę walczyć o nas, ale nie wiem jak.”", "„Nie wiem, czy jeszcze się kochamy.”", "„Myślę o rozstaniu, ale boję się podjąć decyzję.”"].map((q) => (
                <blockquote key={q} className="rounded-2xl bg-white/[0.07] p-6 font-display text-xl leading-snug ring-1 ring-white/15">{q}</blockquote>
              ))}
            </div>
            <p className="mt-10 font-display text-2xl text-[#f3d9cb]">Nie musisz dziś wybierać żadnej z tych dróg.</p>
          </div>
        </section>

        {/* 3. MAPA RELACJI */}
        <section id="mapa" className="scroll-mt-20" aria-labelledby="mapa-h">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Mapa Relacji</p>
              <h2 id="mapa-h" className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Najpierw zrozumienie. Dopiero potem decyzja.</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                W kryzysie łatwo działać pod wpływem emocji – albo latami tkwić w zawieszeniu. Mapa Relacji pomaga zatrzymać się i zobaczyć całość: co się między Wami
                dzieje, co Was jeszcze łączy i jakie macie możliwości. Z tej perspektywy łatwiej wybrać kierunek, który naprawdę jest Wasz.
              </p>
            </div>
            <div className="mt-12"><MapaFlow /></div>
            <p className="mt-8 text-sm text-muted">Te drogi to możliwości, które można rozważyć po konsultacji – nie wynik quizu i nie gotowa rekomendacja.</p>
          </div>
        </section>

        {/* 4. JAK POWSTAJE */}
        <section id="jak" className="scroll-mt-20 bg-linen" aria-labelledby="jak-h">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <h2 id="jak-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Jak powstaje Mapa Relacji?</h2>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((st, i) => (
                <li key={st.t} className="relative rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-forest font-display text-lg text-white">{i + 1}</span>
                    <st.icon size={22} className="text-clay" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-xl leading-snug text-ink">{st.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{st.d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">Quiz jest bezpłatny. Mapa Relacji jest usługą płatną – koszt poznasz w rozmowie, zanim cokolwiek zdecydujesz.</p>
            <div className="mt-8"><QuizCta>Sprawdź, gdzie dziś jesteście</QuizCta></div>
          </div>
        </section>

        {s.site.vslUrl && /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(s.site.vslUrl) && (
          <section className="mx-auto max-w-4xl px-5 py-16" aria-labelledby="vsl">
            <h2 id="vsl" className="text-center font-display text-3xl text-ink">Zobacz, jak wygląda Mapa Relacji</h2>
            <div className="mt-8 aspect-video overflow-hidden rounded-2xl shadow-soft ring-1 ring-sand">
              <iframe src={s.site.vslUrl} title="Film: jak wygląda Mapa Relacji" className="h-full w-full" allow="fullscreen; picture-in-picture" loading="lazy" referrerPolicy="no-referrer" />
            </div>
          </section>
        )}

        {/* 5. TRZY DROGI */}
        <section id="drogi" className="scroll-mt-20" aria-labelledby="drogi-h">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <h2 id="drogi-h" className="font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Trzy możliwe drogi</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              Żadna nie jest „lepsza”. Psycholog nie podejmie decyzji za Was – pomoże zobaczyć, która droga odpowiada temu, czego naprawdę chcecie i potrzebujecie.
            </p>
            <div className="mt-10"><Roads /></div>
          </div>
        </section>

        {/* 6. KTO POMAGA */}
        <TherapistSection />

        {/* 7. FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16 md:py-24" aria-labelledby="faq-h">
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
          {price && <p className="mt-4 text-sm text-ink-soft">Aktualna cena Mapy Relacji – {price}.</p>}
        </section>

        {/* 8. OSTATNIE CTA */}
        <section className="px-5 pb-20" aria-labelledby="end-h">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 px-6 py-14 text-center text-white shadow-soft sm:px-12">
            <h2 id="end-h" className="font-display text-[1.9rem] leading-tight sm:text-4xl">Nie musisz dziś podejmować decyzji o całym swoim życiu.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/85">Możesz zacząć od małego kroku, który pomoże Ci lepiej zrozumieć Waszą relację.</p>
            <QuizCta className="mt-8 w-full sm:w-auto">Zacznij od 6 krótkich pytań</QuizCta>
            <p className="mt-3 text-sm text-white/70">około 2 minut · bez rejestracji · bez oceniania</p>
          </div>
          <div className="mt-8 text-center"><AskDialog consentText={s.legal.inquiryConsent} /></div>
        </section>
      </main>

      <footer className="bg-forest-800 text-white/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">Mapa Relacji – zrozum, w jakim miejscu jesteście, i świadomie zdecyduj, co dalej.</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Informacje</p>
            <ul className="mt-3 space-y-1.5">
              <li><Link href="/prywatnosc" className="hover:text-white">Polityka prywatności</Link></li>
              <li><Link href="/pomoc" className="inline-flex items-center gap-1.5 hover:text-white"><ShieldCheck size={14} aria-hidden /> Gdy nie czujesz się bezpiecznie</Link></li>
              {s.site.contactEmail && <li><a href={`mailto:${s.site.contactEmail}`} className="hover:text-white">{s.site.contactEmail}</a></li>}
              <li><Link href="/app" className="hover:text-white">Panel specjalisty</Link></li>
            </ul>
            <p className="mt-6 text-xs text-white/50">DUO® · Mapa Relacji. Konsultacja psychologiczna – nie terapia, nie diagnoza, nie pomoc kryzysowa.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
