// Szybka kontrola pliku artykułu przed dodaniem do rejestru (te same zasady co tests/unit/articles.test.ts + typografia).
// Użycie: npx tsx scripts/check-article.ts src/content/articles/<slug>.ts [kolejne pliki…]
// Opcjonalnie EXTRA_SLUGS="a,b,c" – slugi artykułów, które powstają równolegle (linki do nich uznajemy za poprawne).
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { ARTICLES, articleHref } from "@/content/articles";
import type { Article } from "@/content/articles/types";
import { PATHS } from "@/content/paths";
import { MAGNETS, magnetBySlug } from "@/knowledge/registry";

const extra = (process.env.EXTRA_SLUGS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const STATIC = ["/", "/mapa-relacji", "/start", "/wiedza", "/wiedza/artykuly", ...PATHS.map((p) => `/${p.slug}`)];
const articleSlugs = new Set([...ARTICLES.map((a) => a.slug), ...extra]);
const known = (href: string) => {
  const path = href.split("#")[0];
  return STATIC.includes(path) || MAGNETS.some((m) => `/wiedza/${m.slug}` === path) || [...articleSlugs].some((s) => articleHref(s) === path);
};
const texts = (a: Article) =>
  a.blocks.flatMap((b) => (b.t === "p" || b.t === "quote" || b.t === "callout" ? [b.text] : b.t === "list" ? b.items : []));

function check(a: Article): string[] {
  const e: string[] = [];
  if (!/^[a-z0-9-]+$/.test(a.slug)) e.push("slug");
  if (a.seoTitle.length > 60) e.push(`seoTitle ma ${a.seoTitle.length} znaków (max 60)`);
  if (a.description.length < 120 || a.description.length > 165) e.push(`description ma ${a.description.length} znaków (120–165)`);
  if (a.keywords.length < 3) e.push("keywords < 3");
  if (a.faq.length < 2) e.push("faq < 2");
  const main = a.keywords[0].split(" ").slice(0, 2).join(" ").toLowerCase();
  if (!`${a.h1} ${a.seoTitle}`.toLowerCase().includes(main)) e.push(`fraza „${main}” nie występuje w H1 ani seoTitle`);
  const arts = a.blocks.filter((b) => b.t === "art");
  if (arts.length < 2) e.push("mniej niż 2 bloki art");
  const artKeys = arts.map((b) => (b.t === "art" ? b.key : ""));
  if (new Set(artKeys).size !== artKeys.length || artKeys.some((k) => !/^[a-z0-9-]{3,60}$/.test(k))) e.push("klucze art: unikalne, [a-z0-9-]");
  if (a.hero.prompt.length <= 40 || a.hero.alt.length <= 20) e.push("hero prompt/alt za krótkie");
  const words = a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.t === "list" ? b.items : b.t === "callout" ? [b.text] : [])).join(" ").split(/\s+/).length;
  if (words < 480) e.push(`treść ma ${words} słów (min. 480)`);
  const ctas = a.blocks.filter((b) => b.t === "cta");
  if (!ctas.length) e.push("brak bloku cta");
  for (const c of ctas) if (c.t === "cta" && !magnetBySlug(c.magnet)) e.push(`nieznany materiał ${c.magnet}`);
  for (const m of a.magnets) if (!magnetBySlug(m)) e.push(`nieznany materiał w magnets: ${m}`);
  const ids = a.blocks.filter((b) => b.t === "h2").map((b) => (b.t === "h2" ? b.id : ""));
  if (new Set(ids).size !== ids.length) e.push("powtórzone id h2");
  const links = texts(a).flatMap((t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]));
  for (const l of links) if (!known(l)) e.push(`nieznany link ${l}`);
  if (!links.some((l) => l.startsWith("/wiedza/artykuly/"))) e.push("brak linku do innego artykułu");
  for (const r of a.related) if (!articleSlugs.has(r)) e.push(`related: nieznany ${r}`);
  if (JSON.stringify(a).includes(String.fromCharCode(0x2014))) e.push("pauza (U+2014) – użyj półpauzy –");
  if (/"[^"]*"/.test(texts(a).join(" ").replace(/\]\([^)]*\)/g, ""))) e.push("proste cudzysłowy w treści – użyj „…”");
  return e;
}

async function main() {
let bad = 0;
for (const f of process.argv.slice(2).filter((f) => !/\/(index|types)\.ts$/.test(f))) {
  const mod = await import(pathToFileURL(resolve(f)).href);
  const a: Article = mod.article;
  const words = a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.t === "list" ? b.items : b.t === "callout" ? [b.text] : [])).join(" ").split(/\s+/).length;
  const errs = check(a);
  if (errs.length) bad++;
  console.log(`${errs.length ? "✗" : "✓"} ${a.slug} (${words} słów, ${a.blocks.filter((b) => b.t === "art").length} ilustracje)${errs.map((x) => `\n    – ${x}`).join("")}`);
}
process.exit(bad ? 1 : 0);
}
main();
