// Telefon: „Podsumuj” na starcie nie blokuje uzupełniania (pasek chowa się na czas pisania), pola 16px (bez powiększania
// strony przez iOS), uczciwy komunikat zapisu – „brak internetu” tylko, gdy naprawdę nie ma połączenia.
import { devices, expect, test } from "@playwright/test";

// wymiary i dotyk iPhone’a, ale w Chromium (WebKit nie jest zainstalowany w środowisku testów)
const { defaultBrowserType: _, ...iphone } = devices["iPhone 13"];
test.use(iphone);

test("telefon: podsumuj na starcie → da się pisać; pola 16px; komunikat offline tylko offline", async ({ page, context }) => {
  await page.goto("/wiedza/3-rozmowy-przed-rozwodem");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1600);
  await page.getByLabel("Imię", { exact: true }).fill("Mobilna");
  await page.getByLabel("E-mail", { exact: true }).fill(`mobile.${Date.now()}@example.test`);
  await page.getByTestId("lm-relationship").getByText("Małżeństwem", { exact: true }).tap();
  await page.getByTestId("lm-children").getByText("Mamy dzieci", { exact: true }).tap();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).tap();
  await page.waitForURL(/\/material\?witaj=1/);
  await expect(page.getByTestId("unlock-intro")).toHaveCount(0, { timeout: 8000 });

  const field = page.locator("textarea[data-field]").first();
  expect(await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);

  // „Podsumuj” bez odpowiedzi: pole z brakiem dostaje fokus, a pasek chowa się, żeby go nie zasłaniać
  const bar = page.getByTestId("summarize-bar");
  await bar.getByRole("button", { name: /Podsumuj/ }).tap();
  await expect(bar).toHaveAttribute("data-editing", "true");
  const focused = page.locator("textarea[data-field]:focus");
  await expect(focused).toBeInViewport();
  await focused.fill("Zaczęło się po przeprowadzce.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });
  // koniec pisania – pasek wraca
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(bar).not.toHaveAttribute("data-editing", "true");

  // brak połączenia → uczciwy komunikat, po powrocie internetu zapis się dokańcza
  await context.setOffline(true);
  await page.locator("textarea[data-field]").nth(1).fill("Offline odpowiedź");
  await expect(page.locator('[data-save-status="error"]')).toContainText("Brak internetu", { timeout: 10_000 });
  await context.setOffline(false);
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.locator("textarea[data-field]").nth(1)).toHaveValue("Offline odpowiedź");
});
