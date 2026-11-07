// Widoczność materiałów (lead magnetów) na stronie – przełącznik w panelu. Ukryty materiał znika z menu, list, artykułów
// i mapy strony, a jego landing i podgląd zwracają 404. Osoby, które już go odebrały, dalej mają dostęp przez swój link.
import { system } from "./db";
import { MAGNETS } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";

let cache: { at: number; hidden: Set<string> } | null = null;

export async function hiddenMagnets(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.hidden;
  try {
    const [r] = await system((tx) => tx<{ value: { hidden?: string[] } }[]>`select value from app_settings where key = 'magnets'`);
    cache = { at: Date.now(), hidden: new Set(r?.value?.hidden ?? []) };
  } catch {
    cache = { at: Date.now(), hidden: new Set() };
  }
  return cache.hidden;
}
export const invalidateMagnetVisibility = () => { cache = null; };

export async function visibleMagnets(): Promise<LeadMagnet[]> {
  const h = await hiddenMagnets();
  return MAGNETS.filter((m) => !h.has(m.slug));
}
export async function isMagnetVisible(slug: string) {
  return !(await hiddenMagnets()).has(slug);
}
