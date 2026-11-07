"use client";

// Przyciski prowadzące do quizu + rejestracja wejścia na stronę (bez danych osobowych).
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { captureAttribution, track } from "@/lib/track-client";

export function LandingTracker() {
  useEffect(() => {
    captureAttribution();
    track("landing_view");
  }, []);
  return null;
}

export function QuizCta({
  children,
  className,
  hero,
  sticky,
  id,
  size = "lg",
  href = "/start",
}: {
  children: React.ReactNode;
  className?: string;
  hero?: boolean;
  sticky?: boolean;
  id?: string;
  size?: "lg" | "sm";
  href?: string;
}) {
  return (
    <Link
      href={href}
      id={id}
      onClick={() => (hero ? track("hero_cta_click") : sticky ? track("sticky_cta_click") : undefined)}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full bg-clay font-semibold text-white shadow-[0_10px_30px_-10px_rgba(169,81,47,0.7)] transition hover:brightness-110 active:scale-[0.99]",
        size === "lg" ? "min-h-14 px-5 text-[16px] min-[360px]:px-7 min-[360px]:text-[17px]" : "min-h-10 px-4 text-sm",
        className,
      )}
    >
      {children} <ArrowRight size={size === "lg" ? 19 : 15} className={size === "lg" ? "max-[359px]:hidden" : undefined} aria-hidden />
    </Link>
  );
}

/**
 * Przyklejone CTA na telefonie: pojawia się dopiero po przewinięciu głównego przycisku z hero
 * i znika przy końcowym CTA (bez pop-upów, nie zasłania treści na starcie).
 */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const hero = document.getElementById("hero-cta")?.getBoundingClientRect();
      const end = document.getElementById("end-h")?.getBoundingClientRect();
      setShow(!!hero && hero.bottom < 0 && (!end || end.top > window.innerHeight));
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
    <div
      inert={!show}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40 border-t border-sand/70 bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 md:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <QuizCta sticky className="min-h-12 w-full !text-[16px]">
        Zacznij od 6 krótkich pytań
      </QuizCta>
      <p className="mt-1.5 text-center text-[12px] text-muted">Bezpłatny quiz · około 2 minut</p>
    </div>
  );
}
