// Podsumowanie z materiału: najpierw wartość (gotowe podsumowanie, wydruk, e-mail), potem oferta Mapy Relacji; lejek krok po kroku.
import { expect, test } from "@playwright/test";

test("podsumowanie: „gotowe” → treść → oferta „Rozszerz o Mapę Relacji”; e-mail; lejek krok po kroku", async ({ page, browser }) => {
  await page.goto("/wiedza/petla-konfliktu");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Imię", { exact: true }).fill("Pods Test");
  await page.getByLabel("E-mail", { exact: true }).fill(`pods.${Date.now()}@example.test`);
  await page.getByTestId("lm-relationship").getByText("Parą", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Nie mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await page.getByRole("link", { name: "Otwórz materiał" }).click();
  await page.locator("textarea[data-field]").first().fill("Wieczorem, przy kolacji.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });

  await page.goto("/wiedza/petla-konfliktu/podsumowanie");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Twoje podsumowanie jest gotowe");
  // treść podsumowania jest przed ofertą
  const order = await page.evaluate(() => {
    const a = document.querySelector('[data-testid="summary"]');
    const b = document.querySelector('[data-testid="summary-upsell"]');
    return !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  const up = page.getByTestId("summary-upsell");
  await expect(up.getByRole("heading", { name: "Rozszerz podsumowanie o Mapę Relacji" })).toBeVisible();
  await expect(up).toContainText("Twoje podsumowanie pokazuje Twoją perspektywę.");
  await expect(up).toContainText("To podsumowanie nie jest pełną Mapą Relacji");
  await expect(up.getByTestId("summary-offer")).toHaveAttribute("href", "/start?dolacz=petla-konfliktu");

  // e-mail: wybór „sam link / z treścią”; bez skonfigurowanej poczty – uczciwy komunikat
  await page.getByTestId("summary-email-open").click();
  await expect(page.getByTestId("summary-email")).toContainText("Sam link do podsumowania");
  await page.getByTestId("summary-email-send").click();
  await expect(page.getByTestId("summary-email").getByRole("alert")).toContainText("Wysyłka e-maili nie jest jeszcze skonfigurowana");

  await up.getByTestId("summary-offer").click();
  await expect(page).toHaveURL(/\/start\?dolacz=petla-konfliktu/);

  // panel: lejek materiału krok po kroku
  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail").fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/funnel");
  const card = admin.getByTestId("lm-steps");
  await expect(card).toContainText("Wygenerowane podsumowanie");
  for (const e of ["lead_magnet_landing_view", "lead_magnet_form_started", "lead_magnet_submitted", "lead_magnet_summary_view", "lead_magnet_offer_click"]) {
    expect(Number(await card.locator(`tr[data-step="${e}"] td`).nth(1).textContent()), e).toBeGreaterThan(0);
  }
  await admin.close();
});
