"use client";

// Część kliencka „Wiedzy”: formularz odbioru materiału, ekran podziękowania, pomiar (bez danych osobowych i bez tytułów).
import clsx from "clsx";
import { CheckCircle2, Download, Loader2, Mail, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitKnowledgeLead } from "@/app/actions/knowledge";
import { anonId, attribution, captureAttribution, track } from "@/lib/track-client";
import type { FunnelEvent } from "@/lib/mapa-quiz";

/** Zdarzenie przy wejściu na stronę + pomiar kliknięć w Mapę Relacji (elementy z atrybutem data-mapa-cta). */
export function KTrack({ event, step }: { event: FunnelEvent; step?: number }) {
  useEffect(() => {
    captureAttribution();
    track(event, step);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("[data-mapa-cta]")) track("mapa_relacji_cta_click", step);
      if ((e.target as HTMLElement).closest?.("[data-pdf]")) track("lead_magnet_pdf_download", step);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [event, step]);
  return null;
}

/** E-mail „wygląda na kompletny”: coś@coś.xx – dopiero wtedy pokazujemy resztę formularza. */
const EMAIL_READY = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function LeadMagnetForm({
  slug,
  n,
  title,
  deliveryInfo,
  marketingText,
  seriesText,
}: {
  slug: string;
  n: number;
  title: string;
  deliveryInfo: string;
  marketingText: string;
  seriesText?: string;
}) {
  const [f, setF] = useState({ name: "", email: "", relationship: "", children: "", consent: false, website: "" });
  const [err, setErr] = useState<{ text: string; field?: string } | null>(null);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);
  const [pending, start] = useTransition();
  const shownAt = useRef(Date.now());
  const requestId = useRef<string>("");
  const started = useRef(false);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    requestId.current = crypto.randomUUID();
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        track("lead_magnet_form_view", n);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("lead_magnet_form_started", n);
  };

  const emailReady = EMAIL_READY.test(f.email.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (f.name.trim().length < 2) return setErr({ text: "Podaj imię.", field: "name" });
    if (!emailReady) return setErr({ text: "Podaj poprawny adres e-mail.", field: "email" });
    if (!f.relationship) return setErr({ text: "Zaznacz, czy jesteście parą, czy małżeństwem.", field: "relationship" });
    if (!f.children) return setErr({ text: "Zaznacz, czy macie dzieci.", field: "children" });
    if (!f.consent) return setErr({ text: "Zaznacz zgodę, żeby odebrać materiał.", field: "consent" });
    start(async () => {
      try {
        const r = await submitKnowledgeLead({
          slug,
          email: f.email,
          name: f.name,
          relationship: f.relationship as "para",
          children: f.children as "tak",
          consent: f.consent as true,
          requestId: requestId.current,
          attribution: attribution() as Record<string, string>,
          anonId: anonId(),
          startedAt: shownAt.current,
          website: f.website,
        });
        if (r.ok) {
          setDone({ emailSent: r.emailSent });
          requestAnimationFrame(() => document.getElementById("lm-done")?.focus());
        } else setErr({ text: r.error, field: r.field });
      } catch {
        setErr({ text: "Nie udało się wysłać. Sprawdź połączenie i spróbuj ponownie." });
      }
    });
  };

  if (done)
    return (
      <div id="lm-done" tabIndex={-1} role="status" className="rounded-3xl bg-white p-6 text-center shadow-soft ring-1 ring-sand outline-none sm:p-8">
        <CheckCircle2 className="mx-auto text-ok" size={40} aria-hidden />
        <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-ink">Twój materiał jest gotowy</h3>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-soft">
          {done.emailSent ? "Wysłaliśmy link do pobrania na podany adres e-mail. Możesz też otworzyć materiał od razu." : "Możesz otworzyć materiał od razu albo pobrać go jako PDF."}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href={`/wiedza/${slug}/material`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-clay px-6 font-semibold text-white">
            <MonitorSmartphone size={18} aria-hidden /> Otwórz materiał
          </Link>
          <a href={`/wiedza/${slug}/pdf`} data-pdf onClick={() => track("lead_magnet_pdf_download", n)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-forest ring-1 ring-sand-dark">
            <Download size={18} aria-hidden /> Pobierz PDF
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">„{title}”</p>
      </div>
    );

  const input = "w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-sand-dark placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-forest";
  return (
    <form ref={ref} onSubmit={submit} onFocus={onStart} noValidate className="space-y-4">
      <div>
        <label htmlFor="lm-name" className="mb-1.5 block text-sm font-medium text-ink">Imię</label>
        <input id="lm-name" className={input} autoComplete="given-name" required value={f.name}
          onChange={(e) => { setF({ ...f, name: e.target.value }); if (err?.field === "name") setErr(null); }}
          aria-invalid={err?.field === "name"} aria-describedby={err?.field === "name" ? "lm-name-e" : undefined} />
        {err?.field === "name" && <p id="lm-name-e" role="alert" className="mt-1.5 text-sm text-alert">{err.text}</p>}
      </div>
      <div>
        <label htmlFor="lm-email" className="mb-1.5 block text-sm font-medium text-ink">E-mail</label>
        <input id="lm-email" className={input} type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })}
          aria-invalid={err?.field === "email"} aria-describedby={err?.field === "email" ? "lm-email-e" : undefined} />
        {err?.field === "email" && <p id="lm-email-e" role="alert" className="mt-1.5 text-sm text-alert">{err.text}</p>}
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      {/* reszta formularza pojawia się, gdy e-mail wygląda na kompletny (jest „@” i min. 2 znaki po ostatniej kropce) */}
      <div className={clsx("grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none", emailReady ? "grid-rows-[1fr] opacity-100" : "invisible !mt-0 grid-rows-[0fr] opacity-0")}
        inert={!emailReady} data-testid="lm-more">
        <div className={clsx("min-h-0 space-y-4 overflow-hidden", emailReady && "-m-1 p-1")}>
        <Choice
          name="relationship" label="Jesteśmy" value={f.relationship} error={err?.field === "relationship" ? err.text : undefined}
          options={[["para", "Parą"], ["malzenstwo", "Małżeństwem"]]}
          onChange={(v) => { setF({ ...f, relationship: v }); if (err?.field === "relationship") setErr(null); }}
        />
        <Choice
          name="children" label="Dzieci" value={f.children} error={err?.field === "children" ? err.text : undefined}
          options={[["tak", "Mamy dzieci"], ["nie", "Nie mamy dzieci"]]}
          onChange={(v) => { setF({ ...f, children: v }); if (err?.field === "children") setErr(null); }}
        />
        <label className={clsx("flex items-start gap-3 rounded-2xl p-3.5 text-[14.5px] leading-snug text-ink ring-1 transition", err?.field === "consent" ? "bg-alert-soft/60 ring-alert/40" : f.consent ? "bg-sage-soft/60 ring-sage/50" : "bg-linen/60 ring-sand")}>
          <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" checked={f.consent}
            onChange={(e) => { setF({ ...f, consent: e.target.checked }); if (err?.field === "consent") setErr(null); }}
            aria-invalid={err?.field === "consent"} aria-describedby={err?.field === "consent" ? "lm-consent-e" : undefined} data-testid="lm-consent" />
          <span>{marketingText}{seriesText ? ` ${seriesText}` : ""}</span>
        </label>
        {err?.field === "consent" && <p id="lm-consent-e" role="alert" className="-mt-2 text-sm text-alert">{err.text}</p>}
        </div>
      </div>
      {err && !["name", "email", "consent", "relationship", "children"].includes(err.field ?? "") && <p role="alert" className="rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">{err.text}</p>}
      <button type="submit" disabled={pending} className={clsx("btn-convex btn-glare flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[17px] font-bold tracking-[0.005em] text-white transition hover:brightness-105 active:translate-y-px disabled:opacity-60")}>
        {pending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Mail size={18} aria-hidden />} {pending ? "Wysyłanie…" : "Wyślij mi materiał"}
      </button>
      <p className="text-center text-xs leading-relaxed text-muted">
        {deliveryInfo} <Link href="/prywatnosc" className="underline underline-offset-2">Polityka prywatności</Link>
      </p>
    </form>
  );
}

