// Potwierdzony numer = „zalogowanie”: dostęp do wszystkich bezpłatnych materiałów, logowanie kodem SMS na innym urządzeniu
// i automatyzacja w panelu Mailing (e-mail + SMS po potwierdzeniu numeru).
import { expect, test } from "@playwright/test";

test("numer potwierdzony kodem SMS odblokowuje wszystkie materiały; logowanie numerem; automatyzacja w panelu", async ({ page, browser }) => {
  const phone = `601 ${String(Date.now()).slice(-6, -3)} ${String(Date.now()).slice(-3)}`;
  await page.goto("/wiedza/petla-konfliktu");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1600);
  await page.getByLabel("Imię", { exact: true }).fill("Odblokowana");
  await page.getByLabel("E-mail", { exact: true }).fill(`unlock.${Date.now()}@example.test`);
  await page.getByTestId("lm-relationship").getByText("Małżeństwem", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await page.waitForURL(/\/material\?witaj=1/);
  await expect(page.getByTestId("unlock-intro")).toBeVisible();
  await expect(page.getByTestId("unlock-intro")).toHaveCount(0, { timeout: 8000 });

  // przed potwierdzeniem numeru inne materiały wymagają formularza
  await page.locator("textarea[data-field]").first().fill("Wieczorem w kuchni.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("save-later").click();
  const dlg = page.getByTestId("save-later-dialog");
  await expect(dlg.getByTestId("unlock-info")).toContainText(/dostęp do wszystkich \d+ bezpłatnych materiałów/);
  await dlg.getByTestId("unlock-show").click();
  await expect(dlg.getByTestId("unlock-list")).toContainText("Cicha separacja");
  await dlg.getByTestId("sfl-phone").fill(phone);
  await dlg.getByRole("button", { name: "Wyślij kod SMS" }).click();
  const code = (await dlg.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0];
  await dlg.getByTestId("sms-code").fill(code);
  await dlg.getByTestId("sfl-confirm").click();
  await expect(dlg.getByTestId("unlock-done")).toContainText("Odblokowane");

  // inny materiał: bez formularza – od razu „Otwórz”, pola do uzupełnienia działają
  await page.goto("/wiedza/cicha-separacja");
  await expect(page.getByTestId("lm-access-box")).toContainText("Masz dostęp do wszystkich materiałów");
  await expect(page.getByTestId("lm-form-box")).toHaveCount(0);
  await page.getByTestId("lm-access-open").click();
  await expect(page).toHaveURL(/\/wiedza\/cicha-separacja\/material$/);
  await expect(page.locator("textarea[data-field]").first()).toBeVisible();
  await page.goto("/wiedza");
  await expect(page.getByTestId("hub-unlocked")).toBeVisible();

  // inne urządzenie: logowanie numerem i kodem SMS
  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await other.goto("/wiedza/zaloguj");
  await other.getByTestId("pl-phone").fill(phone);
  await other.getByRole("button", { name: "Wyślij kod SMS" }).click();
  const code2 = (await other.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0];
  await other.getByTestId("sms-code").fill(code2);
  await other.getByTestId("pl-confirm").click();
  await expect(other).toHaveURL(/\/wiedza\?dostep=1$/);
  await expect(other.getByTestId("hub-unlocked")).toBeVisible();
  await other.goto("/wiedza/petla-konfliktu/material");
  await expect(other.locator("textarea[data-field]").first()).toHaveValue("Wieczorem w kuchni.");
  // nieznany numer: nie zdradzamy, czy jest w bazie, i nie ma kodu
  const third = await (await browser.newContext()).newPage();
  await third.goto("/wiedza/zaloguj");
  await third.getByTestId("pl-phone").fill("609 000 001");
  await third.getByRole("button", { name: "Wyślij kod SMS" }).click();
  await expect(third.getByText(/Jeśli ten numer jest zapisany w DUO/)).toBeVisible();
  await expect(third.getByTestId("sms-demo")).toHaveCount(0);
  await ctx.close();

  // panel: automatyzacja „po wpisaniu kodu SMS” – zapis treści i licznik uruchomień
  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail").fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/mailing");
  const card = admin.getByTestId("automations");
  await expect(card).toContainText("Gdy osoba wpisze kod SMS");
  await expect(card).toContainText(/Uruchomień: [1-9]/);
  await card.getByLabel("Treść SMS-a (nadawca DUO)").fill("DUO: Odblokowane {liczba} materiałów: {link}");
  await card.getByRole("button", { name: "Zapisz automatyzację" }).click();
  await expect(card.getByText("Zapisano automatyzację.")).toBeVisible();
  await card.getByLabel("Treść SMS-a (nadawca DUO)").fill("bez linku");
  await card.getByRole("button", { name: "Zapisz automatyzację" }).click();
  await expect(card.getByText(/musi zawierać \{link\}/)).toBeVisible();
  await admin.close();
});
