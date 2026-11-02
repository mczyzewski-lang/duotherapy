// Sekcja „Kto pomaga” – psychoterapeutka prowadząca.
// Treść wyłącznie na podstawie opisu przekazanego przez Klaudię Bosek (bez dopisanych referencji).
import { Check } from "lucide-react";

const STATS = [
  ["+10 lat", "doświadczenia klinicznego"],
  ["1000+", "godzin pracy terapeutycznej"],
  ["online", "cała Polska"],
] as const;

const CREDENTIALS = [
  "4-letnie szkolenie psychoterapeutyczne rekomendowane przez Polskie Towarzystwo Psychiatryczne (w trakcie certyfikacji)",
  "Regularna superwizja własnej pracy",
  "Współtworzy Centrum Kryzysu Relacyjnego i Psychoterapii, współpracujące z prawnikami",
];

const METHODS = ["Psychoterapia", "CBT i ACT", "Terapia schematów", "Teoria więzi"];

export function TherapistSection() {
  return (
    <section id="o-mnie" className="scroll-mt-20 bg-linen" aria-labelledby="o-mnie-h">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-24">
        <figure className="relative mx-auto w-full max-w-[19rem] md:max-w-none">
          <div className="absolute -inset-3 -z-0 rounded-[2rem] bg-gradient-to-br from-clay-soft via-sand to-sage-soft" aria-hidden />
          <img
            src="/img/klaudia-bosek.avif"
            alt="Klaudia Bosek – psycholog i psychoterapeutka relacji"
            width={1122}
            height={1402}
            loading="lazy"
            className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-soft"
          />
        </figure>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Kto pomaga?</p>
          <h2 id="o-mnie-h" className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">Klaudia Bosek</h2>
          <p className="mt-1 text-lg text-ink-soft">Psycholog i psychoterapeutka relacji</p>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Pracuję z osobami w kryzysie związku, przed rozstaniem i po nim. Pomagam zobaczyć emocje, komunikację i wzorce, które prowadzą do oddalenia i powtarzających się
            konfliktów – żeby można było świadomie z nich wyjść.
          </p>

          <ul className="mt-6 space-y-2.5">
            {CREDENTIALS.map((c) => (
              <li key={c} className="flex gap-3 text-[15px] leading-snug text-ink">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={13} aria-hidden /></span>
                {c}
              </li>
            ))}
          </ul>

          <ul className="mt-7 grid grid-cols-3 gap-4 border-y border-sand py-5">
            {STATS.map(([v, l]) => (
              <li key={v}>
                <span className="block font-display text-[1.75rem] font-semibold leading-none text-clay sm:text-4xl">{v}</span>
                <span className="mt-1.5 block text-[13px] leading-snug text-ink-soft sm:text-sm">{l}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Metody pracy">
            {METHODS.map((m) => (
              <li key={m} className="rounded-full bg-gradient-to-b from-[#3a302b] to-[#251e1a] px-4 py-2 text-sm font-medium text-white shadow-soft">
                {m}
              </li>
            ))}
          </ul>

          <blockquote className="mt-7 border-l-2 border-clay pl-4 font-display text-xl leading-snug text-ink">
            „Nie jesteśmy tu po stronie męża ani żony. Jesteśmy po stronie lepszego zrozumienia Waszej sytuacji.”
          </blockquote>
        </div>
      </div>
    </section>
  );
}
