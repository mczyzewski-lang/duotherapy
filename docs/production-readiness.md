# Gotowość produkcyjna – lista kontrolna przed przetwarzaniem prawdziwych danych

> Kod wdraża techniczne środki ochrony, ale **sam kod nie zapewnia zgodności z RODO**. Poniższe punkty wymagają decyzji właściciela usługi, prawnika i/lub inspektora ochrony danych. Do czasu ich wykonania aplikacja powinna działać wyłącznie w trybie DEMO z danymi syntetycznymi.

## 1. Decyzje prawne i organizacyjne

- [ ] Wskazanie administratora danych (psycholog / gabinet / spółka) i ewentualnie współadministratorów; uzupełnienie danych w *Ustawienia → Dane prawne*.
- [ ] Ocena, czy wymagane jest powołanie IOD; dane kontaktowe IOD.
- [ ] Podstawy prawne: art. 6 ust. 1 lit. a/b i art. 9 ust. 2 lit. a (zgoda wyraźna) lub inne – zatwierdzenie treści klauzuli w kwestionariuszu, zgód w formularzu zgłoszenia oraz zgody marketingowej.
- [ ] Polityka prywatności (pełna treść) i regulamin usługi (zakres, płatności, odwołanie terminu).
- [ ] **Polityka retencji**: okres przechowywania odpowiedzi, notatek i raportów; zasady usuwania vs. obowiązki dokumentacyjne (zasady etyki zawodowej psychologa, ewentualne przepisy o dokumentacji). Funkcja „Usuń dane uczestnika” usuwa odpowiedzi, notatki i kontakt – zweryfikować, czy to zgodne z polityką.
- [ ] Rejestr czynności przetwarzania; **DPIA** (dane szczególnych kategorii, dane o przemocy – ocena skutków jest wysoce zalecana).
- [ ] Procedura obsługi żądań osób (dostęp – eksport JSON w karcie sprawy; sprostowanie – korekta z historią; usunięcie; ograniczenie; wycofanie zgody).
- [ ] Procedura naruszeń ochrony danych (72 h do PUODO).
- [ ] Zasada „sekretów” przy audycie pary – jednolity tekst przekazywany klientom.
- [ ] Zatwierdzenie tekstów prawnych → przełącznik „Teksty zatwierdzone” (bez niego, poza trybem DEMO, kwestionariusz jest zablokowany).

- [ ] Lejek Mapy Relacji: treść zgody na kontakt telefoniczny w sprawie oferty, zakres i okres przechowywania odpowiedzi z quizu, informacja o pomiarze lejka i ciasteczku testu A/B w polityce prywatności (ocena wymogu zgody), informacja o powiązaniu DUO – Nowy Etap przekazywana przy ewentualnej propozycji tej oferty (`docs/mapa-relacji-lejek.md`).

## 2. Umowy powierzenia i dostawcy

- [ ] Hosting aplikacji i bazy w UE/EOG; umowa powierzenia (art. 28 RODO).
- [ ] Kopie zapasowe (szyfrowane, w UE), testy odtwarzania.
- [ ] Dostawca płatności (link do płatności) – umowa, zakres danych.
- [ ] Jeżeli zostanie dodana integracja e-mail/SMS: umowa powierzenia, **brak treści wrażliwych w wiadomościach** (tylko link, kod innym kanałem).
- [ ] Platforma wideo do sesji – umowa, lokalizacja, brak nagrywania.
- [ ] AI: obecnie **wyłączone**. Włączenie wymaga DPIA, umowy powierzenia, przetwarzania w UE, braku trenowania na danych, wyraźnej zgody klienta i przeglądu każdego szkicu przez psychologa.

## 3. Konfiguracja techniczna

