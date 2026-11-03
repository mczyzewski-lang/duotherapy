# Mailing – nurturing e-mailowy (Resend)

Panel: **/app/mailing** (tylko administrator). Zakładka „Mailing” w menu panelu.

## Jak to działa

```
pobranie materiału ──► kontakt + tag #lm-<materiał> ──► ścieżka „Przed zakupem → Mapa Relacji” (n1…n8)
quiz z e-mailem ─────► kontakt + tag #quiz ───────────┘
zakup (webhook płatności) ──► tag #klient, ścieżka „przed zakupem” zatrzymana ──► ścieżka „Po zakupie” (k1…k4, bez Mapy Relacji)
```

- **Kontakt** = jeden adres e-mail. Ma stały, losowy **kod osoby** (8 znaków, np. `k7m2p9xq`) i listę **tagów**.
- **Tagi nadawane automatycznie:** `#lm-<slug materiału>` (np. `#lm-po-zdradzie`), `#para` / `#malzenstwo`, `#dzieci` / `#bez-dzieci` (z formularza materiału), `#seria-7-dni`, `#quiz`, `#klient`. Własne tagi dopisujesz przy kontakcie.
- **Warunki w każdym e-mailu:**
  - „Wysyłaj tylko, jeśli osoba MA tag” – którykolwiek z wpisanych (puste = wszyscy),
  - „Nie wysyłaj, jeśli osoba MA tag” – wystarczy jeden.
  Osoba, która nie spełnia warunku, pomija ten e-mail i przechodzi do następnego.
- **Harmonogram:** „Wyślij po N dniach” liczone od startu ścieżki. Każda osoba dostaje maks. 1 wiadomość na uruchomienie.
- **Zgoda:** ścieżka „przed zakupem” wysyła tylko osobom ze zgodą marketingową (przełącznik „Tylko ze zgodą marketingową”). Ścieżka „po zakupie” domyślnie nie wymaga zgody, bo dotyczy zamówionej usługi – jeśli zostawisz w niej treści promocyjne (np. k4), rozważ włączenie wymogu zgody.
- **Wypisanie:** link w stopce każdej wiadomości (`/wiedza/wypisz?k=…`) i nagłówek `List-Unsubscribe`. Wypisuje też ze wszystkich materiałów tej osoby.

## Linki i analityka

Każdy przycisk w mailu prowadzi przez adres **`/{kod maila}/{kod osoby}`**, np. `https://twojadomena.pl/n3/k7m2p9xq`:

1. zapisuje kliknięcie przy osobie (panel: Kontakty → osoba → **Podróż**),
2. wiąże przeglądarkę z kontaktem (ciasteczko `duo_mc`, httpOnly) – późniejszy quiz i zamówienie z tej przeglądarki trafiają do tej samej podróży,
3. przekierowuje na stronę z CTA z UTM: `utm_source=duo_mail&utm_medium=email&utm_campaign=<kod maila>&utm_content=<ścieżka>` – zakupy widać też w atrybucji zgłoszeń.

W tabeli ścieżki przy każdym mailu: wysłane, pominięte, ile osób kliknęło i **ile kupiło po kliknięciu**. Podróż osoby: pobrane materiały → maile (wysłane / pominięte z powodem) → kliknięcia → quiz → zamówienie → zakup.

Do Resend trafia tylko adres, temat i treść maila – bez tagów i bez informacji o pobranych materiałach.

## Uruchomienie (produkcja)

1. W Resend zweryfikuj domenę nadawcy.
2. Zmienne środowiskowe aplikacji:
   - `RESEND_API_KEY` – klucz API Resend,
   - `MAIL_FROM` – np. `DUO <kontakt@twojadomena.pl>` (domena zweryfikowana w Resend),
   - `MAIL_REPLY_TO` – opcjonalnie,
   - `CRON_SECRET` – min. 24 znaki.
3. Harmonogram (Railway Cron lub inny) co godzinę:
   `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://twojadomena.pl/api/cron/nurture`
4. W panelu przejrzyj treści, wyślij **test do siebie** (zawsze tylko na adres zalogowanego administratora), potem zaznacz „Wysyłaj” przy ścieżce.

Ścieżki są **domyślnie wyłączone** – nic nie wyjdzie do klientów, dopóki ich nie włączysz. Przy włączeniu ścieżki wiadomości trafią także do osób zapisanych wcześniej (licząc dni od ich zapisu).

Gdy Resend jest skonfigurowany, przez Resend idą też maile z materiałami i potwierdzenie zakupu (wcześniej tylko SMTP; SMTP zostaje jako zapas).

## Domyślne treści

Pliki: `src/lib/mailing-defaults.ts` (wstawiane raz, potem edycja w panelu). Ścieżka „przed zakupem”: n1–n8 (n4 tylko dla tagów rozstania, n5 tylko `#lm-po-zdradzie`, n6 nie dla `#quiz`). Ścieżka „po zakupie”: k1–k4 (przygotowanie do konsultacji, korzystanie z podsumowania, dalsze ścieżki) – bez linków do Mapy Relacji.
