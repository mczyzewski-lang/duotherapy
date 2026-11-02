# Strona po quizie (VSL) i sprzedaż Mapy Relacji online – 670 zł

## Przebieg klienta

```
quiz (6 pytań) → wstępne podsumowanie → prośba o kontakt (imię, telefon, zgoda)
  → /twoja-mapa: „Dziękujemy za Twoje odpowiedzi”, film od Klaudii, oferta 670 zł
     → „Zamawiam” → podsumowanie zamówienia (zakres, realizacja, sprzedawca, regulamin, zgoda na rozpoczęcie usługi)
     → bezpieczna płatność u operatora (Stripe Checkout)
     → /zamowienie/<prywatny-link>: potwierdzenie (z danych operatora) → wybór terminu + wersji kwestionariusza
     → automatycznie: sprawa w panelu, uczestnik, link i kod do kwestionariusza → konsultacja → podsumowanie (jak dotąd)
  bez zakupu → zgłoszenie zostaje w CRM i konsultant dzwoni zgodnie z prośbą (z regułami czasu)
```

Dane kontaktowe nie są zbierane ponownie. Przeglądarka jest powiązana ze zgłoszeniem losowym tokenem w ciasteczku httpOnly (`duo_lead`, w bazie tylko hash). Na stronie VSL pokazujemy wyłącznie imię.

## Płatność – jak to działa

- Operator: **Stripe Checkout** (REST, bez dodatkowych bibliotek). Metody płatności (karta, BLIK, Przelewy24…) włącza się w panelu Stripe – strona nie deklaruje konkretnych metod.
- Kwota pochodzi z serwera (Ustawienia → Oferta: `670`), nigdy z przeglądarki.
- **Status „opłacone” ustawia wyłącznie operator**: podpisane powiadomienie (webhook, weryfikacja HMAC i znacznika czasu) albo zapytanie do API operatora kluczem tajnym przy powrocie na stronę zamówienia. Samo przekierowanie na stronę sukcesu niczego nie zmienia.
- Powtórzone powiadomienia są ignorowane (tabela `payment_events`, unikalny identyfikator zdarzenia). Status „opłacone” jest ostateczny (`nextOrderStatus`).
- Bez podwójnych zamówień: ponowne kliknięcie „Zamawiam” wraca do tej samej, wciąż ważnej sesji płatności; u operatora klucz idempotencji = id zamówienia; w bazie maks. jedno opłacone zamówienie na zgłoszenie.
- Stany: `open` (płatność rozpoczęta) · `pending` (metoda odroczona – czekamy na potwierdzenie) · `paid` · `failed` (odrzucona) · `expired` (niedokończona, sesja wygasła po 60 min). Powrót z bramki przyciskiem „wróć” = „płatność przerwana” (bez zmiany statusu – ostateczny stan ustali operator).
- Odświeżenie strony zamówienia jest bezpieczne; strona sama się odświeża, dopóki operator nie potwierdzi płatności.

### Konfiguracja (wymagana przed sprzedażą)

