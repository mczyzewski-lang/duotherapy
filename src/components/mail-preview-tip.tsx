"use client";

// Podgląd e-maila w dymku po najechaniu (albo fokusie klawiatury) na temat – miniatura wyrenderowanej wiadomości.
// Pozycja liczona względem okna, więc dymek nie jest ucinany przez przewijaną tabelę.
import { useRef, useState } from "react";

const W = 600; // szerokość wiadomości
const SCALE = 0.6;
const H = 720;

export function MailPreviewTip({ children, html, subject, preheader }: { children: React.ReactNode; html: string; subject: string; preheader: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const w = W * SCALE + 24;
      const h = H * SCALE + 76;
      const left = Math.min(Math.max(12, r.left), window.innerWidth - w - 12);
      const below = r.bottom + 8 + h < window.innerHeight;
      setPos({ left, top: below ? r.bottom + 8 : Math.max(12, r.top - h - 8) });
    }, 180);
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setPos(null);
  };

  return (
    <span ref={ref} className="relative inline" onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close} tabIndex={0} aria-describedby={pos ? "mail-tip" : undefined} data-testid="mail-tip-trigger">
      <span className="cursor-help border-b border-dashed border-sand-dark">{children}</span>
      {pos && (
        <span
          id="mail-tip"
          role="tooltip"
          className="pointer-events-none fixed z-50 block overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(31,42,35,0.45)] ring-1 ring-sand"
          style={{ top: pos.top, left: pos.left, width: W * SCALE + 24 }}
          data-testid="mail-tip"
        >
          <span className="block border-b border-sand/70 px-3 py-2">
            <span className="block truncate text-[13px] font-semibold text-ink">{subject}</span>
            {preheader && <span className="block truncate text-[11.5px] text-muted">{preheader}</span>}
          </span>
          <span className="block bg-[#f4eee6] p-3" style={{ height: H * SCALE }}>
            <iframe title={`Podgląd: ${subject}`} srcDoc={html} sandbox="" tabIndex={-1} className="origin-top-left border-0 bg-transparent" style={{ width: W, height: H, transform: `scale(${SCALE})` }} />
          </span>
        </span>
      )}
    </span>
  );
}
