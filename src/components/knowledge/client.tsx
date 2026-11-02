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
  const [f, setF] = useState({ name: "", email: "", marketing: false, series: false, website: "" });
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    start(async () => {
      try {
        const r = await submitKnowledgeLead({
          slug,
          email: f.email,
          name: f.name,
          marketing: f.marketing,
          series: f.series,
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
        <label htmlFor="lm-name" className="mb-1.5 block text-sm font-medium text-ink">Imię <span className="font-normal text-muted">– opcjonalnie</span></label>
        <input id="lm-name" className={input} autoComplete="given-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </div>
      <div>
        <label htmlFor="lm-email" className="mb-1.5 block text-sm font-medium text-ink">E-mail</label>
        <input id="lm-email" className={input} type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })}
          aria-invalid={err?.field === "email"} aria-describedby={err?.field === "email" ? "lm-email-e" : undefined} />
        {err?.field === "email" && <p id="lm-email-e" role="alert" className="mt-1.5 text-sm text-alert">{err.text}</p>}
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      {seriesText && (
        <label className="flex items-start gap-3 rounded-2xl bg-white/70 p-3.5 text-sm leading-snug text-ink ring-1 ring-sand">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" checked={f.series} onChange={(e) => setF({ ...f, series: e.target.checked })} />
          <span>{seriesText} <span className="text-muted">(opcjonalnie)</span></span>
        </label>
      )}
      <label className="flex items-start gap-3 px-1 text-sm leading-snug text-ink-soft">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" checked={f.marketing} onChange={(e) => setF({ ...f, marketing: e.target.checked })} />
        <span>{marketingText} <span className="text-muted">(opcjonalnie)</span></span>
      </label>
      {err && err.field !== "email" && <p role="alert" className="rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">{err.text}</p>}
      <button type="submit" disabled={pending} className={clsx("flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 text-[16px] font-semibold text-white shadow-soft transition hover:brightness-110 disabled:opacity-60")}>
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
