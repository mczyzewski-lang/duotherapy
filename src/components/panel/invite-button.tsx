"use client";

import { Copy, KeyRound, Link2 } from "lucide-react";
import { useState, useTransition } from "react";
import { generateInviteAction } from "@/actions/cases";
import { Alert, Button } from "@/components/ui";

export function InviteButton({ participantId, hasActive }: { participantId: string; hasActive: boolean }) {
  const [res, setRes] = useState<{ url: string; code: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const copy = async (t: string, what: string) => {
    await navigator.clipboard.writeText(t);
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div className="space-y-3">
      <Button
        size="sm"
        variant={hasActive ? "secondary" : "primary"}
        disabled={pending}
        onClick={() => {
          if (hasActive && !confirm("Wygenerowanie nowego linku unieważni poprzedni. Kontynuować?")) return;
          start(async () => {
            const r = await generateInviteAction(participantId);
            if ("error" in r) setErr(r.error);
            else setRes(r);
          });
        }}
      >
        <Link2 size={15} aria-hidden /> {hasActive ? "Wygeneruj nowy link" : "Wygeneruj link do kwestionariusza"}
      </Button>
      {err && <Alert tone="alert">{err}</Alert>}
      {res && (
        <div className="space-y-2 rounded-xl bg-sage-soft/50 p-4 ring-1 ring-sage/40" role="status">
          <p className="text-xs font-medium text-forest">Dane widoczne tylko teraz – w bazie zapisujemy wyłącznie ich hash.</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-2 py-1.5 text-xs" data-testid="invite-url">{res.url}</code>
            <Button size="sm" variant="secondary" onClick={() => copy(res.url, "url")}><Copy size={14} aria-hidden /> {copied === "url" ? "Skopiowano" : "Link"}</Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-base tracking-[0.3em]" data-testid="invite-code">{res.code}</code>
            <Button size="sm" variant="secondary" onClick={() => copy(res.code, "code")}><KeyRound size={14} aria-hidden /> {copied === "code" ? "Skopiowano" : "Kod"}</Button>
          </div>
          <p className="text-xs text-ink-soft">Wyślij link (np. e-mailem), a kod przekaż innym kanałem (telefonicznie lub SMS). Aplikacja nie wysyła wiadomości automatycznie.</p>
        </div>
      )}
    </div>
  );
}
