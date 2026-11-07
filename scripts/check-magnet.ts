// Kontrola nowego materiału „Wiedza” (te same zasady co tests/unit/knowledge.test.ts + typografia).
// Użycie: npx tsx scripts/check-magnet.ts <plik materiałów .ts> <plik okładek .ts> <plik przykładów .ts>
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { fieldsOf, requirementsOf } from "@/knowledge/fields";
import type { LeadMagnet } from "@/knowledge/types";

async function main() {
  const [mf, cf, sf] = process.argv.slice(2).map((f) => import(pathToFileURL(resolve(f)).href));
  const mats = Object.values(await mf).filter((x): x is LeadMagnet => !!x && typeof x === "object" && "slug" in (x as object));
  const covers = Object.values(await cf).find((x) => x && typeof x === "object") as Record<string, Record<string, unknown>>;
  const samples = Object.values(await sf).find((x) => x && typeof x === "object") as Record<string, Record<string, string | true>>;
  let bad = 0;
  for (const m of mats) {
    const e: string[] = [];
    if (!/^lm[0-9]{2}$/.test(m.id)) e.push("id lmNN");
    if (m.gets.length < 3 || m.gets.length > 5) e.push("gets 3–5");
    if (m.forWho.length > 4) e.push("forWho ≤ 4");
    if (m.emails.length !== 3) e.push("3 e-maile");
    if (m.blocks.length <= 14) e.push(`bloków ${m.blocks.length} (min. 15)`);
    if (!m.preview.length || m.preview.some((i) => !m.blocks[i])) e.push("preview – złe indeksy");
    const f = fieldsOf(m);
    if (f.length <= 3) e.push(`pól do uzupełnienia ${f.length} (min. 4)`);
    if (new Set(f.map((x) => x.id)).size !== f.length) e.push("powtórzone pola");
    if (!requirementsOf(f).length) e.push("brak wymagań podsumowania");
    if (m.seo.title.length > 70) e.push(`seo.title ${m.seo.title.length} > 70`);
    if (m.seo.description.length < 120 || m.seo.description.length > 165) e.push(`seo.description ${m.seo.description.length} (120–165)`);
    const c = covers?.[m.slug];
    if (!c) e.push("brak okładki w pliku okładek");
    else for (const k of ["hook", "summary", "photoBrief", "artBrief"]) if (!c[k]) e.push(`okładka: brak ${k}`);
    const t = JSON.stringify(m).toLowerCase();
    if (/lorem|ipsum|todo|\[do uzupełnienia|tbd|xxx/.test(t)) e.push("tekst zastępczy");
    if (/\d+\s?% szans|uratuje(my)? (wasz|twój) związek|gwarantujemy/.test(t)) e.push("obietnice / wynik punktowy");
    if (JSON.stringify([m, c ?? {}, samples?.[m.slug] ?? {}]).includes(String.fromCharCode(0x2014))) e.push("pauza (U+2014) – użyj półpauzy –");
    const prev = f.filter((x) => m.preview.includes(Number(x.id.match(/^[a-z](\d+)/)![1])));
    for (const [id, v] of Object.entries(samples?.[m.slug] ?? {})) {
      const fx = prev.find((x) => x.id === id);
      if (!fx) e.push(`przykład ${id}: pole spoza podglądu (dostępne: ${prev.map((x) => x.id).join(", ")})`);
      else if (fx.kind !== (v === true ? "check" : "text")) e.push(`przykład ${id}: zły typ`);
      else if (typeof v === "string" && v.length > 70) e.push(`przykład ${id}: > 70 znaków`);
    }
    if (!samples?.[m.slug]) e.push("brak przykładowych odpowiedzi");
    if (e.length) bad++;
    console.log(`${e.length ? "✗" : "✓"} ${m.slug} (${m.blocks.length} bloków, ${f.length} pól)${e.map((x) => `\n    – ${x}`).join("")}`);
  }
  process.exit(bad ? 1 : 0);
}
main();
