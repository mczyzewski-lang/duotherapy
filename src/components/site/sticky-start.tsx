"use client";

// Strona główna: przyklejony pasek „Zacznij tutaj od Mapy Relacji” – po przewinięciu pierwszego ekranu, chowa się przy stopce.
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapaSymbol } from "@/components/brand";

export function StickyStart() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const foot = document.querySelector("footer")?.getBoundingClientRect();
      setShow(window.scrollY > window.innerHeight * 0.8 && (!foot || foot.top > window.innerHeight));
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
      data-testid="sticky-start"
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 md:bottom-5 md:px-0 md:pb-0 md:pt-0",
        "border-t border-sand/70 bg-ivory/95 backdrop-blur md:border-0 md:bg-transparent md:backdrop-blur-none",
        show ? "translate-y-0" : "pointer-events-none translate-y-[140%]",
      )}
    >
      <Link
        href="/mapa-relacji"
        className="mx-auto flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-clay px-6 text-[16px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(169,81,47,0.75)] transition hover:brightness-110 md:w-max md:px-7"
      >
        <span className="inline-flex h-7 items-center rounded-full bg-white/90 px-2"><MapaSymbol id="sticky-start" className="h-3.5 w-auto" /></span>
        Zacznij tutaj od Mapy Relacji <ArrowRight size={18} aria-hidden />
      </Link>
    </div>
  );
}
