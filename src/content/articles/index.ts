// Rejestr artykułów. Nowy artykuł: plik w tym katalogu + import poniżej (kolejność = kolejność na listach).
import type { Article } from "./types";
import { article as kiedyIsc } from "./kiedy-isc-na-terapie-par";
import { article as pierwszaWizyta } from "./jak-wyglada-pierwsza-wizyta-terapia-malzenska";
import { article as partnerNieChce } from "./terapia-par-gdy-partner-nie-chce";
import { article as czyRozwod } from "./terapia-malzenska-czy-rozwod";
import { article as online } from "./terapia-par-online";
import { article as a_ciagle_klotnie_w_zwiazku } from "./ciagle-klotnie-w-zwiazku";
import { article as a_ciche_dni_w_zwiazku } from "./ciche-dni-w-zwiazku";
import { article as a_jak_rozmawiac_z_partnerem_bez_klotni } from "./jak-rozmawiac-z-partnerem-bez-klotni";
import { article as a_komunikacja_w_zwiazku_cwiczenia } from "./komunikacja-w-zwiazku-cwiczenia";
import { article as a_obwinianie_w_zwiazku } from "./obwinianie-w-zwiazku";
import { article as a_jak_odbudowac_zaufanie_po_zdradzie } from "./jak-odbudowac-zaufanie-po-zdradzie";
import { article as a_zdrada_emocjonalna } from "./zdrada-emocjonalna";
import { article as a_czy_warto_ratowac_zwiazek_po_zdradzie } from "./czy-warto-ratowac-zwiazek-po-zdradzie";
import { article as a_zazdrosc_w_zwiazku } from "./zazdrosc-w-zwiazku";
import { article as a_jak_przeprosic_partnera } from "./jak-przeprosic-partnera";
import { article as a_kryzys_w_zwiazku_jak_przetrwac } from "./kryzys-w-zwiazku-jak-przetrwac";
import { article as a_wypalenie_w_zwiazku } from "./wypalenie-w-zwiazku";
import { article as a_czy_to_jeszcze_milosc } from "./czy-to-jeszcze-milosc";
import { article as a_partner_sie_oddala } from "./partner-sie-oddala";
import { article as a_kryzys_siedem_roku_malzenstwa } from "./kryzys-7-roku-malzenstwa";
import { article as a_kryzys_po_narodzinach_dziecka } from "./kryzys-po-narodzinach-dziecka";
import { article as a_brak_bliskosci_w_malzenstwie } from "./brak-bliskosci-w-malzenstwie";
import { article as a_brak_seksu_w_zwiazku } from "./brak-seksu-w-zwiazku";
import { article as a_syndrom_pustego_gniazda } from "./syndrom-pustego-gniazda";
import { article as a_stres_a_zwiazek } from "./stres-a-zwiazek";
import { article as a_podzial_obowiazkow_w_zwiazku } from "./podzial-obowiazkow-w-zwiazku";
import { article as a_klotnie_o_pieniadze } from "./klotnie-o-pieniadze";
import { article as a_konflikt_z_tesciami } from "./konflikt-z-tesciami";
import { article as a_separacja_w_malzenstwie } from "./separacja-w-malzenstwie";
import { article as a_jak_powiedziec_dzieciom_o_rozwodzie } from "./jak-powiedziec-dzieciom-o-rozwodzie";
import { article as a_czy_terapia_par_dziala } from "./czy-terapia-par-dziala";
import { article as a_ile_trwa_terapia_par } from "./ile-trwa-terapia-par";
import { article as a_ile_kosztuje_terapia_par } from "./ile-kosztuje-terapia-par";
import { article as a_jak_wybrac_terapeute_par } from "./jak-wybrac-terapeute-par";
import { article as a_przemoc_psychiczna_w_zwiazku } from "./przemoc-psychiczna-w-zwiazku";

export const ARTICLES: Article[] = [
  kiedyIsc, pierwszaWizyta, partnerNieChce, czyRozwod, online,
  a_ciagle_klotnie_w_zwiazku,
  a_ciche_dni_w_zwiazku,
  a_jak_rozmawiac_z_partnerem_bez_klotni,
  a_komunikacja_w_zwiazku_cwiczenia,
  a_obwinianie_w_zwiazku,
  a_jak_odbudowac_zaufanie_po_zdradzie,
  a_zdrada_emocjonalna,
  a_czy_warto_ratowac_zwiazek_po_zdradzie,
  a_zazdrosc_w_zwiazku,
  a_jak_przeprosic_partnera,
  a_kryzys_w_zwiazku_jak_przetrwac,
  a_wypalenie_w_zwiazku,
  a_czy_to_jeszcze_milosc,
  a_partner_sie_oddala,
  a_kryzys_siedem_roku_malzenstwa,
  a_kryzys_po_narodzinach_dziecka,
  a_brak_bliskosci_w_malzenstwie,
  a_brak_seksu_w_zwiazku,
  a_syndrom_pustego_gniazda,
  a_stres_a_zwiazek,
  a_podzial_obowiazkow_w_zwiazku,
  a_klotnie_o_pieniadze,
  a_konflikt_z_tesciami,
  a_separacja_w_malzenstwie,
  a_jak_powiedziec_dzieciom_o_rozwodzie,
  a_czy_terapia_par_dziala,
  a_ile_trwa_terapia_par,
  a_ile_kosztuje_terapia_par,
  a_jak_wybrac_terapeute_par,
  a_przemoc_psychiczna_w_zwiazku,
];

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
