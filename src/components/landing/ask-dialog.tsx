"use client";

// „Masz pytania? Napisz do mnie” – okno z krótkim formularzem.
import { Check, Mail, X } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import { sendInquiry } from "@/app/actions/inquiry";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";

export function AskDialog({
  consentText,
  label = "Masz pytania? Napisz do mnie",
  title = "Masz pytania? Napisz do mnie",
  topic,
  trigger = "link",
  triggerClassName,
}: {
  consentText: string;
  label?: string;
  title?: string;
  /** Temat zapytania (np. ścieżka) – dopisywany na początku wiadomości, widoczny w panelu Wiadomości. */
  topic?: string;
  trigger?: "link" | "button";
  triggerClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId().replace(/:/g, "");
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "", consent: false, website: "" });
  const [err, setErr] = useState<{ text: string; field?: string } | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const close = () => ref.current?.close();

  return (
    <>
      {trigger === "button" ? (
        <button type="button" onClick={() => ref.current?.showModal()} className={triggerClassName ?? "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(169,81,47,0.7)] transition hover:brightness-110"}>
          {label}
        </button>
      ) : (
        <button type="button" onClick={() => ref.current?.showModal()} className={triggerClassName ?? "inline-flex items-center gap-2 text-[15px] font-medium text-forest underline decoration-clay/50 underline-offset-4 hover:decoration-clay"}>
          <Mail size={16} aria-hidden /> {label}
        </button>
      )}
      <dialog
        ref={ref}
        aria-labelledby={`ask-${uid}-h`}
        className="m-auto w-[min(92vw,34rem)] rounded-3xl bg-white p-0 text-left shadow-soft backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === ref.current && close()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id={`ask-${uid}-h`} className="font-display text-2xl text-ink">{title}</h2>
            <button type="button" onClick={close} aria-label="Zamknij" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-linen">
              <X size={18} aria-hidden />
            </button>
          </div>
          {done ? (
            <div className="mt-6 text-center" role="status">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage-soft text-forest"><Check aria-hidden /></span>
              <p className="mt-4 font-display text-xl text-ink">Dziękuję, wiadomość dotarła.</p>
              <p className="mt-2 text-ink-soft">Odpowiem e-mailem lub telefonicznie najszybciej, jak to możliwe.</p>
              <Button className="mt-6" variant="secondary" onClick={close}>Zamknij</Button>
            </div>
          ) : (
            <form
              className="mt-5 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                start(async () => {
                  const r = await sendInquiry({ ...f, message: topic ? `[${topic}] ${f.message}` : f.message, consent: f.consent as true });
                  if (r.ok) setDone(true);
                  else setErr({ text: r.error, field: r.field });
                });
              }}
            >
              <p className="text-sm text-muted">Zapytaj o Mapę Relacji, przebieg spotkania czy sprawy organizacyjne. Nie musisz opisywać szczegółów swojej sytuacji.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Imię" htmlFor={`ask-${uid}-name`} required error={err?.field === "name" ? err.text : undefined}>
                  <Input id={`ask-${uid}-name`} autoComplete="given-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </Field>
                <Field label="E-mail" htmlFor={`ask-${uid}-email`} required error={err?.field === "email" ? err.text : undefined}>
                  <Input id={`ask-${uid}-email`} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                </Field>
              </div>
              <Field label="Telefon" htmlFor={`ask-${uid}-phone`} hint="Opcjonalnie – jeśli wolisz, żebym oddzwoniła." error={err?.field === "phone" ? err.text : undefined}>
                <Input id={`ask-${uid}-phone`} type="tel" autoComplete="tel" placeholder="+48 600 000 000" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </Field>
              <Field label="Twoje pytanie" htmlFor={`ask-${uid}-msg`} required error={err?.field === "message" ? err.text : undefined}>
                <Textarea id={`ask-${uid}-msg`} className="min-h-32" maxLength={3000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              </Field>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
              <label className="flex items-start gap-3 text-sm text-ink">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-forest" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
                <span>{consentText} <span className="text-clay">*</span></span>
              </label>
              {err && !["name", "email", "phone", "message"].includes(err.field ?? "") && <Alert tone="alert">{err.text}</Alert>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={close}>Anuluj</Button>
                <Button type="submit" variant="clay" disabled={pending}>{pending ? "Wysyłanie…" : "Wyślij wiadomość"}</Button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
