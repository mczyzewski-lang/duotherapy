"use client";

// Kalendarz terminów: klik w puste pole = nowy termin, klik w wolny termin = do usunięcia, „Zapisz zmiany” zapisuje wszystko naraz.
// Do tego szybkie narzędzia: wzór godzin, powtórzenie tygodnia, wyczyszczenie wolnych terminów.
import clsx from "clsx";
import { CalendarPlus, ChevronLeft, ChevronRight, Copy, Eraser, Info, Trash2, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applySlotChangesAction, clearWeekAction, copyWeekAction, fillPatternAction } from "@/actions/slots";
import { addDays, DAY_LONG, DAY_SHORT, dayLabel, fromMin, toMin } from "@/lib/slot-dates";

export type CalSlot = { id: string; date: string; time: string; minutes: number; status: "free" | "booked"; client: string | null; caseId: string | null };
type Msg = { tone: "ok" | "error"; text: string } | null;

const START = 7 * 60; // 07:00
const END = 21 * 60; // 21:00
const STEP = 30;
const ROW = 24; // px na 30 minut
const ROWS = (END - START) / STEP;

export function SlotCalendar(p: {
  weekStart: string;
  today: string;
  nowMin: number;
  slots: CalSlot[];
  therapistId: string;
  therapists: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [minutes, setMinutes] = useState<60 | 90>(60);
  const [add, setAdd] = useState<{ date: string; time: string; minutes: number }[]>([]);
  const [remove, setRemove] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<Msg>(null);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(p.weekStart, i)), [p.weekStart]);
  const q = (w: string, t = p.therapistId) => `/app/terminy?w=${w}${p.isAdmin && t ? `&t=${t}` : ""}`;
  const dirty = add.length + remove.size;

  const isPast = (date: string, m: number) => date < p.today || (date === p.today && m < p.nowMin + 30);
  const busy = (date: string, m: number, len: number) =>
    p.slots.some((s) => s.date === date && toMin(s.time) < m + len && toMin(s.time) + s.minutes > m) ||
    add.some((a) => a.date === date && toMin(a.time) < m + len && toMin(a.time) + a.minutes > m);

  function clickCell(date: string, m: number) {
    setMsg(null);
    if (isPast(date, m)) return;
    if (m + minutes > END) return setMsg({ tone: "error", text: `Termin ${minutes} min nie zmieści się przed 21:00.` });
    if (busy(date, m, minutes)) return setMsg({ tone: "error", text: "Ten czas nachodzi na inny termin." });
    setAdd((a) => [...a, { date, time: fromMin(m), minutes }]);
  }
  const unAdd = (date: string, time: string) => setAdd((a) => a.filter((x) => !(x.date === date && x.time === time)));
  const toggleRemove = (id: string) => setRemove((r) => { const n = new Set(r); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  function run(fn: () => Promise<{ error?: string; ok?: string } | undefined>, after?: () => void) {
    setMsg(null);
    start(async () => {
      const r = await fn();
      if (r?.error) setMsg({ tone: "error", text: r.error });
      else { setMsg({ tone: "ok", text: r?.ok ?? "Zapisano." }); after?.(); router.refresh(); }
    });
  }
  function save() {
    // długość każdego nowego terminu wysyłamy grupami (60 i 90 min)
    const groups = [60, 90].map((len) => add.filter((a) => a.minutes === len)).filter((g) => g.length);
    run(async () => {
      let last: { error?: string; ok?: string } | undefined;
      const parts: string[] = [];
      if (!groups.length) last = await applySlotChangesAction({ therapistId: p.therapistId, minutes, add: [], remove: [...remove] });
      for (const [i, g] of groups.entries()) {
        last = await applySlotChangesAction({ therapistId: p.therapistId, minutes: g[0].minutes, add: g.map(({ date, time }) => ({ date, time })), remove: i === 0 ? [...remove] : [] });
        if (last?.error) return last;
        if (last?.ok) parts.push(last.ok);
      }
      return parts.length > 1 ? { ok: parts.join(" ") } : last;
    }, () => { setAdd([]); setRemove(new Set()); });
  }

  const freeCount = p.slots.filter((s) => s.status === "free").length;
  const bookedCount = p.slots.length - freeCount;

  return (
    <div className="space-y-5" data-testid="slot-calendar">
      {/* Pasek: osoba, tydzień, długość */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-sand">
        {p.isAdmin && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Psycholog</span>
            <select className="min-h-10 rounded-full bg-linen/60 px-3 text-sm ring-1 ring-sand" value={p.therapistId} onChange={(e) => router.push(q(p.weekStart, e.target.value))} aria-label="Psycholog">
              {p.therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <Link href={q(addDays(p.weekStart, -7))} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-sand hover:bg-linen" aria-label="Poprzedni tydzień"><ChevronLeft size={18} /></Link>
          <Link href={q(addDays(p.today, 0))} className="min-h-10 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-sand hover:bg-linen">Dziś</Link>
          <Link href={q(addDays(p.weekStart, 7))} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-sand hover:bg-linen" aria-label="Następny tydzień"><ChevronRight size={18} /></Link>
        </div>
        <p className="font-display text-lg text-ink" data-testid="week-label">{dayLabel(days[0])} – {dayLabel(days[6])} {days[6].slice(0, 4)}</p>
        <p className="text-sm text-muted">wolne: <strong className="text-forest">{freeCount}</strong> · zarezerwowane: <strong className="text-ink">{bookedCount}</strong></p>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted">Nowy termin:</span>
          <div className="flex rounded-full bg-linen/70 p-1 ring-1 ring-sand" role="radiogroup" aria-label="Długość nowego terminu">
            {([60, 90] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={minutes === m} onClick={() => setMinutes(m)}
                className={clsx("min-h-8 rounded-full px-3 text-sm font-medium transition", minutes === m ? "bg-forest text-white shadow-soft" : "text-ink-soft hover:text-forest")}>
                {m} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="flex items-start gap-2 text-sm text-ink-soft"><Info size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />
        <span>Kliknij puste pole, żeby dodać termin ({minutes} min). Kliknij wolny termin, żeby go usunąć. Na koniec <strong>Zapisz zmiany</strong>. Online klienci rezerwują terminy 60-minutowe.</span>
      </p>

      {/* Siatka tygodnia */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-sand">
        <div className="grid min-w-[780px] grid-cols-[56px_repeat(7,1fr)]">
          <div className="sticky left-0 z-20 border-b border-sand bg-white" />
          {days.map((d, i) => (
            <div key={d} className={clsx("border-b border-l border-sand px-2 py-2 text-center", d === p.today && "bg-sage-soft/50")}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{DAY_SHORT[i]}</p>
              <p className={clsx("font-display text-lg leading-tight", d === p.today ? "text-forest" : "text-ink")}>{dayLabel(d)}</p>
            </div>
          ))}
          {/* kolumna godzin */}
          <div className="sticky left-0 z-20 bg-white" style={{ height: ROWS * ROW }}>
            {Array.from({ length: ROWS / 2 }, (_, i) => (
              <div key={i} className="relative border-sand pr-2 text-right text-[11px] text-muted" style={{ height: ROW * 2 }}>
                <span className="relative -top-2">{fromMin(START + i * 60)}</span>
              </div>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className={clsx("relative border-l border-sand", d === p.today && "bg-sage-soft/20")} style={{ height: ROWS * ROW }}>
              {/* puste pola co 30 min */}
              {Array.from({ length: ROWS }, (_, r) => {
                const m = START + r * STEP;
                const past = isPast(d, m);
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={past}
                    onClick={() => clickCell(d, m)}
                    data-testid={`cell-${d}-${fromMin(m)}`}
                    aria-label={`Dodaj termin: ${DAY_LONG[di]} ${dayLabel(d)}, ${fromMin(m)}`}
                    className={clsx(
                      "group absolute inset-x-0 flex items-center justify-center",
                      r % 2 === 0 ? "border-t border-sand/80" : "border-t border-dashed border-sand/50",
                      past ? "cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgba(234,220,203,0.45)_6px_8px)]" : "hover:bg-clay-soft/60",
                    )}
                    style={{ top: r * ROW, height: ROW }}
                  >
                    {!past && <span className="hidden text-[11px] font-medium text-clay group-hover:inline">+ {fromMin(m)}</span>}
                  </button>
                );
              })}
              {/* istniejące terminy */}
              {p.slots.filter((s) => s.date === d).map((s) => {
                const top = ((toMin(s.time) - START) / STEP) * ROW;
                const h = (s.minutes / STEP) * ROW - 3;
                if (toMin(s.time) < START || toMin(s.time) >= END) return null;
                const del = remove.has(s.id);
                return s.status === "booked" ? (
                  <a key={s.id} href={s.caseId ? `/app/cases/${s.caseId}` : undefined} data-testid="slot-booked"
                    className="absolute inset-x-1 z-10 overflow-hidden rounded-lg bg-forest px-2 py-1 text-left text-[11px] leading-tight text-white shadow-soft"
                    style={{ top: top + 1, height: h }} title={`Zarezerwowany: ${s.client ?? ""}`}>
                    <p className="font-semibold">{s.time} · {s.minutes} min</p>
                    <p className="truncate opacity-90">{s.client ?? "zarezerwowany"}</p>
                  </a>
                ) : (
                  <button key={s.id} type="button" onClick={() => toggleRemove(s.id)} data-testid="slot-free"
                    aria-label={`${del ? "Przywróć" : "Usuń"} termin ${s.time}`}
                    className={clsx("group absolute inset-x-1 z-10 overflow-hidden rounded-lg px-2 py-1 text-left text-[11px] leading-tight ring-1 transition",
                      del ? "bg-alert-soft text-alert line-through ring-alert/40" : "bg-sage-soft text-forest ring-sage/50 hover:bg-alert-soft hover:text-alert hover:ring-alert/40")}
                    style={{ top: top + 1, height: h }}>
                    <p className="font-semibold">{s.time} · {s.minutes} min</p>
                    <p className="flex items-center gap-1 opacity-80">{del ? <><Undo2 size={11} /> przywróć</> : <><span className="group-hover:hidden">wolny</span><span className="hidden items-center gap-1 group-hover:inline-flex"><Trash2 size={11} /> usuń</span></>}</p>
                  </button>
                );
              })}
              {/* nowe (niezapisane) */}
              {add.filter((a) => a.date === d).map((a) => (
                <button key={a.time} type="button" onClick={() => unAdd(a.date, a.time)} data-testid="slot-new"
                  aria-label={`Cofnij nowy termin ${a.time}`}
                  className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border-2 border-dashed border-clay bg-clay-soft/80 px-2 py-1 text-left text-[11px] leading-tight text-clay"
                  style={{ top: ((toMin(a.time) - START) / STEP) * ROW + 1, height: (a.minutes / STEP) * ROW - 3 }}>
                  <p className="font-semibold">{a.time} · {a.minutes} min</p>
                  <p className="flex items-center gap-1"><X size={11} /> nowy</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded bg-sage-soft ring-1 ring-sage/50" /> wolny</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded bg-forest" /> zarezerwowany (klik – sprawa)</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded border-2 border-dashed border-clay bg-clay-soft" /> nowy, niezapisany</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded bg-alert-soft ring-1 ring-alert/40" /> do usunięcia</span>
      </div>

      {msg && <p role={msg.tone === "error" ? "alert" : "status"} className={clsx("rounded-xl px-4 py-3 text-sm ring-1", msg.tone === "error" ? "bg-alert-soft text-ink ring-alert/30" : "bg-sage-soft text-ink ring-ok/30")}>{msg.text}</p>}

      <Tools weekStart={p.weekStart} today={p.today} therapistId={p.therapistId} minutes={minutes} run={run} pending={pending} />

      {/* Pasek zapisu – widoczny, gdy są niezapisane zmiany */}
      {dirty > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-white shadow-[0_18px_40px_-12px_rgba(31,42,35,0.6)]" data-testid="slot-savebar">
          <p className="text-sm">
            {add.length > 0 && <span>+{add.length} {add.length === 1 ? "nowy termin" : "nowe terminy"}</span>}
            {add.length > 0 && remove.size > 0 && " · "}
            {remove.size > 0 && <span>−{remove.size} do usunięcia</span>}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setAdd([]); setRemove(new Set()); setMsg(null); }} className="min-h-10 rounded-full px-4 text-sm text-white/80 hover:text-white">Anuluj</button>
            <button type="button" onClick={save} disabled={pending} className="min-h-10 rounded-full bg-clay px-5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Zapisuję…" : "Zapisz zmiany"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Szybkie narzędzia: wzór godzin, powtórzenie tygodnia, wyczyszczenie. */
function Tools(p: { weekStart: string; today: string; therapistId: string; minutes: 60 | 90; pending: boolean; run: (fn: () => Promise<{ error?: string; ok?: string } | undefined>) => void }) {
  const [daysSel, setDaysSel] = useState<number[]>([0, 1, 2, 3, 4]);
  const [from, setFrom] = useState(p.weekStart < p.today ? p.today : p.weekStart);
  const [to, setTo] = useState(addDays(p.weekStart, 27));
  const [startT, setStartT] = useState("09:00");
  const [endT, setEndT] = useState("17:00");
  const [every, setEvery] = useState(60);
  const [weeks, setWeeks] = useState(4);
  const hours = Array.from({ length: (END - START) / 30 + 1 }, (_, i) => fromMin(START + i * 30));
  const input = "min-h-10 rounded-xl bg-white px-3 text-sm ring-1 ring-sand";
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand" data-testid="slot-pattern">
        <h3 className="flex items-center gap-2 font-display text-lg text-ink"><CalendarPlus size={18} className="text-clay" aria-hidden /> Dodaj wiele terminów naraz</h3>
        <p className="mt-1 text-sm text-muted">Np. poniedziałek–piątek, 9:00–17:00, co godzinę, przez 4 tygodnie.</p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Dni tygodnia">
          {DAY_SHORT.map((d, i) => {
            const on = daysSel.includes(i);
            return (
              <button key={d} type="button" aria-pressed={on} onClick={() => setDaysSel((s) => (on ? s.filter((x) => x !== i) : [...s, i]))}
                className={clsx("min-h-10 w-12 rounded-full text-sm font-medium ring-1 transition", on ? "bg-forest text-white ring-forest" : "bg-white text-ink-soft ring-sand hover:ring-forest/40")}>{d}</button>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted">Od godziny<select className={clsx(input, "mt-1 w-full")} value={startT} onChange={(e) => setStartT(e.target.value)}>{hours.map((h) => <option key={h}>{h}</option>)}</select></label>
          <label className="text-xs text-muted">Do godziny<select className={clsx(input, "mt-1 w-full")} value={endT} onChange={(e) => setEndT(e.target.value)}>{hours.map((h) => <option key={h}>{h}</option>)}</select></label>
          <label className="text-xs text-muted">Co<select className={clsx(input, "mt-1 w-full")} value={every} onChange={(e) => setEvery(Number(e.target.value))}><option value={60}>60 min</option><option value={90}>90 min</option><option value={120}>2 godziny</option></select></label>
          <p className="text-xs text-muted">Długość<span className="mt-1 flex min-h-10 items-center rounded-xl bg-linen/60 px-3 text-sm text-ink ring-1 ring-sand">{p.minutes} min (wybór u góry)</span></p>
          <label className="text-xs text-muted">Od dnia<input type="date" className={clsx(input, "mt-1 w-full")} value={from} min={p.today} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="text-xs text-muted">Do dnia<input type="date" className={clsx(input, "mt-1 w-full")} value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <button type="button" disabled={p.pending} className="mt-4 min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
          onClick={() => p.run(() => fillPatternAction({ therapistId: p.therapistId, from, to, days: daysSel, start: startT, end: endT, every, minutes: p.minutes }))}>
          Dodaj terminy według wzoru
        </button>
        <p className="mt-2 text-xs text-muted">Zajęte godziny i przeszłość są pomijane – nic się nie zdubluje.</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
          <h3 className="flex items-center gap-2 font-display text-lg text-ink"><Copy size={17} className="text-clay" aria-hidden /> Powtórz ten tydzień</h3>
          <p className="mt-1 text-sm text-muted">Te same dni i godziny w kolejnych tygodniach.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select className={input} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} aria-label="Na ile tygodni">
              {[1, 2, 3, 4, 6, 8, 12].map((n) => <option key={n} value={n}>na {n} {n === 1 ? "tydzień" : n < 5 ? "tygodnie" : "tygodni"}</option>)}
            </select>
            <button type="button" disabled={p.pending} className="min-h-10 rounded-full px-4 text-sm font-medium text-forest ring-1 ring-forest/40 hover:bg-sage-soft disabled:opacity-60"
              onClick={() => p.run(() => copyWeekAction({ therapistId: p.therapistId, weekStart: p.weekStart, weeks }))}>Powtórz</button>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
          <h3 className="flex items-center gap-2 font-display text-lg text-ink"><Eraser size={17} className="text-clay" aria-hidden /> Wyczyść ten tydzień</h3>
          <p className="mt-1 text-sm text-muted">Usuwa wszystkie wolne terminy z widocznego tygodnia. Rezerwacje zostają.</p>
          <button type="button" disabled={p.pending} className="mt-3 min-h-10 rounded-full px-4 text-sm font-medium text-alert ring-1 ring-alert/40 hover:bg-alert-soft disabled:opacity-60"
            onClick={() => { if (window.confirm("Usunąć wszystkie wolne terminy z tego tygodnia?")) p.run(() => clearWeekAction({ therapistId: p.therapistId, weekStart: p.weekStart })); }}>Usuń wolne terminy</button>
        </div>
      </section>
    </div>
  );
}
