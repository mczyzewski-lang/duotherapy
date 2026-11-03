// Mailing: zapis na materiał → kontakt z tagiem; panel ścieżek i edycja warunków tagów; link /kod maila/kod osoby → klik w podróży.
import { expect, test, type Page } from "@playwright/test";

async function adminLogin(page: Page) {
  await page.goto("/app/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail", { exact: true }).fill("admin@demo.duo");
  await page.getByLabel("Hasło").fill("demo-duo-2026!");
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
}

test("mailing: tag z materiału, ścieżki w panelu, warunki tagów, link śledzący i podróż do zakupu", async ({ page, browser, request }) => {
  // zapis na materiał ze zgodą marketingową
  await page.goto("/wiedza/po-zdradzie");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Imię", { exact: true }).fill("Podróżniczka");
  await page.getByLabel("E-mail", { exact: true }).fill("podroz@example.test");
  await page.getByTestId("lm-relationship").getByText("Parą", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Nie mamy dzieci", { exact: true }).click();
  await page.getByTestId("lm-consent").check();
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByRole("heading", { name: "Twój materiał jest gotowy" })).toBeVisible();

  const admin = await browser.newPage();
  await adminLogin(admin);
  await admin.goto("/app/mailing");
  await expect(admin.getByTestId("seq-lead")).toContainText("Przed zakupem → Mapa Relacji");
  await expect(admin.getByTestId("seq-lead")).toContainText("wyłączona");
  await expect(admin.getByTestId("seq-customer")).toContainText("/k1/…");
  await expect(admin.getByText("Resend nieskonfigurowany")).toBeVisible();

  // okładki zdjęciowe: panel generowania (bez klucza – wyłączone), brak zdjęcia → 404
  await admin.goto("/app/wiedza");
  await expect(admin.getByTestId("cover-item")).toHaveCount(10);
  await expect(admin.getByTestId("cover-admin")).toContainText("Brak OPENAI_API_KEY");
  expect((await request.get("/wiedza-okladki/petla-konfliktu")).status()).toBe(404);
  await admin.goto("/app/mailing");

  // warunek tagów w e-mailu n6
  await admin.getByTestId("seq-lead").locator("tr", { hasText: "/n6/…" }).getByRole("link", { name: "Edytuj" }).click();
  await expect(admin.getByTestId("mail-preview")).toBeVisible();
  await admin.getByLabel(/Nie wysyłaj, jeśli osoba MA tag/).fill("#quiz #test-wykluczenie");
  await admin.getByRole("button", { name: "Zapisz" }).click();
  await expect(admin.getByText("Zapisano.")).toBeVisible();
  await admin.goto("/app/mailing");
  await expect(admin.getByTestId("seq-lead").locator("tr", { hasText: "/n6/…" })).toContainText("bez #test-wykluczenie");

  // kontakt z tagiem materiału
  await admin.goto("/app/mailing/kontakty?tag=lm-po-zdradzie");
  const row = admin.getByTestId("contact-row").filter({ hasText: "podroz@example.test" });
  await expect(row).toContainText("#lm-po-zdradzie");
  await expect(row).toContainText("#para");
  await expect(row).toContainText("#bez-dzieci");
  await expect(row).toContainText("przed zakupem: w toku");
  await row.getByRole("link", { name: "podroz@example.test" }).click();
  const code = (await admin.locator("span.font-mono").first().textContent())!.trim();
  expect(code).toMatch(/^[a-z0-9]{8}$/);
  await expect(admin.getByTestId("journey")).toContainText("Pobrał(a)");

  // link z maila: zapis kliknięcia + przekierowanie z UTM (kampania = kod maila)
  await page.goto(`/n1/${code}`);
  await expect(page).toHaveURL(/\/mapa-relacji\?utm_source=duo_mail&utm_medium=email&utm_campaign=n1&utm_content=lead/);
  expect((await request.get("/zz1/abcdefgh", { maxRedirects: 0 })).status()).toBe(404);
  expect((await request.get("/wiedza-x/abc", { maxRedirects: 0 })).status()).toBe(404);

  // ta sama przeglądarka wypełnia quiz (bez e-maila) – zgłoszenie łączy się z kontaktem
  await page.goto("/start");
  await page.waitForLoadState("networkidle");
  for (const pick of ["Oddaliliśmy się", "Nie potrafimy spokojnie", "Tak, oboje chcemy", "Dlaczego ciągle", "Od ponad roku", "Samodzielnie"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).first().click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  await page.getByLabel("Imię").fill("Podróżnik");
  await page.getByLabel("Numer telefonu").fill("600 555 666");
  await page.getByRole("checkbox", { name: /Proszę o kontakt telefoniczny/ }).check();
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  await page.waitForURL(/twoja-mapa/);

  await admin.reload();
  await expect(admin.getByTestId("journey")).toContainText(`Kliknięcie w /n1/${code}`);
  await expect(admin.getByTestId("journey")).toContainText("Quiz Mapy Relacji");
  await admin.goto("/app/mailing");
  await expect(admin.getByTestId("seq-lead").locator("tr", { hasText: "/n1/…" })).toContainText("1");
  await admin.close();
});