- [ ] `DEMO_MODE=false`, `NODE_ENV=production`, `REQUIRE_MFA=true`.
- [ ] Silne, losowe `DATA_ENCRYPTION_KEY` i `TOKEN_SECRET` w menedżerze sekretów (nie w repozytorium). **Utrata klucza szyfrowania = utrata danych**; procedura rotacji kluczy (do zaprojektowania – obecnie format `v1:` umożliwia dodanie kolejnej wersji).
- [ ] Osobne role bazy: właściciel (migracje) i `duo_app` (aplikacja, bez superużytkownika, bez BYPASSRLS). Zweryfikować, że rola aplikacji nie jest właścicielem tabel.
- [ ] TLS wszędzie (także połączenie z bazą – `?sslmode=require`); HSTS jest włączony w nagłówkach.
- [ ] Szyfrowanie dysku/wolumenu bazy po stronie dostawcy.
- [ ] Zaufane nagłówki proxy (`x-forwarded-for`) – limity prób opierają się na IP.
- [ ] Chromium dostępny w środowisku uruchomieniowym (generowanie PDF) albo zastąpienie modułu `src/lib/pdf.ts`; `CHROMIUM_PATH`.
- [ ] Logi serwera: bez treści zapytań/parametrów (klient bazy nie loguje parametrów); weryfikacja logów platformy hostingowej.
- [ ] Monitoring błędów **bez** treści formularzy (jeśli dodany – maskowanie danych).
- [ ] Utworzenie pierwszego administratora: `npm run user:create -- admin email "Imię Nazwisko"`; usunięcie kont demo; brak danych demo w produkcji (seed bez `DEMO_MODE` tworzy wyłącznie szablony).
- [ ] Zadanie okresowe czyszczące wygasłe sesje, `rate_limits` i realizujące politykę retencji (do dodania po decyzji o retencji).

## 4. Treść merytoryczna

- [ ] **Kwestionariusze dla pary (PDF 01/02)** – porównać i opublikować poprawioną wersję (patrz `docs/source-mapping.md`, „Elementy wymagające ręcznej weryfikacji”).
- [ ] Weryfikacja numerów pomocy (aktualność na dzień uruchomienia) – *Ustawienia → Numery pomocy*.
- [ ] Ceny, dane kontaktowe, profile psychologów, film (VSL) – uzupełnić w ustawieniach; puste sekcje pozostają ukryte.
- [ ] Przegląd tekstów landingu i FAQ przez właściciela usługi.

## 5. Przegląd bezpieczeństwa

- [ ] Niezależny przegląd kodu i test penetracyjny (autoryzacja, IDOR, enumeracja linków, CSRF, XSS w raporcie, nagłówki).
- [ ] Przegląd polityk RLS (`db/migrations/002_rls.sql`, `005_cases_policy.sql`) i uruchomienie `npm test` na docelowej wersji PostgreSQL.
- [ ] Zasady dostępu administratora (administrator widzi wszystkie sprawy – rozważyć, czy rola administratora nie powinna być rozdzielona od roli klinicznej).
- [ ] Szkolenie zespołu: przekazywanie linku i kodu różnymi kanałami, brak treści wrażliwych w notatkach do zgłoszeń, zasady udostępniania raportów wspólnych.
- [ ] Plan ciągłości: co robić, gdy w kwestionariuszu pojawi się „tak” przy pyt. 1–4/7 (kto i w jakim czasie przegląda – system nie jest całodobowym monitoringiem kryzysowym).

## 6. Znane ograniczenia techniczne

- Brak wysyłki e-mail/SMS – świadomie (linki i kody kopiuje psycholog).
- Brak integracji z kalendarzem i płatnościami – terminy w aplikacji, status płatności ręcznie.
- Generowanie PDF wymaga Chromium na serwerze.
- Brak MFA dla klientów (zastępuje je link + kod z innego kanału).
- Brak automatycznych powiadomień dla psychologa o „tak” w przesiewie poza panelem (do decyzji: powiadomienie bez treści, np. „nowy alert w sprawie X”).
