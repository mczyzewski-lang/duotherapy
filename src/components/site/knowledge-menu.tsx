"use client";

// Menu strony: „Jak pomagamy” (Mapa Relacji jako start, pod nią trzy ścieżki) i „Wiedza” (materiały; max 6 na kategorię + link do reszty).
// Desktop: panel na klik lub najechanie; Esc zamyka i wraca do przycisku. Telefon (i landingi materiałów): menu hamburgerowe.
import clsx from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapaSymbol, RoadGlyph } from "@/components/brand";
import { MagnetIcon } from "@/components/knowledge/icons";
import { PATHS } from "@/content/paths";
import { CATEGORIES } from "@/knowledge/registry";

const MENU_PER_CATEGORY = 6;

function KnowledgeItems({ onPick, dense, hidden = [] }: { onPick?: () => void; dense?: boolean; hidden?: string[] }) {
  return (
    <>
      {CATEGORIES.map((c) => ({ ...c, items: c.items.filter((m) => !hidden.includes(m.slug)) })).filter((c) => c.items.length).map((c) => (
        <div key={c.key}>
          <p className="px-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-clay">{c.label}</p>
          <ul className={clsx("mt-2", dense ? "space-y-0.5" : "space-y-1")}>
            {c.items.slice(0, MENU_PER_CATEGORY).map((m) => (
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
          {c.items.length > MENU_PER_CATEGORY && (
            <Link href={`/wiedza?kategoria=${c.key}`} onClick={onPick} className="mt-1 block px-2 text-[13px] font-semibold text-forest hover:underline">
              + {c.items.length - MENU_PER_CATEGORY} więcej w tej kategorii →
            </Link>
          )}
        </div>
      ))}
    </>
  );
}

/** Hierarchia oferty: Mapa Relacji (start) → rozgałęzienie → trzy ścieżki. */
function OfferItems({ onPick, dense }: { onPick?: () => void; dense?: boolean }) {
  return (
    <div>
      <Link href="/mapa-relacji" onClick={onPick} className="group flex items-start gap-3 rounded-2xl bg-forest p-3.5 text-white transition hover:brightness-110">
        <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-white">
          <MapaSymbol id={`nav-mapa-sym${dense ? "-m" : ""}`} className="h-3 w-auto" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70">Zacznij tutaj</span>
          <span className="block font-display text-lg leading-tight">Mapa Relacji</span>
          <span className="block text-[12.5px] leading-snug text-white/80">Zrozumienie Waszej sytuacji z psychologiem – i wybór drogi.</span>
        </span>
      </Link>
      {/* pionowa linia składa się z odcinków i kończy na ostatniej drodze – bez „ogona” sugerującego czwartą */}
      <div className="relative ml-[1.85rem] pl-4 pt-2">
        <span className="absolute left-0 top-0 h-[calc(0.5rem+1rem+0.25rem)] border-l-2 border-dashed border-sand-dark" aria-hidden />
        <p className="mb-1 px-2 text-[10.5px] font-semibold uppercase leading-4 tracking-[0.18em] text-clay">Możliwe drogi po Mapie Relacji</p>
        <ul>
          {PATHS.map((p, i) => {
            const last = i === PATHS.length - 1;
            return (
            <li key={p.slug} className={clsx("relative", !last && (dense ? "pb-0.5" : "pb-1"))}>
              <span className={clsx("absolute -left-4 top-0 border-l-2 border-dashed border-sand-dark", last ? "h-[1.625rem]" : "bottom-0")} aria-hidden />
              <span className="absolute -left-4 top-6 h-0.5 w-3.5 bg-sand-dark" aria-hidden />
              <Link href={`/${p.slug}`} onClick={onPick} className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-linen focus-visible:bg-linen">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-soft ring-1 ring-sand">
                  <RoadGlyph road={p.key} id={`nav-road-${p.key}${dense ? "-m" : ""}`} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium leading-snug text-ink group-hover:text-forest">{p.short}</span>
                  <span className="block text-[12.5px] leading-snug text-muted">{p.menuDesc}</span>
                </span>
              </Link>
            </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Dropdown({ label, children, wide }: { label: string; children: (close: () => void) => React.ReactNode; wide?: boolean }) {
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
    if (e.pointerType !== "mouse") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(v), v ? 80 : 220);
  };
  const close = () => setOpen(false);

  return (
    <div className={wide ? undefined : "relative"} onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button ref={btn} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
        className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-forest", open && "text-forest")}>
        {label} <ChevronDown size={15} className={clsx("transition", open && "rotate-180")} aria-hidden />
      </button>
      <div ref={box} id={id} hidden={!open}
        className={clsx("absolute top-full z-50 mt-1 animate-rise whitespace-normal rounded-3xl bg-white p-5 text-left shadow-[0_30px_60px_-30px_rgba(54,73,61,0.45)] ring-1 ring-sand", wide ? "inset-x-5" : "left-0 mt-3 w-[27rem]")}>
        {children(close)}
      </div>
    </div>
  );
}

export function OfferMenu() {
  return <Dropdown label="Jak pomagamy">{(close) => <OfferItems onPick={close} />}</Dropdown>;
}

export function KnowledgeMenu({ hidden = [] }: { hidden?: string[] } = {}) {
  return (
    <Dropdown label="Wiedza" wide>
      {(close) => (
        <>
          <div className="grid grid-cols-3 gap-5"><KnowledgeItems onPick={close} hidden={hidden} /></div>
          <div className="mt-4 flex items-center justify-between border-t border-sand pt-3">
            <p className="text-xs text-muted">Bezpłatne poradniki, pytania i ćwiczenia DUO</p>
            <span className="flex gap-5">
              <Link href="/wiedza/artykuly" onClick={close} className="text-sm font-semibold text-forest hover:underline">Artykuły o terapii par →</Link>
              <Link href="/wiedza" onClick={close} className="text-sm font-semibold text-forest hover:underline">Zobacz wszystkie materiały →</Link>
            </span>
          </div>
        </>
      )}
    </Dropdown>
  );
}

/** Menu hamburgerowe: „Jak pomagamy” (rozwinięte), „Wiedza”, „Kto pomaga”, „Pytania”. */
export function MobileMenu({ always, initialWiedza = false, hidden = [] }: { always?: boolean; initialWiedza?: boolean; hidden?: string[] } = {}) {
  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState(!initialWiedza);
  const [wiedza, setWiedza] = useState(initialWiedza);
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
  const section = (label: string, isOpen: boolean, toggle: () => void, body: React.ReactNode) => (
    <>
      <button type="button" aria-expanded={isOpen} onClick={toggle} className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-lg text-ink">
        {label} <ChevronDown size={20} className={clsx("transition", isOpen && "rotate-180")} aria-hidden />
      </button>
      {isOpen && <div className="space-y-5 pb-3 pl-1">{body}</div>}
    </>
  );
  return (
    <div className={always ? undefined : "md:hidden"}>
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Zamknij menu" : "Otwórz menu"} onClick={() => setOpen((o) => !o)}
        className="grid h-11 w-11 place-items-center rounded-full text-ink ring-1 ring-sand">
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>
      {open && createPortal(
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[65px] z-50 overflow-y-auto border-t border-sand bg-ivory px-5 pb-10 pt-4">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Menu" className="space-y-1">
              <Link href="/" onClick={close} className="block rounded-xl px-2 py-3 text-lg text-ink">Strona główna</Link>
              {section("Jak pomagamy", offer, () => setOffer((x) => !x), <OfferItems onPick={close} dense />)}
              {section("Wiedza", wiedza, () => setWiedza((x) => !x), (
                <>
                  <KnowledgeItems onPick={close} dense hidden={hidden} />
                  <Link href="/wiedza" onClick={close} className="block px-2 text-[15px] font-semibold text-forest">Zobacz wszystkie materiały →</Link>
                  <Link href="/wiedza/artykuly" onClick={close} className="block px-2 text-[15px] font-semibold text-forest">Artykuły o terapii par →</Link>
                </>
              ))}
              <a href="/#o-mnie" onClick={close} className="block rounded-xl px-2 py-3 text-lg text-ink">Kto pomaga</a>
              <a href="/#faq" onClick={close} className="block rounded-xl px-2 py-3 text-lg text-ink">Pytania</a>
            </nav>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
