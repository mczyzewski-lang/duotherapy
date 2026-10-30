"use client";

// Ogólny edytor sekcji ustawień (pola tekstowe, przełączniki, listy) zapisujący JSON przez akcję serwera.
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveSettingsAction } from "@/actions/admin";
import { Alert, Button } from "@/components/ui";

type Val = string | number | boolean | Val[] | { [k: string]: Val };
const cls = "w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-sand-dark focus:outline-none focus:ring-2 focus:ring-forest";

export function SettingsForm({ section, value, labels }: { section: string; value: Record<string, Val>; labels: Record<string, string> }) {
  const [v, setV] = useState(value);
  const [state, action] = useActionState(saveSettingsAction as never, undefined as { error?: string; ok?: string } | undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="json" value={JSON.stringify(v)} />
      {Object.entries(v).map(([k, val]) => (
        <Editor key={k} label={labels[k] ?? k} value={val} onChange={(nv) => setV({ ...v, [k]: nv })} long={typeof val === "string" && (val.length > 80 || /Policy|Notice|Consent|abroad|disclaimer/i.test(k))} />
      ))}
      {state?.error && <Alert tone="alert">{state.error}</Alert>}
      {state?.ok && <Alert tone="ok">{state.ok}</Alert>}
      <Button type="submit" size="sm">Zapisz sekcję</Button>
    </form>
  );
}

function Editor({ label, value, onChange, long }: { label: string; value: Val; onChange: (v: Val) => void; long?: boolean }) {
  if (typeof value === "boolean")
    return <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" className="h-4 w-4 accent-forest" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
  if (typeof value === "number")
    return <label className="block text-sm text-ink">{label}<input type="number" className={cls + " mt-1 max-w-40"} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
  if (typeof value === "string")
    return <label className="block text-sm text-ink">{label}{long ? <textarea className={cls + " mt-1 min-h-24"} value={value} onChange={(e) => onChange(e.target.value)} /> : <input className={cls + " mt-1"} value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
  if (Array.isArray(value)) {
    const tmpl = value[0] && typeof value[0] === "object" ? Object.fromEntries(Object.keys(value[0] as object).map((k) => [k, ""])) : "";
    return (
      <fieldset className="space-y-2 rounded-xl bg-ivory p-3 ring-1 ring-sand">
        <legend className="px-1 text-sm font-medium text-ink">{label}</legend>
        {value.map((item, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1 space-y-1">
              {typeof item === "object" && !Array.isArray(item)
                ? Object.entries(item).map(([k, x]) => <Editor key={k} label={k} value={x} long={k === "a" || k === "when"} onChange={(nv) => onChange(value.map((y, j) => (j === i ? { ...(y as object), [k]: nv } : y)) as Val)} />)
                : <Editor label={`${i + 1}`} value={item} onChange={(nv) => onChange(value.map((y, j) => (j === i ? nv : y)))} />}
            </div>
            <button type="button" aria-label="Usuń" className="self-start p-2 text-muted hover:text-alert" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...value, tmpl as Val])}><Plus size={14} aria-hidden /> Dodaj</Button>
      </fieldset>
    );
  }
  return null;
}
