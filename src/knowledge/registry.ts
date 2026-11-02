// Rejestr materiałów „Wiedza”. Nowy materiał = nowy wpis tutaj (treść w src/knowledge/materials).
import { kryzysCzyKoniec, mapaTrzechDrog, pytan21 } from "./materials/decyzje";
import { jednaOsoba, petlaKonfliktu, siedemDni, trudnaRozmowa } from "./materials/rozmowa";
import { poZdradzie, przykladowaMapa, SAMPLE_INTRO, swiadomeRozstanie } from "./materials/trudne";
import { CATEGORY_LABEL, type Category, type LeadMagnet } from "./types";

/** Kolejność menu i strony /wiedza. */
export const MAGNETS: LeadMagnet[] = [
  mapaTrzechDrog,
  pytan21,
  kryzysCzyKoniec,
  przykladowaMapa,
  siedemDni,
  trudnaRozmowa,
  jednaOsoba,
  petlaKonfliktu,
  poZdradzie,
  swiadomeRozstanie,
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
export const mapaHref = (m: Pick<LeadMagnet, "id">, place: string) => `/?utm_source=duo_wiedza&utm_medium=lead_magnet&utm_campaign=${m.id}&utm_content=${place}#co-otrzymasz`;
