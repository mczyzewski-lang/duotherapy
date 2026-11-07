// Mailing: podgląd e-maila w dymku po najechaniu, eksport CSV i import (z błędem – bez zmian; poprawny – aktualizacja).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test } from "@playwright/test";

test("mailing: dymek z podglądem, pobranie CSV, import z walidacją", async ({ page }, info) => {
  await page.goto("/app/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail").fill("admin@demo.duo");
  await page.getByLabel("Hasło").fill("demo-duo-2026!");
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await page.goto("/app/mailing");
  await page.waitForLoadState("networkidle");

  // dymek z podglądem
  const trigger = page.getByTestId("seq-lead").getByTestId("mail-tip-trigger").first();
  await trigger.hover();
  const tip = page.getByTestId("mail-tip");
  await expect(tip).toBeVisible();
  await expect(tip.locator("iframe")).toBeAttached();
  expect(await tip.locator("iframe").getAttribute("srcdoc")).toContain("Cześć Anna,");
  await page.mouse.move(5, 5);
  await expect(tip).toHaveCount(0);

  // pobranie CSV
  await expect(page.getByTestId("mail-csv-download")).toHaveAttribute("href", "/app/mailing/csv");
  const res = await page.request.get("/app/mailing/csv");
  expect(res.headers()["content-disposition"]).toMatch(/attachment; filename="duo-emaile-\d{4}-\d{2}-\d{2}\.csv"/);
  const path = info.outputPath("emaile.csv");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, await res.body());
  const original = readFileSync(path, "utf8");
  expect(original.startsWith("﻿sciezka;kod;kolejnosc;dzien;aktywny;temat")).toBe(true);
  const code = original.split("\r\n")[1].split(";")[1];

  // błędny plik – nic się nie zmienia
  const bad = info.outputPath("zle.csv");
  writeFileSync(bad, "sciezka;kod;temat;tresc\nlead;n1;;Treść\n");
  const card = page.getByTestId("mail-csv");
  await card.locator('input[type="file"]').setInputFiles({ name: "zle.csv", mimeType: "text/csv", buffer: readFileSync(bad) });
  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Importuj CSV" }).click();
  await expect(card.getByText(/Nic nie zmieniono\. Wiersz 2: temat/)).toBeVisible();

  // poprawny plik: zmieniony temat pierwszego e-maila
  const lines = original.split("\r\n");
  const cells = lines[1].split(";");
  cells[5] = "Temat z importu CSV";
  const changed = info.outputPath("zmiana.csv");
  writeFileSync(changed, [lines[0], cells.join(";"), ...lines.slice(2)].join("\r\n"));
  await card.locator('input[type="file"]').setInputFiles({ name: "zmiana.csv", mimeType: "text/csv", buffer: readFileSync(changed) });
  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Importuj CSV" }).click();
  await expect(card.getByText(/Zaimportowano: zaktualizowane \d+, nowe 0/)).toBeVisible();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Temat z importu CSV")).toBeVisible();

  // przywrócenie oryginału
  await card.locator('input[type="file"]').setInputFiles({ name: "emaile.csv", mimeType: "text/csv", buffer: readFileSync(path) });
  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Importuj CSV" }).click();
  await expect(card.getByText(/Zaimportowano/)).toBeVisible();
  expect(code).toMatch(/^[a-z]{1,2}\d+$/);
});