| Co | Gdzie |
|---|---|
| `STRIPE_SECRET_KEY` (sk_live_… / sk_test_…) | zmienne środowiskowe (Railway → Variables) |
| `STRIPE_WEBHOOK_SECRET` (whsec_…) | Stripe → Developers → Webhooks → endpoint `https://<domena>/api/payments/stripe/webhook`, zdarzenia: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` |
| Metody płatności w PLN, potwierdzenia e-mail (receipts) | panel Stripe |
| Dane sprzedawcy, regulamin, wersja regulaminu, „zatwierdzony” | Panel → Ustawienia → Oferta i płatności |
| Film, obraz startowy, napisy | j.w. (zob. `docs/vsl-scenariusz.md`) |
| Wolne terminy konsultacji | Panel → **Terminy** |
| `SMTP_URL` (opcjonalnie) | e-mail do klienta z linkiem do zamówienia + powiadomienie zespołu o zakupie |

Sprzedaż online jest aktywna tylko, gdy: są oba klucze Stripe **i** „Sprzedaż online” włączona **i** regulamin zatwierdzony (w trybie DEMO wystarczy projekt regulaminu). W przeciwnym razie strona pokazuje ofertę i informację, że konsultant zadzwoni.

**Nie uruchamiaj kluczy produkcyjnych (`sk_live_…`) bez zatwierdzenia regulaminu i danych sprzedawcy.** Najpierw tryb testowy Stripe (`sk_test_…`) i płatność testowa.

## Po zakupie

1. Webhook → zamówienie `paid`, zgłoszenie → etap „Mapa Relacji opłacona”, wartość sprzedaży 670 zł, wpis w historii, zdarzenie `purchase_completed`, e-mail (jeśli SMTP).
2. Strona zamówienia → wybór terminu (wolne terminy 60 min, najwcześniej za X godzin – ustawienie) i wersji kwestionariusza (dla kobiety / dla mężczyzny – szablony są w dwóch wersjach językowych).
3. Atomowa rezerwacja terminu → sprawa (wariant indywidualny, psycholog = właściciel terminu, termin sesji, płatność „opłacona”) → link i kod do kwestionariusza (link ważny min. 14 dni). Zgłoszenie → „W realizacji (sprawa)”.
4. Link i kod widać na stronie zamówienia (prywatny link + ciasteczko). To świadome uproszczenie względem zasady „link i kod innym kanałem” – właścicielem obu jest osoba, która zapłaciła. Kod jest zaszyfrowany w bazie.
5. Brak wolnych terminów → klient widzi informację, że konsultant zadzwoni; w CRM: „opłacono online – klient jeszcze nie wybrał terminu”.

## CRM – osoby, które nie kupiły

Karta w Zgłoszeniach pokazuje stan płatności (rozpoczęta / przerwana / oczekuje / odrzucona / niedokończona / opłacona) i **kiedy dzwonić**:

- nie wcześniej niż `callDelayMinutes` (60) po zgłoszeniu, tylko w godzinach i dniach pracy (`9-18`, `1-5`, czas warszawski);
- nie w trakcie płatności: przez `checkoutGraceMinutes` (30) od jej rozpoczęcia;
- „płatność oczekuje na potwierdzenie” – sprawdź przed telefonem;
- opłacone online → bez telefonu sprzedażowego (ewentualnie telefon organizacyjny, gdy klient nie wybrał terminu).

Zgłoszenie nigdy nie jest usuwane ani oznaczane jako „bez kontynuacji” automatycznie.

## Analityka (pierwszopartyjna, bez treści odpowiedzi)

`vsl_page_view`, `vsl_play`, `vsl_25_percent`, `vsl_50_percent`, `vsl_75_percent`, `vsl_completed`, `checkout_click` – przeglądarka.
`checkout_started` (utworzona sesja płatności), `purchase_completed`, `purchase_failed` – **wyłącznie serwer** (endpoint `/api/events` je odrzuca).
Panel **Lejek** → „Strona po quizie (VSL) → zakup online”: quiz → VSL → film → „Zamawiam” → płatność → zakup (z podziałem na warianty hero A/B) oraz kanał sprzedaży: online vs przez konsultanta (sprzedaże, % zgłoszeń, przychód).
Do operatora płatności trafiają tylko: kwota, nazwa usługi, identyfikator zamówienia i (jeśli podano) e-mail. Nic z quizu.

## Testy

- Jednostkowe (`tests/unit/payments.test.ts`): podpis webhooka (poprawny / zmieniona treść / zły sekret / stary), stany i przejścia zamówienia, kodowanie parametrów, czas warszawski (zmiana czasu), godziny pracy, reguły kontaktu.
- E2E (`tests/e2e/vertical.spec.ts`): atrapa operatora (`tests/e2e/stripe-mock.mjs`, osobny proces – wysyła podpisane powiadomienia, w tym zdublowane) → dodanie terminów w panelu → quiz → strona VSL → podsumowanie (blokada bez regulaminu) → przerwana płatność → ta sama sesja → zapłata → odświeżenie → rezerwacja → kwestionariusz z kodem → CRM bez telefonu sprzedażowego.

Lokalnie: `STRIPE_MOCK_PORT=3199 APP_WEBHOOK=http://localhost:3000/api/payments/stripe/webhook STRIPE_WEBHOOK_SECRET=whsec_dev node tests/e2e/stripe-mock.mjs` oraz aplikacja z `STRIPE_SECRET_KEY=sk_test_dev STRIPE_WEBHOOK_SECRET=whsec_dev STRIPE_API_BASE=http://localhost:3199`.

## Wymaga decyzji / danych biznesowych

- **Wariant dla pary** – czy 670 zł obejmuje też parę (90 min, dwa kwestionariusze). Obecnie online: tylko wariant indywidualny; para → konsultant. Nie wprowadzono drugiej ceny.
- **Regulamin** (projekt w `src/lib/terms-draft.ts`) – zasady zmiany/odwołania terminu, reklamacje, odstąpienie; zatwierdzenie przez prawnika. **Dane sprzedawcy** i status VAT usług (strona podaje „do zapłaty 670 zł”, bez deklaracji VAT).
- **Zgoda na rozpoczęcie usługi przed upływem 14 dni** – treść do weryfikacji przez prawnika.
- **Film** – nagranie, napisy, hosting.
- **Terminy** – kto prowadzi konsultacje kupione online i jak często dodawać wolne terminy.
- **Faktury** – jeśli potrzebne: faktury Stripe (Invoicing) albo zewnętrzny system.
- **Umowa powierzenia** z operatorem płatności (RODO) i aktualizacja polityki prywatności.
