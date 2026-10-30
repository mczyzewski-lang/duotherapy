"use client";

import { useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui";

export function NewCaseFields(p: { defaultKind?: string; defaultName?: string; defaultEmail?: string; defaultPhone?: string; therapists: { id: string; name: string }[]; defaultTherapist: string; isAdmin: boolean }) {
  const [kind, setKind] = useState(p.defaultKind === "couple" ? "couple" : "individual");
  const person = (i: number) => (
    <fieldset key={i} className="space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-sand">
      <legend className="px-1 text-sm font-medium text-ink">{kind === "couple" ? `Osoba ${i}` : "Uczestnik"}</legend>
      <Field label="Imię (do powitania)" htmlFor={`p${i}_name`} required><Input id={`p${i}_name`} name={`p${i}_name`} defaultValue={i === 1 ? p.defaultName : ""} required /></Field>
      <Field label="Wersja kwestionariusza (forma gramatyczna)" htmlFor={`p${i}_gender`}>
        <Select id={`p${i}_gender`} name={`p${i}_gender`} defaultValue={i === 1 ? "female" : "male"}>
          <option value="female">dla niej</option>
          <option value="male">dla niego</option>
        </Select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="E-mail" htmlFor={`p${i}_email`}><Input id={`p${i}_email`} name={`p${i}_email`} type="email" defaultValue={i === 1 ? p.defaultEmail : ""} /></Field>
        <Field label="Telefon" htmlFor={`p${i}_phone`}><Input id={`p${i}_phone`} name={`p${i}_phone`} defaultValue={i === 1 ? p.defaultPhone : ""} /></Field>
      </div>
    </fieldset>
  );
  return (
    <>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Rodzaj audytu</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[["individual", "Indywidualny · 60 min"], ["couple", "Para · 90 min"]].map(([v, l]) => (
            <label key={v} className={`cursor-pointer rounded-xl px-3 py-2.5 text-center text-sm ring-1 ${kind === v ? "bg-forest text-white ring-forest" : "bg-white ring-sand-dark"}`}>
              <input type="radio" name="kind" value={v} checked={kind === v} onChange={() => setKind(v)} className="sr-only" /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      {person(1)}
      {kind === "couple" && person(2)}
      {kind === "couple" && <p className="text-xs text-muted">Każda osoba dostanie osobny link i kod. Odpowiedzi nie są widoczne dla drugiej osoby.</p>}
      <Field label="Cel audytu / powód zgłoszenia" htmlFor="goal"><Textarea id="goal" name="goal" className="min-h-20" /></Field>
      <Field label="Psycholog prowadzący" htmlFor="therapist_id">
        <Select id="therapist_id" name="therapist_id" defaultValue={p.defaultTherapist} disabled={!p.isAdmin}>
          {p.therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </Field>
      {!p.isAdmin && <input type="hidden" name="therapist_id" value={p.defaultTherapist} />}
    </>
  );
}