/** Dolny pasek na landingu materiału: pojawia się po przewinięciu nagłówka, znika przy formularzu. */
export function MagnetStickyBar({ title }: { title: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const form = document.getElementById("odbierz")?.getBoundingClientRect();
      const formVisible = !!form && form.top < window.innerHeight * 0.85 && form.bottom > 0;
      setShow(window.scrollY > 420 && !formVisible && !document.getElementById("lm-done"));
    };
    const on = () => (raf ||= requestAnimationFrame(check));
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div inert={!show} className={clsx(
      "fixed inset-x-0 bottom-0 z-40 border-t border-sand/70 bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300",
      show ? "translate-y-0" : "pointer-events-none translate-y-full",
    )} data-testid="lm-sticky">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Bezpłatny materiał</span>
          <span className="block truncate font-display text-[15px] text-ink">{title}</span>
        </span>
        <a href="#odbierz" className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-clay px-5 text-[15px] font-semibold text-white shadow-soft">Pobierz bezpłatnie</a>
      </div>
    </div>
  );
}

/** Wybór jednym kliknięciem (dwa przyciski-kafelki) – dostępny jak grupa radio. */
function Choice({ name, label, value, options, onChange, error }: {
  name: string; label: string; value: string; options: [string, string][]; onChange: (v: string) => void; error?: string;
}) {
  return (
    <fieldset aria-invalid={!!error} aria-describedby={error ? `lm-${name}-e` : undefined} data-testid={`lm-${name}`}>
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map(([v, l]) => (
          <label key={v} className={clsx(
            "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-[15px] font-medium leading-tight ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest",
            value === v ? "bg-sage-soft/70 text-forest ring-2 ring-forest" : error ? "bg-alert-soft/50 text-ink ring-alert/40" : "bg-white text-ink ring-sand-dark hover:ring-forest/60",
          )}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {/* widoczny przycisk radiowy: wybór jednej z dwóch opcji */}
            <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 bg-white transition", value === v ? "border-forest" : "border-sand-dark")} aria-hidden>
              <span className={clsx("h-2.5 w-2.5 rounded-full bg-forest transition-transform", value === v ? "scale-100" : "scale-0")} />
            </span>
            {l}
          </label>
        ))}
      </div>
      {error && <p id={`lm-${name}-e`} role="alert" className="mt-1.5 text-sm text-alert">{error}</p>}
    </fieldset>
  );
}
