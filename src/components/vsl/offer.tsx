"use client";

// Karta oferty: jedna usługa, jedna cena. Przed płatnością – podsumowanie zamówienia (zakres, realizacja,
// sprzedawca, regulamin, zgoda na rozpoczęcie usługi). Dane kontaktowe są już zapisane – nie pytamy o nie ponownie.
import clsx from "clsx";
import { ArrowRight, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { startCheckout } from "@/app/actions/checkout";
import { track } from "@/lib/track-client";

export interface OfferProps {
  price: number;
  productName: string;
  sellerInfo: string;
  termsVersion: string;
  startConsentText: string;
  available: boolean;
  hasLead: boolean;
  firstName: string | null;
  orderPath: string | null;
  cancelled: boolean;
  demo: boolean;
}

export const INCLUDED = [
  ["Szczegółowy kwestionariusz", "ok. 15–25 minut, na prywatnym linku"],
  ["Konsultacja online z psychologiem", "60 minut – psycholog zna już Twoje odpowiedzi"],
  ["Pisemna Mapa Relacji", "podsumowanie po konsultacji – online i w PDF"],
  ["Wybór terminu od razu po zamówieniu", "z dostępnych terminów konsultacji"],
] as const;

const OPEN_EVENT = "duo:open-checkout";

export function openCheckout() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function OfferCard(p: OfferProps) {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState(false);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [leaving, setLeaving] = useState(false);

  const show = () => {
    if (!open) track("checkout_click");
    setOpen(true);
    requestAnimationFrame(() => document.getElementById("order-summary")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  useEffect(() => {
    const h = () => {
      document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
      show();
    };
    window.addEventListener(OPEN_EVENT, h);
    return () => window.removeEventListener(OPEN_EVENT, h);
  });

  useEffect(() => {
    document.body.dataset.checkout = open ? "open" : "";
  }, [open]);

  const pay = () => {
    setErr(null);
    start(async () => {
      const r = await startCheckout({ termsAccepted: terms, startConsent: consent }).catch(() => ({ ok: false as const, error: "Nie udało się połączyć. Sprawdź internet i spróbuj ponownie." }));
      if (r.ok) {
        setLeaving(true);
        window.location.assign(r.url);
      } else setErr(r.error);
    });
  };

  return (
    <section id="oferta" aria-labelledby="oferta-h" className="scroll-mt-20 rounded-[1.75rem] bg-white p-5 shadow-soft ring-1 ring-sand sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Oferta</p>
      <h2 id="oferta-h" className="mt-1.5 font-display text-[1.65rem] leading-tight text-ink">Twoja Mapa Relacji</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        Profesjonalny proces z psychologiem, który pomoże Ci lepiej zrozumieć swoją relację i przyjrzeć się możliwym dalszym krokom.
      </p>
      <ul className="mt-4 space-y-2.5">
        {INCLUDED.map(([t, d]) => (
          <li key={t} className="flex gap-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={13} aria-hidden /></span>
            <span className="text-[15px] leading-snug"><strong className="font-medium text-ink">{t}</strong><span className="block text-[13.5px] text-muted">{d}</span></span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-sand pt-4">
        <div>
          <p className="font-display text-[2.4rem] leading-none text-ink">{p.price} zł</p>
          <p className="mt-1 text-[13px] text-muted">Jednorazowa cena za pełną Mapę Relacji – bez abonamentu</p>
        </div>
      </div>

      {p.orderPath && (
        <Link href={p.orderPath} className="mt-4 flex items-center justify-between rounded-2xl bg-sage-soft/70 px-4 py-3 text-sm font-medium text-forest">
          Masz już zamówienie – przejdź do niego <ArrowRight size={16} aria-hidden />
        </Link>
      )}
      {p.cancelled && !open && (
        <p className="mt-4 rounded-2xl bg-linen px-4 py-3 text-sm leading-relaxed text-ink-soft">
          Płatność nie została dokończona – nic nie zostało pobrane. Możesz spróbować ponownie albo poczekać na telefon konsultanta.
        </p>
      )}

      {!p.hasLead ? (
        <div className="mt-5">
          <Link href="/start" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-5 text-[16px] font-semibold text-white shadow-soft">
            Zacznij od 6 krótkich pytań <ArrowRight size={18} aria-hidden />
          </Link>
          <p className="mt-2 text-center text-xs text-muted">Zamówienie jest dostępne po krótkim quizie i zostawieniu kontaktu.</p>
        </div>
      ) : !p.available ? (
        <p className="mt-5 rounded-2xl bg-linen px-4 py-3 text-sm leading-relaxed text-ink-soft">
          Zakup online jest chwilowo niedostępny. Konsultant DUO zadzwoni zgodnie z Twoją prośbą i pomoże w zamówieniu.
        </p>
      ) : !open ? (
        <div className="mt-5">
          <button id="offer-cta" type="button" onClick={show} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-5 text-[16px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(169,81,47,0.7)] transition hover:brightness-110">
            Zamawiam Mapę Relacji – {p.price} zł
          </button>
          <p className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-[13px] leading-snug text-muted">
            <Lock size={14} className="mt-0.5 shrink-0" aria-hidden /> Bezpieczna płatność. Przed zakupem poznajesz zakres i warunki usługi.
          </p>
        </div>
      ) : (
        <div id="order-summary" className="mt-5 scroll-mt-24 rounded-2xl bg-ivory p-4 ring-1 ring-sand sm:p-5">
          <h3 className="font-display text-xl text-ink">Podsumowanie zamówienia</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Usługa">{p.productName}</Row>
            <Row k="Do zapłaty"><strong className="text-ink">{p.price} zł</strong></Row>
            {p.firstName && <Row k="Zamawia">{p.firstName} – dane z Twojego zgłoszenia</Row>}
            <Row k="Realizacja">Po zapłacie od razu wybierasz termin konsultacji online i otrzymujesz dostęp do kwestionariusza. Mapę Relacji otrzymasz po konsultacji – online i w PDF.</Row>
            <Row k="Sprzedawca">{p.sellerInfo || (p.demo ? "[dane sprzedawcy – do uzupełnienia w Ustawieniach]" : "DUO")}</Row>
          </dl>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Nie musisz ponownie podawać danych kontaktowych. Dane do rachunku (imię i nazwisko, adres, e-mail) podasz na bezpiecznej stronie operatora płatności.
          </p>
          <label className="mt-4 flex items-start gap-3 text-sm leading-snug text-ink">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>
              Akceptuję{" "}
              <Link href="/regulamin" target="_blank" className="font-medium text-forest underline underline-offset-2">regulamin usługi</Link> (wersja {p.termsVersion}) i{" "}
              <Link href="/prywatnosc" target="_blank" className="text-forest underline underline-offset-2">informację o danych</Link>.
            </span>
          </label>
          <label className="mt-3 flex items-start gap-3 text-sm leading-snug text-ink">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#36493d]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{p.startConsentText}</span>
          </label>
          {err && <p role="alert" className="mt-3 rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">{err}</p>}
          <button
            type="button"
            onClick={pay}
            disabled={pending || leaving || !terms || !consent}
            className={clsx(
              "mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-[16px] font-semibold text-white shadow-soft transition",
              terms && consent ? "bg-clay hover:brightness-110" : "bg-clay/50",
            )}
          >
            {pending || leaving ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <ShieldCheck size={18} aria-hidden />}
            {pending || leaving ? "Łączenie z płatnością…" : `Przejdź do bezpiecznej płatności – ${p.price} zł`}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="mt-2 min-h-10 w-full text-sm text-muted">Wróć</button>
        </div>
      )}

      <p className="mt-4 border-t border-sand pt-3 text-[13px] leading-relaxed text-muted">
        Chcecie przejść ją we dwoje? Mapa Relacji dla Was to 3 spotkania: z Tobą, z partnerem i wspólne (osobny kwestionariusz dla każdego z Was). Ten wariant ustalisz z konsultantem DUO.
      </p>
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}

/** Dolny pasek na telefonie – po przewinięciu oferty; nie zasłania filmu ani podsumowania zamówienia. */
export function VslSticky({ price, enabled }: { price: number; enabled: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const visible = (id: string) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return !!r && r.bottom > 0 && r.top < window.innerHeight;
    };
    const check = () => {
      raf = 0;
      const offer = document.getElementById("oferta")?.getBoundingClientRect();
      const past = !!offer && offer.bottom < 0;
      setShow(past && !visible("vsl-video") && !visible("final-cta") && !document.getElementById("order-summary"));
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
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div
      inert={!show}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-sand/70 bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <span className="leading-tight">
        <span className="block text-[13px] text-muted">Mapa Relacji</span>
        <strong className="font-display text-xl font-medium text-ink">{price} zł</strong> <span className="text-[12px] text-muted">jednorazowo</span>
      </span>
      <button type="button" onClick={() => openCheckout()} className="min-h-12 rounded-full bg-clay px-6 text-[16px] font-semibold text-white shadow-soft">
        Zamawiam
      </button>
    </div>
  );
}

/** Przycisk w końcowej sekcji – otwiera to samo podsumowanie zamówienia. */
export function FinalOrderButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => openCheckout()} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white shadow-soft transition hover:brightness-110 sm:w-auto">
      {label} <ArrowRight size={18} aria-hidden />
    </button>
  );
}
