# DUO™ – Audyt Relacji

> Zrozum, co naprawdę dzieje się w Twojej relacji – i świadomie zdecyduj, co dalej.

Aplikacja webowa dla usługi Audyt Relacji: publiczny landing z krótkim quizem i formularzem zgłoszenia, mini-CRM (pipeline zgłoszeń), poufne kwestionariusze dla klientów na prywatnych linkach, panel psychologa (karta sprawy, odpowiedzi z notatkami, porównanie pary, tryb sesji) oraz generator raportu z eksportem do PDF i kontrolowanym udostępnianiem.

Audyt jest jednorazową, ustrukturyzowaną konsultacją. **Nie jest** terapią par, diagnozą kliniczną, prognozą trwałości związku ani pomocą kryzysową. System nie decyduje za psychologa ani klientów.

- Architektura i mapa ekranów: [`docs/architecture.md`](docs/architecture.md)
- Mapowanie materiałów źródłowych na aplikację: [`docs/source-mapping.md`](docs/source-mapping.md)
- Lista kontrolna przed produkcją: [`docs/production-readiness.md`](docs/production-readiness.md)

## Wymagania

- Node.js 22+
- PostgreSQL 15+ (lokalnie lub w chmurze w UE/EOG)
- Chromium do generowania PDF (w środowisku deweloperskim – ten instalowany przez Playwright)

## Uruchomienie lokalne

```bash
npm install
```

Utwórz role i bazę (przykład dla lokalnego PostgreSQL):

```bash
sudo -u postgres psql -c "CREATE ROLE duo_owner LOGIN PASSWORD 'duo_owner_dev' CREATEDB;" -c "CREATE ROLE duo_app LOGIN PASSWORD 'duo_app_dev';" -c "CREATE DATABASE duo OWNER duo_owner;"
```

Skonfiguruj zmienne środowiskowe (opis w `.env.example`) i wygeneruj sekrety:

```bash
cp .env.example .env
```

```bash
sed -i "s|^DATA_ENCRYPTION_KEY=.*|DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)|; s|^TOKEN_SECRET=.*|TOKEN_SECRET=$(openssl rand -base64 32)|" .env
```

Migracje i dane demonstracyjne:

```bash
npm run db:reset
```

Start:

```bash
npm run dev
```

Otwórz http://localhost:3000 (landing) i http://localhost:3000/app (panel).

### Konta i dane DEMO

Przy `DEMO_MODE=true` seed tworzy wyłącznie **syntetyczne** dane (oznaczone „DEMO”, baner na każdej stronie):

| Konto | Rola | Hasło |
|---|---|---|
| `admin@demo.duo` | administrator | `demo-duo-2026!` (lub `DEMO_PASSWORD`) |
| `psycholog@demo.duo` | psycholog (prowadzi sprawy demo) | jw. |
| `psycholog2@demo.duo` | psycholog (bez dostępu do spraw demo – do testu uprawnień) | jw. |

Sprawy demo: para z wypełnionymi kwestionariuszami i alertem bezpieczeństwa (`…-9001-DEMO`) oraz audyt indywidualny w trakcie (`…-9002-DEMO`), a także trzy zgłoszenia w pipeline.

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `DEMO_MODE` | `true` – środowisko demonstracyjne (baner, niezatwierdzone teksty prawne dopuszczone). W produkcji `false`. |
| `APP_URL` | publiczny adres – do budowania linków dla klientów |
| `DATABASE_OWNER_URL` | rola właściciela schematu – **tylko** migracje i seed |
| `DATABASE_URL` | rola aplikacji `duo_app` – podlega RLS |
| `DATA_ENCRYPTION_KEY` | 32 bajty base64 – szyfrowanie odpowiedzi, notatek, raportów |
| `TOKEN_SECRET` | sekret HMAC tokenów linków i sesji |
| `REQUIRE_MFA` | wymuszenie TOTP dla specjalistów (w produkcji domyślnie włączone) |
| `CHROMIUM_PATH` | ścieżka do Chromium dla PDF (opcjonalnie) |

Integracje zewnętrzne (e-mail, SMS, płatności, kalendarz, AI, analityka) są **wyłączone** – aplikacja niczego nie udaje: psycholog kopiuje link i kod, link do płatności ustawia się w panelu, a status płatności oznacza ręcznie; terminy proponuje się w karcie sprawy, a klient wybiera je pod swoim linkiem.

## Przebieg (pionowy scenariusz)

