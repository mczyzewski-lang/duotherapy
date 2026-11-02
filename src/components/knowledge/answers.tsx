"use client";

// Pola do uzupełnienia w materiale online. Bez AnswersProvider (podgląd /demo, druk, landing) renderują się
// jako linie do pisania odręcznego; z providerem – jako pola z autozapisem przypisanym do e-maila.
import clsx from "clsx";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { saveAnswers } from "@/app/actions/answers";

type Val = string | boolean;
interface Ctx {
  get: (id: string) => Val | undefined;
  set: (id: string, v: Val) => void;
}
const AnswersCtx = createContext<Ctx | null>(null);

export function AnswersProvider({ slug, initial, children }: { slug: string; initial: Record<string, Val>; children: React.ReactNode }) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(data);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setStatus("saving");
    try {
      const r = await saveAnswers(slug, latest.current);
      setStatus(r.ok ? "saved" : "error");
      setError(r.ok ? null : r.error ?? "Nie udało się zapisać.");
    } catch {
      setStatus("error");
      setError("Brak połączenia – zapiszemy, gdy wróci internet.");
      dirty.current = true;
    }
  }, [slug]);

  const set = useCallback((id: string, v: Val) => {
    setData((d) => {
      const n = { ...d, [id]: v };
      latest.current = n;
      return n;
    });
    dirty.current = true;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 900);
  }, [flush]);

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
    <AnswersCtx.Provider value={{ get: (id) => data[id], set }}>
      {children}
      <div role="status" aria-live="polite" className={clsx(
        "fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-soft ring-1 transition sm:left-auto sm:right-4",
        status === "idle" ? "pointer-events-none opacity-0" : "opacity-100",
        status === "error" ? "bg-alert-soft text-alert ring-alert/20" : "bg-white text-forest ring-sand",
      )} data-save-status={status}>
        {status === "saving" && <><Loader2 size={13} className="animate-spin" aria-hidden /> Zapisywanie…</>}
        {status === "saved" && <><Check size={13} aria-hidden /> Zapisano</>}
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
      data-field={id}
      value={typeof v === "string" ? v : ""}
      onChange={(e) => ctx.set(id, e.target.value)}
      placeholder="Twoja odpowiedź…"
      rows={lines}
      className={clsx(
        "block w-full resize-none rounded-xl bg-ivory/70 px-3 py-2 text-[15px] leading-8 text-ink ring-1 ring-sand placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest",
        compact ? "mt-1" : "mt-2",
      )}
      style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(213,194,173,.55) 31px, rgba(213,194,173,.55) 32px)", backgroundPositionY: "8px" }}
    />
  );
}

/** Pole wyboru w checkliście. */
export function AnswerCheck({ id, label }: { id: string; label: string }) {
  const ctx = useContext(AnswersCtx);
  if (!ctx) return <span className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-forest/60 bg-white" aria-hidden />;
  const on = ctx.get(id) === true;
  return (
    <input type="checkbox" aria-label={label} data-field={id} checked={on} onChange={(e) => ctx.set(id, e.target.checked)}
      className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" />
  );
}
