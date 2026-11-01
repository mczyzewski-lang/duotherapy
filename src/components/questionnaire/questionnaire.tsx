"use client";

// Wieloetapowy, interaktywny kwestionariusz z autozapisem do bazy (bez localStorage).
import clsx from "clsx";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, CloudOff, Loader2, Lock, Save, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { chooseSlotAction, saveAnswerAction, submitAction } from "@/app/q/[token]/actions";
import { SafetyBox } from "@/components/safety-box";
import { Alert, Button } from "@/components/ui";
import type { Settings } from "@/lib/settings";
import type { AnswerValue } from "@/questionnaires/types";
import { isVisible, NA_MARK } from "@/questionnaires/validate";
import { QuestionInput, type AState, type QView } from "./question-input";

export interface QData {
  token: string;
  firstName: string;
  gender: "male" | "female";
  status: "not_started" | "in_progress" | "submitted" | "reopened";
  kind: "individual" | "couple";
  version: {
    title: string;
    intro: string[];
    outro: string | null;
    sections: { key: string; title: string; intro?: string; scaleLegend?: string; area?: string; questions: QView[] }[];
  };
  answers: Record<string, AState>;
  notice: string;
  helplines: Settings["helplines"];
  payment: { status: string; url: string; required: boolean };
  sessionAt: string | null;
  slots: { id: string; startsAt: string; minutes: number; status: string; mine: boolean }[];
}

type Screen =
  | { kind: "welcome" }
  | { kind: "intro" }
  | { kind: "questions"; section: number; questions: QView[]; title?: string | null }
  | { kind: "safety"; section: number; info: QView }
  | { kind: "review" };

const GROUPABLE = new Set(["scale5", "screening", "text", "email", "phone", "date", "country_city"]);

