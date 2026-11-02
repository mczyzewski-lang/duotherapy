"use client";

// Animacja pojawiania się schematów i kart przy przewinięciu (linie rysują się, punkty pojawiają się po kolei).
// Z poszanowaniem prefers-reduced-motion; w druku nieużywana (treść zawsze widoczna).
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export function Reveal({ children, className, off }: { children: React.ReactNode; className?: string; off?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (off) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOn(true);
    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        setOn(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [off]);
  if (off) return <div className={className}>{children}</div>;
  return <div ref={ref} className={clsx("reveal-box", on && "on", className)}>{children}</div>;
}
