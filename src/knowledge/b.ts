// Krótkie konstruktory bloków treści (czytelniejsze pliki materiałów).
import type { Block } from "./types";

export const h2 = (text: string, noBreak = false): Block => ({ t: "h2", text, noBreak });
export const h3 = (text: string): Block => ({ t: "h3", text });
export const p = (text: string): Block => ({ t: "p", text });
export const lead = (text: string): Block => ({ t: "lead", text });
export const ul = (...items: string[]): Block => ({ t: "list", items });
export const ol = (...items: string[]): Block => ({ t: "list", items, ordered: true });
export const info = (title: string, text: string): Block => ({ t: "callout", tone: "info", title, text });
export const tip = (title: string, text: string): Block => ({ t: "callout", tone: "tip", title, text });
export const safety = (text: string, title = "Twoje bezpieczeństwo jest najważniejsze"): Block => ({ t: "callout", tone: "safety", title, text });
export const check = (title: string, ...items: string[]): Block => ({ t: "checklist", title, items });
export const br: Block = { t: "break" };

export const SAFETY_JOINT =
  "Ćwiczeń do wspólnej rozmowy nie wykonuj, jeśli w relacji jest przemoc, zastraszanie, kontrola albo boisz się reakcji drugiej osoby. Wtedy najważniejsze jest Twoje bezpieczeństwo: w zagrożeniu dzwoń pod 112, wsparcie znajdziesz też w Niebieskiej Linii (800 120 002) i Centrum Wsparcia (800 70 2222).";
