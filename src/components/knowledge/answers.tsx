"use client";

// Pola do uzupełnienia w materiale online. Bez AnswersProvider (druk, landing) renderują się jako linie do pisania
// odręcznego; z providerem – jako pola z autozapisem: przypisanym do e-maila (material) albo tylko na tym urządzeniu (demo).
import clsx from "clsx";
import { ArrowRight, Check, CloudOff, Loader2, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { saveAnswers } from "@/app/actions/answers";
import { missingRequirements, type Requirement } from "@/knowledge/fields";
import { SaveForLater } from "./phone";

/** Klucz odpowiedzi z podglądu /demo w pamięci przeglądarki (nic nie trafia na serwer, dopóki osoba ich nie dołączy). */
export const demoKey = (slug: string) => `duo_demo_answers:${slug}`;
export function readDemoAnswers(slug: string): Record<string, Val> {
  try {
    const v = JSON.parse(localStorage.getItem(demoKey(slug)) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

type Val = string | boolean;
interface Ctx {
  get: (id: string) => Val | undefined;
  set: (id: string, v: Val) => void;
  data: Record<string, Val>;
  flush: () => Promise<boolean>;
  invalid: Set<string>;
  setInvalid: (s: Set<string>) => void;
}
const AnswersCtx = createContext<Ctx | null>(null);

/**
 * Podgląd na landingu: przykładowe odpowiedzi pisane „na żywo” odręcznym pismem (bez zapisu) – po kolei, jak pisze człowiek:
 * następne pole zaczyna się dopiero, gdy poprzednie jest skończone (kolejność = kolejność kluczy w SAMPLE_ANSWERS).
 */
interface SampleState { answers: Record<string, string | true>; order: string[]; turn: number; next: () => void }
const SampleCtx = createContext<SampleState | null>(null);
export function SampleAnswers({ answers, children }: { answers: Record<string, string | true>; children: React.ReactNode }) {
  const [turn, setTurn] = useState(0);
  const order = Object.keys(answers);
  const next = useCallback(() => setTurn((t) => t + 1), []);
  return <SampleCtx.Provider value={{ answers, order, turn, next }}>{children}</SampleCtx.Provider>;
}

/** Czy to pole ma teraz „długopis”, czy już je skończono. */
function useSampleTurn(id: string) {
  const c = useContext(SampleCtx);
  const idx = c ? c.order.indexOf(id) : -1;
  return { active: !!c && idx === c.turn, done: !!c && idx > -1 && idx < c.turn, next: c?.next ?? (() => {}) };
}

function useOnScreen<T extends Element>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && (setOn(true), io.disconnect()), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return { ref, on };
}

/** Linie do pisania z odręczną odpowiedzią „niebieskim długopisem”, pisaną znak po znaku po wejściu w widok. */
function HandLines({ id, text, lines, compact }: { id: string; text: string; lines: number; compact?: boolean }) {
  const { ref, on } = useOnScreen<HTMLDivElement>(true);
  const { active, done, next } = useSampleTurn(id);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      next();
      return;
    }
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      i++;
      setN(i);
      if (i < text.length) t = setTimeout(step, /[ ,.–]/.test(text[i - 1]) ? 120 : 45 + Math.random() * 45);
      else t = setTimeout(next, 650); // chwila na przeniesienie długopisu do następnego pola
    };
    t = setTimeout(step, 350);
    return () => clearTimeout(t);
  }, [on, active, text, next]);
  const shown = done ? text.length : n;
  return (
    <div ref={ref} className={clsx("relative", compact ? "mt-1" : "mt-2")} data-sample-answer>
      {Array.from({ length: lines }).map((_, i) => <div key={i} className="h-8 border-b border-dashed border-sand-dark/80" aria-hidden />)}
      <p className="absolute inset-x-1 top-0 -rotate-[0.6deg] font-hand text-[1.45rem] leading-8 text-[#1f3f9a]" aria-label={`Przykładowa odpowiedź: ${text}`}>
        <span aria-hidden className={clsx(active && shown < text.length && "hand-caret")}>{text.slice(0, shown)}</span>
      </p>
    </div>
  );
}

