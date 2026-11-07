"use client";

// Po odebraniu materiału: krótka animacja „{imię}, odblokowuję dla Ciebie…” → „przypisuję…” → „pokazuję…”, potem sam materiał.
// Imię przychodzi z serwera (zapis), nie z adresu strony. Z poszanowaniem prefers-reduced-motion; można pominąć.
import clsx from "clsx";
import { Check, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STEP_MS = 700;

export function UnlockIntro({ name, title, mailSent }: { name: string | null; title: string; mailSent: boolean }) {
  const [step, setStep] = useState(0); // 0 odblokowuję, 1 przypisuję, 2 pokazuję, 3 znika
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // adres bez ?witaj – odświeżenie strony nie powtarza animacji
    window.history.replaceState(null, "", window.location.pathname);
    const fast = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = [1, 2, 3].map((k) => setTimeout(() => setStep(k), (fast ? 250 : STEP_MS) * k + (k === 3 ? (fast ? 100 : 450) : 0)));
    return () => t.forEach(clearTimeout);
  }, []);
  if (!mounted || step >= 4) return null;
  const steps = [
    `${name ? `${name}, o` : "O"}dblokowuję dla Ciebie materiał`,
    mailSent ? "Przypisuję go do Twojego e-maila – link wysłaliśmy też na skrzynkę" : "Przypisuję go do Twojego e-maila",
    "Pokazuję – odpowiedzi będą zapisywać się same",
  ];
  return createPortal(
    <div
      className={clsx("fixed inset-0 z-[60] grid place-items-center bg-ivory/95 p-6 backdrop-blur-sm transition-opacity duration-500", step >= 3 && "pointer-events-none opacity-0")}
      onTransitionEnd={() => step >= 3 && setStep(4)}
      role="status" aria-live="polite" data-testid="unlock-intro"
    >
      <div className="w-full max-w-sm text-center">
        <span className={clsx("mx-auto grid h-20 w-20 place-items-center rounded-full shadow-soft ring-1 transition-all duration-500", step >= 1 ? "bg-forest text-white ring-forest scale-105" : "bg-white text-clay ring-sand")}>
          {step >= 1 ? <LockKeyholeOpen size={34} className="animate-[fadeUp_.4s_ease-out]" aria-hidden /> : <LockKeyhole size={34} className="animate-pulse" aria-hidden />}
        </span>
        <p className="mt-5 font-display text-[1.6rem] leading-tight text-ink">{steps[0]}</p>
        <p className="mt-1 text-[15px] text-ink-soft">„{title}”</p>
        <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-[14.5px]">
          {steps.slice(1).map((t, i) => (
            <li key={t} className={clsx("flex items-start gap-2.5 transition-all duration-500", step >= i + 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}>
              <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors", step >= i + 2 ? "bg-forest text-white" : "bg-sand text-transparent")}>
                <Check size={13} aria-hidden />
              </span>
              <span className="text-ink-soft">{t}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setStep(4)} className="mt-7 text-sm text-muted underline underline-offset-2">Pomiń</button>
      </div>
    </div>,
    document.body,
  );
}
