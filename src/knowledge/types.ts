// Model treści materiałów „Wiedza”. Każdy materiał ma JEDNO źródło (lista bloków), z którego powstają:
// wersja online, podgląd /demo, fragmenty na landingu i PDF (wydruk tej samej strony przez Chromium).

export type Block =
  | { t: "h2"; text: string; noBreak?: boolean }
  | { t: "h3"; text: string }
  | { t: "p"; text: string }
  | { t: "lead"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "callout"; tone: "info" | "safety" | "tip"; title?: string; text: string }
  | { t: "question"; n: number; area?: string; q: string; why?: string; deeper?: string; lines?: number }
  | { t: "exercise"; title: string; time?: string; intro?: string; steps?: string[]; prompts?: string[]; lines?: number }
  | { t: "columns"; title?: string; cols: [string, string]; rows?: [string, string][]; blankRows?: number }
  | { t: "day"; n: number; title: string; minutes: string; intro: string; task: string[]; example: string; solo: string; lines?: number }
  | { t: "dialog"; title: string; tone: "escalate" | "support"; lines: { who: string; text: string }[]; note?: string }
  | { t: "checklist"; title?: string; items: string[] }
  | { t: "cards"; title?: string; items: { label?: string; title: string; text?: string }[] }
  | { t: "roads" }
  | { t: "loop" }
  | { t: "loopExample"; title: string; steps: [string, string][]; breakPoint: string }
  | { t: "loopBlank" }
  | { t: "break" };

export type Category = "decyzje" | "rozmowa" | "trudne";

export const CATEGORY_LABEL: Record<Category, string> = {
  decyzje: "Zrozumienie i decyzje",
  rozmowa: "Rozmowa i odbudowa",
  trudne: "Trudne sytuacje",
};

export type IconKey =
  | "roads" | "questions" | "crisis" | "report" | "days" | "talk" | "solo" | "loop" | "betrayal" | "separation"
  | "money" | "home" | "together" | "family" | "needs" | "silence" | "kids" | "boundary" | "signals" | "therapy"
  | "hourglass" | "distance" | "stop" | "repair" | "three" | "scale" | "flag";

export interface LeadMagnet {
  /** Identyfikator nieopisowy (do analityki i CRM – bez treści o problemie). */
  id: string;
  /** Numer 1–10 (zdarzenia lejka). */
  n: number;
  slug: string;
  category: Category;
  icon: IconKey;
  /** Pełny tytuł materiału (okładka, H1 w podglądzie). */
  title: string;
  /** Krótka nazwa do menu i kart. */
  short: string;
  /** Jedno zdanie do menu. */
  menuDesc: string;
  format: string;
  minutes: string;
  hero: { h1: string; sub: string };
  seo: { title: string; description: string };
  gets: string[];
  forWho: string[];
  /** Indeksy bloków pokazywanych jako podgląd na landingu. */
  preview: number[];
  previewNote: string;
  /** Delikatne nawiązanie do Mapy Relacji (sekcja 7 landingu i koniec materiału). */
  mapaText: string;
  cover: { kicker: string; subtitle: string };
  /** Krótko: do czego służy materiał (e-mail dostarczający). */
  purpose: string;
  howTo: string;
  blocks: Block[];
  /** Trzy wiadomości po zgodzie marketingowej. */
  emails: { subject: string; body: string }[];
  /** Wymaga akceptacji merytorycznej psycholożki przed publikacją. */
  needsReview: true;
  /** Materiał specjalny – przykładowy raport (renderowany prawdziwym generatorem podsumowań). */
  special?: "sample-report";
}
