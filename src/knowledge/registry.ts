// Rejestr materiałów „Wiedza”. Nowy materiał = nowy wpis tutaj (treść w src/knowledge/materials).
import { kryzysCzyKoniec, mapaTrzechDrog, pytan21 } from "./materials/decyzje";
import { jednaOsoba, petlaKonfliktu, siedemDni, trudnaRozmowa } from "./materials/rozmowa";
import { poZdradzie, przykladowaMapa, SAMPLE_INTRO, swiadomeRozstanie } from "./materials/trudne";
import { ktoCoRobi, rozmowaOPieniadzach } from "./materials/nowe-a";
import { bliskoscPoDziecku, czasWeDwoje } from "./materials/nowe-b";
import { cicheDni, jezykPotrzeb } from "./materials/nowe-c";
import { graniceZRodzina, klotniePrzyDzieciach } from "./materials/nowe-d";
import { przygotowanieDoTerapii, sygnalyKryzysu } from "./materials/nowe-e";
import { cichaSeparacja, szansaCzyOdwlekanie } from "./materials/nowe-f";
import { kartaNaprawczaPoKlotni, siedemZdanWKlotni } from "./materials/nowe-g";
import { dzieciMiloscCzyStrach, trzyRozmowyPrzedRozwodem } from "./materials/nowe-h";
import { czerwoneFlagiTerapiaPar } from "./materials/nowe-i";
import { CATEGORY_LABEL, type Category, type LeadMagnet } from "./types";

/** Kolejność strony /wiedza i menu (w kategoriach): najpierw materiały o najwyższej intencji – do testów kosztu pobrania i konwersji. */
export const MAGNETS: LeadMagnet[] = [
  mapaTrzechDrog,
  szansaCzyOdwlekanie,
  siedemZdanWKlotni,
  przygotowanieDoTerapii,
  pytan21,
  cichaSeparacja,
  trudnaRozmowa,
  jednaOsoba,
  poZdradzie,
  kryzysCzyKoniec,
  petlaKonfliktu,
  trzyRozmowyPrzedRozwodem,
  dzieciMiloscCzyStrach,
  czerwoneFlagiTerapiaPar,
  kartaNaprawczaPoKlotni,
  siedemDni,
  cicheDni,
  jezykPotrzeb,
  rozmowaOPieniadzach,
  ktoCoRobi,
  czasWeDwoje,
  bliskoscPoDziecku,
  sygnalyKryzysu,
  klotniePrzyDzieciach,
  graniceZRodzina,
  swiadomeRozstanie,
  przykladowaMapa,
];

export const CATEGORIES: { key: Category; label: string; items: LeadMagnet[] }[] = (["decyzje", "rozmowa", "trudne"] as Category[]).map((key) => ({
  key,
  label: CATEGORY_LABEL[key],
  items: MAGNETS.filter((m) => m.category === key),
}));

export const magnetBySlug = (slug: string) => MAGNETS.find((m) => m.slug === slug) ?? null;
export const magnetById = (id: string) => MAGNETS.find((m) => m.id === id) ?? null;

export { SAMPLE_INTRO };

/** Parametry atrybucji linku do Mapy Relacji – nieopisowe (id materiału, bez tematu). */
export const mapaHref = (m: Pick<LeadMagnet, "id">, place: string) => `/mapa-relacji?utm_source=duo_wiedza&utm_medium=lead_magnet&utm_campaign=${m.id}&utm_content=${place}#co-otrzymasz`;
