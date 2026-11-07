// Podsumowanie z materiału: od razu jako strona (taby „Materiał” | „Podsumowanie” – gdy podsumowanie jest dostępne), potem oferta Mapy Relacji i stały pasek „Załącz”; lejek krok po kroku.
import { expect, test } from "@playwright/test";

test("podsumowanie: taby, „gotowe” → treść → oferta; stały pasek „Załącz do Mapy Relacji”; lejek krok po kroku", async ({ page, browser }) => {
  await page.goto("/wiedza/petla-konfliktu");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Imię", { exact: true }).fill("Pods Test");
  await page.getByLabel("E-mail", { exact: true }).fill(`pods.${Date.now()}@example.test`);
  await page.getByTestId("lm-relationship").getByText("Parą", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Nie mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await page.waitForURL(/\/material\?witaj=1/);
  await expect(page.getByTestId("unlock-intro")).toBeVisible();
  await expect(page.getByTestId("unlock-intro")).toHaveCount(0, { timeout: 8000 });
  await page.locator("textarea[data-field]").first().fill("Wieczorem, przy kolacji.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });

  // taby pojawiają się dopiero, gdy podsumowanie jest dostępne (min. 1 odpowiedź w każdej wymaganej części)
  await expect(page.getByTestId("material-tabs")).toHaveCount(0);
  const missing = page.getByTestId("summarize-missing");
  const done = page.getByRole("heading", { name: /Twoje podsumowanie/ });
  for (let i = 0; i < 8; i++) {
    await page.getByTestId("summarize-bar").getByRole("button", { name: /Podsumuj/ }).click();
    await expect(missing.or(done)).toBeVisible();
    if (await done.isVisible()) break;
    await missing.getByRole("button").first().click();
    const f = page.locator(":focus");
    if ((await f.getAttribute("type")) === "checkbox") await f.check();
    else await f.fill(`Odpowiedź ${i + 1}`);
  }
  await page.goto("/wiedza/petla-konfliktu/material");
  await expect(page.getByTestId("tab-material")).toHaveAttribute("aria-current", "page");
  await page.getByTestId("tab-summary").click();
  await page.waitForURL(/\/wiedza\/petla-konfliktu\/podsumowanie$/);
  await expect(page.getByTestId("tab-summary")).toHaveAttribute("aria-current", "page");
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

  await expect(page.getByTestId("summary-email-open")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Wydrukuj/ })).toHaveCount(0);
  // stały pasek na dole – widoczny także na górze strony
  await page.evaluate(() => window.scrollTo(0, 0));
  const bar = page.getByTestId("attach-bar");
  await expect(bar).toBeInViewport();
  await expect(bar.getByTestId("attach-offer")).toHaveAttribute("href", "/start?dolacz=petla-konfliktu");
  await expect(bar.getByTestId("attach-offer")).toContainText("Załącz do Mapy Relacji");

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
