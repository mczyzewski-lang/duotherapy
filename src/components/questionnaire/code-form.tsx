"use client";

import { KeyRound } from "lucide-react";
import { useState, useTransition } from "react";
import { verifyCodeAction } from "@/app/q/[token]/actions";
import { Alert, Button, Field, Input } from "@/components/ui";

export function CodeForm({ token, firstName }: { token: string; firstName: string }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-8 animate-rise rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Mapa Relacji · DUO®</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">Cześć, {firstName}. To bezpieczna przestrzeń, w której możesz opisać swoją perspektywę.</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Dla Twojego bezpieczeństwa link działa razem z 6-cyfrowym kodem dostępu, który przekazał Ci psycholog prowadzący (np. telefonicznie). Dzięki temu nikt, kto
        zobaczy sam link, nie odczyta Twoich odpowiedzi.
      </p>
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          start(async () => {
            const r = await verifyCodeAction(token, code);
            if (!r.ok) setErr(r.error);
            else window.location.reload();
          });
        }}
      >
        <div className="flex-1">
          <Field label="Kod dostępu" htmlFor="code" error={err ?? undefined}>
            <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" className="text-lg tracking-[0.3em]" aria-invalid={!!err} />
          </Field>
        </div>
        <Button type="submit" disabled={pending || code.replace(/\D/g, "").length !== 6}>
          <KeyRound size={17} aria-hidden /> {pending ? "Sprawdzam…" : "Otwórz kwestionariusz"}
        </Button>
      </form>
      <Alert tone="info" className="mt-6">Nie masz kodu? Napisz lub zadzwoń do psychologa prowadzącego – nie przesyłamy kodu razem z linkiem.</Alert>
    </div>
  );
}