export function AnswersProvider({ slug, initial, local, children }: { slug: string; initial: Record<string, Val>; local?: boolean; children: React.ReactNode }) {
  const [data, setData] = useState(initial);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(data);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!local) return;
    const v = readDemoAnswers(slug);
    latest.current = v;
    setData(v);
  }, [local, slug]);

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    if (!dirty.current) return true;
    dirty.current = false;
    if (local) {
      try {
        localStorage.setItem(demoKey(slug), JSON.stringify(latest.current));
        setStatus("saved");
        return true;
      } catch {
        setStatus("error");
        setError("Przeglądarka nie pozwala zapisać odpowiedzi.");
        return false;
      }
    }
    setStatus("saving");
    try {
      const r = await saveAnswers(slug, latest.current);
      setStatus(r.ok ? "saved" : "error");
      setError(r.ok ? null : r.error ?? "Nie udało się zapisać.");
      return r.ok;
    } catch {
      setStatus("error");
      setError("Brak połączenia – zapiszemy, gdy wróci internet.");
      dirty.current = true;
      return false;
    }
  }, [slug, local]);

  const set = useCallback((id: string, v: Val) => {
    setData((d) => {
      const n = { ...d, [id]: v };
      latest.current = n;
      return n;
    });
    dirty.current = true;
    setStatus("saving");
    setInvalid((s) => (s.size ? new Set() : s));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, local ? 300 : 900);
  }, [flush, local]);

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("online", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onHide);
    };
  }, [flush]);

  return (
    <AnswersCtx.Provider value={{ get: (id) => data[id], set, data, flush, invalid, setInvalid }}>
      {children}
      <div role="status" aria-live="polite" className={clsx(
        "fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-soft ring-1 transition sm:left-auto sm:right-4",
        status === "idle" ? "pointer-events-none opacity-0" : "opacity-100",
        status === "error" ? "bg-alert-soft text-alert ring-alert/20" : "bg-white text-forest ring-sand",
      )} data-save-status={status}>
        {status === "saving" && <><Loader2 size={13} className="animate-spin" aria-hidden /> Zapisywanie…</>}
        {status === "saved" && <><Check size={13} aria-hidden /> {local ? "Zapisano na tym urządzeniu" : "Zapisano"}</>}
        {status === "error" && <><CloudOff size={13} aria-hidden /> {error}</>}
      </div>
    </AnswersCtx.Provider>
  );
}

export function useAnswersEnabled() {
  return useContext(AnswersCtx) !== null;
}

