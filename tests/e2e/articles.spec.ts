// Artykuły: lista pod materiałami w /wiedza, strona artykułu (SEO, infografika, kontener z materiałem), linkowanie.
import { expect, test } from "@playwright/test";

test("artykuły: /wiedza → lista → artykuł z infografiką, kontenerem materiału, FAQ i danymi strukturalnymi", async ({ page, request }) => {
  await page.goto("/wiedza");
  await expect(page.getByRole("heading", { name: /Terapia par i terapia małżeńska – przeczytaj/ })).toBeVisible();
  // lazy loader: na start 6 kart, przewinięcie doładowuje kolejne, przycisk – resztę
  const lazy = page.getByTestId("articles-lazy");
  await expect(lazy.getByTestId("article-card")).toHaveCount(6);
  await page.getByTestId("lazy-more").scrollIntoViewIfNeeded();
  await expect(lazy.getByTestId("article-card")).toHaveCount(12);
  while (await page.getByTestId("lazy-more").count()) {
    await page.getByTestId("lazy-more").click();
    await page.waitForTimeout(500);
  }
  await expect(lazy.getByTestId("article-card")).toHaveCount(35);
  await page.getByRole("link", { name: "Wszystkie artykuły →" }).first().click();
  await expect(page).toHaveURL(/\/wiedza\/artykuly$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terapia par i terapia małżeńska – artykuły");
  // pełna lista + filtr tematów (karty zostają w HTML, filtr tylko je ukrywa)
  await expect(page.getByTestId("article-card")).toHaveCount(35);
  await page.getByTestId("article-tags").getByRole("button", { name: /^zdrada/ }).click();
  const visible = await page.getByTestId("article-card").evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);
  expect(visible).toBeGreaterThan(1);
  expect(visible).toBeLessThan(35);
  await page.getByTestId("article-tags").getByRole("button", { name: "Wszystkie" }).click();

  await page.getByTestId("article-card").filter({ hasText: "Kiedy iść na terapię par?" }).click();
  await expect(page).toHaveURL(/\/wiedza\/artykuly\/kiedy-isc-na-terapie-par$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page).toHaveTitle("Kiedy iść na terapię par? 9 sygnałów, że to ten moment | DUO");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/wiedza\/artykuly\/kiedy-isc-na-terapie-par$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /terapię par/);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((x) => JSON.parse(x));
  expect(ld.map((x: { "@type": string }) => x["@type"])).toEqual(["Article", "BreadcrumbList", "FAQPage"]);
  await expect(page.getByTestId("article-author").first()).toContainText("Klaudia Bosek");
  await expect(page.getByTestId("article-hero")).toBeVisible();
  expect(await page.getByTestId("art-figure").count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByTestId("mapa-slim")).toBeVisible();
  await expect(page.getByTestId("mapa-explainer")).toHaveCount(0);
  expect(ld[0].author.name).toBe("Klaudia Bosek");
  await expect(page.getByTestId("infographic").first()).toContainText("9 sygnałów");
  await expect(page.getByTestId("infographic").first()).toContainText("DUO®");

  // kontener z materiałem prowadzi do formularza materiału
  const cta = page.getByTestId("article-cta").first();
  await expect(cta).toContainText("21 pytań o relacji");
  await cta.getByRole("link", { name: /Pobierz bezpłatnie/ }).click();
  await expect(page).toHaveURL(/\/wiedza\/21-pytan-o-relacji#odbierz$/);
  // a strona materiału linkuje z powrotem do artykułów
  await expect(page.getByRole("heading", { name: "Przeczytaj też" })).toBeVisible();
  await expect(page.getByTestId("article-card").first()).toBeVisible();

  // wszystkie artykuły działają i są w sitemapie
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const slug of ["kiedy-isc-na-terapie-par", "jak-wyglada-pierwsza-wizyta-terapia-malzenska", "terapia-par-gdy-partner-nie-chce", "terapia-malzenska-czy-rozwod", "terapia-par-online"]) {
    expect((await request.get(`/wiedza/artykuly/${slug}`)).status(), slug).toBe(200);
    expect(sitemap, slug).toContain(`/wiedza/artykuly/${slug}`);
  }
  expect((await request.get("/wiedza/artykuly/nie-ma-takiego")).status()).toBe(404);
});
