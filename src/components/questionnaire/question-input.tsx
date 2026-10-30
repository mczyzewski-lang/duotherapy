"use client";

// Pole odpowiedzi dopasowane do typu pytania. Używane w kwestionariuszu i przy korekcie w panelu.
import clsx from "clsx";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AnswerState, AnswerValue, Option } from "@/questionnaires/types";

export interface QView {
  id: string;
  key: string;
  type: string;
  prompt: string;
  hint: string | null;
  options: Option[] | null;
  primaryPick: string | null;
  required: boolean;
  allowNA: boolean;
  showIf: { questionKey: string; anyOf: string[] } | null;
  group: string | null;
  sourceNumber: string | null;
  tags: string[];
}

export interface AState {
  state: AnswerState;
  value: AnswerValue;
}

const SCALE_LABELS = ["zupełnie nie", "raczej nie", "trudno powiedzieć", "raczej tak", "całkowicie tak"];

const inputCls = "w-full rounded-xl bg-white px-3.5 py-2.5 text-[15px] ring-1 ring-sand-dark focus:outline-none focus:ring-2 focus:ring-forest";

export function QuestionInput({ q, a, onChange, compact }: { q: QView; a?: AState; onChange: (s: AState) => void; compact?: boolean }) {
  const na = a?.state === "not_applicable";
  const val = a?.state === "answered" ? a.value : null;
  const set = (value: AnswerValue) => onChange({ state: "answered", value });
  const labelId = `q-${q.id}`;
  const pill = (on: boolean) =>
    clsx(
      "rounded-xl px-4 py-2.5 text-left text-[15px] ring-1 transition min-h-11",
      on ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-sand-dark hover:ring-forest",
    );

  // „Data wypełnienia” – uzupełniana automatycznie dzisiejszą datą (można zmienić)
  const autoToday = q.key === "m.filled" && !a;
  useEffect(() => {
    if (autoToday) onChange({ state: "answered", value: localToday() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoToday]);

  let body: React.ReactNode = null;
  switch (q.type) {
    case "text":
    case "email":
    case "phone":
      body = (
        <input
          aria-labelledby={labelId}
          className={inputCls}
          type={q.type === "email" ? "email" : q.type === "phone" ? "tel" : "text"}
          autoComplete={q.type === "email" ? "email" : q.type === "phone" ? "tel" : q.key === "m.name" ? "name" : "off"}
          value={typeof val === "string" ? val : ""}
          onChange={(e) => set(e.target.value)}
          disabled={na}
        />
      );
      break;
    case "textarea":
      body = <textarea aria-labelledby={labelId} className={clsx(inputCls, compact ? "min-h-24" : "min-h-40", "leading-relaxed")} value={typeof val === "string" ? val : ""} onChange={(e) => set(e.target.value)} disabled={na} />;
      break;
    case "date":
      if (q.key === "m.birth") {
        body = <BirthDateInput labelId={labelId} value={typeof val === "string" ? val : ""} onChange={(v) => set(v)} />;
        break;
      }
      body = <input aria-labelledby={labelId} type="date" className={clsx(inputCls, "max-w-xs")} value={typeof val === "string" ? val : ""} onChange={(e) => set(e.target.value)} />;
      break;
    case "country_city": {
      const v = (val as { country: string; city: string }) ?? { country: "", city: "" };
      body = (
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-labelledby={labelId}>
          <label className="text-sm text-muted">
            Kraj
            <input className={clsx(inputCls, "mt-1")} autoComplete="country-name" value={v.country} onChange={(e) => set({ ...v, country: e.target.value })} />
          </label>
          <label className="text-sm text-muted">
            Miasto
            <input className={clsx(inputCls, "mt-1")} autoComplete="address-level2" value={v.city} onChange={(e) => set({ ...v, city: e.target.value })} />
          </label>
        </div>
      );
      break;
    }
    case "children": {
      const list = (val as { children: { name: string; age: string }[] } | null)?.children ?? [];
      const rows = list.length ? list : [{ name: "", age: "" }];
      const put = (next: { name: string; age: string }[]) => set({ children: next });
      body = na ? null : (
        <div className="space-y-2" role="group" aria-labelledby={labelId}>
          {rows.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_6.5rem_auto] items-center gap-2">
              <input aria-label={`Imię dziecka ${i + 1}`} placeholder="Imię" className={inputCls} value={c.name} onChange={(e) => put(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input aria-label={`Wiek dziecka ${i + 1}`} placeholder="Wiek" inputMode="numeric" className={inputCls} value={c.age} onChange={(e) => put(rows.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))} />
              <button type="button" aria-label={`Usuń dziecko ${i + 1}`} className="grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-linen hover:text-alert disabled:opacity-0" disabled={rows.length === 1 && !c.name && !c.age} onClick={() => put(rows.length === 1 ? [] : rows.filter((_, j) => j !== i))}>
                <X size={16} aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-forest hover:bg-linen" onClick={() => put([...rows, { name: "", age: "" }])}>
            <Plus size={16} aria-hidden /> Dodaj dziecko
          </button>
        </div>
      );
      break;
    }
    case "scale5":
      body = (
        <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={val === n}
              aria-label={`${n} – ${SCALE_LABELS[n - 1]}`}
              disabled={na}
              onClick={() => set(n)}
              className={clsx(
                "flex min-h-12 flex-col items-center justify-center rounded-xl ring-1 transition",
                val === n ? "bg-forest text-white ring-forest shadow-soft" : "bg-white text-ink ring-sand-dark hover:ring-forest",
                na && "opacity-40",
              )}
            >
              <span className="font-display text-lg leading-none">{n}</span>
              {!compact && <span className={clsx("mt-1 hidden text-[10px] leading-tight sm:block", val === n ? "text-white/80" : "text-muted")}>{SCALE_LABELS[n - 1]}</span>}
            </button>
          ))}
        </div>
      );
      break;
    case "screening": {
      const cur = a?.state === "discuss_in_session" ? "discuss" : (val as string | null);
      body = (
        <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
          {(
            [
              ["no", "Nie"],
              ["yes", "Tak"],
              ["discuss", "Wolę omówić na sesji"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={cur === v}
              className={pill(cur === v)}
              onClick={() => (v === "discuss" ? onChange({ state: "discuss_in_session", value: null }) : set(v))}
            >
              {l}
            </button>
          ))}
        </div>
      );
      break;
    }
    case "single": {
      const v = val as { choice: string; detail?: string } | null;
      const opt = q.options?.find((o) => o.value === v?.choice);
      body = (
        <div className="space-y-2">
          <div role="radiogroup" aria-labelledby={labelId} className="grid gap-2">
            {q.options?.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={v?.choice === o.value} disabled={na} className={pill(v?.choice === o.value)} onClick={() => set({ choice: o.value, detail: v?.choice === o.value ? v.detail : undefined })}>
                {o.label}
              </button>
            ))}
          </div>
          {opt?.detailLabel && (
            <label className="block text-sm text-muted">
              {opt.detailLabel}
              <input className={clsx(inputCls, "mt-1")} value={v?.detail ?? ""} onChange={(e) => set({ choice: v!.choice, detail: e.target.value })} />
            </label>
          )}
        </div>
      );
      break;
    }
    case "multi": {
      const v = (val as { choices: string[]; primary?: string; detail?: string }) ?? { choices: [] };
      const toggle = (c: string) => {
        const choices = v.choices.includes(c) ? v.choices.filter((x) => x !== c) : [...v.choices, c];
        set({ ...v, choices, primary: v.primary && choices.includes(v.primary) ? v.primary : undefined });
      };
      const needsDetail = q.options?.find((o) => o.detailLabel && v.choices.includes(o.value));
      body = (
        <div className="space-y-3">
          <div className="grid gap-2" role="group" aria-labelledby={labelId}>
            {q.options?.map((o) => {
              const on = v.choices.includes(o.value);
              return (
                <button key={o.value} type="button" role="checkbox" aria-checked={on} className={pill(on)} onClick={() => toggle(o.value)}>
                  <span className="flex items-center gap-3">
                    <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1", on ? "bg-white text-forest ring-white" : "ring-sand-dark")}>{on && <Check size={14} aria-hidden />}</span>
                    {o.label}
                  </span>
                </button>
              );
            })}
          </div>
          {needsDetail && (
            <label className="block text-sm text-muted">
              {needsDetail.detailLabel}
              <input className={clsx(inputCls, "mt-1")} value={v.detail ?? ""} onChange={(e) => set({ ...v, detail: e.target.value })} />
            </label>
          )}
          {q.primaryPick && v.choices.length > 1 && (
            <fieldset className="rounded-xl bg-ivory p-4 ring-1 ring-sand">
              <legend className="px-1 text-sm font-medium text-ink">{q.primaryPick}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.choices.map((c) => (
                  <button key={c} type="button" aria-pressed={v.primary === c} className={clsx(pill(v.primary === c), "py-1.5 text-sm")} onClick={() => set({ ...v, primary: c })}>
                    {q.options?.find((o) => o.value === c)?.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      );
      break;
    }
    case "consent": {
      const on = Boolean((val as { granted?: boolean } | null)?.granted);
      body = (
        <label className="flex items-start gap-3 rounded-xl bg-ivory p-4 ring-1 ring-sand">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-forest" checked={on} onChange={(e) => set({ granted: e.target.checked })} aria-labelledby={labelId} />
          <span className="text-[15px] text-ink">{q.prompt}</span>
        </label>
      );
      break;
    }
    case "signature": {
      const v = (val as { name: string; date: string }) ?? { name: "", date: new Date().toISOString().slice(0, 10) };
      body = (
        <label className="block text-sm text-muted">
          Imię i nazwisko
          <input className={clsx(inputCls, "mt-1 max-w-md")} autoComplete="name" value={v.name} onChange={(e) => set({ name: e.target.value, date: new Date().toISOString().slice(0, 10) })} />
        </label>
      );
      break;
    }
  }

  return (
    <div className="space-y-3">
      {q.type !== "consent" && (
        <p id={labelId} className={clsx("text-ink", compact ? "text-[15px]" : q.type === "scale5" || q.type === "screening" ? "text-[17px] leading-snug" : "font-display text-xl leading-snug sm:text-2xl")}>
          {q.sourceNumber && (q.type === "scale5" || q.type === "screening") && <span className="mr-1.5 text-muted">{q.sourceNumber}.</span>}
          {q.prompt}
          {q.required && <span className="text-clay" aria-label="pole wymagane"> *</span>}
        </p>
      )}
      {q.type === "consent" && <span id={labelId} className="sr-only">{q.prompt}</span>}
      {q.hint && q.type !== "consent" && <p className="text-sm text-muted">{q.hint}</p>}
      {body}
      {q.allowNA && (
        <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 accent-forest" checked={na} onChange={(e) => onChange(e.target.checked ? { state: "not_applicable", value: null } : { state: "answered", value: null })} />
          {q.type === "children" ? "nie mamy dzieci" : "nie dotyczy"}
        </label>
      )}
    </div>
  );
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MONTHS = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];

function polishYears(n: number) {
  if (n === 1) return "rok";
  const d = n % 10, t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? "lata" : "lat";
}

/** Data urodzenia: trzy listy (dzień / miesiąc / rok) zamiast kalendarza – szybki wybór także na telefonie. */
function BirthDateInput({ labelId, value, onChange }: { labelId: string; value: string; onChange: (v: string) => void }) {
  const init = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split("-").map(Number) : [0, 0, 0];
  // częściowy wybór trzymamy lokalnie – zapisujemy dopiero pełną datę
  const [cur, setCur] = useState({ y: init[0], m: init[1], d: init[2] });
  const now = new Date().getFullYear();
  const years = Array.from({ length: now - 16 - 1920 + 1 }, (_, i) => now - 16 - i);
  const daysIn = cur.y && cur.m ? new Date(cur.y, cur.m, 0).getDate() : 31;
  const update = (patch: Partial<typeof cur>) => {
    const c = { ...cur, ...patch };
    if (c.y && c.m && c.d) c.d = Math.min(c.d, new Date(c.y, c.m, 0).getDate());
    setCur(c);
    if (c.y && c.m && c.d) onChange(`${c.y}-${String(c.m).padStart(2, "0")}-${String(c.d).padStart(2, "0")}`);
  };
  let age: number | null = null;
  if (cur.y && cur.m && cur.d) {
    const t = new Date();
    age = t.getFullYear() - cur.y - (t.getMonth() + 1 < cur.m || (t.getMonth() + 1 === cur.m && t.getDate() < cur.d) ? 1 : 0);
  }
  const sel = "rounded-xl bg-white px-3 py-2.5 text-[15px] ring-1 ring-sand-dark focus:outline-none focus:ring-2 focus:ring-forest";
  return (
    <div className="space-y-2">
      <div className="grid max-w-md grid-cols-[5rem_1fr_6.5rem] gap-2" role="group" aria-labelledby={labelId}>
        <select aria-label="Dzień" className={sel} value={cur.d || ""} onChange={(e) => update({ d: Number(e.target.value) })}>
          <option value="">dzień</option>
          {Array.from({ length: daysIn }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select aria-label="Miesiąc" className={sel} value={cur.m || ""} onChange={(e) => update({ m: Number(e.target.value) })}>
          <option value="">miesiąc</option>
          {MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
        </select>
        <select aria-label="Rok" className={sel} value={cur.y || ""} onChange={(e) => update({ y: Number(e.target.value) })}>
          <option value="">rok</option>
          {years.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {age !== null && <p className="text-sm text-muted">Wiek: {age} {polishYears(age)}</p>}
    </div>
  );
}
