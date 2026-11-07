// „Wiedza”: menu, strona zbiorcza, 20 landingów, 20 podglądów /demo, zgodność /demo ↔ PDF, formularz i panel.
import { expect, test, type Page } from "@playwright/test";

const SLUGS = [
  "mapa-trzech-drog", "21-pytan-o-relacji", "kryzys-czy-koniec-milosci", "przykladowa-mapa-relacji", "7-dni-lepszych-rozmow",
  "trudna-rozmowa", "partner-nie-chce-ratowac-zwiazku", "petla-konfliktu", "po-zdradzie", "swiadome-rozstanie",
  "rozmowa-o-pieniadzach", "kto-co-robi", "czas-we-dwoje", "bliskosc-po-dziecku", "jezyk-potrzeb", "ciche-dni",
  "klotnie-przy-dzieciach", "granice-z-rodzina", "sygnaly-kryzysu", "przygotowanie-do-terapii",
];
/** Pierwsze 6 w każdej kategorii – tyle pokazuje menu (reszta: „+ N więcej”). */
const MENU_SLUGS = [
  "mapa-trzech-drog", "21-pytan-o-relacji", "kryzys-czy-koniec-milosci", "przykladowa-mapa-relacji", "sygnaly-kryzysu", "przygotowanie-do-terapii",
  "7-dni-lepszych-rozmow", "trudna-rozmowa", "partner-nie-chce-ratowac-zwiazku", "petla-konfliktu",
  "po-zdradzie", "swiadome-rozstanie", "klotnie-przy-dzieciach", "granice-z-rodzina",
];

/** Klika „Podsumuj…”; dopóki brakuje odpowiedzi – przechodzi do wskazanego pola i je uzupełnia. */
async function summarizeAnswers(page: Page, label: RegExp) {
  const missing = page.getByTestId("summarize-missing");
  const done = page.getByRole("heading", { name: /Twoje podsumowanie/ });
  for (let i = 0; i < 8; i++) {
    await page.getByTestId("summarize-bar").getByRole("button", { name: label }).click();
    await expect(missing.or(done)).toBeVisible();
    if (await done.isVisible()) return i;
    await missing.getByRole("button").first().click();
    const f = page.locator(":focus");
    if ((await f.getAttribute("type")) === "checkbox") await f.check();
    else await f.fill(`Moja odpowiedź ${i + 1}`);
  }
  throw new Error("Nie udało się podsumować");
}

async function adminLogin(page: Page) {
  await page.goto("/app/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail", { exact: true }).fill("admin@demo.duo");
  await page.getByLabel("Hasło").fill("demo-duo-2026!");
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
}

async function headings(page: Page, url: string, sel: string) {
  await page.goto(url);
  return page.locator(sel).allTextContents();
}

test("menu Wiedza: desktop (klik, Esc) i telefon; strona zbiorcza z filtrem", async ({ page, browser }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const btn = page.getByRole("button", { name: "Wiedza" });
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  for (const s of MENU_SLUGS) await expect(page.locator(`a[href="/wiedza/${s}"]`).first()).toBeVisible();
  await expect(page.locator('a[href="/wiedza?kategoria=rozmowa"]').first()).toContainText("+ 4 więcej");
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();

  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto("/");
  await m.waitForLoadState("networkidle");
  await m.getByRole("button", { name: "Otwórz menu" }).click();
  await m.getByRole("button", { name: "Wiedza" }).click();
  await expect(m.locator('#mobile-menu a[href="/wiedza/po-zdradzie"]')).toBeVisible();
  await m.locator('#mobile-menu a[href="/wiedza"]').click();
  await expect(m.getByRole("heading", { level: 1, name: /Wiedza, która pomaga/ })).toBeVisible();
  await m.close();

  await page.goto("/wiedza");
  await page.waitForLoadState("networkidle");
  const cards = page.locator('main a[href^="/wiedza/"]:not([href^="/wiedza/artykuly"])');
  await expect(cards).toHaveCount(9);
  await page.getByTestId("magnets-more").click();
  await expect(cards).toHaveCount(20);
  await page.getByRole("button", { name: "Trudne sytuacje" }).click();
  await expect(cards).toHaveCount(4);
  await page.goto("/wiedza?kategoria=rozmowa");
  await expect(cards).toHaveCount(10);
});

