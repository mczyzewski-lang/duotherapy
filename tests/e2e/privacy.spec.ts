// Prywatność odpowiedzi: sam adres e-mail nie daje dostępu do cudzych zapisów. Znany adres na obcej przeglądarce →
// link na skrzynkę (bez numeru) albo kod SMS (z potwierdzonym numerem). Pierwsze urządzenie nie traci dostępu.
import { expect, test, type Page } from "@playwright/test";

async function submit(page: Page, slug: string, email: string) {
  await page.goto(`/wiedza/${slug}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1600);
  await page.getByLabel("Imię", { exact: true }).fill("Prywatna");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByTestId("lm-relationship").getByText("Małżeństwem", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
}

test("cudzy e-mail w formularzu nie otwiera cudzych odpowiedzi (link na skrzynkę / kod SMS)", async ({ page, browser }) => {
  const email = `prywatna.${Date.now()}@example.test`;
  await submit(page, "petla-konfliktu", email);
  await page.waitForURL(/\/material\?witaj=1/);
  await expect(page.getByTestId("unlock-intro")).toHaveCount(0, { timeout: 8000 });
  await page.locator("textarea[data-field]").first().fill("Tajna odpowiedź.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });

  // obca przeglądarka wpisuje ten sam adres: ten sam materiał i inny materiał – bez dostępu
  const b = await (await browser.newContext()).newPage();
  for (const slug of ["petla-konfliktu", "cicha-separacja"]) {
    await submit(b, slug, email);
    await expect(b.getByTestId("lm-proof")).toContainText("Żeby nikt poza Tobą nie zobaczył Twoich odpowiedzi");
    await expect(b).toHaveURL(new RegExp(`/wiedza/${slug}$`));
  }
  await b.goto("/wiedza/petla-konfliktu/material");
  await expect(b.locator("textarea[data-field]")).toHaveCount(0);
  await expect(b.getByText("Tajna odpowiedź.")).toHaveCount(0);
  await b.goto("/wiedza/petla-konfliktu/podsumowanie");
  await expect(b.getByText("Tajna odpowiedź.")).toHaveCount(0);

  // pierwsze urządzenie dalej ma dostęp (obca próba nie unieważniła jego linku)
  await page.reload();
  await expect(page.locator("textarea[data-field]").first()).toHaveValue("Tajna odpowiedź.");
  // ta sama przeglądarka może odebrać kolejny materiał bez dodatkowych kroków
  await submit(page, "cicha-separacja", email);
  await page.waitForURL(/\/wiedza\/cicha-separacja\/material\?witaj=1/);

  // z potwierdzonym numerem: obca przeglądarka trafia na kod SMS, bez kodu nic nie widzi
  await page.goto("/wiedza/petla-konfliktu/material");
  await page.getByTestId("save-later").click();
  const dlg = page.getByTestId("save-later-dialog");
  await dlg.getByTestId("sfl-phone").fill(`602 ${String(Date.now()).slice(-6, -3)} ${String(Date.now()).slice(-3)}`);
  await dlg.getByRole("button", { name: "Wyślij kod SMS" }).click();
  await dlg.getByTestId("sms-code").fill((await dlg.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0]);
  await dlg.getByTestId("sfl-confirm").click();
  await expect(dlg.getByRole("heading", { name: "Zapisane na później" })).toBeVisible();

  const c = await (await browser.newContext()).newPage();
  await submit(c, "trudna-rozmowa", email);
  await c.waitForURL(/\/wiedza\/trudna-rozmowa\/potwierdz$/);
  await expect(c.getByTestId("masked-phone")).toBeVisible();
  await c.goto("/wiedza/petla-konfliktu/material");
  await expect(c.locator("textarea[data-field]")).toHaveCount(0);
  // właściciel numeru przechodzi dalej kodem
  await c.goto("/wiedza/trudna-rozmowa/potwierdz");
  await c.getByTestId("access-send").click();
  await c.getByTestId("sms-code").fill((await c.getByTestId("sms-demo").textContent())!.match(/\d{4}/)![0]);
  await c.getByTestId("access-confirm").click();
  await c.waitForURL(/\/wiedza\/trudna-rozmowa\/material$/);
  await c.goto("/wiedza/petla-konfliktu/material");
  await expect(c.locator("textarea[data-field]").first()).toHaveValue("Tajna odpowiedź.");
});
