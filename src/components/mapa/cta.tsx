"use client";

// Przyciski prowadzące do quizu + rejestracja wejścia na stronę (bez danych osobowych).
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { captureAttribution, track } from "@/lib/track-client";

export function LandingTracker() {
  useEffect(() => {
    captureAttribution();
    track("landing_view");
  }, []);
  return null;
}

export function QuizCta({ children, className, hero, size = "lg" }: { children: React.ReactNode; className?: string; hero?: boolean; size?: "lg" | "sm" }) {
  return (
    <Link
      href="/start"
      onClick={() => hero && track("hero_cta_click")}
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
