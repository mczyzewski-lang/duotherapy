"use client";

import clsx from "clsx";
import { useState } from "react";

/** Filtr tematów listy artykułów: karty są wyrenderowane na serwerze (pełna lista dla Google), tu tylko je ukrywamy. */
export function TagFilter({ tags, listId }: { tags: { id: string; label: string; count: number }[]; listId: string }) {
  const [sel, setSel] = useState<string | null>(null);
  const chip = (active: boolean) =>
    clsx("min-h-10 rounded-full px-4 text-sm font-medium ring-1 transition", active ? "bg-forest text-white ring-forest" : "bg-white text-ink-soft ring-sand hover:text-forest hover:ring-forest/40");
  return (
    <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtruj artykuły według tematu" data-testid="article-tags">
      {sel && <style>{`#${listId} > li:not([data-t~="${sel}"]){display:none}`}</style>}
      <button type="button" className={chip(!sel)} aria-pressed={!sel} onClick={() => setSel(null)}>Wszystkie</button>
      {tags.map((t) => (
        <button key={t.id} type="button" className={chip(sel === t.id)} aria-pressed={sel === t.id} onClick={() => setSel(sel === t.id ? null : t.id)}>
          {t.label} <span className="opacity-60">{t.count}</span>
        </button>
      ))}
    </div>
  );
}
