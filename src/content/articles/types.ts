// Artykuły „Wiedzy” (SEO, długi ogon): treść jako lista bloków, jeden renderer, infografiki w barwach DUO.
// Nowy artykuł = nowy plik w src/content/articles/ + wpis w index.ts (szczegóły: docs/artykuly.md).

/** Klucze infografik (src/components/articles/infographics.tsx). */
export type GraphicKey = "signals" | "first-visit" | "influence" | "decision-roads" | "online-fit";

/**
 * Tekst akapitów i list obsługuje: **pogrubienie** i [link](/adres) – linki wewnętrzne budują sieć powiązań
 * między artykułami, materiałami i ścieżkami DUO.
 */
export type ArticleBlock =
  | { t: "h2"; id: string; text: string }
  | { t: "h3"; text: string }
  | { t: "p"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "quote"; text: string }
  | { t: "callout"; title: string; text: string; tone?: "info" | "safety" }
  | { t: "figure"; graphic: GraphicKey; title: string; caption: string }
  /** Kontener z bezpłatnym materiałem dopasowanym do miejsca w tekście. */
  | { t: "cta"; magnet: string; hook: string }
  /**
   * Ilustracja-infografika generowana w panelu (OpenAI): minimalistyczna, w barwach DUO, bez tekstu w obrazie.
   * Tytuł i podpis (podsumowanie idei) są w HTML – czytelne dla Google i czytników ekranu.
   */
  | { t: "art"; key: string; title: string; prompt: string; alt: string; caption: string }
  /** Krótki, dyskretny odnośnik do Mapy Relacji. */
  | { t: "mapa" };

export interface Article {
  slug: string;
  /** Nagłówek H1 (może być dłuższy niż title). */
  h1: string;
  /** Krótki tytuł do kart i linków. */
  title: string;
  /** <title> – z frazą z długiego ogona, do ok. 60 znaków. */
  seoTitle: string;
  /** Meta description – 140–160 znaków, z frazą i obietnicą treści. */
  description: string;
  /** Zajawka na kartach (1–2 zdania). */
  excerpt: string;
  /** Frazy z długiego ogona, na które artykuł odpowiada (do kontroli i analiz). */
  keywords: string[];
  /** Tematy do łączenia artykułów i filtrów. */
  tags: string[];
  published: string;
  updated: string;
  minutes: number;
  lead: string;
  /** Grafika na górze artykułu (generowana w panelu). */
  hero: { prompt: string; alt: string };
  blocks: ArticleBlock[];
  faq: { q: string; a: string }[];
  /** Ręcznie wybrane powiązane artykuły (slugi); uzupełniane automatycznie po wspólnych tagach. */
  related: string[];
  /** Materiały (slugi lead magnetów) najlepiej pasujące do tematu – do bocznego kontenera i końca artykułu. */
  magnets: string[];
}
