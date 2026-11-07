"use client";

// Parallaksa podglądu materiału: przy przewijaniu w dół treść fragmentu „zapada się” za kartę
// „To dopiero fragment”, a karta lekko rośnie i wychodzi na pierwszy plan. Postęp (0–1) trafia do zmiennej CSS --pv.
import { useEffect, useRef } from "react";

export function PreviewParallax({ children, className, testId }: { children: React.ReactNode; className?: string; testId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0: dół podglądu przy dolnej krawędzi ekranu; 1: dół podglądu na ~40% wysokości ekranu
      const p = Math.min(1, Math.max(0, (vh - r.bottom) / (vh * 0.6)));
      el.style.setProperty("--pv", p.toFixed(3));
    };
    const on = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className={className} data-testid={testId}>{children}</div>;
}
