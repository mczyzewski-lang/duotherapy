"use client";

// Podsumowanie z materiału: wysłanie na e-mail (sam link albo z treścią) i przejście do oferty Mapy Relacji (zdarzenie lejka).
import clsx from "clsx";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { emailSummary } from "@/app/actions/summary-mail";
import { track } from "@/lib/track-client";

export function EmailSummary({ slug, n }: { slug: string; n: number }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    setBusy(true); setMsg(null);
    const r = await emailSummary(slug, full);
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, text: `Wysłaliśmy podsumowanie na ${r.to}.` }); track("lead_magnet_summary_email", n); }
    else setMsg({ ok: false, text: r.error });
  };

  if (msg?.ok) return <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-sm font-medium text-forest" role="status" data-testid="summary-emailed"><Check size={16} aria-hidden /> {msg.text}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-forest ring-1 ring-forest/30 hover:bg-sage-soft" data-testid="summary-email-open">
        <Mail size={16} aria-hidden /> Wyślij podsumowanie na mój e-mail
      </button>
    );
  }
  return (
    <div className="w-full rounded-2xl bg-linen/60 p-4 ring-1 ring-sand" data-testid="summary-email">
      <p className="text-sm font-medium text-ink">Co wysłać na Twój adres e-mail?</p>
      <div className="mt-2 space-y-2 text-sm">
        {[
          [false, "Sam link do podsumowania", "Bezpieczniej, jeśli ktoś inny może zajrzeć do tej skrzynki."],
          [true, "Link i treść podsumowania", "Twoje odpowiedzi będą zapisane w wiadomości."],
        ].map(([v, label, hint]) => (
          <label key={String(v)} className={clsx("flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1", full === v ? "bg-white ring-forest/40" : "ring-sand")}>
            <input type="radio" name="summary-mode" className="mt-1 accent-[#36493d]" checked={full === v} onChange={() => setFull(v as boolean)} />
            <span><span className="block font-medium text-ink">{label as string}</span><span className="text-muted">{hint as string}</span></span>
          </label>
        ))}
      </div>
      {msg && !msg.ok && <p role="alert" className="mt-2 text-sm text-alert">{msg.text}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={send} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white disabled:opacity-60" data-testid="summary-email-send">
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Mail size={16} aria-hidden />} Wyślij
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full px-4 text-sm text-ink-soft">Anuluj</button>
      </div>
    </div>
  );
}

export function OfferLink({ href, n, children, className }: { href: string; n: number; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} onClick={() => track("lead_magnet_offer_click", n)} className={className} data-testid="summary-offer">
      {children} <ArrowRight size={18} aria-hidden />
    </Link>
  );
}
