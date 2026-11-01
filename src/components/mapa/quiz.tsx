"use client";

// Quiz „Mapa Relacji”: 6 pytań, jedno na ekran, automatyczne przejście, wstępne podsumowanie i prośba o telefon.
// Wstępne podsumowanie to wyłącznie parafraza odpowiedzi – bez ocen, prognoz i diagnoz.
import clsx from "clsx";
import { ArrowLeft, Check, Compass, Loader2, MessagesSquare, Phone, Route, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitLead } from "@/app/actions/lead";
import { Alert } from "@/components/ui";
import { PREFERRED_TIMES, QUIZ, summaryFor, type QuizAnswers } from "@/lib/mapa-quiz";
import { anonId, attribution, captureAttribution, track } from "@/lib/track-client";

type Phase = "questions" | "summary" | "done";

export function MapaQuiz({ consentText, marketingText, callbackPromise }: { consentText: string; marketingText: string; callbackPromise: string }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [phase, setPhase] = useState<Phase>("questions");
  const started = useRef(false);
  const advancing = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    captureAttribution();
    if (!started.current) {
      started.current = true;
      track("quiz_started");
    }
  }, []);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [i, phase]);

  const q = QUIZ[i];
  const choose = (value: string) => {
    if (advancing.current) return;
    advancing.current = true;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    track("quiz_step_completed", i + 1);
    // krótka pauza, żeby wybór był widoczny, potem automatyczne przejście
    setTimeout(() => {
      advancing.current = false;
      if (i < QUIZ.length - 1) setI(i + 1);
      else {
        track("quiz_completed");
        setPhase("summary");
      }
    }, 260);
  };

  if (phase === "done") return <Done callbackPromise={callbackPromise} />;
  if (phase === "summary")
    return <Summary answers={answers} consentText={consentText} marketingText={marketingText} onBack={() => { setPhase("questions"); setI(QUIZ.length - 1); }} onDone={() => setPhase("done")} headingRef={headingRef} />;

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <div className="px-5 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Pytanie {i + 1} z {QUIZ.length}</span>
          <span className="text-muted">ok. 2 minuty</span>
        </div>
        <div className="mt-2.5 flex gap-1.5" role="progressbar" aria-label="Postęp quizu" aria-valuemin={1} aria-valuemax={QUIZ.length} aria-valuenow={i + 1}>
          {QUIZ.map((x, k) => (
            <span key={x.id} className={clsx("h-1.5 flex-1 rounded-full transition-colors duration-500", k <= i ? "bg-forest" : "bg-sand")} />
          ))}
        </div>
      </div>

      <div key={q.id} className="mx-auto w-full max-w-xl flex-1 animate-rise px-5 pb-6 pt-7">
        {q.note && (
          <p className="mb-5 flex items-start gap-2 rounded-2xl bg-sage-soft/70 px-4 py-3 text-sm leading-snug text-forest-800">
            <Compass size={16} className="mt-0.5 shrink-0" aria-hidden /> {q.note}
          </p>
        )}
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[1.7rem] leading-tight text-ink outline-none sm:text-3xl">
          {q.title}
        </h1>
        {q.hint && <p className="mt-2 text-sm text-muted">{q.hint}</p>}
        <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label={q.title}>
          {q.options.map((o) => {
            const on = answers[q.id] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(o.value)}
                className={clsx(
                  "flex min-h-[3.75rem] w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[16px] leading-snug ring-1 transition active:scale-[0.99]",
                  on ? "bg-forest text-white ring-forest shadow-soft" : "bg-white text-ink ring-sand-dark hover:ring-forest",
                )}
              >
                <span className={clsx("grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1", on ? "bg-white text-forest ring-white" : "ring-sand-dark")}>
                  {on && <Check size={14} aria-hidden />}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-sand/60 bg-ivory/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-forest disabled:opacity-30">
            <ArrowLeft size={17} aria-hidden /> Wstecz
          </button>
          <span className="text-xs text-muted">Bez rejestracji · bez oceniania</span>
        </div>
      </div>
    </div>
  );
}

