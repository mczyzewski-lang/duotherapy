import { expect, test, type Browser, type Page } from "@playwright/test";

async function login(page: Page, email: string, pw: string) {
  await page.goto("/app/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill(pw);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
}

async function tryLogin(browser: Browser, email: string, pw: string) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await login(p, email, pw);
  const ok = await p.getByRole("heading", { name: /Dzień dobry/ }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
  await ctx.close();
  return ok;
}

test("zespół: admin dodaje psychologa, edytuje profil, resetuje hasło, wyłącza, włącza i usuwa konto", async ({ page, browser }) => {
  const email = `nowa.psycholog.${Date.now()}@example.test`;
  await login(page, "admin@demo.duo", "demo-duo-2026!");
  await expect(page.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await page.getByRole("link", { name: "Zespół" }).first().click();
  await expect(page.getByTestId("team-list")).toBeVisible();
  const before = await page.getByTestId("team-row").count();

  // dodanie z wygenerowanym hasłem (pokazane raz)
  const add = page.getByTestId("team-add");
  await add.getByLabel("Imię i nazwisko").fill("Nowa Psycholog");
  await add.getByLabel("E-mail (login)").fill(email);
  await add.getByLabel("Tytuł zawodowy").fill("psycholog");
  await add.getByRole("button", { name: "Dodaj osobę" }).click();
  const msg = add.getByText(/Hasło tymczasowe \(widoczne tylko teraz\)/);
  await expect(msg).toBeVisible();
  const temp = (await msg.textContent())!.match(/duo-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/)![0];
  await page.reload();
  await expect(page.getByTestId("team-row")).toHaveCount(before + 1);
  expect(await tryLogin(browser, email, temp)).toBe(true);

  // karta osoby: profil i nowe hasło
  await page.getByRole("link", { name: "Nowa Psycholog" }).click();
  const prof = page.getByTestId("member-profile");
  await prof.getByLabel("Tytuł zawodowy").fill("psycholożka relacji");
  await prof.getByRole("button", { name: "Zapisz profil" }).click();
  await expect(prof.getByText("Zapisano profil.")).toBeVisible();
  const sec = page.getByTestId("member-security");
  await sec.getByLabel("Nowe hasło").fill("Nowe-haslo-2026!");
  page.once("dialog", (d) => d.accept());
  await sec.getByRole("button", { name: "Ustaw nowe hasło" }).click();
  await expect(sec.getByText(/Ustawiono nowe hasło/)).toBeVisible();
  expect(await tryLogin(browser, email, temp)).toBe(false);

  // wyłączenie blokuje logowanie, włączenie przywraca
  const acc = page.getByTestId("member-access");
  page.once("dialog", (d) => d.accept());
  await acc.getByRole("button", { name: "Wyłącz konto" }).click();
  await expect(acc.getByText(/Konto wyłączone/)).toBeVisible();
  expect(await tryLogin(browser, email, "Nowe-haslo-2026!")).toBe(false);
  await page.reload();
  await page.getByTestId("member-access").getByRole("button", { name: "Włącz konto" }).click();
  await expect(page.getByTestId("member-access").getByText("Konto ponownie aktywne.")).toBeVisible();
  expect(await tryLogin(browser, email, "Nowe-haslo-2026!")).toBe(true);

  // usunięcie konta bez historii
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("member-access").getByRole("button", { name: "Usuń konto" }).click();
  await expect(page.getByText("Konto zostało usunięte.")).toBeVisible();
  await expect(page.getByTestId("team-row")).toHaveCount(before);



});
