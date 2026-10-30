"use client";

import clsx from "clsx";
import { History, MessageSquarePlus, PencilLine } from "lucide-react";
import { useState, useTransition } from "react";
import { correctAnswerAction } from "@/actions/cases";
import { QuestionInput, type AState, type QView } from "@/components/questionnaire/question-input";
import { Alert, Badge, Button, Input } from "@/components/ui";
import { NoteForm, NoteList, type NoteLite } from "./notes";

export interface AnswerItem {
  q: QView & { ref: string };
  a: (AState & { byTherapist: boolean; updatedAt: string }) | null;
  display: string;
  revisions: { at: string; who: string; reason: string | null; old: string; new: string }[];
}

export function AnswersView({ caseId, participantId, couple, sections, notes: initial }: { caseId: string; participantId: string; couple: boolean; sections: { key: string; title: string; items: AnswerItem[] }[]; notes: NoteLite[] }) {
  const [notes, setNotes] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [fix, setFix] = useState<string | null>(null);
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.key} id={`s-${s.key}`} aria-labelledby={`h-${s.key}`} className="scroll-mt-6">
          <h2 id={`h-${s.key}`} className="mb-3 font-display text-xl text-ink">{s.title}</h2>
          <ol className="divide-y divide-sand/70 rounded-2xl bg-white shadow-soft ring-1 ring-sand">
            {s.items.map(({ q, a, display, revisions }) => {
              const qNotes = notes.filter((n) => n.question_id === q.id);
              const flagged = q.type === "screening" && (display === "tak" || display === "wolę omówić na sesji");
              return (
                <li key={q.id} className="p-4 sm:p-5">
                  <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                    <div>
                      <p className="text-xs text-muted">{q.ref}</p>
                      <p className="text-[15px] text-ink">{q.prompt}</p>
                    </div>
                    <div className="md:text-right">
                      <p className={clsx("text-[15px] font-medium", !a ? "text-muted" : flagged ? "text-alert" : "text-forest")} data-testid={`answer-${q.key}`}>
                        {display}
                      </p>
                      {a?.byTherapist && <Badge tone="clay" className="mt-1">poprawione przez psychologa</Badge>}
                    </div>
                  </div>
                  {revisions.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="flex cursor-pointer items-center gap-1 text-muted"><History size={12} aria-hidden /> Historia zmian ({revisions.length})</summary>
                      <ul className="mt-1 space-y-1">
                        {revisions.map((r, i) => (
                          <li key={i} className="rounded-lg bg-ivory p-2">
                            <span className="text-muted">{new Date(r.at).toLocaleString("pl-PL")} · {r.who}{r.reason ? ` · powód: ${r.reason}` : ""}</span>
                            <br />
                            <span className="line-through">{r.old}</span> → <strong>{r.new}</strong>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="mt-3"><NoteList notes={qNotes} caseId={caseId} /></div>
                  <div className="mt-2 flex gap-3 text-xs">
                    <button type="button" className="flex items-center gap-1 text-forest" onClick={() => setOpen(open === q.id ? null : q.id)}><MessageSquarePlus size={13} aria-hidden /> Notatka do pytania</button>
                    {q.type !== "consent" && q.type !== "signature" && (
                      <button type="button" className="flex items-center gap-1 text-muted hover:text-clay" onClick={() => setFix(fix === q.id ? null : q.id)}><PencilLine size={13} aria-hidden /> Popraw na prośbę klienta</button>
                    )}
                  </div>
                  {open === q.id && (
                    <div className="mt-2"><NoteForm caseId={caseId} participantId={participantId} questionId={q.id} couple={couple} onSaved={(n) => setNotes((x) => [...x, n])} /></div>
                  )}
                  {fix === q.id && <Correction participantId={participantId} q={q} a={a} onDone={() => setFix(null)} />}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Correction({ participantId, q, a, onDone }: { participantId: string; q: QView; a: AState | null; onDone: () => void }) {
  const [val, setVal] = useState<AState | undefined>(a ?? undefined);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-clay/30">
      <p className="text-xs text-ink-soft">Korekta odpowiedzi klienta – poprzednia wartość, autor i czas zostaną zapisane w historii zmian.</p>
      <QuestionInput q={{ ...q, prompt: "Nowa wartość", hint: null, required: false }} a={val} onChange={setVal} compact />
      <label className="block text-xs text-muted">Powód zmiany<Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="np. klient poprosił o poprawkę podczas rozmowy 12.11" /></label>
      {err && <Alert tone="alert">{err}</Alert>}
      <div className="flex gap-2">
        <Button size="sm" disabled={pending || !val || !reason.trim()} onClick={() => start(async () => {
          const r = await correctAnswerAction(participantId, q.id, val!.state, val!.value, reason);
          if (!r.ok) setErr(r.error);
          else onDone();
        })}>Zapisz korektę</Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Anuluj</Button>
      </div>
    </div>
  );
}
