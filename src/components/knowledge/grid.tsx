"use client";

// Karty materiałów z filtrem kategorii (/wiedza).
import clsx from "clsx";
import { ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, MAGNETS } from "@/knowledge/registry";
import type { Category } from "@/knowledge/types";
import { Cover } from "./doc";
import { MagnetIcon } from "./icons";

export function KnowledgeGrid() {
  const [cat, setCat] = useState<Category | "all">("all");
  const list = cat === "all" ? MAGNETS : MAGNETS.filter((m) => m.category === cat);
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
              <div className="bg-linen/60 p-4">
                <div className="mx-auto max-w-[13rem]"><Cover m={m} mode="screen" compact /></div>
              </div>
              <div className="flex flex-1 flex-col p-5">
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
    </>
  );
}
