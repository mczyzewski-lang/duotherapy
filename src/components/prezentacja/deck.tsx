// Prezentacja webinaru i reklamy Meta dla psychologów (Nowy Etap). Wewnętrzny materiał roboczy.
import clsx from "clsx";
import { ADS, DECK, FUNNEL, HOOKS, SLIDES, type Ad, type Block, type Slide } from "@/content/prezentacja-psycholodzy";

const serif = "font-serif";

function BlockView({ b, dark }: { b: Block; dark?: boolean }) {
  switch (b.t) {
    case "h":
      return <h3 className={clsx(serif, "text-balance text-[1.75rem] font-medium leading-[1.12] sm:text-[2.35rem]", dark ? "text-[#faf7f1]" : "text-[#16291f]")}>{b.text}</h3>;
    case "lead":
      return <p className={clsx("text-pretty text-lg leading-snug sm:text-[1.35rem]", dark ? "text-[#e8dcc0]" : "text-[#1f3b30]")}>{b.text}</p>;
    case "p":
      return <p className={clsx("text-pretty text-[15px] leading-relaxed sm:text-[17px]", dark ? "text-[#faf7f1]/80" : "text-[#3d4a43]")}>{b.text}</p>;
    case "strong":
      return <p className="text-[17px] font-semibold text-[#16291f] sm:text-lg">{b.text}</p>;
    case "list":
      return (
        <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
          {b.items.map((x) => (
            <li key={x} className="flex items-start gap-3 text-[15px] leading-snug text-[#26352c] sm:text-[17px]">
              <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b4975a]" aria-hidden />
              {x}
            </li>
          ))}
        </ul>
      );
    case "quotes":
      return (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {b.items.map((x) => (
            <p key={x} className={clsx(serif, "rounded-2xl border border-[#e3d8c2] bg-white px-4 py-3 text-[17px] italic leading-snug text-[#1f3b30]")}>„{x}”</p>
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote className={clsx(serif, "border-l-2 border-[#b4975a] pl-4 italic leading-snug", b.big ? "text-[1.35rem] text-[#16291f] sm:text-[1.7rem]" : "text-lg text-[#3d4a43] sm:text-xl")}>
          „{b.text}”
        </blockquote>
      );
    case "flow": {
      if (b.dir === "right")
        return (
          <ol className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
            {b.items.map((x, i) => (
              <li key={x} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <span className={clsx("rounded-full px-4 py-2 text-[15px] leading-tight sm:text-base",
                  i === b.items.length - 1 ? "bg-[#1f3b30] text-[#faf7f1]" : "bg-[#f2ece0] text-[#1f3b30] ring-1 ring-[#e3d8c2]")}>{x}</span>
                {i < b.items.length - 1 && <span className="pl-5 text-[#b4975a] sm:pl-0" aria-hidden><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>}
              </li>
            ))}
          </ol>
        );
      // Schodki: każdy kolejny krok niżej i dalej – eskalacja widoczna na pierwszy rzut oka.
      return (
        <ol className="space-y-1.5">
          {b.items.map((x, i) => (
            <li key={x} className="flex items-center gap-2" style={{ paddingLeft: `min(${i * 2.25}rem, ${i * 6}vw)` }}>
              {i > 0 && <span className="text-[#b4975a]" aria-hidden>↳</span>}
              <span className={clsx("rounded-full px-4 py-1.5 text-[15px] leading-tight sm:text-base",
                i === b.items.length - 1 ? "bg-[#1f3b30] text-[#faf7f1]" : "bg-[#f2ece0] text-[#1f3b30] ring-1 ring-[#e3d8c2]")}>{x}</span>
            </li>
          ))}
        </ol>
      );
    }
    case "vs":
      return (
        <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
          <p className={clsx(serif, "rounded-2xl bg-[#f2ece0] p-4 text-lg leading-snug text-[#16291f] sm:p-5 sm:text-xl")}>{b.a}</p>
          <span className="self-center justify-self-center text-xs font-semibold uppercase tracking-[0.25em] text-[#b4975a]">vs.</span>
          <p className={clsx(serif, "rounded-2xl bg-[#1f3b30] p-4 text-lg leading-snug text-[#faf7f1] sm:p-5 sm:text-xl")}>{b.b}</p>
        </div>
      );
    case "cols":
      return (
        <div className={clsx("grid gap-3", b.cols.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {b.cols.map((c) => (
            <div key={c.title} className="rounded-2xl border border-[#e3d8c2] bg-white p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7d43]">{c.title}</p>
              <ul className="mt-2 space-y-1">
                {c.items.map((x) => <li key={x} className="text-[15px] leading-snug text-[#26352c] sm:text-base">{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="grid gap-2.5">
          {b.items.map((x, i) => (
            <li key={x} className="flex items-start gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-[#e3d8c2] sm:p-4">
              <span className={clsx(serif, "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f3b30] text-lg text-[#e8dcc0]")}>{i + 1}</span>
              <span className="pt-1.5 text-[15px] leading-snug text-[#16291f] sm:text-[17px]">{x}</span>
            </li>
          ))}
        </ol>
      );
    case "pills":
      return (
        <ul className="flex flex-wrap gap-2">
          {b.items.map((x) => <li key={x} className="rounded-full bg-[#f2ece0] px-4 py-1.5 text-[15px] text-[#1f3b30] ring-1 ring-[#e3d8c2]">{x}</li>)}
        </ul>
      );
    case "note":
      return <p className={clsx("text-sm leading-relaxed", dark ? "text-[#e8dcc0]/80" : "text-[#6b6a5f]")}>{b.text}</p>;
    case "highlight":
      return <p className={clsx(serif, "rounded-2xl bg-[#1f3b30] px-5 py-4 text-lg leading-snug text-[#faf7f1] sm:text-[1.35rem]")}>{b.text}</p>;
    case "cta":
      return (
        <span className="inline-flex min-h-14 items-center justify-center self-start rounded-full bg-[#b4975a] px-7 text-[15px] font-semibold uppercase tracking-[0.12em] text-[#16291f]">
          {b.label}
        </span>
      );
  }
}

function SlideView({ s }: { s: Slide }) {
  const dark = s.title || s.n === 28;
  return (
    <section
      id={`slajd-${s.n}`}
      aria-label={`Slajd ${s.n}`}
      className={clsx(
        "np-slide relative isolate flex flex-col rounded-[1.75rem] px-6 py-8 shadow-[0_1px_2px_rgba(22,41,31,.05),0_18px_40px_-24px_rgba(22,41,31,.35)] sm:px-12 sm:py-12 lg:aspect-[16/9] lg:px-16",
        dark ? "bg-[#16291f]" : "border border-[#ece4d4] bg-[#fdfbf7]",
      )}
      data-testid="slide"
    >
      <header className="mb-6 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]">
        <span className={dark ? "text-[#b4975a]" : "text-[#9a7d43]"}>{s.tag ?? (s.title ? DECK.kicker : "Nowy Etap · webinar")}</span>
        <span className={dark ? "text-[#faf7f1]/50" : "text-[#16291f]/40"}>{String(s.n).padStart(2, "0")} / {SLIDES.length}</span>
      </header>
      <div className={clsx("flex flex-1 flex-col justify-center gap-4 sm:gap-5", s.title && "max-w-4xl")}>
        {s.title ? (
          <>
            <p className="text-lg text-[#e8dcc0] sm:text-2xl">Twój pacjent mówi:</p>
            <h2 className={clsx(serif, "text-balance text-[2.6rem] font-medium leading-[1.02] text-[#faf7f1] sm:text-[4.4rem]")}>„chyba chcę się rozwieść”</h2>
            <p className="max-w-2xl text-lg leading-snug text-[#faf7f1]/85 sm:text-[1.45rem]">{DECK.subtitle}</p>
            <p className="mt-2 inline-flex max-w-2xl border-t border-[#b4975a]/50 pt-4 text-[15px] leading-snug text-[#e8dcc0] sm:text-lg">{DECK.tagline}</p>
          </>
        ) : (
          s.blocks.map((b, i) => <BlockView key={i} b={b} dark={dark && b.t !== "highlight"} />)
        )}
      </div>
      {s.title && (
        <footer className="mt-8 grid gap-1 text-sm text-[#faf7f1]/70 sm:grid-cols-2 sm:gap-6">
          <p><span className="text-[#b4975a]">Format:</span> {DECK.format}</p>
          <p><span className="text-[#b4975a]">Prowadzący:</span> {DECK.hosts}</p>
        </footer>
      )}
      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]" aria-hidden>
        <span className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-[#b4975a]/20" />
      </span>
    </section>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="np-divider flex items-center gap-4 py-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-[#d8c8a4]" />
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a7d43]">{label}</span>
      <span className="h-px flex-1 bg-[#d8c8a4]" />
    </div>
  );
}

export function Presentation() {
  return (
    <div className="np-deck space-y-6 sm:space-y-8">
      <div className="np-cover-meta rounded-[1.75rem] border border-[#ece4d4] bg-white/70 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9a7d43]">{DECK.kicker}</p>
        <h1 className={clsx(serif, "mt-2 text-balance text-3xl font-medium leading-tight text-[#16291f] sm:text-[2.6rem]")}>{DECK.title}</h1>
        <p className="mt-2 text-lg text-[#1f3b30]">{DECK.subtitle}</p>
        <p className="mt-1 text-[15px] text-[#3d4a43]">{DECK.tagline}</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="font-semibold text-[#16291f]">Format</dt><dd className="text-[#3d4a43]">{DECK.format}</dd></div>
          <div><dt className="font-semibold text-[#16291f]">Prowadzący</dt><dd className="text-[#3d4a43]">{DECK.hosts}</dd></div>
          <div><dt className="font-semibold text-[#16291f]">Slajdy</dt><dd className="text-[#3d4a43]">{SLIDES.length} · 7 sytuacji · model współpracy · partnerstwo</dd></div>
        </dl>
      </div>
      {SLIDES.map((s) => (
        <div key={s.n} className="space-y-6 sm:space-y-8">
          {s.divider && <Divider label={s.divider} />}
          <SlideView s={s} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- REKLAMY ---------------- */

function CreativeBox({ c }: { c: NonNullable<Ad["creative"]> }) {
  return (
    <div className="flex aspect-square flex-col justify-between rounded-2xl bg-[#16291f] p-6 text-[#faf7f1] sm:p-8">
      <div className="space-y-3">
        {c.kicker && <p className="text-lg text-[#e8dcc0]">{c.kicker}</p>}
        <p className={clsx(serif, "text-balance text-[1.9rem] font-medium leading-[1.08] sm:text-[2.3rem]")}>{c.big}</p>
        {c.small && <p className="text-[15px] leading-snug text-[#faf7f1]/80">{c.small}</p>}
      </div>
      {c.badge && <span className="self-start rounded-full bg-[#b4975a] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#16291f]">{c.badge}</span>}
    </div>
  );
}

export function AdCard({ ad }: { ad: Ad }) {
  return (
    <article className="rounded-[1.75rem] border border-[#ece4d4] bg-[#fdfbf7] p-5 sm:p-8" data-testid="ad">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a7d43]">Reklama {ad.n} – {ad.name}</p>
      <div className={clsx("mt-4 grid gap-6", ad.creative && "lg:grid-cols-[minmax(0,22rem)_1fr]")}>
        {ad.creative && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b6a5f]">Tekst na kreacji</p>
            <CreativeBox c={ad.creative} />
          </div>
        )}
        <div className="space-y-4">
          {ad.headline && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b6a5f]">Headline</p>
              <p className={clsx(serif, "mt-1 text-balance text-2xl leading-tight text-[#16291f]")}>{ad.headline}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b6a5f]">Primary text</p>
            <div className="mt-2 space-y-2.5 rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-[#26352c] ring-1 ring-[#ece4d4]">
              {ad.primary.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b6a5f]">CTA</span>
            <span className="rounded-lg bg-[#1f3b30] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-[#faf7f1]">{ad.cta}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MainAds() {
  return <div className="space-y-6">{ADS.map((a) => <AdCard key={a.n} ad={a} />)}</div>;
}

export function Hooks() {
  return (
    <div>
      <p className="mb-4 text-[15px] text-[#3d4a43]">Dodatkowe hooki do testów A/B.</p>
      <ol className="grid gap-3 sm:grid-cols-2">
        {HOOKS.map((h, i) => (
          <li key={h} className="flex gap-4 rounded-2xl border border-[#ece4d4] bg-[#fdfbf7] p-5" data-testid="hook">
            <span className={clsx(serif, "text-2xl text-[#b4975a]")}>{i + 1}</span>
            <span className={clsx(serif, "text-lg leading-snug text-[#16291f]")}>{h}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Concept({ letter, title, note, children }: { letter: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-[1.75rem] border border-[#ece4d4] bg-[#fdfbf7] p-4 sm:p-5" data-testid="concept">
      <div className="aspect-square overflow-hidden rounded-2xl">{children}</div>
      <figcaption className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a7d43]">Koncept kreacji {letter}</p>
        <p className="mt-0.5 text-[15px] font-medium text-[#16291f]">{title}</p>
        {note && <p className="mt-0.5 text-sm text-[#6b6a5f]">{note}</p>}
      </figcaption>
    </figure>
  );
}

const badge = "rounded-full bg-[#b4975a] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#16291f]";

export function Creatives() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Concept letter="A" title="Zdjęcie Kamila + cytat" note="Miejsce na zdjęcie Kamila (portret, naturalne światło, bez gabinetowego „prawniczego” tła).">
        <div className="relative flex h-full flex-col justify-end bg-[#16291f] p-6">
          <div className="absolute inset-y-0 right-0 flex w-[46%] items-center justify-center border-l border-dashed border-[#b4975a]/40 bg-[linear-gradient(160deg,#2a4a3c,#16291f)] text-center text-xs uppercase tracking-[0.18em] text-[#e8dcc0]/60">
            Zdjęcie<br />Kamila
          </div>
          <div className="relative max-w-[56%] space-y-3">
            <p className={clsx(serif, "text-[1.7rem] leading-[1.05] text-[#faf7f1]")}>„Chyba chcę się rozwieść.”</p>
            <p className="text-[13px] leading-snug text-[#faf7f1]/80">7 rzeczy, które psycholog powinien wiedzieć, zanim pacjent zrobi pierwszy krok.</p>
            <span className={clsx(badge, "inline-block whitespace-nowrap")}>Bezpłatny webinar</span>
          </div>
        </div>
      </Concept>
      <Concept letter="B" title="Split-screen: psychologia vs. prawo">
        <div className="relative grid h-full grid-cols-2">
          <div className="flex items-start justify-center bg-[#f2ece0] pt-8"><span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1f3b30]">Psychologia</span></div>
          <div className="flex items-start justify-center bg-[#1f3b30] pt-8"><span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e8dcc0]">Prawo</span></div>
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-[#fdfbf7] p-4 text-center shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7d43]">vs.</p>
            <p className={clsx(serif, "mt-1 text-xl leading-tight text-[#16291f]")}>A co dzieje się pomiędzy?</p>
          </div>
          <p className="absolute inset-x-6 bottom-5 rounded-xl bg-[#b4975a] px-3 py-2 text-center text-[12px] font-semibold leading-snug text-[#16291f]">
            Bezpłatny webinar dla psychologów i psychoterapeutów
          </p>
        </div>
      </Concept>
      <Concept letter="C" title="Notatka z gabinetu">
        <div className="flex h-full flex-col justify-between bg-[#f6f0e3] p-6" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 29px, rgba(180,151,90,.25) 29px, rgba(180,151,90,.25) 30px)" }}>
          <div className="space-y-1.5">
            {["Chyba chcę się rozwieść.", "Co mam powiedzieć dzieciom?", "Składać już pozew?", "On na pewno się nie zgodzi."].map((q, i) => (
              <p key={q} className={clsx(serif, "italic leading-[30px] text-[#1f3b30]", i === 0 ? "text-xl" : "text-[17px]")}>„{q}”</p>
            ))}
          </div>
          <p className="rounded-xl bg-[#1f3b30] p-3 text-[14px] font-medium leading-snug text-[#faf7f1]">Kiedy klient potrzebuje również innej kompetencji?</p>
        </div>
      </Concept>
      <Concept letter="D" title="Mocne stwierdzenie">
        <div className="flex h-full flex-col justify-between bg-[#fdfbf7] p-6 ring-1 ring-inset ring-[#ece4d4]">
          <p className={clsx(serif, "text-[1.8rem] leading-[1.08] text-[#16291f]")}>Psycholog nie musi znać prawa rozwodowego.</p>
          <div className="space-y-4">
            <p className="text-[15px] leading-snug text-[#3d4a43]">Ale powinien wiedzieć, kiedy klient potrzebuje prawnika lub mediatora.</p>
            <span className="inline-block rounded-lg bg-[#1f3b30] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#faf7f1]">Bezpłatny webinar</span>
          </div>
        </div>
      </Concept>
      <Concept letter="E" title="7 sytuacji przed rozwodem">
        <div className="flex h-full flex-col justify-between bg-[#1f3b30] p-6">
          <p className={clsx(serif, "text-[2.1rem] leading-[1.02] text-[#faf7f1]")}>7 sytuacji przed rozwodem</p>
          <div className="flex items-center justify-between gap-1 text-center">
            {["emocje", "mediacja", "prawo"].map((x, i) => (
              <span key={x} className="contents">
                {i > 0 && <span className="text-[#b4975a]">×</span>}
                <span className="flex-1 rounded-full border border-[#b4975a]/60 px-2 py-2 text-[13px] text-[#e8dcc0]">{x}</span>
              </span>
            ))}
          </div>
          <span className={clsx(badge, "self-start")}>Webinar dla psychologów</span>
        </div>
      </Concept>
    </div>
  );
}

export function Strategy() {
  return (
    <section className="rounded-[1.75rem] bg-[#16291f] p-6 text-[#faf7f1] sm:p-10" data-testid="strategy" aria-labelledby="strategia">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b4975a]">Ważne założenie funnelu</p>
      <h2 id="strategia" className={clsx(serif, "mt-2 text-3xl leading-tight sm:text-4xl")}>Najpierw wartość. Potem relacja.</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#faf7f1]/15 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#faf7f1]/60">Nie reklamujemy</p>
          <p className={clsx(serif, "mt-2 text-lg italic text-[#faf7f1]/70 line-through decoration-[#b4975a]/70")}>„Dołącz do programu partnerskiego Nowego Etapu.”</p>
        </div>
        <div className="rounded-2xl bg-[#faf7f1]/[.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b4975a]">Pierwszy cel</p>
          <p className={clsx(serif, "mt-2 text-2xl")}>wartość → zaufanie → relacja</p>
        </div>
      </div>
      <ol className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {FUNNEL.map((x, i) => (
          <li key={x} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className={clsx("rounded-full px-4 py-2 text-[14px] leading-tight", i === FUNNEL.length - 1 ? "bg-[#b4975a] font-semibold text-[#16291f]" : "bg-[#faf7f1]/10 text-[#faf7f1]")}>
              <span className={clsx("mr-2", i === FUNNEL.length - 1 ? "text-[#16291f]/60" : "text-[#b4975a]")}>{i + 1}.</span>{x}
            </span>
            {i < FUNNEL.length - 1 && <span className="pl-5 text-[#b4975a] sm:pl-0" aria-hidden><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>}
          </li>
        ))}
      </ol>
      <blockquote className="mt-10 border-l-2 border-[#b4975a] pl-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b4975a]">Najważniejsza zasada</p>
        <p className={clsx(serif, "mt-2 text-xl leading-snug sm:text-2xl")}>
          Pierwszą transakcją psychologa z Nowym Etapem nie ma być polecenie klienta. Pierwszą transakcją ma być oddanie nam godziny uwagi i dojście do wniosku:{" "}
          <em className="text-[#e8dcc0]">„Ci ludzie rozumieją mojego klienta i nie będą niepotrzebnie eskalować jego sytuacji.”</em>
        </p>
      </blockquote>
    </section>
  );
}
