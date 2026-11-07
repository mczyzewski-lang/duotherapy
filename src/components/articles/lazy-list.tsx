"use client";

// Lista doładowywana przy przewijaniu: na start `initial` elementów, kolejne porcje, gdy koniec listy zbliża się do ekranu.
// Elementy (karty) renderuje serwer; tu tylko decydujemy, ile z nich jest w DOM. Przycisk „Pokaż więcej” – dla klawiatury i bez przewijania.
import { Children, useEffect, useRef, useState } from "react";

export function LazyList({ children, initial = 6, step = 6, className, moreLabel = "Pokaż więcej", testId }: { children: React.ReactNode; initial?: number; step?: number; className?: string; moreLabel?: string; testId?: string }) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(Math.min(initial, items.length));
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const done = shown >= items.length;

  const more = () => {
    if (loading || done) return;
    setLoading(true);
    // krótka pauza ze szkieletami kart – płynne pojawianie się zamiast skoku
    setTimeout(() => { setShown((n) => Math.min(n + step, items.length)); setLoading(false); }, 350);
  };

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) more(); }, { rootMargin: "500px 0px" });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, loading, done]);

  return (
    <>
      <ul className={className} data-testid={testId}>
        {items.slice(0, shown).map((c, i) => (
          <li key={i} className={i >= initial ? "animate-[fadeUp_.45s_ease-out_both]" : undefined}>{c}</li>
        ))}
        {loading && Array.from({ length: Math.min(3, items.length - shown) }, (_, i) => (
          <li key={`s${i}`} aria-hidden className="overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-sand" data-testid="lazy-skeleton">
            <div className="aspect-[16/9] animate-pulse bg-linen" />
            <div className="space-y-3 p-6"><div className="h-3 w-24 animate-pulse rounded-full bg-linen" /><div className="h-5 w-4/5 animate-pulse rounded-full bg-linen" /><div className="h-3 w-full animate-pulse rounded-full bg-linen/70" /><div className="h-3 w-2/3 animate-pulse rounded-full bg-linen/70" /></div>
          </li>
        ))}
      </ul>
      <div ref={sentinel} aria-hidden className="h-1" />
      <p className="sr-only" aria-live="polite">{shown < items.length ? `Widocznych ${shown} z ${items.length}` : `Wszystkie ${items.length} widoczne`}</p>
      {!done && (
        <div className="mt-8 text-center">
          <button type="button" onClick={more} disabled={loading} className="min-h-12 rounded-full bg-white px-6 text-[15px] font-semibold text-forest shadow-soft ring-1 ring-sand transition hover:ring-forest/40 disabled:opacity-60" data-testid="lazy-more">
            {loading ? "Ładuję…" : `${moreLabel} (${items.length - shown})`}
          </button>
        </div>
      )}
    </>
  );
}
