import { expect, test } from "@playwright/test";

test("prezentacja dla psychologów: 28 slajdów, zakładki, reklamy, noindex, wydruk", async ({ page }) => {
  await page.goto("/prezentacja-dla-psychologow");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByTestId("slide")).toHaveCount(28);
  await expect(page.getByRole("separator", { name: "7 sytuacji" })).toBeVisible();
  await expect(page.getByTestId("print-deck")).toBeVisible();

  await page.getByRole("tab", { name: "Reklamy" }).click();
  await expect(page).toHaveURL(/#reklamy$/);
  await expect(page.getByRole("heading", { name: /Reklamy Meta/ })).toBeVisible();
  await expect(page.getByTestId("ad")).toHaveCount(6);
  await page.getByRole("tab", { name: "Hooki" }).click();
  await expect(page.getByTestId("hook")).toHaveCount(8);
  await page.getByRole("tab", { name: "Kreacje" }).click();
  await expect(page.getByTestId("concept")).toHaveCount(5);
  await expect(page.getByTestId("strategy")).toContainText("Pierwszy referral");

  await page.reload();
  await expect(page.getByTestId("ad").first()).toBeVisible();
  await page.getByRole("tab", { name: "Prezentacja" }).click();
  await expect(page.getByTestId("slide").first()).toBeVisible();
});
