"use client";

// Wyzwanie 7 dni (wersja online): oznaczanie ukończonych dni – tylko w tej przeglądarce, bez wysyłania danych.
import clsx from "clsx";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "duo_7dni";

export function DayDone({ n }: { n: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    try {
      setDone((JSON.parse(localStorage.getItem(KEY) ?? "[]") as number[]).includes(n));
    } catch {}
  }, [n]);
  const toggle = () => {
    try {
      const cur = new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as number[]);
      if (cur.has(n)) cur.delete(n);
      else cur.add(n);
      localStorage.setItem(KEY, JSON.stringify([...cur]));
      setDone(cur.has(n));
    } catch {
      setDone((d) => !d);
    }
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={done}
      className={clsx("mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition", done ? "bg-forest text-white ring-forest" : "bg-white text-forest ring-sand-dark hover:ring-forest")}>
      <Check size={16} aria-hidden /> {done ? `Dzień ${n} zrobiony` : `Oznacz dzień ${n} jako zrobiony`}
    </button>
  );
}
