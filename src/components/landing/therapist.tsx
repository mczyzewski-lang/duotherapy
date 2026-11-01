// Sekcja „Kim jestem i jak pomagam” – psychoterapeutka prowadząca.
// Treść na podstawie opisu przekazanego przez Klaudię Bosek (skrócona).

const STATS = [
  ["+10 lat", "doświadczenia klinicznego"],
  ["1000+", "godzin pracy terapeutycznej"],
  ["online", "cała Polska"],
] as const;

const METHODS = ["Psychoterapia", "CBT i ACT", "Terapia schematów", "Teoria więzi"];

export function TherapistSection() {
  return (
    <section id="o-mnie" className="scroll-mt-20 bg-linen" aria-labelledby="o-mnie-h">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <figure className="relative mx-auto w-full max-w-sm md:max-w-none">
          <div className="absolute -inset-3 -z-0 rounded-[2rem] bg-gradient-to-br from-clay-soft via-sand to-sage-soft" aria-hidden />
          <img
            src="/img/klaudia-bosek.avif"
            alt="Klaudia Bosek – psycholog i psychoterapeutka relacji"
            width={1122}
            height={1402}
            loading="lazy"
            className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-soft"
          />
          <figcaption className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm text-ink shadow-soft ring-1 ring-sand">
            Klaudia Bosek · psychoterapeutka relacji
          </figcaption>
        </figure>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Kto pomaga?</p>
          <h2 id="o-mnie-h" className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Nazywam się Klaudia Bosek. Jestem psychologiem i psychoterapeutką relacji.
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
            <p>
              Pracuję z osobami w kryzysie związku, przed rozstaniem i po nim. Razem przyglądamy się emocjom, komunikacji i
              utrwalonym wzorcom, które prowadzą do oddalenia i powtarzających się konfliktów, żeby można było świadomie z nich wyjść.
            </p>
            <p>
              Ukończyłam 4-letnie szkolenie psychoterapeutyczne rekomendowane przez Polskie Towarzystwo Psychiatryczne (jestem w trakcie certyfikacji), a swoją pracę poddaję
              regularnej superwizji. Współtworzę Centrum Kryzysu Relacyjnego i Psychoterapii, współpracujące z prawnikami – dzięki temu wsparcie może być zarówno emocjonalne,
              jak i formalne.
            </p>
          </div>
          <blockquote className="mt-6 rounded-2xl bg-white p-5 font-display text-xl leading-snug text-ink shadow-soft ring-1 ring-sand">
            „Nie jesteśmy tu po stronie męża ani żony. Jesteśmy po stronie lepszego zrozumienia Waszej sytuacji.”
          </blockquote>

          <ul className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map(([v, l]) => (
              <li key={v}>
                <span className="block font-display text-3xl font-semibold text-clay sm:text-4xl">{v}</span>
                <span className="mt-1 block text-sm leading-snug text-ink-soft">{l}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Metody pracy">
            {METHODS.map((m) => (
              <li key={m} className="rounded-full bg-gradient-to-b from-[#3a302b] to-[#251e1a] px-5 py-2.5 text-sm font-medium text-white shadow-soft ring-1 ring-sand/40">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
