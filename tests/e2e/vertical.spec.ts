// Pełny pionowy scenariusz: quiz → zgłoszenie → sprawa pary → dwa linki → dwa kwestionariusze →
// odpowiedzi, rozbieżności, notatki → sesja → podsumowanie (edycja, zatwierdzenie, PDF) → udostępnienie jednej osobie.
import { expect, test, type Browser, type Page } from "@playwright/test";

const PASSWORD = "demo-duo-2026!";

async function login(page: Page, email = "psycholog@demo.duo") {
  await page.goto("/app/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill(PASSWORD);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page.getByRole("heading", { name: /Dzień dobry/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

/** Wypełnia kwestionariusz ekran po ekranie. scale = wartość dla skal, firstScreeningYes = "tak" w pyt. 1 przesiewu. */
async function fillQuestionnaire(page: Page, opts: { name: string; scale: number; firstScreeningYes: boolean }) {
  await page.getByRole("button", { name: "Zaczynamy" }).click();
  await expect(page.getByTestId("q-card")).not.toHaveAttribute("data-screen", "0");
  let screeningDone = false;
  for (let guard = 0; guard < 80; guard++) {
    if (await page.getByRole("heading", { name: "Prawie gotowe" }).isVisible()) return;
    const card = page.getByTestId("q-card");
    // pola tekstowe
    for (const label of ["Imię i nazwisko"]) {
      const f = card.getByRole("textbox", { name: label });
      if ((await f.count()) && !(await f.first().inputValue())) await f.first().fill(opts.name);
    }
    const country = card.getByLabel("Kraj", { exact: true });
    if (await country.count()) {
      await country.fill("Polska");
      await card.getByLabel("Miasto", { exact: true }).fill("Warszawa");
    }
    const consent = card.getByRole("checkbox", { name: /Wyrażam zgodę/ });
    if (await consent.count()) await consent.check();
    // skale i przesiew
    const groups = card.getByRole("radiogroup");
    const n = await groups.count();
    for (let i = 0; i < n; i++) {
      const g = groups.nth(i);
      const scaleBtn = g.getByRole("radio", { name: new RegExp(`^${opts.scale} –`) });
      if (await scaleBtn.count()) {
        await scaleBtn.click();
        continue;
      }
      const yes = g.getByRole("radio", { name: "Tak", exact: true });
      if (await yes.count()) {
        if (opts.firstScreeningYes && !screeningDone && i === 0) await yes.click();
        else await g.getByRole("radio", { name: "Nie", exact: true }).click();
        continue;
      }
      const radios = g.getByRole("radio");
      if (!(await radios.count())) throw new Error("Pusta grupa: " + (await card.innerText()).slice(0, 300));
      const checked = await radios.first().getAttribute("aria-checked", { timeout: 3000 }).catch(async (e) => {
        await page.screenshot({ path: "test-results/q-fail.png", fullPage: true });
        throw e;
      });
      if (checked !== "true") await radios.first().click();
    }
    if (n && (await card.getByRole("radio", { name: "Wolę omówić na sesji" }).count())) screeningDone = true;
    const tas = card.locator("textarea");
    for (let i = 0; i < (await tas.count()); i++) if (!(await tas.nth(i).inputValue())) await tas.nth(i).fill(`Odpowiedź opisowa – ${opts.name}`);
    const before = await card.getAttribute("data-screen");
    await page.getByRole("button", { name: /^(Dalej|Zaczynamy)/ }).click();
    await expect(page.getByTestId("q-card")).not.toHaveAttribute("data-screen", before!);
  }
  throw new Error("Nie dotarto do podsumowania kwestionariusza");
}

async function openAsParticipant(browser: Browser, url: string, code: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /To bezpieczna przestrzeń/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Kod dostępu").fill(code);
  await page.getByRole("button", { name: "Otwórz kwestionariusz" }).click();
  await expect(page.getByRole("button", { name: "Zaczynamy" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  return { ctx, page };
}

test("pełny scenariusz audytu pary", async ({ page, browser, request }) => {
  // 1. Landing (wariant A) → quiz Mapy Relacji → prośba o telefon (z UTM)
  await page.goto("/mapa-relacji?hero=A&utm_source=instagram&utm_medium=reels&utm_campaign=e2e");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.");
  // podgląd rzeczywistej struktury podsumowania (dane fikcyjne)
  await expect(page.getByTestId("pv-card")).toHaveCount(6);
  await expect(page.getByTestId("pv-card").nth(3)).toContainText("Wasz cykl w jednym zdaniu");
  await expect(page.getByRole("img", { name: /Schemat: Cykl konfliktu/ })).toBeVisible();
  const sample = await request.get("/mapa-relacji-przyklad");
  expect(sample.ok()).toBeTruthy();
  const sampleHtml = await sample.text();
  expect(sampleHtml).toContain("dane fikcyjne");
  expect(sampleHtml).not.toContain("[DO UZUPEŁNIENIA]");
  await page.locator("#hero-cta").click();
  await page.waitForURL(/\/start/);
  await page.waitForLoadState("networkidle");
  for (const pick of ["Nie wiem już, co dalej", "Nie potrafimy spokojnie", "Tak, oboje chcemy", "Dlaczego ciągle", "Od ponad roku", "Razem z partnerem"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).click();
    await page.waitForTimeout(400);
  }
  await expect(page.getByRole("heading", { name: "Pierwszy krok już za Tobą" })).toBeVisible();
  await expect(page.getByText("nie diagnoza ani gotowa Mapa Relacji")).toBeVisible();
  await page.waitForTimeout(2600); // ochrona przed botami: formularz wysłany zbyt szybko jest ignorowany
  await page.getByLabel("Imię").fill("Ola Testowa");
  await page.getByLabel("Numer telefonu").fill("12");
  await page.getByRole("checkbox", { name: /Proszę o kontakt telefoniczny/ }).check();
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  await expect(page.getByText(/Podaj poprawny numer telefonu/)).toBeVisible();
  await page.getByLabel("Numer telefonu").fill("600 100 200");
  await page.getByLabel(/E-mail/).fill("ola@example.test");
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  // po prośbie o kontakt: strona z wiadomością od Klaudii i ofertą (bez zakupu – zostaje w kontakcie telefonicznym)
  await expect(page.getByRole("heading", { name: /Dziękujemy za Twoje odpowiedzi, Ola/ })).toBeVisible();
  await expect(page.locator("#oferta").getByText("670 zł").first()).toBeVisible();

  // 2. Psycholog: pipeline → sprawa pary
  await login(page);
  await page.goto("/app/leads");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Ola Testowa" }).click();
  await expect(page.getByText("instagram / reels / e2e")).toBeVisible();
  await expect(page.getByText("Razem z partnerem lub partnerką.")).toBeVisible();
  await page.getByLabel("Imię (do powitania)").first().fill("Ola");
  await page.locator("#p2_name").fill("Tomek");
  await page.getByRole("button", { name: "Załóż sprawę" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ola & Tomek" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const caseUrl = page.url();

  // 3. Dwa osobne linki
  const links: { url: string; code: string }[] = [];
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Wygeneruj link do kwestionariusza" }).first().click();
    const url = await page.getByTestId("invite-url").innerText();
    const code = await page.getByTestId("invite-code").innerText();
    links.push({ url, code });
    await page.reload();
    await page.waitForLoadState("networkidle");
  }
  expect(links[0].url).not.toBe(links[1].url);

  // 4. Uczestniczka A: błędny kod, potem właściwy; zapis i powrót
  const a = await openAsParticipant(browser, links[0].url.replace(/^https?:\/\/[^/]+/, "http://localhost:3100"), links[0].code);
  await fillQuestionnaire(a.page, { name: "Ola Testowa", scale: 4, firstScreeningYes: true });
  // powrót bez utraty danych
  await a.page.reload();
  await a.page.waitForLoadState("networkidle");
  const counter = a.page.getByRole("navigation", { name: "Nawigacja kwestionariusza" }).getByText(/^\d+\/\d+$/);
  await expect(counter).not.toHaveText(/^0\//);
  // przejdź do podsumowania
  for (let i = 0; i < 60 && !(await a.page.getByRole("heading", { name: "Prawie gotowe" }).isVisible()); i++) {
    const before = await a.page.getByTestId("q-card").getAttribute("data-screen");
    await a.page.getByRole("button", { name: /^(Dalej|Zaczynamy)/ }).click();
    await expect(a.page.getByTestId("q-card")).not.toHaveAttribute("data-screen", before!);
  }

  // 5. Uczestnik B na osobnym urządzeniu
  const b = await openAsParticipant(browser, links[1].url.replace(/^https?:\/\/[^/]+/, "http://localhost:3100"), links[1].code);
  await fillQuestionnaire(b.page, { name: "Tomek Testowy", scale: 2, firstScreeningYes: false });

  // Izolacja: API B zwraca tylko odpowiedzi B; link A z ciasteczkami B nie daje dostępu
  const pathB = new URL(links[1].url).pathname;
  const pathA = new URL(links[0].url).pathname;
  const apiB = await b.page.request.get(`${pathB}/api/answers?participantId=anything`);
  expect(apiB.status()).toBe(200);
  const bodyB = await apiB.json();
  expect(JSON.stringify(bodyB)).toContain("Tomek Testowy");
  expect(JSON.stringify(bodyB)).not.toContain("Ola Testowa");
  const crossA = await b.page.request.get(`${pathA}/api/answers`);
  expect(crossA.status()).toBe(401);
  const anon = await request.get(`${pathA}/api/answers`);
  expect(anon.status()).toBe(401);

  // Przekazanie kwestionariuszy
  for (const p of [a.page, b.page]) {
    await p.getByRole("button", { name: /Przekaż kwestionariusz psychologowi/ }).click();
    await expect(p.getByText("Kwestionariusz przekazany psychologowi")).toBeVisible();
  }

  // 6. Psycholog: alert bezpieczeństwa, odpowiedzi, notatka, porównanie
  await page.goto(caseUrl);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Wymaga pilnego przeglądu przed sesją").first()).toBeVisible();
  await page.getByRole("link", { name: "Odpowiedzi i notatki" }).click();
  await expect(page.getByTestId("answer-s2.1")).toHaveText("4 / 5");
  await page.getByRole("button", { name: "Notatka do pytania" }).first().click();
  await page.getByLabel("Notatka psychologa").fill("Notatka prywatna testowa");
  await page.getByRole("button", { name: "Dodaj notatkę" }).click();
  await expect(page.getByText("Notatka prywatna testowa")).toBeVisible();
  await expect(page.getByTestId("answer-s2.1")).toHaveText("4 / 5"); // odpowiedź klienta bez zmian
  await page.getByRole("link", { name: "Porównanie" }).click();
  await expect(page.getByText("rozbieżność").first()).toBeVisible();
  await expect(page.getByText(/nie werdykt/)).toBeVisible();

  // 7. Sesja
  await page.getByRole("link", { name: "Tryb sesji" }).click();
  await page.getByRole("button", { name: "Rozpocznij sesję" }).click();
  await expect(page.getByText("Sygnały zagrożenia w przesiewie")).toBeVisible();
  await expect(page.getByText("Czas sesji")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.locator("#pad").fill("Notatka z kontraktu – ustalono słowo stop.");
  await expect(page.getByText("zapisano", { exact: true })).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /Zakończ sesję/ }).click();
  await page.waitForURL(/tab=reports/);

  // 8. Podsumowanie wspólne: szkic → uzupełnienie → zatwierdzenie → PDF → udostępnienie jednej osobie
  await page.getByRole("button", { name: "Przygotuj podsumowanie sesji" }).click();
  await expect(page.getByRole("heading", { name: "Podsumowanie wspólne" })).toBeVisible();
  await expect(page.getByText("Te opcje są zablokowane w tym raporcie")).toBeVisible();
  const fields = page.locator("textarea, input[aria-label^='Krok']");
  for (let i = 0; i < (await fields.count()); i++) {
    const f = fields.nth(i);
    const v = await f.inputValue();
    if (v.includes("[DO UZUPEŁNIENIA]") || v === "") await f.fill(v.includes("[DO UZUPEŁNIENIA]") ? `Treść uzupełniona przez psychologa ${i}` : "uzupełnione");
  }
  for (const label of ["Komunikacja i konflikt", "Bliskość i intymność", "Zaufanie", "Granice", "Obowiązki i rodzicielstwo", "Stres i praca"]) {
    await page.getByRole("group", { name: `Nasilenie: ${label}` }).getByText("umiarkowane").click();
  }
  await page.getByRole("radio", { name: "Pilne wsparcie (bezpieczeństwo)" }).check();
  await page.getByRole("checkbox", { name: "plan bezpieczeństwa" }).check();
  await page.getByRole("button", { name: "Zapisz wersję" }).click();
  await expect(page.getByText(/Zapisano wersję 2/)).toBeVisible();
  await page.getByRole("button", { name: "Zatwierdź podsumowanie" }).click();
  await expect(page.getByText("Podsumowanie zatwierdzone")).toBeVisible();

  const pdfHref = await page.getByRole("link", { name: /Pobierz PDF/ }).getAttribute("href");
  const pdf = await page.request.get(pdfHref!);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");

  // bez potwierdzenia zakresu ujawnienia przycisk jest nieaktywny
  await expect(page.getByRole("button", { name: "Wygeneruj link do podsumowania" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Potwierdzam, że podsumowanie wspólne/ }).check();
  await page.getByRole("button", { name: "Wygeneruj link do podsumowania" }).click();
  const shareUrl = (await page.getByTestId("share-url").innerText()).replace(/^https?:\/\/[^/]+/, "http://localhost:3100");
  const shareCode = await page.getByTestId("share-code").innerText();

  const viewer = await browser.newContext();
  const vp = await viewer.newPage();
  await vp.goto(shareUrl);
  await vp.waitForLoadState("networkidle");
  await expect(vp.getByRole("heading", { name: /Twoje podsumowanie/ })).toBeVisible();
  await vp.getByLabel("Kod dostępu do podsumowania").fill(shareCode);
  await vp.getByRole("button", { name: "Otwórz podsumowanie" }).click();
  await expect(vp.getByRole("link", { name: "Pobierz PDF" })).toBeVisible();
  const frame = vp.frameLocator("iframe[title='Podsumowanie']");
  await expect(frame.getByRole("heading", { name: "Mapa Relacji" })).toBeVisible();
  await expect(frame.getByText("Treść uzupełniona przez psychologa").first()).toBeVisible();
  // podsumowanie wspólne nie zawiera odpowiedzi z indywidualnych kwestionariuszy
  await expect(frame.getByText("Odpowiedź opisowa")).toHaveCount(0);

  await a.ctx.close();
  await b.ctx.close();
  await viewer.close();
});

test("audyt indywidualny: link nie działa po cofnięciu, drugi psycholog nie widzi sprawy", async ({ page, browser }) => {
  await login(page);
  await page.goto("/app/cases/new");
  await page.waitForLoadState("networkidle");
  await page.locator("#p1_name").fill("Kasia");
  await page.getByRole("button", { name: "Załóż sprawę" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Kasia" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const caseUrl = page.url();
  await page.getByRole("button", { name: "Wygeneruj link do kwestionariusza" }).click();
  const url = (await page.getByTestId("invite-url").innerText()).replace(/^https?:\/\/[^/]+/, "http://localhost:3100");
  const code = await page.getByTestId("invite-code").innerText();

  // błędny kod
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForLoadState("networkidle");
  await p.getByLabel("Kod dostępu").fill(code === "000000" ? "111111" : "000000");
  await p.getByRole("button", { name: "Otwórz kwestionariusz" }).click();
  await expect(p.getByText(/Kod jest nieprawidłowy/)).toBeVisible();
  await p.getByLabel("Kod dostępu").fill(code);
  await p.getByRole("button", { name: "Otwórz kwestionariusz" }).click();
  await expect(p.getByRole("button", { name: "Zaczynamy" })).toBeVisible();
  await expect(p.getByText("Kwestionariusz Mapy Relacji, wersja indywidualna")).toHaveCount(0); // tytuł dopiero na ekranie "Zanim zaczniesz"

  // cofnięcie linku odcina dostęp
  await page.reload();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Cofnij link" }).click();
  await page.waitForLoadState("networkidle");
  await p.reload();
  await expect(p.getByRole("heading", { name: "Ten link jest nieaktywny" })).toBeVisible();

  // drugi psycholog nie ma dostępu do sprawy
  const other = await browser.newContext();
  const op = await other.newPage();
  await login(op, "psycholog2@demo.duo");
  const res = await op.goto(caseUrl);
  expect(res?.status()).toBe(404);
  await ctx.close();
  await other.close();
});

test("zakup online: strona VSL → płatność (atrapa operatora) → termin → kwestionariusz; CRM bez telefonu sprzedażowego", async ({ page, browser }) => {
  // psycholog dodaje wolne terminy
  const staff = await browser.newPage();
  await login(staff);
  const day = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
  await staff.goto(`/app/terminy?w=${day}`);
  await staff.waitForLoadState("networkidle");
  // kalendarz: klik w puste pola → nowe terminy (przerywane), zapis jednym przyciskiem
  await staff.getByTestId(`cell-${day}-10:00`).click();
  await staff.getByTestId(`cell-${day}-15:30`).click();
  await expect(staff.getByTestId("slot-new")).toHaveCount(2);
  await staff.getByTestId(`cell-${day}-09:30`).click(); // 9:30–10:30 nachodzi na 10:00–11:00
  await expect(staff.getByText("Ten czas nachodzi na inny termin.")).toBeVisible();
  await staff.getByTestId("slot-savebar").getByRole("button", { name: "Zapisz zmiany" }).click();
  await expect(staff.getByText(/Dodano terminy: 2/)).toBeVisible();
  await expect(staff.getByTestId("slot-free")).toHaveCount(2);
  // wolny termin można zaznaczyć do usunięcia i cofnąć
  await staff.getByTestId("slot-free").first().click();
  await expect(staff.getByTestId("slot-savebar")).toContainText("−1 do usunięcia");
  await staff.getByTestId("slot-savebar").getByRole("button", { name: "Anuluj" }).click();
  await expect(staff.getByTestId("slot-savebar")).toHaveCount(0);

  // klient: quiz → prośba o kontakt → strona VSL
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/start");
  await page.waitForLoadState("networkidle");
  for (const pick of ["Oddaliliśmy się", "Brakuje nam bliskości", "Raczej nie", "Czy możemy jeszcze", "Od kilku miesięcy", "Samodzielnie"]) {
    await page.getByRole("radio", { name: new RegExp(pick) }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  await page.getByLabel("Imię").fill("Kasia Kupująca");
  await page.getByLabel("Numer telefonu").fill("600 300 400");
  await page.getByRole("checkbox", { name: /Proszę o kontakt telefoniczny/ }).check();
  await page.getByRole("button", { name: /Poproś o telefon/ }).click();
  await expect(page.getByRole("heading", { name: /Dziękujemy za Twoje odpowiedzi, Kasia/ })).toBeVisible();
  await page.waitForLoadState("networkidle");

  // podsumowanie zamówienia: bez akceptacji regulaminu i zgody nie da się przejść dalej
  await page.getByRole("button", { name: /Zamawiam Mapę Relacji – 670 zł/ }).click();
  await expect(page.getByRole("heading", { name: "Podsumowanie zamówienia" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Przejdź do bezpiecznej płatności/ })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Akceptuję/ }).check();
  await page.getByRole("checkbox", { name: /Żądam rozpoczęcia/ }).check();

  // 1. próba: powrót z bramki bez płacenia → płatność przerwana, nic nie oznaczone jako opłacone
  await page.getByRole("button", { name: /Przejdź do bezpiecznej płatności/ }).click();
  await page.waitForURL(/localhost:3199\/pay\//);
  await page.getByRole("button", { name: "Wróć do sklepu" }).click();
  await page.waitForURL(/twoja-mapa/);
  await expect(page.getByText(/Płatność nie została dokończona/)).toBeVisible();

  // 2. próba: ta sama sesja płatności (bez dublowania zamówienia) → zapłata
  await page.getByRole("button", { name: /Zamawiam Mapę Relacji/ }).click();
  await page.getByRole("checkbox", { name: /Akceptuję/ }).check();
  await page.getByRole("checkbox", { name: /Żądam rozpoczęcia/ }).check();
  await page.getByRole("button", { name: /Przejdź do bezpiecznej płatności/ }).click();
  await page.waitForURL(/localhost:3199\/pay\//);
  await page.getByRole("button", { name: "Zapłać" }).click();
  await page.waitForURL(/\/zamowienie\//);
  await expect(page.getByRole("heading", { name: /Dziękujemy za zamówienie, Kasia/ })).toBeVisible();

  // odświeżenie strony nie zmienia stanu; wybór terminu i wersji kwestionariusza
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^10:00/ }).first().click();
  await page.getByRole("button", { name: "Dla kobiety" }).click();
  await page.getByRole("button", { name: "Rezerwuję termin" }).click();
  await expect(page.getByRole("heading", { name: /Wszystko gotowe, Kasia/ })).toBeVisible();
  const code = (await page.getByTestId("access-code").textContent())?.trim() ?? "";
  expect(code).toMatch(/^\d{6}$/);

  // kwestionariusz zgodnie z dotychczasowym przebiegiem: link + kod
  await page.getByRole("link", { name: "Otwórz kwestionariusz" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /To bezpieczna przestrzeń/ })).toBeVisible();
  await page.getByLabel("Kod dostępu").fill(code);
  await page.getByRole("button", { name: "Otwórz kwestionariusz" }).click();
  await expect(page.getByRole("button", { name: "Zaczynamy" })).toBeVisible();

  // CRM: opłacono online, sprawa założona, termin zajęty; bez telefonu sprzedażowego
  await staff.goto("/app/leads");
  await staff.waitForLoadState("networkidle");
  await staff.getByRole("link", { name: "Kasia Kupująca" }).click();
  const pay = staff.getByTestId("online-payment");
  await expect(pay.getByText("Opłacono online").first()).toBeVisible();
  await expect(pay.getByText(/bez telefonu sprzedażowego/)).toBeVisible();
  await expect(pay.getByText(/Termin wybrany online/)).toBeVisible();
  await staff.goto("/app/terminy");
  await expect(staff.getByTestId("upcoming-bookings").getByText("Kasia Kupująca")).toBeVisible();
  await staff.close();
});
