// Struktura strony: strona główna DUO → Mapa Relacji (start) → trzy ścieżki z podstronami; zapytanie ze ścieżki trafia do panelu z tematem.
import { expect, test } from "@playwright/test";

test("strona główna i menu „Jak pomagamy”: Mapa Relacji nad trzema ścieżkami", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toHaveCount(1);
  const jp = page.locator("#jak-pomagamy");
  for (const href of ["/mapa-relacji", "/odbudowa", "/czas-na-decyzje", "/swiadome-rozstanie"]) await expect(jp.locator(`a[href="${href}"]`)).toBeVisible();
  await page.getByRole("button", { name: "Jak pomagamy" }).click();
  const panel = page.locator("header div[id]:not([hidden])", { hasText: "Możliwe drogi po Mapie Relacji" });
  const hrefs = await panel.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(["/mapa-relacji", "/odbudowa", "/czas-na-decyzje", "/swiadome-rozstanie"]);
  await page.keyboard.press("Escape");
  // logo Mapy Relacji tylko na stronach Mapy Relacji
  await expect(page.locator('header a[aria-label="Mapa Relacji"]')).toHaveCount(0);
  await page.goto("/mapa-relacji");
  await expect(page.locator('header a[aria-label="Mapa Relacji"]')).toHaveCount(1);
  // dwa warianty z cenami jednorazowymi
  await expect(page.getByTestId("variant-solo")).toContainText("670 zł");
  await expect(page.getByTestId("variant-couple")).toContainText("1270 zł");
  await expect(page.getByTestId("variant-couple")).toContainText("jednorazowo");
  // dwa przyciski wyboru wariantu → quiz z zaznaczoną formą; drugi rekomendowany
  await expect(page.getByTestId("variant-solo").getByRole("link", { name: /Wybieram 1 spotkanie\s*Ścieżka dla Ciebie/ })).toHaveAttribute("href", "/start?forma=solo");
  await expect(page.getByTestId("variant-couple").getByRole("link", { name: /Wybieram 3 spotkania\s*Ścieżka dla Was/ })).toHaveAttribute("href", "/start?forma=together");
  await expect(page.getByTestId("variant-recommended")).toHaveText("Rekomendowana");
});

test("podstrony ścieżek: jeden H1, plan, zapytanie z tematem trafia do panelu", async ({ page, browser }) => {
  for (const [slug, text] of [["odbudowa", "Tydzień 6"], ["czas-na-decyzje", "Krok 4"], ["swiadome-rozstanie", "psychologiem dziecięcym"]]) {
    await page.goto(`/${slug}`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(text).first()).toBeVisible();
  }
  await page.goto("/odbudowa");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Porozmawiajmy o programie" }).first().click();
  const dlg = page.getByRole("dialog");
  await dlg.locator('input[autocomplete="given-name"]').fill("Ania Ścieżka");
  await dlg.locator('input[type="email"]').fill("ania.sciezka@example.test");
  await dlg.locator("textarea").fill("Chcemy zapytać o program.");
  await dlg.getByRole("checkbox").check();
  await dlg.getByRole("button", { name: /Wyślij/ }).click();
  await expect(dlg.getByText("wiadomość dotarła")).toBeVisible();

  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail").fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/inquiries");
  await expect(admin.getByText("[Odbudowa relacji – 6 tygodni] Chcemy zapytać o program.")).toBeVisible();
  await admin.close();
});