1. Klient wypełnia quiz na stronie głównej i zostawia kontakt (osobna zgoda na kontakt, opcjonalna marketingowa).
2. Zgłoszenie trafia do *Zgłoszenia* (kanban). Rozmowa telefoniczna (ściągawka w karcie zgłoszenia), płatność, założenie sprawy (para lub indywidualnie).
3. W karcie sprawy psycholog generuje **osobny link i 6-cyfrowy kod** dla każdej osoby. Link przesyła np. e-mailem, kod innym kanałem.
4. Klient otwiera link, wpisuje kod, wypełnia kwestionariusz (autozapis, powrót bez utraty danych). Odpowiedź „tak” w pyt. 1–4 lub 7 przesiewu natychmiast pokazuje ramkę pomocy i ustawia prywatny status „wymaga pilnego przeglądu przed sesją”.
5. Psycholog czyta odpowiedzi, dodaje notatki przy pytaniach (oddzielone od odpowiedzi), porównuje perspektywy pary, proponuje terminy.
6. *Tryb sesji*: zegar, harmonogram 60/90 min z wytycznych, pytania pogłębiające, notatnik z autozapisem i oznaczeniami.
7. *Przygotuj raport Audytu Relacji* → szkic zgodny z szablonem → edycja → zapis wersji → zatwierdzenie (blokowane, dopóki są braki) → PDF → udostępnienie jednej osobie (link + kod). Raport wspólny wymaga potwierdzenia zakresu ujawnienia. Nic nie jest wysyłane automatycznie.

## Testy

```bash
npm run typecheck
```

```bash
npm test
```

`npm test` (Vitest, osobna baza `duo_unit`) – 36 testów: kompletność i struktura czterech szablonów (manifest z `docs/source-mapping.md`), walidacja odpowiedzi, analiza jakościowa, generator raportu oraz **testy autoryzacji na poziomie bazy (RLS)**: uczestnik nie odczyta ani nie zapisze odpowiedzi partnera, nie widzi notatek ani statusów ryzyka, nie zmieni odpowiedzi po przekazaniu; psycholog nieprzypisany nie widzi sprawy; rola publiczna nie odczyta zgłoszeń; opublikowane szablony i dziennik audytowy są niezmienne.

Bazy testowe (jednorazowo):

```bash
sudo -u postgres psql -c "CREATE DATABASE duo_unit OWNER duo_owner;" -c "CREATE DATABASE duo_test OWNER duo_owner;"
```

```bash
npm run test:e2e
```

Playwright (osobna baza `duo_test`, build produkcyjny na porcie 3100) – pełny scenariusz: quiz → zgłoszenie → sprawa pary → dwa linki → dwa kwestionariusze (z błędnym kodem, powrotem i izolacją API: `GET /q/<token>/api/answers` z ciasteczkami drugiej osoby zwraca 401) → alert bezpieczeństwa → notatki → porównanie → sesja → raport wspólny (blokada terapii par przy zagrożeniu) → zatwierdzenie → PDF → udostępnienie z kodem; drugi scenariusz: cofnięcie linku odcina dostęp, drugi psycholog dostaje 404.

## Struktura

```
db/migrations/        schemat, RLS, triggery niezmienności
scripts/              migrate, seed (szablony + DEMO), create-user
src/questionnaires/   definicje 4 szablonów (źródło wersji 1), typy, walidacja
src/lib/              auth, db (kontekst RLS), crypto, cases, analysis, report, pdf, settings, templates
src/actions/          akcje serwera panelu
src/app/              landing, /q (kwestionariusz), /r (raport), /app (panel), API
src/components/       UI, quiz, kwestionariusz, komponenty panelu
tests/unit, tests/e2e
```

## Znane ograniczenia

- **Brak PDF 01/02** – szablony dla pary są wersją roboczą zbudowaną z pozycji wspólnych z wersją indywidualną i są oznaczone „do weryfikacji” w panelu (szczegóły i lista kontrolna w `docs/source-mapping.md`).
- Generator raportu jest szablonowy (bez AI) – wstawia fakty, deklaracje osoby, dla której jest raport, i notatki dopuszczone do raportu; resztę oznacza `[DO UZUPEŁNIENIA]`.
- Brak integracji e-mail/SMS/kalendarza/płatności (świadomie – patrz wyżej).
- PDF wymaga Chromium na serwerze.
- Ceny, dane administratora, polityka prywatności, profile psychologów i film są puste – uzupełnia je administrator; puste sekcje są ukryte.

## Przed produkcją

Przejdź [`docs/production-readiness.md`](docs/production-readiness.md): decyzje prawne (administrator, podstawy, retencja, DPIA), umowy powierzenia, konfiguracja (`DEMO_MODE=false`, MFA, sekrety, TLS, role bazy), weryfikacja kwestionariuszy dla pary, przegląd bezpieczeństwa.
