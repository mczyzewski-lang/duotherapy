"use client";

// Menu „Wiedza”: rozwijany panel (desktop – klik lub najechanie) i rozwijana sekcja w menu mobilnym.
// Klawiatura: Enter/Spacja otwiera, Esc zamyka i wraca do przycisku, Tab przechodzi po linkach.
import clsx from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagnetIcon } from "@/components/knowledge/icons";
import { CATEGORIES } from "@/knowledge/registry";
import { NAV_LINKS } from "./nav";


function Items({ onPick, dense }: { onPick?: () => void; dense?: boolean }) {
  return (
    <>
      {CATEGORIES.map((c) => (
        <div key={c.key}>
          <p className="px-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-clay">{c.label}</p>
          <ul className={clsx("mt-2", dense ? "space-y-0.5" : "space-y-1")}>
            {c.items.map((m) => (
              <li key={m.slug}>
                <Link href={`/wiedza/${m.slug}`} onClick={onPick} className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-linen focus-visible:bg-linen">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-soft ring-1 ring-sand">
                    <MagnetIcon icon={m.icon} id={`nav-${m.id}${dense ? "-m" : ""}`} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium leading-snug text-ink group-hover:text-forest">{m.short}</span>
                    <span className="block text-[12.5px] leading-snug text-muted">{m.menuDesc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function KnowledgeMenu() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const hover = (v: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return; // dotyk: tylko klik
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(v), v ? 80 : 220);
  };

  return (
    <div onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-forest", open && "text-forest")}
      >
        Wiedza <ChevronDown size={15} className={clsx("transition", open && "rotate-180")} aria-hidden />
      </button>
      <div
        ref={box}
        id={id}
        hidden={!open}
        className="absolute inset-x-5 top-full z-50 mt-1 animate-rise whitespace-normal rounded-3xl bg-white p-5 text-left shadow-[0_30px_60px_-30px_rgba(54,73,61,0.45)] ring-1 ring-sand"
      >
        <div className="grid grid-cols-3 gap-5">
          <Items onPick={() => setOpen(false)} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-sand pt-3">
          <p className="text-xs text-muted">Bezpłatne poradniki, pytania i ćwiczenia DUO</p>
          <Link href="/wiedza" onClick={() => setOpen(false)} className="text-sm font-semibold text-forest hover:underline">Zobacz wszystkie materiały →</Link>
        </div>
      </div>
    </div>
  );
}

/** Menu mobilne: linki strony + rozwijana sekcja „Wiedza” z kategoriami. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [wiedza, setWiedza] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div className="md:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Zamknij menu" : "Otwórz menu"} onClick={() => setOpen((o) => !o)}
        className="grid h-11 w-11 place-items-center rounded-full text-ink ring-1 ring-sand">
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>
      {open && createPortal(
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[65px] z-50 overflow-y-auto border-t border-sand bg-ivory px-5 pb-10 pt-4">
          <nav aria-label="Menu" className="space-y-1">
            {NAV_LINKS.map(([href, l]) => (
              <a key={href} href={href} onClick={close} className="block rounded-xl px-2 py-3 text-lg text-ink">{l}</a>
            ))}
            <button type="button" aria-expanded={wiedza} onClick={() => setWiedza((w) => !w)} className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-lg text-ink">
              Wiedza <ChevronDown size={20} className={clsx("transition", wiedza && "rotate-180")} aria-hidden />
            </button>
            {wiedza && (
              <div className="space-y-5 pb-3 pl-1">
                <Items onPick={close} dense />
                <Link href="/wiedza" onClick={close} className="block px-2 text-[15px] font-semibold text-forest">Zobacz wszystkie materiały →</Link>
              </div>
            )}
            <a href="/#faq" onClick={close} className="block rounded-xl px-2 py-3 text-lg text-ink">Pytania</a>
          </nav>
        </div>,
        document.body,
      )}
    </div>
  );
}