/** Pole tekstowe (lub linie do pisania, gdy brak autozapisu). */
export function AnswerText({ id, lines = 2, label, compact }: { id: string; lines?: number; label?: string; compact?: boolean }) {
  const ctx = useContext(AnswersCtx);
  const ref = useRef<HTMLTextAreaElement>(null);
  const v = ctx?.get(id);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, lines * 32)}px`;
  }, [v, lines]);
  const sample = useContext(SampleCtx)?.answers[id];
  if (!ctx && typeof sample === "string") return <HandLines id={id} text={sample} lines={lines} compact={compact} />;
  if (!ctx)
    return (
      <div className={clsx(compact ? "mt-1" : "mt-2")} aria-hidden>
        {Array.from({ length: lines }).map((_, i) => <div key={i} className="h-8 border-b border-dashed border-sand-dark/80" />)}
      </div>
    );
  return (
    <textarea
      ref={ref}
      aria-label={label ?? "Twoja odpowiedź"}
      aria-invalid={ctx.invalid.has(id) || undefined}
      data-field={id}
      value={typeof v === "string" ? v : ""}
      onChange={(e) => ctx.set(id, e.target.value)}
      placeholder="Twoja odpowiedź…"
      rows={lines}
      className={clsx(
        "block w-full scroll-mt-24 resize-none rounded-xl bg-ivory/70 px-3 py-2 text-[15px] leading-8 text-ink ring-1 placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest",
        ctx.invalid.has(id) ? "ring-2 ring-alert" : "ring-sand",
        compact ? "mt-1" : "mt-2",
      )}
      style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(213,194,173,.55) 31px, rgba(213,194,173,.55) 32px)", backgroundPositionY: "8px" }}
    />
  );
}

/** Pole wyboru w checkliście. */
export function AnswerCheck({ id, label }: { id: string; label: string }) {
  const ctx = useContext(AnswersCtx);
  const sample = useContext(SampleCtx)?.answers[id] === true;
  if (!ctx && sample) return <HandTick id={id} />;
  if (!ctx) return <span className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-forest/60 bg-white" aria-hidden />;
  const on = ctx.get(id) === true;
  return (
    <input type="checkbox" aria-label={label} data-field={id} checked={on} onChange={(e) => ctx.set(id, e.target.checked)}
      aria-invalid={ctx.invalid.has(id) || undefined}
      className={clsx("mt-0.5 h-5 w-5 shrink-0 scroll-mt-24 accent-[#36493d]", ctx.invalid.has(id) && "outline-2 outline-offset-2 outline-alert")} />
  );
}

/** Dolny sticky bar „Podsumuj …”: sprawdza minimum (min. 1 odpowiedź w wymaganych częściach), zapisuje i przechodzi dalej. */
export function SummarizeBar({ href, label, requirements, saveLater }: { href: string; label: string; requirements: Requirement[]; saveLater?: { slug: string; n: number; masked: string | null; unlockList?: string[] } }) {
  const ctx = useContext(AnswersCtx);
  const router = useRouter();
  const [missing, setMissing] = useState<Requirement[]>([]);
  const [busy, setBusy] = useState(false);
  if (!ctx) return null;

  const goTo = (r: Requirement) => {
    const el = document.querySelector<HTMLElement>(`[data-field="${r.ids[0]}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  };

  const submit = async () => {
    const miss = missingRequirements(requirements, ctx.data);
    setMissing(miss);
    if (miss.length) {
      ctx.setInvalid(new Set(miss.map((r) => r.ids[0])));
      goTo(miss[0]);
      return;
    }
    setBusy(true);
    const ok = await ctx.flush();
    if (ok) router.push(href);
    else setBusy(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand/70 bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur" data-testid="summarize-bar">
      <div className="mx-auto max-w-3xl">
        {missing.length > 0 && ctx.invalid.size > 0 && (
          <div role="alert" className="mb-3 rounded-2xl bg-alert-soft p-3.5 text-sm leading-snug text-alert" data-testid="summarize-missing">
            <p className="font-semibold">Żeby podsumować, uzupełnij jeszcze min. 1 odpowiedź w:</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {missing.map((r) => (
                <li key={r.section}>
                  <button type="button" onClick={() => goTo(r)} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white px-3 text-[13px] font-medium text-alert ring-1 ring-alert/30">
                    <PenLine size={13} aria-hidden /> {r.section}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* „Zapisz zmiany na później” – po wpisaniu choć jednego słowa (wersja z e-maila, nie demo) */}
        {saveLater && (saveLater.masked || Object.values(ctx.data).some((v) => typeof v === "string" && /\S/.test(v))) && (
          <div className="mb-2.5"><SaveForLater slug={saveLater.slug} n={saveLater.n} initialMasked={saveLater.masked} unlockList={saveLater.unlockList ?? []} /></div>
        )}
        <button type="button" onClick={submit} disabled={busy}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[16px] font-semibold text-white shadow-soft transition hover:brightness-110 disabled:opacity-60">
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null} {label} <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Odręczny ptaszek w checkliście podglądu – rysowany po wejściu w widok. */
function HandTick({ id }: { id: string }) {
  const { ref, on } = useOnScreen<HTMLSpanElement>(true);
  const { active, done, next } = useSampleTurn(id);
  const drawn = done || (on && active);
  useEffect(() => {
    if (!on || !active) return;
    const t = setTimeout(next, 700); // ptaszek rysuje się ok. 0,45 s, potem chwila przerwy
    return () => clearTimeout(t);
  }, [on, active, next]);
  return (
    <span ref={ref} className="relative mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-forest/60 bg-white" data-sample-answer>
      <svg viewBox="0 0 24 24" className={clsx("hand-tick absolute -left-1 -top-2 h-7 w-7", drawn && "on")} aria-label="Przykładowe zaznaczenie">
        <path d="M4 13.5c2 1.6 3.4 3.3 4.6 5.4C11.2 12.6 15 7.2 21 3.5" fill="none" stroke="#1f3f9a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
