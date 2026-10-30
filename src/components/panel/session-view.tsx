"use client";

import clsx from "clsx";
import { Clock, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveNoteAction } from "@/actions/cases";
import { Alert, Badge } from "@/components/ui";
import type { Stage } from "@/lib/session-plan";
import { NoteList, TAGS, type NoteLite } from "./notes";

interface Props {
  caseId: string;
  couple: boolean;
  minutes: number;
  startedAt: string | null;
  plan: Stage[];
  conditions: string[];
  risk: boolean;
  signals: { area: string; text: string; refs: string[]; who?: string; level: string }[];
  discrepancies: { ref: string; prompt: string; a: string; b: string }[];
  keyAnswers: { who: string; label: string; text: string }[];
  notes: NoteLite[];
  names: string[];
  endForm: React.ReactNode;
  startForm: React.ReactNode;
}

export function SessionView(p: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsedMin = p.startedAt ? Math.max(0, (now - new Date(p.startedAt).getTime()) / 60000) : 0;
  const auto = p.plan.find((s) => elapsedMin >= s.from && elapsedMin < s.to) ?? p.plan[p.plan.length - 1];
  const [manual, setManual] = useState<string | null>(null);
  // stan notatników etapów trzymany wyżej – przełączanie etapów nie gubi niezapisanej treści
  const [pads, setPads] = useState<Record<string, Pad>>(() => {
    const init: Record<string, Pad> = {};
    for (const n of p.notes) if (n.stage && !n.question_id && !init[n.stage]) init[n.stage] = { id: n.id, body: n.body, tags: n.tags, kind: n.kind, jointOk: n.joint_ok };
    return init;
  });
  const stage = p.plan.find((s) => s.key === manual) ?? (p.startedAt ? auto : p.plan[0]);
  const mm = Math.floor(elapsedMin);
  const ss = Math.floor((elapsedMin * 60) % 60);
  const over = elapsedMin > p.minutes;
  const feedbackSoon = p.startedAt && elapsedMin >= p.plan.find((s) => s.key === "feedback")!.from - 3 && elapsedMin < p.plan.find((s) => s.key === "feedback")!.from;

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr_340px]">
      {/* Harmonogram */}
      <aside className="space-y-4" aria-label="Harmonogram sesji">
        <div className="rounded-2xl bg-forest p-5 text-white shadow-soft">
          <p className="flex items-center gap-2 text-sm text-white/70"><Clock size={15} aria-hidden /> {p.startedAt ? "Czas sesji" : "Sesja nierozpoczęta"}</p>
          <p className={clsx("mt-1 font-display text-4xl tabular-nums", over && "text-rose")} aria-live="off">{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}<span className="text-lg text-white/60"> / {p.minutes}:00</span></p>
          <div className="mt-3">{p.startedAt ? p.endForm : p.startForm}</div>
        </div>
        {feedbackSoon && <Alert tone="warn">Za kilka minut informacja zwrotna – nie pozwól, by wypadła z powodu przeciągniętej części diagnostycznej.</Alert>}
        <ol className="space-y-1.5">
          {p.plan.map((s) => (
            <li key={s.key}>
              <button type="button" onClick={() => setManual(s.key)} aria-current={stage.key === s.key ? "step" : undefined}
                className={clsx("w-full rounded-xl px-3 py-2.5 text-left text-sm ring-1 transition", stage.key === s.key ? "bg-white ring-clay shadow-soft" : "bg-transparent ring-transparent hover:bg-white/60", p.startedAt && elapsedMin >= s.to && "opacity-60")}>
                <span className="block text-xs text-muted">{s.from}–{s.to} min</span>
                <span className="font-medium text-ink">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* Etap + notatki */}
      <section aria-labelledby="stage-h" className="min-w-0 space-y-5">
        {p.risk && (
          <Alert tone="alert" title={<span className="flex items-center gap-2"><ShieldAlert size={16} aria-hidden /> Sygnały zagrożenia w przesiewie</span>}>
            Jeśli w części indywidualnej pojawią się sygnały przemocy, nie kontynuuj części wspólnej według planu. Przejdź do ścieżki bezpieczeństwa: plan bezpieczeństwa, numery pomocy, bez terapii par i bez mediacji.
          </Alert>
        )}
        <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-sand">
          <p className="text-xs font-medium text-clay">{stage.from}–{stage.to} min</p>
          <h2 id="stage-h" className="font-display text-2xl text-ink">{stage.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">Cel: {stage.goal}</p>
          {stage.key === "contract" && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">{p.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
          )}
          {stage.questions && (
            <details open className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-forest">Pytania pogłębiające</summary>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">{stage.questions.map((q) => <li key={q} className="rounded-lg bg-ivory px-3 py-2">{q}</li>)}</ul>
            </details>
          )}
        </div>
        <StageNotepad key={stage.key} caseId={p.caseId} stage={stage} couple={p.couple} pad={pads[stage.key] ?? { body: "", tags: [], kind: "private", jointOk: false }} onPad={(x) => setPads((all) => ({ ...all, [stage.key]: x }))} />
        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">Notatki z innych etapów</h3>
          <NoteList notes={p.notes.filter((n) => n.stage !== stage.key && !Object.values(pads).some((x) => x.id === n.id))} caseId={p.caseId} />
        </div>
      </section>

      {/* Materiał */}
      <aside className="space-y-5" aria-label="Materiał z kwestionariuszy">
        <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
          <h3 className="font-display text-lg text-ink">Do pogłębienia</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {p.signals.length === 0 && <li className="text-muted">Brak sygnałów.</li>}
            {p.signals.map((s, i) => (
              <li key={i} className={clsx("rounded-lg p-2.5", s.level === "safety" ? "bg-alert-soft/60" : "bg-ivory")}>
                <span className="text-xs text-clay">{s.who ? `${s.who} · ` : ""}{s.refs.join(", ")}</span>
                <p className="text-ink">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
        {p.couple && (
          <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
            <h3 className="font-display text-lg text-ink">Ważne rozbieżności</h3>
            <p className="text-xs text-muted">Tylko dla psychologa – nie pokazuj ekranu uczestnikom.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {p.discrepancies.length === 0 && <li className="text-muted">Brak wyraźnych rozbieżności.</li>}
              {p.discrepancies.map((d) => (
                <li key={d.ref} className="rounded-lg bg-clay-soft/40 p-2.5">
                  <span className="text-xs text-muted">{d.ref}</span>
                  <p className="text-ink">{d.prompt}</p>
                  <p className="mt-1 text-xs">{p.names[0]}: <strong>{d.a}</strong> · {p.names[1]}: <strong>{d.b}</strong></p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
          <h3 className="font-display text-lg text-ink">Kluczowe odpowiedzi</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {p.keyAnswers.map((k, i) => (
              <li key={i}><span className="text-xs text-muted">{k.who} · {k.label}</span><p className="whitespace-pre-wrap text-ink">{k.text}</p></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

interface Pad {
  id?: string;
  body: string;
  tags: string[];
  kind: NoteLite["kind"];
  jointOk: boolean;
}

function StageNotepad({ caseId, stage, couple, pad, onPad }: { caseId: string; stage: Stage; couple: boolean; pad: Pad; onPad: (p: Pad) => void }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(pad.id ? "saved" : "idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(pad);
  latest.current = pad;
  const change = (patch: Partial<Pad>) => {
    const next = { ...latest.current, ...patch };
    onPad(next);
    latest.current = next;
    if (!next.body.trim()) return;
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const cur = latest.current;
      const r = await saveNoteAction({ id: cur.id, caseId, participantId: null, questionId: null, kind: cur.kind, jointOk: cur.jointOk, tags: cur.tags as never, body: cur.body, stage: stage.key });
      if ("id" in r && r.id) {
        if (!latest.current.id) onPad({ ...latest.current, id: r.id });
        latest.current = { ...latest.current, id: r.id };
        setState("saved");
      } else setState("error");
    }, 900);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const { body, tags, kind, jointOk } = pad;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand">
      <div className="flex items-center justify-between">
        <label htmlFor="pad" className="font-display text-lg text-ink">Notatki – {stage.title.toLowerCase()}</label>
        <Badge tone={state === "error" ? "alert" : state === "saved" ? "ok" : "neutral"}>{{ idle: "autozapis", saving: "zapisywanie…", saved: "zapisano", error: "błąd zapisu" }[state]}</Badge>
      </div>
      <textarea id="pad" value={body} onChange={(e) => change({ body: e.target.value })} className="mt-3 min-h-56 w-full rounded-xl bg-ivory p-3 text-[15px] leading-relaxed ring-1 ring-sand focus:outline-none focus:ring-2 focus:ring-forest" placeholder="Notuj na bieżąco… (sesja nie jest nagrywana ani transkrybowana)" />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <select aria-label="Rodzaj notatki" value={kind} onChange={(e) => change({ kind: e.target.value as NoteLite["kind"] })} className="rounded-lg bg-ivory px-2 py-1 ring-1 ring-sand">
          <option value="private">notatka prywatna</option>
          <option value="discussed">ustalenie omówione na sesji</option>
          <option value="report">dopuszczona do podsumowania</option>
        </select>
        {couple && kind === "report" && <label className="flex items-center gap-1"><input type="checkbox" className="accent-forest" checked={jointOk} onChange={(e) => change({ jointOk: e.target.checked })} /> do podsumowania wspólnego</label>}
        {Object.entries(TAGS).map(([k, l]) => (
          <label key={k} className="flex items-center gap-1"><input type="checkbox" className="accent-forest" checked={tags.includes(k)} onChange={(e) => change({ tags: e.target.checked ? [...tags, k] : tags.filter((x) => x !== k) })} /> {l}</label>
        ))}
      </div>
    </div>
  );
}
