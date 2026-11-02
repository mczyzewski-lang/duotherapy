// „Wiedza”: menu, strona zbiorcza, 10 landingów, 10 podglądów /demo, zgodność /demo ↔ PDF, formularz i panel.
import { expect, test, type Page } from "@playwright/test";

const SLUGS = [
  "mapa-trzech-drog", "21-pytan-o-relacji", "kryzys-czy-koniec-milosci", "przykladowa-mapa-relacji", "7-dni-lepszych-rozmow",
  "trudna-rozmowa", "partner-nie-chce-ratowac-zwiazku", "petla-konfliktu", "po-zdradzie", "swiadome-rozstanie",
];

async function headings(page: Page, url: string, sel: string) {
  await page.goto(url);
  return page.locator(sel).allTextContents();
}

test("menu Wiedza: desktop (klik, Esc) i telefon; strona zbiorcza z filtrem", async ({ page, browser }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const btn = page.getByRole("button", { name: "Wiedza" });
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  for (const s of SLUGS) await expect(page.locator(`a[href="/wiedza/${s}"]`).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();

  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto("/");
  await m.waitForLoadState("networkidle");
  await m.getByRole("button", { name: "Otwórz menu" }).click();
  await m.getByRole("button", { name: "Wiedza" }).click();
  await expect(m.locator('#mobile-menu a[href="/wiedza/po-zdradzie"]')).toBeVisible();
  await m.locator('#mobile-menu a[href="/wiedza"]').click();
  await expect(m.getByRole("heading", { level: 1, name: /Wiedza, która pomaga/ })).toBeVisible();
  await m.close();

  await page.goto("/wiedza");
  await page.waitForLoadState("networkidle");
  await expect(page.locator('main a[href^="/wiedza/"]')).toHaveCount(10);
  await page.getByRole("button", { name: "Trudne sytuacje" }).click();
  await expect(page.locator('main a[href^="/wiedza/"]')).toHaveCount(2);
});

test("10 landingów i 10 pełnych podglądów /demo (noindex), /demo zgodne z PDF", async ({ page, request }) => {
  for (const s of SLUGS) {
    await page.goto(`/wiedza/${s}`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Odbierz bezpłatny materiał" })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/wiedza/${s}$`));

    const demo = await request.get(`/wiedza/${s}/demo`);
    expect(demo.ok(), s).toBeTruthy();
    expect(demo.headers()["x-robots-tag"], s).toContain("noindex");
    const html = await demo.text();
    expect(html, s).toMatch(/Podgląd materiału DUO/);
    expect(html, s).not.toMatch(/lorem ipsum|\[DO UZUPEŁNIENIA\]/i);

    const pdf = await request.get(`/wiedza/${s}/pdf`, { timeout: 120_000 });
    expect(pdf.ok(), s).toBeTruthy();
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    const body = await pdf.body();
    expect(body.subarray(0, 4).toString(), s).toBe("%PDF");
    expect(body.length, s).toBeGreaterThan(30_000);
  }
  // zgodność: wersja do druku (źródło PDF) ma te same sekcje co /demo
  for (const s of SLUGS.filter((x) => x !== "przykladowa-mapa-relacji")) {
    const a = await headings(page, `/wiedza/${s}/demo`, "main h2, main h3");
    const b = await headings(page, `/wiedza/${s}/druk`, "main h2, main h3");
    expect(b, s).toEqual(a);
  }
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm).toContain("/wiedza/petla-konfliktu");
  expect(sm).not.toContain("/demo");
});

test("formularz: materiał bez zgody marketingowej, uczciwy komunikat bez SMTP, zapis w panelu", async ({ page, browser }) => {
  await page.goto("/wiedza/petla-konfliktu?utm_source=instagram&utm_campaign=wiedza_e2e");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail", { exact: true }).fill("zle");
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByText("Podaj poprawny adres e-mail.")).toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill("czytelnik@example.test");
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByRole("heading", { name: "Twój materiał jest gotowy" })).toBeVisible();
  // bez skonfigurowanej wysyłki nie twierdzimy, że e-mail wyszedł
  await expect(page.getByText(/Wysłaliśmy link/)).toHaveCount(0);
  await page.getByRole("link", { name: "Otwórz materiał" }).click();
  await expect(page.getByText("Twój materiał DUO")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Twój arkusz pętli" })).toBeVisible();

  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail", { exact: true }).fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/wiedza");
  const row = admin.locator("tr", { hasText: "czytelnik@example.test" });
  await expect(row).toContainText("lm07");
  await expect(row).toContainText("marketing: nie");
  await expect(row).toContainText("wysyłka nieskonfigurowana");
  await expect(row).toContainText("instagram");
  await admin.close();
});