test("20 landingów i 20 pełnych podglądów /demo (noindex), /demo zgodne z PDF", async ({ page, request }) => {
  for (const s of SLUGS) {
    await page.goto(`/wiedza/${s}`);
    await expect(page.locator("h1")).toHaveCount(1);
    if (s === "przykladowa-mapa-relacji") {
      // przykład jest publiczny – bez formularza i bez podawania danych
      await expect(page.getByRole("heading", { name: /^Zobacz bezpłatnie:/ })).toBeVisible();
      await expect(page.getByTestId("lm-form-box")).toHaveCount(0);
      await expect(page.getByTestId("hero-cta")).toHaveAttribute("href", "/mapa-relacji-przyklad");
      await expect(page.getByTestId("lm-free-open")).toHaveAttribute("href", "/mapa-relacji-przyklad");
    } else {
      await expect(page.getByRole("heading", { name: /^Odbierz bezpłatnie:/ })).toBeVisible();
      await expect(page.getByTestId("lm-instant")).toHaveText("Dostęp natychmiast");
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/wiedza/${s}$`));

    const demo = await request.get(`/wiedza/${s}/demo`);
    expect(demo.ok(), s).toBeTruthy();
    expect(demo.headers()["x-robots-tag"], s).toContain("noindex");
    const html = await demo.text();
    expect(html, s).toMatch(/Podgląd materiału DUO/);
    expect(html, s).not.toMatch(/lorem ipsum|\[DO UZUPEŁNIENIA\]/i);

    const pdf = await request.get(`/wiedza/${s}/pdf`, { timeout: 120_000 });
    expect(pdf.ok(), s).toBeTruthy();
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    const body = await pdf.body();
    expect(body.subarray(0, 4).toString(), s).toBe("%PDF");
    expect(body.length, s).toBeGreaterThan(30_000);
  }
  // zgodność: wersja do druku (źródło PDF) ma te same sekcje co /demo
  for (const s of SLUGS.filter((x) => x !== "przykladowa-mapa-relacji")) {
    const a = await headings(page, `/wiedza/${s}/demo`, "main h2, main h3");
    const b = await headings(page, `/wiedza/${s}/druk`, "main h2, main h3");
    expect(b, s).toEqual(a);
  }
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm).toContain("/wiedza/petla-konfliktu");
  expect(sm).not.toContain("/demo");
});

test("formularz: jedna wymagana zgoda, uczciwy komunikat bez wysyłki, zapis w panelu", async ({ page, browser }) => {
  await page.goto("/wiedza/petla-konfliktu?utm_source=instagram&utm_campaign=wiedza_e2e");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1600);
  // imię jest wymagane
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByText("Podaj imię.")).toBeVisible();
  await page.getByLabel("Imię", { exact: true }).fill("Czytelnik");
  await page.getByLabel("E-mail", { exact: true }).fill("zle");
  // dalsze pola pojawiają się dopiero przy e-mailu z „@” i min. 2 znakami po kropce
  await expect(page.getByTestId("lm-consent")).not.toBeVisible();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByText("Podaj poprawny adres e-mail.")).toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill("czytelnik@example.t");
  await expect(page.getByTestId("lm-consent")).not.toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill("czytelnik@example.test");
  await expect(page.getByTestId("lm-consent")).toBeVisible();
  // stan związku i dzieci – wymagane, wybór jednym kliknięciem
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByText("Zaznacz, czy jesteście parą, czy małżeństwem.")).toBeVisible();
  await page.getByTestId("lm-relationship").getByText("Małżeństwem", { exact: true }).click();
  await page.getByTestId("lm-children").getByText("Mamy dzieci", { exact: true }).click();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  // bez zgody nie odbierzesz materiału – jedna zgoda, wymagana
  await expect(page.getByText("Zaznacz zgodę, żeby odebrać materiał.")).toBeVisible();
  await expect(page.locator("#odbierz input[type=checkbox]")).toHaveCount(1);
  await page.getByTestId("lm-consent").check();
  await page.getByRole("button", { name: "Wyślij mi materiał" }).click();
  await expect(page.getByRole("heading", { name: "Twój materiał jest gotowy" })).toBeVisible();
  // bez skonfigurowanej wysyłki nie twierdzimy, że e-mail wyszedł
  await expect(page.getByText(/Wysłaliśmy link/)).toHaveCount(0);
  await page.getByRole("link", { name: "Otwórz materiał" }).click();
  await expect(page.getByText("Twój materiał DUO")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Twój arkusz pętli" })).toBeVisible();
  // uzupełnianie na stronie z autozapisem (przypisane do e-maila) → odświeżenie → podsumowanie → dołączenie do quizu
  const field = page.locator("textarea[data-field]").first();
  await field.fill("Wieczorem po pracy, przy naczyniach.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(page.locator("textarea[data-field]").first()).toHaveValue("Wieczorem po pracy, przy naczyniach.");
  await summarizeAnswers(page, /Podsumuj swoją pętlę konfliktu/);
  await expect(page.getByTestId("summary")).toContainText("Wieczorem po pracy, przy naczyniach.");
  await page.getByRole("link", { name: /Rozszerz podsumowanie o Mapę Relacji/ }).click();
  await page.waitForURL(/\/start\?dolacz=petla-konfliktu/);
  await page.waitForLoadState("networkidle");
  for (const pick of ["Oddaliliśmy się", "Nie potrafimy spokojnie", "Tak, oboje chcemy", "Dlaczego ciągle", "Od ponad roku", "Samodzielnie"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).first().click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  await page.getByLabel("Imię").fill("Czytelnik Pętli");
  await page.getByLabel("Numer telefonu").fill("600 111 222");
  await page.getByRole("checkbox", { name: /Proszę o kontakt telefoniczny/ }).check();
  await page.getByTestId("attach-consent").locator("input").check();
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  await page.waitForURL(/twoja-mapa/);

  const admin = await browser.newPage();
  await admin.goto("/app/login");
  await admin.waitForLoadState("networkidle");
  await admin.getByLabel("E-mail", { exact: true }).fill("admin@demo.duo");
  await admin.getByLabel("Hasło").fill("demo-duo-2026!");
  await admin.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(admin.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await admin.goto("/app/wiedza");
  const row = admin.locator("tr", { hasText: "czytelnik@example.test" });
  await expect(row).toContainText("lm07");
  await expect(row).toContainText("marketing: tak");
  await expect(row).toContainText("małżeństwo · dzieci");
  await expect(row).toContainText("wysyłka nieskonfigurowana");
  await expect(row).toContainText("instagram");
  await admin.goto("/app/leads");
  await admin.getByRole("link", { name: "Czytelnik Pętli" }).click();
  await expect(admin.getByTestId("attached-summary")).toContainText("Wieczorem po pracy, przy naczyniach.");
  await admin.close();
});

test("demo: pola do uzupełnienia, wymagane minimum, mini-podsumowanie i dołączenie odpowiedzi do quizu", async ({ page, browser }) => {
  await page.goto("/wiedza/21-pytan-o-relacji/demo");
  await expect(page.getByText(/akceptacji merytorycznej/)).toHaveCount(0);
  await expect(page.locator("textarea[data-field]").first()).toBeVisible();
  // bez odpowiedzi nie da się podsumować – jest informacja, co uzupełnić
  await page.getByTestId("summarize-bar").getByRole("button", { name: "Podsumuj moje odpowiedzi" }).click();
  await expect(page.getByTestId("summarize-missing")).toContainText("uzupełnij jeszcze");
  await expect(page).toHaveURL(/\/demo$/);
  const first = page.locator("textarea[data-field]").first();
  await first.fill("Najbardziej brakuje mi wspólnych wieczorów.");
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible();
  // odpowiedzi zostają po odświeżeniu (tylko w tej przeglądarce)
  await page.reload();
  await expect(page.locator("textarea[data-field]").first()).toHaveValue("Najbardziej brakuje mi wspólnych wieczorów.");
  expect(await summarizeAnswers(page, /Podsumuj moje odpowiedzi/)).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/demo\/podsumowanie$/);
  await expect(page.getByTestId("summary")).toContainText("Najbardziej brakuje mi wspólnych wieczorów.");
  await expect(page.getByTestId("demo-summary-cta")).toContainText("załączyć te odpowiedzi");

  await page.getByRole("link", { name: /Kliknij tutaj i odpowiedz na kilka pytań/ }).click();
  await page.waitForURL(/\/start\?dolacz=21-pytan-o-relacji/);
  await page.waitForLoadState("networkidle");
  for (const pick of ["Oddaliliśmy się", "Nie potrafimy spokojnie", "Tak, oboje chcemy", "Dlaczego ciągle", "Od ponad roku", "Samodzielnie"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).first().click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  await page.getByLabel("Imię").fill("Czytelnik Demo");
  await page.getByLabel("Numer telefonu").fill("600 333 444");
  await page.getByRole("checkbox", { name: /Proszę o kontakt telefoniczny/ }).check();
  await page.getByTestId("attach-consent").locator("input").check();
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  await page.waitForURL(/twoja-mapa/);

  const admin = await browser.newPage();
  await adminLogin(admin);
  await admin.goto("/app/leads");
  await admin.getByRole("link", { name: "Czytelnik Demo" }).click();
  await expect(admin.getByTestId("attached-summary")).toContainText("Najbardziej brakuje mi wspólnych wieczorów.");
  await admin.close();
});

test("telefon: „Pobierz” przewija od razu do formularza, „Zajrzyj do środka” – do podglądu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/wiedza/swiadome-rozstanie");
  await page.waitForLoadState("networkidle");
  // pod okładką: „Zajrzyj do środka” (nie drugi raz „Pobierz bezpłatnie”) → podgląd materiału
  await expect(page.getByTestId("hero-peek")).toHaveText(/Zajrzyj do środka/);
  await page.getByTestId("hero-peek").click();
  await expect(page.getByRole("heading", { name: "Zajrzyj do środka" })).toBeInViewport();
  // „Pobierz” w nagłówku → kontener z formularzem, pole e-mail na ekranie
  await page.goto("/wiedza/swiadome-rozstanie");
  await page.waitForLoadState("networkidle");
  await page.locator('header a[href="#odbierz"]').click();
  await expect(page.getByRole("heading", { name: /Odbierz bezpłatnie:\s*Świadome rozstanie – co teraz\?/ })).toBeInViewport();
  await expect(page.locator("#lm-email")).toBeInViewport();
});
