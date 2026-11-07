"use client";

// Okno renderowane przez portal – dolny pasek ma backdrop-blur, który „łapie” elementy fixed.
// „Zapisz zmiany na później” (przypisanie numeru telefonu kodem SMS) i powrót z linku w e-mailu (potwierdzenie numeru kodem SMS).
import clsx from "clsx";
import { Check, Loader2, Lock, MessageSquare, ShieldCheck, Smartphone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { confirmAccessCode, confirmBindCode, requestAccessCode, requestBindCode } from "@/app/actions/phone";
import { track } from "@/lib/track-client";

const input = "min-h-12 w-full rounded-2xl bg-white px-4 text-[17px] text-ink ring-1 ring-sand focus:outline-none focus:ring-2 focus:ring-forest";

function CodeInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <input
      className={clsx(input, "text-center font-mono text-2xl tracking-[0.6em]")}
      inputMode="numeric" autoComplete="one-time-code" maxLength={4} pattern="[0-9]{4}" aria-label="Kod z SMS-a (4 cyfry)"
      value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))} autoFocus={autoFocus} data-testid="sms-code"
    />
  );
}

const DemoNote = ({ code }: { code?: string }) =>
  code ? <p className="rounded-xl bg-clay-soft px-3 py-2 text-xs text-ink" data-testid="sms-demo">Tryb demo – SMS nie został wysłany. Kod: <b className="font-mono">{code}</b></p> : null;

