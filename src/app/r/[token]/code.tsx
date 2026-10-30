"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { verifyReportCode } from "./actions";

export function ReportCode({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await verifyReportCode(token, code); if (r.ok) location.reload(); else setErr(r.error ?? "Błąd"); }); }}>
      <Field label="Kod dostępu do podsumowania" htmlFor="rc"><Input id="rc" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={7} className="tracking-[0.3em]" /></Field>
      {err && <Alert tone="alert">{err}</Alert>}
      <Button type="submit" disabled={pending}>Otwórz podsumowanie</Button>
    </form>
  );
}
