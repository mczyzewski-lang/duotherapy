"use client";

// Karty materiałów z filtrem kategorii (/wiedza).
import clsx from "clsx";
import { ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, MAGNETS } from "@/knowledge/registry";
import type { Category } from "@/knowledge/types";
import { CoverBook } from "./cover-book";
import { Cover } from "./doc";
import { MagnetIcon } from "./icons";

const INITIAL = 9;

export function KnowledgeGrid({ photos = {}, hidden = [], initialCategory }: { photos?: Record<string, string>; hidden?: string[]; initialCategory?: string }) {
  const [cat, setCat] = useState<Category | "all">(CATEGORIES.some((c) => c.key === initialCategory) ? (initialCategory as Category) : "all");
  const all = MAGNETS.filter((m) => !hidden.includes(m.slug));
  const [more, setMore] = useState(false);
  const filtered = cat === "all" ? all : all.filter((m) => m.category === cat);
  // „Wszystkie”: najpierw 9 kart (3 rzędy), reszta po kliknięciu – artykuły pod spodem nie giną pod 20 okładkami
  const list = cat === "all" && !more ? filtered.slice(0, INITIAL) : filtered;
  return (
    <>
      <div role="group" aria-label="Filtruj według kategorii" className="mt-8 flex flex-wrap gap-2">
        {[{ key: "all" as const, label: "Wszystkie" }, ...CATEGORIES].map((c) => (
          <button key={c.key} type="button" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}
            className={clsx("min-h-10 rounded-full px-4 text-sm font-medium ring-1 transition", cat === c.key ? "bg-forest text-white ring-forest" : "bg-white text-ink-soft ring-sand-dark hover:ring-forest")}>
            {c.label}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <li key={m.slug}>
            <Link href={`/wiedza/${m.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40">
              <div className="relative bg-linen/60 px-4 pt-5">
                {/* okładka-książka wychodzi z górnego pola i nachodzi na część z treścią (jak na stronie głównej) */}
                <div className="relative z-10 mx-auto -mb-20 h-[17rem] w-[12.6rem]">
                  <div className="w-[14rem] origin-top-left scale-90"><CoverBook><Cover m={m} mode="screen" compact photo={photos[m.slug]} idSuffix="-hub" /></CoverBook></div>
                </div>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-24">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">
                  <MagnetIcon icon={m.icon} id={`g-${m.id}`} className="h-5 w-5" /> {CATEGORIES.find((c) => c.key === m.category)?.label}
                </p>
                <h2 className="mt-2 font-display text-[1.25rem] leading-snug text-ink">{m.short}</h2>
                <p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{m.menuDesc}</p>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted">
                  <span className="inline-flex items-center gap-1"><FileText size={13} aria-hidden /> {m.format}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden /> {m.minutes}</span>
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">Zobacz materiał <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length < filtered.length && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setMore(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-forest ring-1 ring-forest/30 hover:bg-sage-soft" data-testid="magnets-more">
            Pokaż wszystkie materiały ({filtered.length})
          </button>
        </div>
      )}
    </>
  );
}