function Summary({
  answers,
  consentText,
  marketingText,
  onBack,
  onDone,
  headingRef,
}: {
  answers: QuizAnswers;
  consentText: string;
  marketingText: string;
  onBack: () => void;
  onDone: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { lead, points } = summaryFor(answers);
  const [f, setF] = useState({ name: "", phone: "", email: "", preferredTime: "", contactConsent: false, marketingConsent: false, website: "" });
  const [err, setErr] = useState<{ text: string; field?: string } | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    let seen = false;
    const io = new IntersectionObserver((e) => {
      if (!seen && e.some((x) => x.isIntersecting)) {
        seen = true;
        track("lead_form_viewed");
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    start(async () => {
      try {
        const r = await submitLead({
          name: f.name,
          phone: f.phone,
          email: f.email,
          preferredTime: f.preferredTime as never,
          contactConsent: f.contactConsent as true,
          marketingConsent: f.marketingConsent,
          answers: answers as Record<string, string>,
          attribution: attribution() as Record<string, string>,
          anonId: anonId(),
          startedAt: shownAt.current,
          website: f.website,
        });
        if (r.ok) onDone();
        else {
          setErr({ text: r.error, field: r.field });
          track("lead_submission_error");
        }
      } catch {
        setErr({ text: "Nie udało się wysłać. Sprawdź połączenie z internetem i spróbuj ponownie." });
        track("lead_submission_error");
      }
    });
  };

  const fieldErr = (k: string) => (err?.field === k ? err.text : undefined);
  const input = "w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-sand-dark placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-forest";

  return (
    <div className="mx-auto w-full max-w-xl animate-rise px-5 pb-16 pt-6">
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-forest">
        <ArrowLeft size={16} aria-hidden /> Wróć do pytań
      </button>
      <section aria-labelledby="sum-h" className="mt-3 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-forest"><Check size={13} aria-hidden /> 6 z 6 odpowiedzi</p>
        <h1 id="sum-h" ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[1.8rem] leading-tight text-ink outline-none">Pierwszy krok już za Tobą</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink">{lead}</p>
        {points.length > 0 && (
          <ul className="mt-4 space-y-2">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5 text-[15px] leading-snug text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden />{p}</li>
            ))}
          </ul>
        )}
        <p className="mt-5 border-t border-sand pt-4 text-xs leading-relaxed text-muted">To jedynie wstępne podsumowanie Twoich odpowiedzi – nie diagnoza ani gotowa Mapa Relacji.</p>
        <a href="#form-h" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-5 text-[15px] font-medium text-white">
          <Phone size={16} aria-hidden /> Porozmawiajmy o Twojej Mapie Relacji
        </a>
      </section>

      <section aria-labelledby="gain-h" className="mt-8">
        <h2 id="gain-h" className="font-display text-2xl text-ink">Co może dać Ci pełna Mapa Relacji?</h2>
        <ul className="mt-4 grid gap-3">
          {(
            [
              [Route, "Zrozumienie", "Uporządkowanie najważniejszych problemów i potrzeb."],
              [MessagesSquare, "Perspektywa", "Profesjonalna rozmowa z psychologiem – indywidualnie lub razem."],
              [Compass, "Kierunek", "Możliwe następne kroki, dopasowane do Waszej sytuacji i decyzji."],
            ] as const
          ).map(([Icon, t, d]) => (
            <li key={t} className="flex gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-sand">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay-soft text-clay"><Icon size={19} aria-hidden /></span>
              <span><strong className="block text-ink">{t}</strong><span className="text-[15px] text-ink-soft">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="form-h" id="formularz" className="mt-10 scroll-mt-24 rounded-3xl bg-forest p-6 text-white shadow-soft sm:p-8">
        <h2 id="form-h" className="scroll-mt-28 font-display text-[1.7rem] leading-tight">Porozmawiajmy o Twojej Mapie Relacji</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">
          Zostaw numer telefonu. Konsultant DUO zadzwoni, wyjaśni, jak wygląda Mapa Relacji, przedstawi dostępne warianty i ich koszt oraz pomoże ustalić, czy ten proces
          odpowiada Twoim potrzebom.
        </p>
        <form ref={formRef} onSubmit={submit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="ld-name" className="mb-1.5 block text-sm font-medium">Imię</label>
            <input id="ld-name" className={input} autoComplete="given-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!fieldErr("name")} aria-describedby={fieldErr("name") ? "ld-name-e" : undefined} />
            {fieldErr("name") && <p id="ld-name-e" className="mt-1.5 text-sm text-rose" role="alert">{fieldErr("name")}</p>}
          </div>
          <div>
            <label htmlFor="ld-phone" className="mb-1.5 block text-sm font-medium">Numer telefonu</label>
            <input id="ld-phone" className={input} type="tel" inputMode="tel" autoComplete="tel" placeholder="np. 600 100 200" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-invalid={!!fieldErr("phone")} aria-describedby={fieldErr("phone") ? "ld-phone-e" : undefined} />
            {fieldErr("phone") && <p id="ld-phone-e" className="mt-1.5 text-sm text-rose" role="alert">{fieldErr("phone")}</p>}
          </div>
          <div>
            <label htmlFor="ld-email" className="mb-1.5 block text-sm font-medium">E-mail <span className="font-normal text-white/60">– opcjonalnie</span></label>
            <input id="ld-email" className={input} type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!fieldErr("email")} />
            {fieldErr("email") && <p className="mt-1.5 text-sm text-rose" role="alert">{fieldErr("email")}</p>}
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Kiedy najlepiej zadzwonić? <span className="font-normal text-white/60">– opcjonalnie</span></legend>
            <div className="flex flex-wrap gap-2">
              {PREFERRED_TIMES.map((t) => (
                <button key={t.value} type="button" aria-pressed={f.preferredTime === t.value} onClick={() => setF({ ...f, preferredTime: t.value })}
                  className={clsx("min-h-10 rounded-full px-4 text-sm ring-1 transition", f.preferredTime === t.value ? "bg-white text-forest ring-white" : "text-white ring-white/40 hover:ring-white")}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          <label className="flex items-start gap-3 rounded-2xl bg-white/10 p-3.5 text-sm leading-snug">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#a9512f]" checked={f.contactConsent} onChange={(e) => setF({ ...f, contactConsent: e.target.checked })} />
            <span>{consentText} <Link href="/prywatnosc" className="underline underline-offset-2" target="_blank">Informacja o danych</Link></span>
          </label>
          {fieldErr("contactConsent") && <p className="text-sm text-rose" role="alert">{fieldErr("contactConsent")}</p>}
          <label className="flex items-start gap-3 px-3.5 text-sm leading-snug text-white/80">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#a9512f]" checked={f.marketingConsent} onChange={(e) => setF({ ...f, marketingConsent: e.target.checked })} />
            <span>{marketingText}</span>
          </label>
          {err && !["name", "phone", "email", "contactConsent"].includes(err.field ?? "") && <Alert tone="alert">{err.text}</Alert>}
          <button type="submit" disabled={pending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[16px] font-semibold text-white shadow-soft transition hover:brightness-110 disabled:opacity-60">
            {pending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Phone size={18} aria-hidden />}
            {pending ? "Wysyłanie…" : "Poproś o telefon w sprawie Mapy Relacji"}
          </button>
          <p className="text-center text-xs leading-relaxed text-white/70">
            Krótki quiz jest bezpłatny. Pełna Mapa Relacji to osobna, płatna usługa. Poznasz szczegóły przed podjęciem decyzji.
          </p>
        </form>
      </section>

      <p className="mt-8 flex gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Jeśli w relacji pojawia się przemoc albo nie czujesz się bezpiecznie, wspólna terapia może nie być właściwą formą pomocy.{" "}
          <Link href="/pomoc" className="underline underline-offset-2">Zobacz, gdzie szukać wsparcia</Link>.
        </span>
      </p>
    </div>
  );
}

function Done({ callbackPromise }: { callbackPromise: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="mx-auto w-full max-w-xl animate-rise px-5 pb-16 pt-10" role="status">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-forest"><Check aria-hidden /></span>
      <h1 ref={ref} tabIndex={-1} className="mt-5 font-display text-[1.9rem] leading-tight text-ink outline-none">Dziękujemy. Otrzymaliśmy Twoją prośbę o kontakt</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
        {callbackPromise ? `Konsultant DUO zadzwoni ${callbackPromise}.` : "Konsultant DUO zadzwoni na podany numer."} Oto, co wydarzy się dalej:
      </p>
      <ol className="mt-6 space-y-4">
        {[
          ["Rozmowa", "Konsultant wyjaśni, jak wygląda Mapa Relacji, przedstawi warianty i koszt oraz odpowie na pytania."],
          ["Twoja decyzja", "Decydujesz po rozmowie – bez presji i bez zobowiązań. Quiz nie zobowiązuje Cię do zakupu."],
          ["Jeśli zdecydujesz się zacząć", "Otrzymasz prywatny link do szczegółowego kwestionariusza i ustalimy termin konsultacji z psychologiem."],
        ].map(([t, d], k) => (
          <li key={t} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest font-display text-white">{k + 1}</span>
            <span><strong className="block text-ink">{t}</strong><span className="text-[15px] text-ink-soft">{d}</span></span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">Jeśli zadzwonimy w niedogodnym momencie, po prostu nie odbieraj – spróbujemy ponownie albo napiszemy.</p>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-6 font-medium text-forest ring-1 ring-sand-dark hover:bg-linen">Wróć na stronę główną</Link>
    </div>
  );
}