/** Przycisk + okno: numer telefonu → kod SMS → odpowiedzi zapisane i chronione kodem. */
export function SaveForLater({ slug, n, initialMasked }: { slug: string; n: number; initialMasked: string | null }) {
  const [open, setOpen] = useState(false);
  const [masked, setMasked] = useState(initialMasked);
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string>();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const dlg = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    dlg.current?.querySelector<HTMLElement>("input,button")?.focus();
    return () => window.removeEventListener("keydown", esc);
  }, [open, step]);

  if (masked && !open) {
    return (
      <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-forest" data-testid="saved-for-later">
        <ShieldCheck size={15} aria-hidden /> Zapisane na później · dostęp kodem SMS na numer {masked}
      </p>
    );
  }

  const send = async () => {
    setBusy(true); setErr("");
    const r = await requestBindCode(slug, phone);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setDemo(r.demoCode); setStep("code");
  };
  const confirm = async () => {
    setBusy(true); setErr("");
    const r = await confirmBindCode(slug, code);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setMasked(r.masked ?? null); setStep("done");
    track("lead_magnet_phone_saved", n);
  };

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setStep(masked ? "done" : "phone"); }}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-forest ring-1 ring-forest/40 transition hover:bg-sage-soft" data-testid="save-later">
        <Lock size={16} aria-hidden /> Zapisz zmiany na później
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div ref={dlg} role="dialog" aria-modal="true" aria-labelledby="sfl-h" className="relative w-full max-w-md rounded-t-[1.75rem] bg-ivory p-6 shadow-2xl sm:rounded-[1.75rem]" data-testid="save-later-dialog">
            <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-linen"><X size={18} /></button>
            {step === "done" ? (
              <div className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage-soft text-forest"><Check size={24} aria-hidden /></span>
                <h2 id="sfl-h" className="mt-3 font-display text-2xl text-ink">Zapisane na później</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  Wrócisz przez link z e-maila – zanim zobaczysz odpowiedzi, potwierdzisz numer {masked} kodem z SMS-a.
                </p>
                <button type="button" onClick={() => setOpen(false)} className="mt-5 min-h-12 w-full rounded-full bg-forest px-6 text-[15px] font-semibold text-white">Wracam do uzupełniania</button>
              </div>
            ) : (
              <>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay"><ShieldCheck size={14} aria-hidden /> Twoje odpowiedzi są wrażliwe</p>
                <h2 id="sfl-h" className="mt-2 pr-8 font-display text-2xl leading-tight text-ink">Zapisz zmiany na później</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  Z uwagi na wrażliwość tych danych dostęp do zapisanych odpowiedzi będzie chroniony kodem SMS. Podaj numer telefonu – gdy wrócisz przez link z e-maila, wyślemy na niego kod.
                </p>
                {step === "phone" ? (
                  <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
                    <label htmlFor="sfl-phone" className="block text-sm font-medium text-ink">Numer telefonu</label>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex min-h-12 items-center rounded-2xl bg-linen px-3 text-ink-soft ring-1 ring-sand">+48</span>
                      <input id="sfl-phone" className={input} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="600 100 200" value={phone} onChange={(e) => setPhone(e.target.value)} required data-testid="sfl-phone" />
                    </div>
                    {err && <p role="alert" className="text-sm text-alert">{err}</p>}
                    <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[15px] font-semibold text-white disabled:opacity-60">
                      {busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <MessageSquare size={17} aria-hidden />} Wyślij kod SMS
                    </button>
                    <p className="text-center text-xs text-muted">Numer służy wyłącznie do ochrony dostępu do Twoich odpowiedzi.</p>
                  </form>
                ) : (
                  <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); void confirm(); }}>
                    <label className="block text-sm font-medium text-ink">Kod z SMS-a (4 cyfry)</label>
                    <CodeInput value={code} onChange={setCode} autoFocus />
                    <DemoNote code={demo} />
                    {err && <p role="alert" className="text-sm text-alert">{err}</p>}
                    <button type="submit" disabled={busy || code.length !== 4} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[15px] font-semibold text-white disabled:opacity-60" data-testid="sfl-confirm">
                      {busy && <Loader2 size={17} className="animate-spin" aria-hidden />} Potwierdź i zapisz
                    </button>
                    <button type="button" onClick={() => { setStep("phone"); setCode(""); setErr(""); }} className="w-full text-center text-sm text-forest underline">Zmień numer / wyślij ponownie</button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** Powrót z linku w e-mailu: „Czy to Twój numer?” → kod SMS → materiał z odpowiedziami. */
export function PhoneAccess({ slug, masked }: { slug: string; masked: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"ask" | "code" | "notme">("ask");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string>();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true); setErr("");
    const r = await requestAccessCode();
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setDemo(r.demoCode); setStep("code");
  };
  const confirm = async () => {
    setBusy(true); setErr("");
    const r = await confirmAccessCode(code);
    if (!r.ok) { setBusy(false); return setErr(r.error); }
    router.replace(`/wiedza/${slug}/material`);
  };

  if (step === "notme") {
    return (
      <p className="mt-4 leading-relaxed text-ink-soft" data-testid="phone-notme">
        Jeśli to nie Twój numer, nie otwieraj tych odpowiedzi. Napisz do nas z adresu, na który przyszedł materiał – pomożemy. Możesz też odebrać materiał od nowa na stronie DUO.
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-4">
      <p className="leading-relaxed text-ink-soft">
        Twoje odpowiedzi są chronione. Zanim je zobaczysz, potwierdź numer telefonu – wyślemy na niego 4-cyfrowy kod.
      </p>
      {step === "ask" ? (
        <>
          <p className="flex items-center gap-3 rounded-2xl bg-linen/70 p-4 ring-1 ring-sand">
            <Smartphone size={22} className="shrink-0 text-forest" aria-hidden />
            <span className="text-[15px] text-ink">Czy to Twój numer?<b className="mt-0.5 block whitespace-nowrap font-mono text-lg tracking-wide" data-testid="masked-phone">{masked}</b></span>
          </p>
          {err && <p role="alert" className="text-sm text-alert">{err}</p>}
          <button type="button" onClick={send} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[15px] font-semibold text-white disabled:opacity-60" data-testid="access-send">
            {busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <MessageSquare size={17} aria-hidden />} Tak, to mój numer – wyślij kod
          </button>
          <button type="button" onClick={() => setStep("notme")} className="w-full text-center text-sm text-forest underline">To nie mój numer</button>
        </>
      ) : (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void confirm(); }}>
          <label className="block text-sm font-medium text-ink">Kod z SMS-a wysłanego na {masked}</label>
          <CodeInput value={code} onChange={setCode} autoFocus />
          <DemoNote code={demo} />
          {err && <p role="alert" className="text-sm text-alert">{err}</p>}
          <button type="submit" disabled={busy || code.length !== 4} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[15px] font-semibold text-white disabled:opacity-60" data-testid="access-confirm">
            {busy && <Loader2 size={17} className="animate-spin" aria-hidden />} Otwórz moje odpowiedzi
          </button>
          <button type="button" onClick={() => { setCode(""); void send(); }} className="w-full text-center text-sm text-forest underline">Wyślij kod ponownie</button>
        </form>
      )}
    </div>
  );
}
