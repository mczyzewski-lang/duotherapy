// Rejestr artykułów. Nowy artykuł: plik w tym katalogu + import poniżej (kolejność = kolejność na listach).
import type { Article } from "./types";
import { article as kiedyIsc } from "./kiedy-isc-na-terapie-par";
import { article as pierwszaWizyta } from "./jak-wyglada-pierwsza-wizyta-terapia-malzenska";
import { article as partnerNieChce } from "./terapia-par-gdy-partner-nie-chce";
import { article as czyRozwod } from "./terapia-malzenska-czy-rozwod";
import { article as online } from "./terapia-par-online";

export const ARTICLES: Article[] = [kiedyIsc, pierwszaWizyta, partnerNieChce, czyRozwod, online];

export const ARTICLES_PATH = "/wiedza/artykuly";

/** Autorka wszystkich artykułów (opis zgodny z prezentacją na stronie DUO). */
export const AUTHOR = {
  name: "Klaudia Bosek",
  role: "Psycholog i psychoterapeutka relacji",
  bio: "Psycholog i psychoterapeutka relacji w DUO. Pracuje pod regularną superwizją.",
  avatar: "/img/klaudia-bosek-avatar.jpg",
};
export const articleHref = (slug: string) => `${ARTICLES_PATH}/${slug}`;
export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/** Powiązane artykuły: najpierw wskazane ręcznie, potem po liczbie wspólnych tagów. */
export function relatedArticles(a: Article, limit = 3): Article[] {
  const manual = a.related.map(articleBySlug).filter((x): x is Article => !!x && x.slug !== a.slug);
  const byTags = ARTICLES.filter((x) => x.slug !== a.slug && !manual.includes(x))
    .map((x) => ({ x, score: x.tags.filter((t) => a.tags.includes(t)).length }))
    .filter((r) => r.score > 0)
    .sort((p, q) => q.score - p.score)
    .map((r) => r.x);
  return [...manual, ...byTags].slice(0, limit);
}

/** Artykuły, które polecają dany materiał – do sekcji „Przeczytaj też” na landingu materiału. */
export const articlesForMagnet = (magnetSlug: string, limit = 3) => ARTICLES.filter((a) => a.magnets.includes(magnetSlug)).slice(0, limit);

/** Wszystkie wewnętrzne linki z treści artykułu (do testów spójności linkowania). */
export function linksIn(a: Article): string[] {
  const texts = a.blocks.flatMap((b) =>
    b.t === "p" || b.t === "quote" ? [b.text] : b.t === "list" ? b.items : b.t === "callout" ? [b.text] : [],
  );
  return texts.flatMap((t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]));
}