function buildScreens(d: QData, byKey: Record<string, AnswerValue>): Screen[] {
  const out: Screen[] = [{ kind: "welcome" }, { kind: "intro" }];
  d.version.sections.forEach((s, si) => {
    const qs = s.questions.filter((q) => isVisible(q.showIf, byKey));
    let chunk: QView[] = [];
    const flush = () => {
      if (chunk.length) out.push({ kind: "questions", section: si, questions: chunk, title: chunk[0].group });
      chunk = [];
    };
    for (const q of qs) {
      if (q.type === "info") {
        flush();
        out.push({ kind: "safety", section: si, info: q });
        continue;
      }
      const prev = chunk[chunk.length - 1];
      const sameGroup = prev && GROUPABLE.has(q.type) && GROUPABLE.has(prev.type) && prev.group === q.group && (q.type === prev.type || s.area === "profile");
      if (!sameGroup || chunk.length >= (q.type === "scale5" || q.type === "screening" ? 5 : 4)) flush();
      chunk.push(q);
      if (!GROUPABLE.has(q.type)) flush();
    }
    flush();
  });
  out.push({ kind: "review" });
  return out;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function Questionnaire({ data }: { data: QData }) {
  const [answers, setAnswers] = useState<Record<string, AState>>(data.answers);
  const [status, setStatus] = useState(data.status);
  const locked = status === "submitted";
  const allQ = useMemo(() => data.version.sections.flatMap((s) => s.questions), [data]);
  const byKey = useMemo(() => {
    const m: Record<string, AnswerValue> = {};
    for (const q of allQ) {
      if (answers[q.id]?.state === "answered") m[q.key] = answers[q.id].value;
      else if (answers[q.id]?.state === "not_applicable") m[q.key] = NA_MARK;
    }
    return m;
  }, [answers, allQ]);
  const screens = useMemo(() => buildScreens(data, byKey), [data, byKey]);
  const firstUnanswered = useMemo(() => {
    if (data.status === "not_started") return 0;
    // wznów za ostatnim ekranem, na którym jest jakakolwiek odpowiedź (pominięte pytania opcjonalne nie cofają)
    let last = -1;
    screens.forEach((s, i) => {
      if (s.kind === "questions" && s.questions.some((q) => answers[q.id])) last = i;
    });
    if (last < 0) return 1;
    const s = screens[last];
    const complete = s.kind === "questions" && s.questions.every((q) => answers[q.id]);
    return Math.min(complete ? last + 1 : last, screens.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(locked ? screens.length - 1 : firstUnanswered);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const pending = useRef(new Map<string, { t: ReturnType<typeof setTimeout>; s: AState }>());
  const [submitting, startSubmit] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const country = (byKey["m.location"] as { country?: string } | undefined)?.country?.trim().toLowerCase();
  const abroad = !!country && !["polska", "poland", "pl"].includes(country);

  const flushOne = useCallback(
    async (qid: string, s: AState) => {
      setSave("saving");
      const r = await saveAnswerAction(data.token, qid, s.state, s.value);
      pending.current.delete(qid);
      if (!r.ok) {
        setSave("error");
        setError(r.error);
        return false;
      }
      if (r.riskTriggered) setShowSafety(true);
      setError(null);
      if (status === "not_started") setStatus("in_progress");
      if (pending.current.size === 0) setSave("saved");
      return true;
    },
    [data.token, status],
  );

  const onChange = (q: QView, s: AState) => {
    if (locked) return;
    setAnswers((a) => ({ ...a, [q.id]: s }));
    const existing = pending.current.get(q.id);
    if (existing) clearTimeout(existing.t);
    const isText = ["text", "textarea", "email", "phone", "country_city", "signature"].includes(q.type) || (s.value && typeof s.value === "object" && "detail" in s.value);
    const t = setTimeout(() => flushOne(q.id, s), isText ? 700 : 50);
    pending.current.set(q.id, { t, s });
    setSave("saving");
  };

  const flushAll = async () => {
    const entries = [...pending.current.entries()];
    for (const [qid, { t, s }] of entries) {
      clearTimeout(t);
      await flushOne(qid, s);
    }
  };

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (pending.current.size) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [idx]);

  const go = async (d: number) => {
    await flushAll();
    setIdx((i) => Math.max(0, Math.min(screens.length - 1, i + d)));
  };

  const screen = screens[Math.min(idx, screens.length - 1)];
  const sectionCount = data.version.sections.length;
  const sectionIdx = screen.kind === "questions" || screen.kind === "safety" ? screen.section : screen.kind === "review" ? sectionCount : -1;
  const answeredCount = allQ.filter((q) => q.type !== "info" && answers[q.id] && isVisible(q.showIf, byKey)).length;
  const totalCount = allQ.filter((q) => q.type !== "info" && isVisible(q.showIf, byKey)).length;
  const missingRequired = allQ.filter((q) => q.required && isVisible(q.showIf, byKey) && !isFilled(q, answers[q.id]));
  const consentGiven = allQ.filter((q) => q.type === "consent").every((q) => isFilled(q, answers[q.id]));

  if (locked) return <Done data={data} />;

  const section = sectionIdx >= 0 && sectionIdx < sectionCount ? data.version.sections[sectionIdx] : null;
  // przed udzieleniem zgody na przetwarzanie nie pozwalamy przejść do pytań merytorycznych
  const consentSectionIdx = data.version.sections.findIndex((s) => s.area === "consent");
  const blockedByConsent = screen.kind === "questions" && screen.section === consentSectionIdx && !consentGiven;

  return (
    <div className="mt-4">
      {/* pasek postępu */}
      <div className="sticky top-0 z-30 -mx-5 bg-linen/90 px-5 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span className="truncate">{section ? section.title : screen.kind === "review" ? "Podsumowanie" : "Wprowadzenie"}</span>
          <SaveIndicator s={save} />
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {data.version.sections.map((s, i) => (
            <span key={s.key} className={clsx("h-1.5 flex-1 rounded-full transition", i < sectionIdx ? "bg-forest" : i === sectionIdx ? "bg-clay" : "bg-sand")} />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Etap {Math.max(sectionIdx + 1, 0)} z {sectionCount}. Odpowiedzi: {answeredCount} z {totalCount}.
        </p>
      </div>

      {showSafety && (
        <div className="mt-4 animate-rise">
          <Alert tone="alert" title="Dziękujemy, że o tym piszesz.">
            Psycholog zobaczy tę odpowiedź przed sesją i może skontaktować się z Tobą wcześniej. Jeśli w tej chwili jesteś w niebezpieczeństwie, nie czekaj na konsultację –
            skorzystaj z pomocy poniżej. Twoje odpowiedzi nie są przekazywane drugiej osobie.
          </Alert>
          <SafetyBox helplines={data.helplines} abroad={abroad} compact className="mt-3" />
          <button type="button" className="mt-2 text-sm text-muted underline underline-offset-2" onClick={() => setShowSafety(false)}>
            Zwiń informację i kontynuuj
          </button>
        </div>
      )}

      <div key={idx} data-testid="q-card" data-screen={idx} className="mt-6 animate-rise rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand sm:p-10">
        {screen.kind === "welcome" && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl leading-tight text-ink outline-none sm:text-4xl">
              Cześć, {data.firstName}. To bezpieczna przestrzeń, w której możesz opisać swoją perspektywę.
            </h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Wiemy, jak ważna jest ta sprawa w Twoim życiu. Dlatego kwestionariusz jest dokładny – żeby nie zostawiać miejsca na domysły i żeby psycholog jeszcze
              przed spotkaniem miał pełen obraz Twojej sytuacji. Dzięki temu na sesji możecie od razu przejść do tego, co najważniejsze.
            </p>
            <ul className="mt-6 grid gap-3 text-[15px] text-ink-soft sm:grid-cols-2">
              <li className="rounded-2xl bg-ivory p-4 ring-1 ring-sand"><strong className="block text-ink">Około 15–25 minut</strong>Możesz robić przerwy – każda odpowiedź zapisuje się automatycznie.</li>
              <li className="rounded-2xl bg-ivory p-4 ring-1 ring-sand"><strong className="block text-ink">Zapisz i wróć później</strong>Otwórz ten sam link i wpisz kod – zaczniesz tam, gdzie {data.gender === "male" ? "skończyłeś" : "skończyłaś"}.</li>
              <li className="rounded-2xl bg-ivory p-4 ring-1 ring-sand"><strong className="block text-ink">Odpowiadaj samodzielnie</strong>W spokojnym miejscu, w którym nikt nie czyta Ci przez ramię{data.kind === "couple" ? " – także druga osoba w związku" : ""}.</li>
              <li className="rounded-2xl bg-ivory p-4 ring-1 ring-sand"><strong className="block text-ink">Poufnie</strong>{data.kind === "couple" ? "Twoje odpowiedzi widzi tylko psycholog – nie druga osoba." : "Twoje odpowiedzi widzi tylko psycholog prowadzący."}</li>
            </ul>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted"><Lock size={14} aria-hidden /> To nie jest test i nie dostaniesz „wyniku”. Odpowiedzi służą do rozmowy na sesji.</p>
          </div>
        )}

        {screen.kind === "intro" && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink outline-none">Zanim zaczniesz</h1>
            <p className="mt-2 text-sm text-muted">{data.version.title}</p>
            <ul className="mt-6 space-y-3">
              {data.version.intro.map((p) => (
                <li key={p} className="flex gap-3 leading-relaxed text-ink-soft"><Check size={18} className="mt-1 shrink-0 text-forest" aria-hidden />{p}</li>
              ))}
            </ul>
            {data.payment.required && data.payment.status === "unpaid" && <PaymentInfo url={data.payment.url} />}
          </div>
        )}

        {screen.kind === "questions" && section && (
          <div className="space-y-8">
            <header>
              <p className="text-sm font-medium text-clay">{section.title}</p>
              {screen.title && screen.title !== section.title ? (
                <h1 ref={headingRef} tabIndex={-1} className="mt-1 font-display text-2xl text-ink outline-none">{screen.title}</h1>
              ) : (
                <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">{section.title}</h1>
              )}
              {section.intro && screen.questions[0] === section.questions.find((q) => isVisible(q.showIf, byKey)) && (
                <p className="mt-3 leading-relaxed text-ink-soft">{section.intro}</p>
              )}
              {section.area === "consent" && <p className="mt-3 whitespace-pre-line rounded-2xl bg-ivory p-5 text-sm leading-relaxed text-ink-soft ring-1 ring-sand">{data.notice}</p>}
              {screen.questions.some((q) => q.type === "scale5") && section.scaleLegend && (
                <p className="mt-3 inline-flex rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-forest">Skala: {section.scaleLegend}</p>
              )}
            </header>
            {screen.questions.map((q) => (
              <QuestionInput key={q.id} q={q} a={answers[q.id]} onChange={(s) => onChange(q, s)} />
            ))}
            {section.area === "safety" && (
              <p className="text-sm text-muted">Odpowiedź „Wolę omówić na sesji” jest w pełni w porządku. Nie musisz niczego ujawniać na piśmie.</p>
            )}
          </div>
        )}

        {screen.kind === "safety" && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 font-display text-2xl text-ink outline-none"><ShieldAlert className="text-alert" aria-hidden /> Ważne</h1>
            <p className="mt-3 leading-relaxed text-ink-soft">{screen.info.prompt}</p>
            <SafetyBox helplines={data.helplines} abroad={abroad} className="mt-5" />
          </div>
        )}

        {screen.kind === "review" && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink outline-none">Prawie gotowe</h1>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Odpowiedziano na {answeredCount} z {totalCount} pytań. Możesz wrócić do dowolnej części i coś uzupełnić. Puste odpowiedzi nie blokują wysłania – o tym, co
              trudno opisać, porozmawiacie na sesji.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {data.version.sections.map((s, i) => {
                const vis = s.questions.filter((q) => q.type !== "info" && isVisible(q.showIf, byKey));
                const done = vis.filter((q) => answers[q.id]).length;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-xl bg-ivory px-4 py-3 text-left text-sm ring-1 ring-sand hover:ring-forest"
                      onClick={() => setIdx(screens.findIndex((x) => (x.kind === "questions" || x.kind === "safety") && x.section === i))}
                    >
                      <span className="text-ink">{s.title}</span>
                      <span className={clsx("shrink-0 text-xs", done === vis.length ? "text-ok" : "text-muted")}>{done}/{vis.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {missingRequired.length > 0 && (
              <Alert tone="warn" className="mt-6" title="Do uzupełnienia przed wysłaniem">
                <ul className="list-disc pl-5">{missingRequired.map((q) => <li key={q.id}>{q.prompt.slice(0, 90)}</li>)}</ul>
              </Alert>
            )}
            {data.version.outro && <p className="mt-6 text-sm text-muted">{data.version.outro}</p>}
            {error && <Alert tone="alert" className="mt-4">{error}</Alert>}
            <Button
              className="mt-6 w-full sm:w-auto"
              size="lg"
              variant="clay"
              disabled={submitting || missingRequired.length > 0}
              onClick={() =>
                startSubmit(async () => {
                  await flushAll();
                  const r = await submitAction(data.token);
                  if (r.ok) setStatus("submitted");
                  else setError(r.error);
                })
              }
            >
              {submitting ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Check size={18} aria-hidden />} Przekaż kwestionariusz psychologowi
            </Button>
            <p className="mt-2 text-xs text-muted">Po przekazaniu zmiany będą możliwe tylko za zgodą psychologa.</p>
          </div>
        )}

        {error && screen.kind !== "review" && <Alert tone="alert" className="mt-6">{error}</Alert>}
        {blockedByConsent && <p className="mt-6 text-sm text-clay">Aby przejść dalej, zaznacz zgodę na przetwarzanie danych. Bez niej nie możemy przyjąć odpowiedzi.</p>}
      </div>

      <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Nawigacja kwestionariusza">
        <Button variant="ghost" onClick={() => go(-1)} disabled={idx === 0}>
          <ArrowLeft size={18} aria-hidden /> Wstecz
        </Button>
        <span className="text-xs text-muted">{answeredCount}/{totalCount}</span>
        {screen.kind !== "review" && (
          <Button onClick={() => go(1)} disabled={blockedByConsent || (screen.kind === "intro" && data.payment.required && data.payment.status === "unpaid")}>
            {screen.kind === "welcome" ? "Zaczynamy" : "Dalej"} <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </nav>
    </div>
  );
}

function isFilled(q: QView, a?: AState) {
  if (!a) return false;
  if (a.state !== "answered") return true;
  const v = a.value;
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (q.type === "consent") return Boolean((v as { granted: boolean }).granted);
  if (q.type === "signature") return ((v as { name: string }).name ?? "").trim().length >= 2;
  return true;
}

function SaveIndicator({ s }: { s: SaveState }) {
  if (s === "saving") return <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" aria-hidden /> Zapisywanie…</span>;
  if (s === "saved") return <span className="flex items-center gap-1 text-ok"><Save size={12} aria-hidden /> Zapisano</span>;
  if (s === "error") return <span className="flex items-center gap-1 text-alert"><CloudOff size={12} aria-hidden /> Nie zapisano</span>;
  return <span className="flex items-center gap-1"><Lock size={12} aria-hidden /> Autozapis</span>;
}

function PaymentInfo({ url }: { url: string }) {
  return (
    <Alert tone="warn" className="mt-6" title="Płatność przed wypełnieniem kwestionariusza">
      {url ? (
        <>
          Opłać Mapę Relacji przez <a className="font-medium underline" href={url} target="_blank" rel="noopener noreferrer">bezpieczny link do płatności</a>. Po zaksięgowaniu psycholog odblokuje
          kwestionariusz.
        </>
      ) : (
        "Informację o płatności otrzymasz od psychologa prowadzącego."
      )}
    </Alert>
  );
}

function Done({ data }: { data: QData }) {
  const [slots, setSlots] = useState(data.slots);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fmt = (iso: string) => new Date(iso).toLocaleString("pl-PL", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="mt-8 space-y-5">
      <div className="animate-rise rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-sand sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-forest"><Check aria-hidden /></span>
        <h1 className="mt-5 font-display text-3xl text-ink">Dziękujemy, {data.firstName}.</h1>
        <p className="mt-2 inline-flex rounded-full bg-sage-soft px-3 py-1 text-sm font-medium text-forest">Kwestionariusz przekazany psychologowi</p>
        <p className="mx-auto mt-5 max-w-lg leading-relaxed text-ink-soft">
          Psycholog przeczyta Twoje odpowiedzi przed sesją. Nie ma tu wyniku ani oceny – najważniejsze wątki omówicie podczas rozmowy. Jeśli zechcesz coś zmienić, napisz
          do psychologa prowadzącego.
        </p>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8" aria-labelledby="termin">
        <h2 id="termin" className="flex items-center gap-2 font-display text-2xl text-ink"><CalendarCheck className="text-forest" aria-hidden /> Termin sesji</h2>
        {data.sessionAt ? (
          <p className="mt-3 text-ink">Sesja potwierdzona: <strong>{fmt(data.sessionAt)}</strong></p>
        ) : slots.length ? (
          <>
            <p className="mt-2 text-sm text-muted">Wybierz jeden z zaproponowanych terminów. Psycholog potwierdzi go osobno – do tego czasu to wstępny wybór.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={pending || (s.status === "chosen" && !s.mine)}
                  aria-pressed={s.mine}
                  className={clsx("rounded-xl px-4 py-3 text-left text-sm ring-1 transition", s.mine ? "bg-forest text-white ring-forest" : "bg-ivory ring-sand hover:ring-forest disabled:opacity-50")}
                  onClick={() =>
                    start(async () => {
                      const r = await chooseSlotAction(data.token, s.id);
                      if (!r.ok) setErr(r.error);
                      else setSlots((all) => all.map((x) => ({ ...x, mine: x.id === s.id, status: x.id === s.id ? "chosen" : x.mine ? "offered" : x.status })));
                    })
                  }
                >
                  <span className="block font-medium capitalize">{fmt(s.startsAt)}</span>
                  <span className={clsx("text-xs", s.mine ? "text-white/80" : "text-muted")}>{s.minutes} min · {s.mine ? "Twój wybór – czeka na potwierdzenie" : s.status === "chosen" ? "wybrany" : "dostępny"}</span>
                </button>
              ))}
            </div>
            {err && <Alert tone="alert" className="mt-3">{err}</Alert>}
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Psycholog zaproponuje terminy – pojawią się w tym miejscu (ten sam link i kod).</p>
        )}
      </section>

      {data.payment.status === "unpaid" && <PaymentInfo url={data.payment.url} />}
      <SafetyBox helplines={data.helplines} compact />
    </div>
  );
}
