"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteNoteAction, saveNoteAction } from "@/actions/cases";
import { Badge, Button } from "@/components/ui";

export interface NoteLite {
  id: string;
  participant_id: string | null;
  question_id: string | null;
  kind: "private" | "discussed" | "report";
  joint_ok: boolean;
  tags: string[];
  stage: string | null;
  body: string;
  author: string;
  created_at: string;
}

export const NOTE_KIND: Record<NoteLite["kind"], string> = {
  private: "notatka prywatna psychologa",
  discussed: "ustalenie omówione na sesji",
  report: "informacja dopuszczona do podsumowania",
};
export const TAGS: Record<string, string> = { to_check: "do sprawdzenia", important: "ważne do podsumowania", discussed: "omówione" };

export function NoteList({ notes, caseId }: { notes: NoteLite[]; caseId: string }) {
  const [pending, start] = useTransition();
  if (!notes.length) return null;
  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li key={n.id} className="rounded-xl bg-clay-soft/40 p-3 text-sm ring-1 ring-clay/15">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={n.kind === "report" ? "forest" : n.kind === "discussed" ? "neutral" : "clay"}>{NOTE_KIND[n.kind]}</Badge>
            {n.joint_ok && <Badge tone="ok">może trafić do podsumowania wspólnego</Badge>}
            {n.tags.map((t) => <Badge key={t}>{TAGS[t]}</Badge>)}
            <span className="ml-auto text-xs text-muted">{n.author} · {new Date(n.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</span>
            <button type="button" aria-label="Usuń notatkę" disabled={pending} className="text-muted hover:text-alert" onClick={() => confirm("Usunąć notatkę?") && start(() => deleteNoteAction(n.id, caseId))}>
              <Trash2 size={14} aria-hidden />
            </button>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-ink">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function NoteForm({ caseId, participantId, questionId, couple, stage, onSaved, compact, defaultKind = "private" }: { caseId: string; participantId: string | null; questionId: string | null; couple: boolean; stage?: string | null; onSaved?: (n: NoteLite) => void; compact?: boolean; defaultKind?: NoteLite["kind"] }) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<NoteLite["kind"]>(defaultKind);
  const [jointOk, setJointOk] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);
  const save = () =>
    start(async () => {
      const r = await saveNoteAction({ caseId, participantId, questionId, kind, jointOk, tags: tags as never, body, stage: stage ?? null });
      if ("error" in r && r.error) setMsg(r.error);
      else {
        onSaved?.({ id: (r as { id: string }).id, participant_id: participantId, question_id: questionId, kind, joint_ok: kind === "report" && jointOk, tags, stage: stage ?? null, body, author: "Ty", created_at: new Date().toISOString() });
        setBody("");
        setTags([]);
        setMsg("Zapisano");
        setTimeout(() => setMsg(null), 1500);
        ref.current?.focus();
      }
    });
  return (
    <div className={clsx("space-y-2 rounded-xl bg-white p-3 ring-1 ring-sand", compact && "p-2")}>
      <label className="sr-only" htmlFor={`note-${questionId ?? stage ?? "g"}`}>Notatka psychologa</label>
      <textarea
        id={`note-${questionId ?? stage ?? "g"}`}
        ref={ref}
        className="min-h-16 w-full rounded-lg bg-ivory px-3 py-2 text-sm ring-1 ring-sand focus:outline-none focus:ring-2 focus:ring-forest"
        placeholder="Notatka psychologa (oddzielona od odpowiedzi klienta)…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && body.trim() && save()}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select aria-label="Rodzaj notatki" value={kind} onChange={(e) => setKind(e.target.value as NoteLite["kind"])} className="rounded-lg bg-ivory px-2 py-1 ring-1 ring-sand">
          {Object.entries(NOTE_KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        {couple && kind === "report" && (
          <label className="flex items-center gap-1"><input type="checkbox" checked={jointOk} onChange={(e) => setJointOk(e.target.checked)} className="accent-forest" /> może trafić do podsumowania wspólnego</label>
        )}
        {Object.entries(TAGS).map(([k, l]) => (
          <label key={k} className="flex items-center gap-1"><input type="checkbox" checked={tags.includes(k)} onChange={(e) => setTags((t) => (e.target.checked ? [...t, k] : t.filter((x) => x !== k)))} className="accent-forest" /> {l}</label>
        ))}
        <Button size="sm" className="ml-auto" disabled={pending || !body.trim()} onClick={save}>{pending ? "Zapis…" : "Dodaj notatkę"}</Button>
        {msg && <span className="text-ok" role="status">{msg}</span>}
      </div>
    </div>
  );
}
