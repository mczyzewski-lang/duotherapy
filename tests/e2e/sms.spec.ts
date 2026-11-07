// Materiał: „Zapisz zmiany na później” (numer + kod SMS, tryb demo) → powrót z linku w e-mailu wymaga potwierdzenia numeru kodem SMS.
import { expect, test } from "@playwright/test";

test("zapis na później z kodem SMS i powrót z linku w e-mailu z potwierdzeniem numeru", async ({ page, browser }) => {
  // odbiór materiału
  await page.goto("/wiedza/petla-konfliktu");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Imię", { exact: true }).fill("Sms Test");
  await page.getByLabel("E-mail", { exact: true }).fill(`sms.${Date.now()}@example.test`);
  await page.getByTestId("lm-relationship").getByText("Parą", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Nie mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await page.getByRole("link", { name: "Otwórz materiał" }).click();
  await expect(page.getByText("Twój materiał DUO")).toBeVisible();

  // przycisk pojawia się dopiero po wpisaniu słowa
  await expect(page.getByTestId("save-later")).toHaveCount(0);
  await page.locator("textarea[data-field]").first().fill("Kłócimy się wieczorem.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("save-later").click();
  const dlg = page.getByTestId("save-later-dialog");
  await expect(dlg).toContainText("Z uwagi na wrażliwość tych danych");
  await dlg.getByTestId("sfl-phone").fill("12");
  await dlg.getByRole("button", { name: "Wyślij kod SMS" }).click();
  await expect(dlg.getByText(/polski numer komórkowy/)).toBeVisible();
  await dlg.getByTestId("sfl-phone").fill("600 100 123");
  await dlg.getByRole("button", { name: "Wyślij kod SMS" }).click();
  const demo = (await dlg.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0];
  await dlg.getByTestId("sms-code").fill(demo === "0000" ? "1111" : "0000");
  await dlg.getByTestId("sfl-confirm").click();
  await expect(dlg.getByText(/Nieprawidłowy kod/)).toBeVisible();
  await dlg.getByTestId("sms-code").fill(demo);
  await dlg.getByTestId("sfl-confirm").click();
  await expect(dlg.getByRole("heading", { name: "Zapisane na później" })).toBeVisible();
  await dlg.getByRole("button", { name: "Wracam do uzupełniania" }).click();
  await expect(page.getByTestId("saved-for-later")).toContainText("••• ••• 123");

  // ten sam token co w linku z e-maila – nowa przeglądarka (bez dostępu) musi potwierdzić numer kodem SMS
  const token = (await page.context().cookies()).find((c) => c.name === "duo_cl")!.value;
  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await other.goto(`/wiedza/petla-konfliktu/otworz?t=${token}`);
  await expect(other).toHaveURL(/\/wiedza\/petla-konfliktu\/potwierdz$/);
  await expect(other.getByTestId("masked-phone")).toHaveText("••• ••• 123");
  // bez kodu nie ma dostępu do odpowiedzi
  await other.goto("/wiedza/petla-konfliktu/material");
  await expect(other.locator("textarea[data-field]")).toHaveCount(0);
  await other.goto(`/wiedza/petla-konfliktu/otworz?t=${token}`);
  await other.getByTestId("access-send").click();
  const code = (await other.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0];
  await other.getByTestId("sms-code").fill(code);
  await other.getByTestId("access-confirm").click();
  await expect(other).toHaveURL(/\/wiedza\/petla-konfliktu\/material$/);
  await expect(other.locator("textarea[data-field]").first()).toHaveValue("Kłócimy się wieczorem.");
  await ctx.close();

  // to samo urządzenie: link z e-maila otwiera od razu
  await page.goto(`/wiedza/petla-konfliktu/otworz?t=${token}`);
  await expect(page).toHaveURL(/\/wiedza\/petla-konfliktu\/material$/);

  // osoba z osobistego linku: formularz Mapy Relacji ma już jej dane (imię, e-mail, potwierdzony telefon)
  await page.goto("/start");
  await page.waitForLoadState("networkidle");
  for (const pick of ["Oddaliliśmy się", "Brakuje nam bliskości", "Raczej nie", "Czy możemy jeszcze", "Od kilku miesięcy", "Samodzielnie"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  await expect(page.getByLabel("Imię")).toHaveValue("Sms Test");
  await expect(page.getByLabel("Numer telefonu")).toHaveValue("600 100 123");
});

test("strona: „Napisz do mnie” pod autorką, sticky bar na głównej, ocena Google, materiał bez PDF", async ({ page }) => {
  await page.goto("/wiedza/artykuly/terapia-par-online");
  await page.getByTestId("author-contact").getByRole("button", { name: "Napisz do mnie" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Napisz do Klaudii" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/");
  await expect(page.getByTestId("google-rating").first()).toHaveAttribute("aria-label", "Ocena 4,8 na 5 w Google na podstawie 141 opinii");
  const bar = page.getByTestId("sticky-start");
  await expect(bar).toHaveAttribute("inert", "");
  await page.mouse.wheel(0, 1600);
  await expect(bar).not.toHaveAttribute("inert", "");
  await expect(bar.getByRole("link", { name: /Zacznij tutaj od Mapy Relacji/ })).toHaveAttribute("href", "/mapa-relacji");

  await page.goto("/wiedza/petla-konfliktu/demo");
  await expect(page.getByRole("link", { name: /Pobierz PDF/ })).toHaveCount(0);
});
