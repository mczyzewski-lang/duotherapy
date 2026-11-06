// SEO: mapa strony obejmuje wszystkie publiczne strony (artykuły, materiały, ścieżki), bez stron prywatnych; metadane stron.
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { ARTICLES, articleHref } from "@/content/articles";
import { PATHS } from "@/content/paths";
import { MAGNETS } from "@/knowledge/registry";
import { breadcrumbJsonLd, faqJsonLd, ogImage, pageMeta } from "@/lib/seo";

describe("seo", () => {
  it("mapa strony: wszystkie artykuły, materiały i ścieżki, bez stron z tokenami i panelu", async () => {
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    for (const a of ARTICLES) expect(urls, a.slug).toContain(articleHref(a.slug));
    for (const m of MAGNETS) expect(urls, m.slug).toContain(`/wiedza/${m.slug}`);
    for (const p of PATHS) expect(urls, p.slug).toContain(`/${p.slug}`);
    for (const u of ["/", "/mapa-relacji", "/wiedza", "/wiedza/artykuly", "/pomoc", "/regulamin", "/prywatnosc"]) expect(urls).toContain(u);
    expect(urls.filter((u) => /^\/(app|q|r|zamowienie|twoja-mapa|start|api)(\/|$)|\/(demo|druk|material|podsumowanie)$/.test(u))).toEqual([]);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("robots blokuje panel i prywatne adresy, wskazuje mapę strony", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    for (const d of ["/app", "/q/", "/r/", "/zamowienie/"]) expect(rule.disallow).toContain(d);
    expect(String(r.sitemap)).toMatch(/\/sitemap\.xml$/);
  });

  it("pageMeta: kanoniczny adres, OG z obrazkiem 1200×630, karta Twitter", () => {
    const m = pageMeta({ title: "Tytuł", description: "Opis", path: "/x", kicker: "K" });
    expect(String(m.alternates?.canonical)).toMatch(/\/x$/);
    const og = m.openGraph as { images: { url: string; width: number }[]; locale: string };
    expect(og.images[0].url).toBe(ogImage("Tytuł", "K"));
    expect(og.images[0].width).toBe(1200);
    expect(og.locale).toBe("pl_PL");
    expect((m.twitter as { card: string }).card).toBe("summary_large_image");
  });

  it("dane strukturalne: okruszki i FAQ", () => {
    const b = breadcrumbJsonLd([["DUO", "/"], ["Wiedza", "/wiedza"]]);
    expect(b.itemListElement[1]).toMatchObject({ position: 2, name: "Wiedza" });
    expect(faqJsonLd([{ q: "P?", a: "O." }]).mainEntity[0].acceptedAnswer.text).toBe("O.");
  });
});
