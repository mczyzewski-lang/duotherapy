import { ArrowRight, Check, Clock, FileText, Heart, Lock, MessageCircle, Phone, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { HeroArt, PathArt, StepIcon } from "@/components/landing/art";
import { INTENTS } from "@/components/landing/intents";
import { Quiz } from "@/components/landing/quiz";
import { LinkButton, Logo } from "@/components/ui";
import { withActor } from "@/lib/db";
import { readSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const STEPS = [
  { t: "Krótki test", d: "2 minuty online. Opowiadasz w kilku kliknięciach, co się dzieje – bez podawania szczegółów wrażliwych.", meta: "ok. 2 min" },
  { t: "Rozmowa telefoniczna", d: "Oddzwaniamy, wyjaśniamy, jak wygląda audyt, odpowiadamy na pytania i wspólnie decydujemy, czy to dobra forma pomocy teraz.", meta: "krótka rozmowa" },
  { t: "Poufny kwestionariusz", d: "Po potwierdzeniu udziału każda osoba dostaje własny, prywatny link. Odpowiadasz w swoim tempie, z możliwością zapisu i powrotu.", meta: "ok. 40–60 min" },
  { t: "Sesja online z psychologiem", d: "Wybierasz termin spośród zaproponowanych. Rozmowa pogłębia najważniejsze wątki – nie odtwarza kwestionariusza.", meta: "60 min indywidualnie · 90 min dla pary" },
  { t: "Omówienie i raport", d: "Na koniec sesji: mechanizm konfliktu, mocne strony i proponowana ścieżka. Potem pisemny raport z następnymi krokami.", meta: "raport po sesji" },
];

const DELIVERABLES = [
  { i: FileText, t: "Uporządkowana mapa sytuacji", d: "Jak działa konflikt, co ochrania relację, a co jej zagraża – opisane spokojnym, zrozumiałym językiem." },
  { i: MessageCircle, t: "Opis mechanizmu konfliktu", d: "Wasz cykl w jednym zdaniu: wyzwalacze, myśli, emocje i zachowania, które napędzają kłótnie." },
  { i: Heart, t: "Zasoby relacji", d: "To, co już działa i na czym można budować – niezależnie od tego, jaką drogę wybierzecie." },
  { i: Users, t: "Obszary napięcia", d: "Komunikacja, bliskość, zaufanie, granice, obowiązki i rodzicielstwo, stres – gdzie jest najtrudniej." },
  { i: Check, t: "Rekomendacje i następne kroki", d: "Konkretnie: co, kto i kiedy. Propozycja dalszej ścieżki – decyzja zawsze należy do Was." },
];

export default async function Landing({ searchParams }: { searchParams: Promise<{ intent?: string }> }) {
  const { intent } = await searchParams;
  const { s, therapists } = await withActor({ kind: "public" }, async (tx) => ({
    s: await readSettings(tx),
    therapists: await tx<{ display_name: string; title: string | null; bio: string | null }[]>`select display_name, title, bio from therapists where is_public and bio is not null and title is not null order by display_name`,
  }));
  const initialIntent = INTENTS.some((i) => i.value === intent) ? (intent as (typeof INTENTS)[number]["value"]) : undefined;
  const price = s.site.priceIndividual || s.site.priceCouple;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3" aria-label="Główna">
          <Link href="/" aria-label="DUO – strona główna">
            <Logo />
          </Link>
          <div className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
            <a href="#jak-to-dziala" className="hover:text-forest">Jak to działa</a>
            <a href="#co-otrzymasz" className="hover:text-forest">Co otrzymasz</a>
            <a href="#co-dalej" className="hover:text-forest">Co dalej</a>
            <a href="#faq" className="hover:text-forest">Pytania</a>
          </div>
          <LinkButton href="#quiz" size="sm" variant="primary">Umów Audyt Relacji</LinkButton>
        </nav>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
            <div>
              <p className="animate-rise text-sm font-semibold uppercase tracking-[0.18em] text-clay">Audyt Relacji DUO™</p>
              <h1 className="animate-rise delay-1 mt-4 font-display text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.6rem]">
                Nie musisz dziś wiedzieć, czy zostać, czy odejść. <span className="text-forest">Zacznij od zrozumienia Waszej relacji.</span>
              </h1>
              <p className="animate-rise delay-2 mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Audyt Relacji to uporządkowana rozmowa z psychologiem, poprzedzona indywidualnym kwestionariuszem. Pomaga zobaczyć mechanizmy konfliktu, mocne strony i
                realne możliwości dalszych kroków.
              </p>
              <div className="animate-rise delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="#quiz" size="lg" variant="clay">
                  Umów Audyt Relacji <ArrowRight size={18} aria-hidden />
                </LinkButton>
                <LinkButton href="#jak-to-dziala" size="lg" variant="secondary">
                  Zobacz, jak to działa
                </LinkButton>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <li className="flex items-center gap-2"><Lock size={15} aria-hidden /> Poufnie, osobno dla każdej osoby</li>
                <li className="flex items-center gap-2"><Clock size={15} aria-hidden /> Jedna sesja online</li>
                <li className="flex items-center gap-2"><ShieldCheck size={15} aria-hidden /> Bez ocen i wyroków</li>
              </ul>
            </div>
            <div className="animate-rise delay-2 mx-auto w-full max-w-md md:max-w-none">
              <HeroArt />
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-5 pb-20">
            <h2 className="text-center text-sm font-medium text-muted">Co jest dziś najbliższe Twojej sytuacji?</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {INTENTS.map((i, n) => (
                <Link
                  key={i.value}
                  href={`/?intent=${i.value}#quiz`}
                  scroll={false}
                  className="group rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest"
                >
                  <span className="font-display text-sm text-clay">0{n + 1}</span>
                  <p className="mt-2 font-display text-xl leading-snug text-ink">„{i.title}”</p>
                  <p className="mt-2 text-sm text-muted">{i.sub}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest">
                    Zacznij od tego <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted">Wybór pomaga przygotować rozmowę. Nie przesądza o rekomendacji.</p>
          </div>
        </section>

        {/* BRZMI ZNAJOMO */}
        <section className="bg-forest text-white">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl">Czy któreś z tych zdań brzmi znajomo?</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "„Kłócimy się wciąż o to samo, a potem tygodniami nie rozmawiamy.”",
                "„Mieszkamy razem, a czuję się bardziej samotnie niż kiedykolwiek.”",
                "„Jedno z nas chce ratować związek, drugie jest jedną nogą za drzwiami.”",
                "„Myślę o rozstaniu, ale boję się, co to zrobi dzieciom.”",
              ].map((q) => (
                <blockquote key={q} className="rounded-2xl bg-white/8 p-6 font-display text-lg leading-snug ring-1 ring-white/15">{q}</blockquote>
              ))}
            </div>
            <p className="mt-10 max-w-2xl leading-relaxed text-white/85">
              W kryzysie łatwo o dwie skrajności: działać pochopnie albo latami tkwić w zawieszeniu. Audyt daje trzecią drogę – zatrzymać się, zobaczyć całość i dopiero
              wtedy zdecydować. Spokojnie, bez presji i bez wyroków.
            </p>
          </div>
        </section>

        {/* DLA KOGO */}
        <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="dla-kogo">
          <h2 id="dla-kogo" className="font-display text-3xl text-ink sm:text-4xl">Dla kogo jest Audyt Relacji?</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-7 shadow-soft ring-1 ring-sand">
              <p className="font-display text-xl text-forest">Dla pary</p>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Oboje chcecie zrozumieć, co się dzieje – nawet jeśli każde z Was jest w innym miejscu. Każda osoba wypełnia własny kwestionariusz, a podczas sesji jest też
                czas na krótką rozmowę z każdym z Was osobno. 90 minut.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-soft ring-1 ring-sand">
              <p className="font-display text-xl text-forest">Dla jednej osoby</p>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Partner lub partnerka nie chce przyjść, nie wie o audycie, a może wolisz najpierw sam lub sama uporządkować sytuację. Patrzymy na związek z Twojej
                perspektywy i szukamy tego, co zależy od Ciebie. 60 minut.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Związek trwający, który utknął", "Związek w kryzysie", "Para przed rozstaniem lub w jego trakcie"].map((t) => (
              <p key={t} className="flex items-center gap-3 rounded-xl bg-linen px-5 py-4 text-sm text-ink"><Check size={16} className="text-forest" aria-hidden /> {t}</p>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
            Audyt nie jest terapią par, diagnozą kliniczną ani prognozą trwałości związku. Nie jest też formą pomocy kryzysowej – jeśli grozi Ci niebezpieczeństwo, skorzystaj z
            numerów pomocy na dole strony.
          </p>
        </section>

        {/* JAK TO DZIAŁA */}
        <section id="jak-to-dziala" className="scroll-mt-20 bg-linen" aria-labelledby="jtd">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 id="jtd" className="font-display text-3xl text-ink sm:text-4xl">Jak to działa?</h2>
            <p className="mt-3 max-w-2xl text-ink-soft">Pięć prostych etapów – od pierwszego kliknięcia do konkretnych następnych kroków.</p>
            <ol className="mt-12 grid gap-5 md:grid-cols-5">
              {STEPS.map((st, i) => (
                <li key={st.t} className="relative rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
                  <StepIcon n={i + 1} />
                  <p className="mt-4 font-display text-lg leading-snug text-ink">{st.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{st.d}</p>
                  <p className="mt-3 text-xs font-medium text-clay">{st.meta}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {s.site.vslUrl && /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(s.site.vslUrl) && (
          <section className="mx-auto max-w-4xl px-5 py-20" aria-labelledby="vsl">
            <h2 id="vsl" className="text-center font-display text-3xl text-ink">Zobacz, jak pracujemy</h2>
            <div className="mt-8 aspect-video overflow-hidden rounded-2xl shadow-soft ring-1 ring-sand">
              <iframe src={s.site.vslUrl} title="Film: jak wygląda Audyt Relacji" className="h-full w-full" allow="fullscreen; picture-in-picture" loading="lazy" referrerPolicy="no-referrer" />
            </div>
          </section>
        )}

        {/* CO OTRZYMASZ */}
        <section id="co-otrzymasz" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20" aria-labelledby="co">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 id="co" className="font-display text-3xl text-ink sm:text-4xl">Co otrzymasz?</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Zamiast ogólnych porad – opis Waszej konkretnej sytuacji. Bez punktacji, bez procentów, bez obietnic gwarantowanego rezultatu. Za to z jasnością, od której
                można zacząć.
              </p>
              {price && (
                <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
                  <p className="text-sm text-muted">Cena</p>
                  {s.site.priceIndividual && <p className="mt-1 text-ink">Audyt indywidualny (60 min): <strong>{s.site.priceIndividual}</strong></p>}
                  {s.site.priceCouple && <p className="mt-1 text-ink">Audyt dla pary (90 min): <strong>{s.site.priceCouple}</strong></p>}
                  <p className="mt-2 text-xs text-muted">Obejmuje kwestionariusze, sesję online i pisemny raport.</p>
                </div>
              )}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {DELIVERABLES.map(({ i: Icon, t, d }) => (
                <li key={t} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
                  <Icon size={22} className="text-clay" aria-hidden />
                  <p className="mt-3 font-display text-lg text-ink">{t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CO DALEJ */}
        <section id="co-dalej" className="scroll-mt-20 bg-white" aria-labelledby="dalej">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 id="dalej" className="font-display text-3xl text-ink sm:text-4xl">Co może wydarzyć się dalej?</h2>
            <p className="mt-3 max-w-2xl text-ink-soft">Audyt kończy się propozycją jednej ze ścieżek. Rekomendacja jest propozycją – decyzja o dalszej drodze zawsze należy do Ciebie.</p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl bg-sage-soft/50 p-7 ring-1 ring-sage/40">
                <PathArt tone="forest" />
                <h3 className="mt-3 font-display text-2xl text-forest">A. Odbudowa relacji</h3>
                <p className="mt-1 text-sm text-muted">gdy oboje chcą spróbować</p>
                <ul className="mt-4 space-y-3 text-sm text-ink">
                  <li><strong>Terapia par</strong> – regularne sesje we dwoje: komunikacja, bliskość, zaufanie.</li>
                  <li><strong>Program odbudowy relacji</strong> – nagrane moduły online z ćwiczeniami, we własnym tempie.</li>
                </ul>
              </article>
              <article className="rounded-2xl bg-clay-soft/50 p-7 ring-1 ring-clay/25">
                <PathArt tone="clay" />
                <h3 className="mt-3 font-display text-2xl text-clay">B. Rozstanie z szacunkiem</h3>
                <p className="mt-1 text-sm text-muted">gdy decyzja o rozstaniu zapada lub dojrzewa</p>
                <ul className="mt-4 space-y-3 text-sm text-ink">
                  <li><strong>Konstruktywny rozwód</strong> – sesje dla pary, które uczą komunikacji i współpracy, współrodzicielstwa, gdy są dzieci, zgodnego rozwodu i porozumienia. Opcjonalnie: mediacja.</li>
                  <li><strong>Terapia po rozstaniu</strong> – sesje indywidualne, żeby dojść do siebie, gdy rozstanie jest bardzo trudne.</li>
                </ul>
              </article>
            </div>
            <p className="mt-5 rounded-2xl bg-linen px-6 py-4 text-sm text-ink">
              Możesz też <strong>na razie nie wybierać dalszej pracy</strong>. Raport zostaje z Tobą – wrócisz do niego, kiedy będziesz gotowy lub gotowa.
            </p>

            <article className="mt-10 rounded-2xl border border-alert/20 bg-ivory p-7" aria-labelledby="sciezka-c">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="md:w-1/2">
                  <PathArt tone="alert" />
                  <h3 id="sciezka-c" className="mt-3 font-display text-2xl text-alert">C. Pilne wsparcie i bezpieczeństwo</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Przy przemocy lub kryzysie psychicznym pierwszeństwo ma bezpieczeństwo: plan bezpieczeństwa i pomoc specjalistyczna – bez terapii par i bez mediacji.
                    To nie jest jedna z ofert, tylko zasada, której zawsze się trzymamy.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <p className="text-sm font-medium text-ink">Jeśli grozi Ci niebezpieczeństwo, nie czekaj na audyt:</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {s.helplines.items.map((h) => (
                      <li key={h.number}>
                        <a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-display text-lg font-semibold text-forest">{h.number}</a>
                        <span className="text-ink-soft"> – {h.when}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">Poza Polską: lokalny numer alarmowy kraju pobytu (w UE 112) lub najbliższy szpitalny oddział ratunkowy.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* POUFNOŚĆ */}
        <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="poufnosc">
          <h2 id="poufnosc" className="font-display text-3xl text-ink sm:text-4xl">Zasady poufności</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Osobno dla każdej osoby", "W audycie pary każde z Was ma własny link i kod dostępu. Odpowiedzi jednej osoby nie są pokazywane drugiej."],
              ["Tajemnica zawodowa", "Psycholog nie ujawnia treści jednej osoby drugiej bez zgody, z wyjątkiem sytuacji przewidzianych prawem."],
              ["Bez nagrywania", "Sesji nie nagrywamy ani nie transkrybujemy. Nie przekazujemy odpowiedzi do narzędzi analitycznych ani reklamowych."],
              ["Raport tylko dla Was", "Raport trafia wyłącznie do osób uczestniczących – po zatwierdzeniu przez psychologa, nigdy automatycznie."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
                <Lock size={20} className="text-forest" aria-hidden />
                <p className="mt-3 font-display text-lg text-ink">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {therapists.length > 0 && (
          <section className="bg-linen" aria-labelledby="zespol">
            <div className="mx-auto max-w-6xl px-5 py-20">
              <h2 id="zespol" className="font-display text-3xl text-ink sm:text-4xl">Kto prowadzi audyt</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {therapists.map((t) => (
                  <div key={t.display_name} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
                    <p className="font-display text-xl text-ink">{t.display_name}</p>
                    <p className="text-sm text-clay">{t.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20" aria-labelledby="faq-h">
          <h2 id="faq-h" className="font-display text-3xl text-ink sm:text-4xl">Najczęstsze pytania</h2>
          <div className="mt-8 divide-y divide-sand rounded-2xl bg-white shadow-soft ring-1 ring-sand">
            {s.site.faq.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {f.q}
                  <span className="text-clay transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* QUIZ */}
        <section id="quiz" className="scroll-mt-16 bg-gradient-to-b from-ivory to-linen" aria-labelledby="quiz-h">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-clay">Pierwszy krok</p>
            <h2 id="quiz-h" className="mt-3 text-center font-display text-3xl text-ink sm:text-4xl">Opowiedz nam krótko, co się dzieje</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
              Sześć krótkich pytań i kontakt. Oddzwonimy, wyjaśnimy wszystko spokojnie i razem zdecydujemy, czy audyt to dobry krok teraz.
            </p>
            <div className="mt-10">
              <Quiz initialIntent={initialIntent} consentText={s.legal.leadContactConsent} marketingText={s.legal.leadMarketingConsent} helplines={s.helplines.items} />
            </div>
            {s.site.contactPhone && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
                <Phone size={15} aria-hidden /> Wolisz zadzwonić? <a href={`tel:${s.site.contactPhone.replace(/\s/g, "")}`} className="font-medium text-forest">{s.site.contactPhone}</a>
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-forest-800 text-white/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed">Zrozum, co naprawdę dzieje się w Twojej relacji – i świadomie zdecyduj, co dalej.</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Pilna pomoc</p>
            <ul className="mt-3 space-y-1.5">
              {s.helplines.items.map((h) => (
                <li key={h.number}><a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-semibold text-white">{h.number}</a> – {h.when.split("(")[0]}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/60">{s.helplines.disclaimer}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Informacje</p>
            <ul className="mt-3 space-y-1.5">
              <li><Link href="/prywatnosc" className="hover:text-white">Polityka prywatności</Link></li>
              {s.site.contactEmail && <li><a href={`mailto:${s.site.contactEmail}`} className="hover:text-white">{s.site.contactEmail}</a></li>}
              <li><Link href="/app" className="hover:text-white">Panel specjalisty</Link></li>
            </ul>
            <p className="mt-6 text-xs text-white/50">DUO™ · Audyt Relacji. Konsultacja psychologiczna – nie terapia, nie diagnoza, nie pomoc kryzysowa.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
