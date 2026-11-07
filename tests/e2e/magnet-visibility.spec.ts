// Widoczność materiałów: przełącznik w panelu ukrywa materiał na całej stronie i przywraca go.
import { expect, test } from "@playwright/test";

test("widoczność materiału: ukryj → znika z /wiedza, menu, mapy strony, landing 404; pokaż → wraca", async ({ page, browser, request }) => {
  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail").fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/wiedza");
  const item = admin.getByTestId("magnet-visibility-item").filter({ hasText: "Pętla konfliktu" });
  await item.getByRole("radio", { name: /Ukryty/ }).click();
  await expect(item.getByRole("radio", { name: /Ukryty/ })).toHaveAttribute("aria-checked", "true");

  try {
    await page.goto("/wiedza");
    await expect(page.locator('main a[href="/wiedza/petla-konfliktu"]')).toHaveCount(0);
    await expect(page.locator('a[href="/wiedza/trudna-rozmowa"]').first()).toBeAttached();
    await expect(page.locator('header a[href="/wiedza/petla-konfliktu"]')).toHaveCount(0);
    expect((await request.get("/wiedza/petla-konfliktu")).status()).toBe(404);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/wiedza/petla-konfliktu<");
    // artykuł polecający ukryty materiał – bez kontenera z nim
    await page.goto("/wiedza/artykuly/kiedy-isc-na-terapie-par");
    await expect(page.locator('[data-testid="article-cta"] a[href^="/wiedza/petla-konfliktu"]')).toHaveCount(0);
    await expect(page.locator('main a[href^="/wiedza/petla-konfliktu"]')).toHaveCount(0);
    await expect(page.getByText("pętlą konfliktu").first()).toBeVisible(); // link zamieniony na zwykły tekst
  } finally {
    await admin.goto("/app/wiedza");
    const again = admin.getByTestId("magnet-visibility-item").filter({ hasText: "Pętla konfliktu" });
    await again.getByRole("radio", { name: /Widoczny/ }).click();
    await expect(again.getByRole("radio", { name: /Widoczny/ })).toHaveAttribute("aria-checked", "true");
  }
  expect((await request.get("/wiedza/petla-konfliktu")).status()).toBe(200);
  await admin.close();
});
