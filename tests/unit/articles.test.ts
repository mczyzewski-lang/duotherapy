// Artykuły: jakość SEO (tytuły, opisy, frazy), spójność linkowania wewnętrznego i kontenerów z materiałami.
import { describe, expect, it } from "vitest";
import { ARTICLES, articleBySlug, articleHref, linksIn, relatedArticles } from "@/content/articles";
import { PATHS } from "@/content/paths";
import { MAGNETS, magnetBySlug } from "@/knowledge/registry";

const STATIC = ["/", "/mapa-relacji", "/start", "/wiedza", "/wiedza/artykuly", ...PATHS.map((p) => `/${p.slug}`)];
const known = (href: string) => {
  const path = href.split("#")[0];
  return STATIC.includes(path) || MAGNETS.some((m) => `/wiedza/${m.slug}` === path) || ARTICLES.some((a) => articleHref(a.slug) === path);
};

describe("artykuły", () => {
  it("unikalne slugi i poprawne metadane SEO", () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length);
    for (const a of ARTICLES) {
      expect(a.slug, a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(a.seoTitle.length, `${a.slug}: seoTitle`).toBeLessThanOrEqual(60);
      expect(a.description.length, `${a.slug}: description`).toBeGreaterThanOrEqual(120);
      expect(a.description.length, `${a.slug}: description`).toBeLessThanOrEqual(165);
      expect(a.keywords.length, a.slug).toBeGreaterThanOrEqual(3);
      expect(a.faq.length, a.slug).toBeGreaterThanOrEqual(2);
      // główna fraza pojawia się w H1 lub tytule SEO
      const main = a.keywords[0].split(" ").slice(0, 2).join(" ").toLowerCase();
      expect(`${a.h1} ${a.seoTitle}`.toLowerCase(), `${a.slug}: fraza „${main}”`).toContain(main);
    }
  });

  it("każdy artykuł: min. 2 infografiki, grafika na górze, długa treść, kontener z materiałem, unikalne kotwice", async () => {
    const { articleImageJobs } = await import("@/lib/article-images");
    for (const a of ARTICLES) {
      expect(a.blocks.filter((b) => b.t === "figure" || b.t === "art").length, `${a.slug}: infografiki`).toBeGreaterThanOrEqual(2);
      expect(a.blocks.filter((b) => b.t === "art").length, `${a.slug}: ilustracje`).toBeGreaterThanOrEqual(2);
      expect(a.hero.prompt.length, a.slug).toBeGreaterThan(40);
      expect(a.hero.alt.length, a.slug).toBeGreaterThan(20);
      const jobs = articleImageJobs(a.slug);
      expect(new Set(jobs.map((j) => j.key)).size, a.slug).toBe(jobs.length);
      for (const j of jobs) expect(j.key, j.key).toMatch(/^[a-z0-9-]{3,160}$/);
      const words = a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.t === "list" ? b.items : b.t === "callout" ? [b.text] : [])).join(" ").split(/\s+/).length;
      expect(words, `${a.slug}: liczba słów treści`).toBeGreaterThanOrEqual(480);
      const ctas = a.blocks.filter((b) => b.t === "cta");
      expect(ctas.length, a.slug).toBeGreaterThanOrEqual(1);
      for (const c of ctas) if (c.t === "cta") expect(magnetBySlug(c.magnet), `${a.slug} → ${c.magnet}`).toBeTruthy();
      for (const m of a.magnets) expect(magnetBySlug(m), `${a.slug} → ${m}`).toBeTruthy();
      const ids = a.blocks.filter((b) => b.t === "h2").map((b) => (b.t === "h2" ? b.id : ""));
      expect(new Set(ids).size, a.slug).toBe(ids.length);
    }
  });

  it("linki wewnętrzne prowadzą do istniejących stron, artykuły linkują do siebie nawzajem", () => {
    for (const a of ARTICLES) {
      const links = linksIn(a);
      for (const l of links) expect(known(l), `${a.slug}: ${l}`).toBe(true);
      expect(links.some((l) => l.startsWith("/wiedza/artykuly/")), `${a.slug}: link do innego artykułu`).toBe(true);
      for (const r of a.related) expect(articleBySlug(r), `${a.slug} → ${r}`).toBeTruthy();
      expect(relatedArticles(a).length, a.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("układ: między kontenerami (infografika, ilustracja, materiał, ramka) min. 3 zdania tekstu; żaden blok nie ginie", async () => {
    const { isContainer, layoutBlocks, sentencesIn, MIN_SENTENCES_BETWEEN } = await import("@/content/articles/layout");
    for (const a of ARTICLES) {
      const out = layoutBlocks(a.blocks);
      expect(out.length, a.slug).toBe(a.blocks.length);
      expect(new Set(out), a.slug).toEqual(new Set(a.blocks));
      let since = Number.POSITIVE_INFINITY;
      for (const b of out) {
        if (isContainer(b)) {
          expect(since, `${a.slug}: ${b.t} za blisko poprzedniego kontenera`).toBeGreaterThanOrEqual(MIN_SENTENCES_BETWEEN);
          since = 0;
        } else since += sentencesIn(b);
      }
      expect(out[out.length - 1].t, a.slug).toBe("mapa");
    }
  });
});
