# Mapowanie materiałów źródłowych → aplikacja DUO®

Materiały źródłowe (PDF) służyły wyłącznie jako baza wiedzy. **Pliki PDF nie są częścią repozytorium ani aplikacji** – treść została przeniesiona do struktur danych, interfejsu i logiki.

| Plik | Dostarczony | Gdzie w aplikacji |
|---|---|---|
| `01_kwestionariusz_dla_niego.pdf` | **NIE** | szablon `couple_male` – wersja robocza, oznaczona „do weryfikacji” |
| `02_kwestionariusz_dla_niej.pdf` | **NIE** | szablon `couple_female` – wersja robocza, oznaczona „do weryfikacji” |
| `03_wytyczne_dla_psychologa.pdf` | tak (11 s.) | panel: sygnały do pogłębienia, porównanie, tryb sesji, przegląd bezpieczeństwa, ścieżki w raporcie |
| `04_szablon_raportu.pdf` | tak (3 s.) | generator i edytor raportu, HTML/PDF |
| `05_kwestionariusz_indywidualny_dla_niego.pdf` | tak (10 s.) | szablon `individual_male` |
| `06_kwestionariusz_indywidualny_dla_niej.pdf` | tak (10 s.) | szablon `individual_female` |
| `07_sciezka_klienta.pdf` | tak (1 s.) | landing („Jak to działa”, „Co może wydarzyć się dalej?”), ścieżki w raporcie |

Definicje szablonów: `src/questionnaires/individual.ts`, `src/questionnaires/couple.ts`. Seed zapisuje je w bazie jako wersję 1 (`questionnaire_template_versions` + `questions`); od tej chwili źródłem prawdy jest wersjonowana baza (edytor w panelu: *Kwestionariusze*).

## Weryfikacja zgodności

1. **Tekst 1:1** – w trakcie budowy wszystkie 153 teksty każdej wersji indywidualnej (tytuły sekcji, akapity „Zanim zaczniesz”, treść każdego pytania i każdej opcji odpowiedzi) zostały automatycznie porównane z tekstem wyodrębnionym z PDF 05 i 06 (pełne brzmienie, po normalizacji białych znaków). Wynik: **0 rozbieżności** dla obu wersji.
2. **Struktura** – test `tests/unit/templates.test.ts` utrwala manifest poniżej (sekcje, liczba pozycji, kolejność typów, liczba wariantów, numeracja skal, pytania uruchamiające ścieżkę bezpieczeństwa, formy gramatyczne). Każda zmiana szablonu źródłowego wymaga świadomej aktualizacji testu.
3. **Źródło pozycji** – każde pytanie ma pole `source: { file, page }` (strona w PDF; różna dla wersji M/K tam, gdzie łamanie stron się różni). Widoczne w edytorze szablonów.

## Typy pól

| Typ | Interfejs | Uwagi |
|---|---|---|
| `text`, `textarea` | krótka / długa odpowiedź | |
| `date` | wybór daty | „Data wypełnienia” uzupełniana domyślnie |
| `email`, `phone` | pola z walidacją | |
| `country_city` | dwa pola: kraj, miasto | kraj ≠ Polska → komunikat o lokalnych numerach alarmowych |
| `single` | pojedynczy wybór (kafelki) | opcje z `detailLabel` dodają pole tekstowe („inny:”, „Kiedy i jak długo:”) |
| `multi` | wielokrotny wybór + wskazanie głównego | odwzorowuje „zaznacz więcej niż jedno, a główny cel podkreśl” |
| `scale5` | przyciski 1–5 z opisem znaczenia | legenda „1 = zupełnie nie, 5 = całkowicie tak” |
| `screening` | nie / tak / wolę omówić na sesji | trzy kolumny z PDF |
| `consent` | zgoda + klauzula z ustawień | zapis w `consents` (wersja i treść tekstu, data) |
| `signature` | imię i nazwisko + data automatyczna | zastępuje „Podpis” |
| `info` | blok informacyjny | ramka bezpieczeństwa |

Stan odpowiedzi: `answered` / `not_applicable` (jawne „nie dotyczy”, tylko gdzie `allowNA`) / `discuss_in_session` (tylko przesiew) – odróżnione od braku odpowiedzi (brak wiersza).

---

## PDF 05 i 06 – Kwestionariusz Audytu Relacji, wersja indywidualna

Obie wersje mają identyczną strukturę (94 pozycje w aplikacji). Różnią się wyłącznie formami gramatycznymi (`g(męska, żeńska)` w kodzie) – patrz „Różnice M/K” niżej.

| # | Sekcja (klucz) | Pozycje | Typy | Strony M / K |
|---|---|---|---|---|
| – | Zanim zaczniesz (`intro`) | 6 akapitów | tekst | 1 / 1 |
| 1 | Metryczka (`profile`) | 13 | text, date, email, phone, country_city, text, single(5), text, single(3), text+NA, single(3, z polem „Kiedy i jak długo”), textarea, date | 1–2 / 1–2 |
| 2 | Poufność i ochrona danych (`consent`) | 1 | consent | 2 / 2 |
| 3 | Twoja sytuacja i cel audytu (`situation`) | 5 | single(5 + „Inny powód:”), textarea (warunkowe), single(5), single(2), multi(6 + „inny:”, z celem głównym) | 2–3 / 2–3 |
| 4 | Część 1. Pytania przesiewowe o bezpieczeństwo (`safety`) | 8 + ramka | screening ×8, info | 3–4 / 3–4 |
| 5 | Część 2. Komunikacja i konflikt (`communication`) | 11 | scale5 ×9, textarea ×2 | 4–5 / 4–5 |
| 6 | Część 3. Cykl kłótni i mój udział w nim (`cycle`) | 13 | text ×6 (cykl), scale5 ×4 („Mój udział”), textarea ×3 | 5–6 / 5–6 |
| 7 | Część 4. Bliskość i intymność (`closeness`) | 5 | scale5 ×4, textarea | 6 / 6 |
| 8 | Część 5. Zaufanie i przywiązanie (`trust`) | 6 | scale5 ×5, textarea | 7 / 7 |
| 9 | Część 6. Granice (`boundaries`) | 4 | scale5 ×3, textarea | 7 / 7 |
| 10 | Część 7. Obowiązki, rodzicielstwo i kontakt z dzieckiem (`parenting`) | 8 | scale5 ×6 (5 z „nie dotyczy”), textarea ×2 (z „nie dotyczy”) | 8 / 7–8 |
| 11 | Część 8. Stres, praca i wsparcie (`stress`) | 6 | scale5 ×5, textarea | 8–9 / 8 |
| 12 | Część 9. Moje potrzeby i wartości (`values`) | 4 | textarea ×4 | 9 / 9 |
| 13 | Część 10. Gotowość do zmiany i decyzja (`readiness`) | 8 | scale5 ×4, single(5) „Gdzie jesteś teraz?”, single(5) „Jak myślisz, gdzie jest ona/on?”, textarea ×2 | 9–10 / 9–10 |
| 14 | Oświadczenie (`declaration`) | 1 | signature | 10 / 10 |
| – | Stopka („prześlij najpóźniej 48 godzin przed sesją”) | – | `outro` – ekran podsumowania | 10 / 10 |

**Razem: 94 pozycje** (w tym 1 blok informacyjny). Klucze pytań są wspólne dla wersji M/K (np. `s2.5`), co umożliwia porównanie.

### Szczegóły pozycji (klucz → numer w PDF → typ)

- Metryczka: `m.name` Imię i nazwisko · `m.birth` Data urodzenia (wiek) · `m.email` · `m.phone` Telefon (z numerem kierunkowym kraju) · `m.location` Kraj i miasto zamieszkania · `m.job` Zawód, obecna praca · `m.status` Status związku (związek nieformalny / małżeństwo / separacja / w trakcie rozstania / inny:) · `m.length` Długość związku · `m.together` Wspólne zamieszkanie (tak / nie / częściowo) · `m.children` Dzieci (liczba i wiek) · `m.therapy` Wcześniejsza terapia (nie / indywidualna / par + Kiedy i jak długo) · `m.treatment` Obecne leczenie lub leki · `m.filled` Data wypełnienia.
- Sytuacja: `sit.why_alone` (1) · `sit.refusal_reason` (2, wyświetlane gdy w (1) zaznaczono „Partner(ka) nie chce uczestniczyć”) · `sit.who_considers` (1: ja / partner(ka) / oboje / nikt / nie wiem) · `sit.children` (2: tak / nie) · `sit.goal` (3: 5 celów + inny:, wskazanie głównego).
- Część 1: `s1.1`–`s1.8`; pyt. 1–4 i 7 oznaczone tagiem `risk-trigger`.
- Część 2: `s2.1`–`s2.9` (skala) + `s2.o1` (ostatnia kłótnia), `s2.o2` (perspektywa partnera/partnerki).
- Część 3: `s3.trigger`, `s3.thought`, `s3.feeling`, `s3.action`, `s3.partner`, `s3.end` (1–6) · „Mój udział” `s3.1`–`s3.4` · `s3.o1`–`s3.o3`.
- Część 4: `s4.1`–`s4.4`, `s4.o1`. Część 5: `s5.1`–`s5.5`, `s5.o1`. Część 6: `s6.1`–`s6.3`, `s6.o1`.
- Część 7: `s7.1`–`s7.6`, `s7.o1`, `s7.o2`. Część 8: `s8.1`–`s8.5`, `s8.o1`. Część 9: `s9.o1`–`s9.o4`.
- Część 10: `s10.1`–`s10.4`, `s10.position`, `s10.partner_position`, `s10.o1`, `s10.o2`. Oświadczenie: `d.statement`.

### Różnice M/K (formy gramatyczne)

sam/sama, atakowany/atakowana, zadowolony/zadowolona, winny/winna, gotowy/gotowa, wyczerpany/wyczerpana, rozdarty/rozdarta (w obu kierunkach), zdecydowałem/zdecydowałam, poczułeś/poczułaś, powiedziałeś/powiedziałaś, zacząłeś/zaczęłaś, byłeś/byłaś; partnerka/partner (z odmianą: partnerki/partnera, niej/nim, ona/on, nią/niego, jej/jego), „jako partnera/partnerki i rodzica”. Kolejność i liczba pozycji identyczne.

### Tagi analityczne (wg wytycznych 03, rozdz. 7)

`reversed` (Cz. 2 pyt. 3–8, Cz. 7 pyt. 2–3, Cz. 10 pyt. 4), `criticism` (2.3, 2.4), `contempt` (2.5), `defensiveness` (2.6), `stonewalling` (2.7), `repair` (2.9), `emotional-safety` (4.3), `anxiety` (5.2, 5.4), `avoidance` (5.3), `boundaries-respected` (6.2), `child-witness` (7.2), `child-triangulation` (7.3), `overload` (8.1, 8.2), `sleep` (8.3), `readiness` (10.1–10.3), `exhaustion` (10.4), `partner-perspective`, `risk-trigger`.

---

## PDF 01 i 02 – kwestionariusze dla pary (NIE DOSTARCZONE)

Szablony `couple_male` / `couple_female` istnieją, żeby można było przeprowadzić pełny scenariusz audytu pary, ale są **wersją roboczą** (`needs_verification = true`):

- zawierają te same pozycje co wersja indywidualna, **bez** pytań specyficznych dla przychodzenia samemu (`sit.why_alone`, `sit.refusal_reason`) – razem 92 pozycje;
- akapity „Zanim zaczniesz” dla pary zostały napisane na podstawie wytycznych 03 (rozdz. 2–3) i **wymagają porównania z PDF**;
- każda pozycja ma w polu `source.note` informację „Brak PDF 01/02 – pozycja przeniesiona z wersji indywidualnej”.

### Elementy wymagające ręcznej weryfikacji

1. Wytyczne 03 (rozdz. 7) odwołują się w Części 2 do **pyt. 9–10 jako zasobów i pyt. 10 jako naprawy** – w wersji indywidualnej naprawa to pyt. 9. Wersja dla pary ma więc prawdopodobnie 10 pozycji w Części 2. Brakującej pozycji **nie dopisano**, bo nie znamy jej brzmienia.
2. Wytyczne wskazują dla Części 3 „proporcję nacisku i wycofania” – sugeruje to skalę nacisku/wycofania w wersji dla pary. **Nie dopisano.** Analiza w panelu korzysta z tagów, więc po dodaniu pozycji z tagami `push`/`withdraw` wystarczy rozszerzyć `src/lib/analysis.ts`.
3. Wytyczne 03 (rozdz. 7) odwołują się w Części 7 do **pyt. 4–5 jako odwróconych i pyt. 6** – numeracja może się różnić od wersji indywidualnej.
4. Treść ekranu „Zanim zaczniesz” i oświadczenia dla pary.
5. Numery stron (`source.page = 0`).

Procedura: *Panel → Kwestionariusze → Para – on/ona → Nowa wersja (szkic)* → popraw/dodaj pozycje → zaznacz „Treść porównana ze źródłem” → *Opublikuj*. Istniejące sprawy zachowają swoją wersję.

---

## PDF 03 – Wytyczne dla psychologa → panel

| Rozdział | Implementacja |
|---|---|
| 1. Cel audytu | landing, FAQ, zastrzeżenia w raporcie |
| 2. Konfiguracje zgłoszeń | rodzaje spraw (para / indywidualnie), wersje kwestionariuszy, porównanie, sygnał asymetrii gotowości |
| 3. Przed sesją | status „wymaga pilnego przeglądu przed sesją” (pyt. 1–4, 7), porównanie z rozbieżnościami, poufność wobec drugiej osoby, części indywidualne w harmonogramie |
| 4. Warunki sesji online | lista kontrolna w etapie „Kontrakt i bezpieczeństwo” trybu sesji; brak nagrywania |
| 5. Przebieg sesji | harmonogramy 60 i 90 min (`src/lib/session-plan.ts`), zegar, ostrzeżenie przed informacją zwrotną, przypomnienie o przerwaniu części wspólnej przy sygnałach przemocy |
| 6. Pytania pogłębiające | przypisane do etapów sesji |
| 7. Interpretacja | `src/lib/analysis.ts` – sygnały do pogłębienia z odwołaniem do pytań, porównanie „dwie perspektywy”, bez norm i wyników; średnia gotowości opisana jako pomocnicza i niediagnostyczna |
| 8–9. Czerwone flagi, kierowanie | ramka pomocy, status przeglądu ryzyka, ścieżka bezpieczeństwa w raporcie |
| 10. Wybór ścieżki | trzy ścieżki + „na razie bez dalszej pracy”; blokada terapii par/programu/mediacji przy sygnałach zagrożenia; termin raportu w etapie „Zamknięcie” |
| 11. Audyt indywidualny | pytania pogłębiające w harmonogramie 60 min; raport: kolumna „Partner/partnerka – w perspektywie uczestnika”, zastrzeżenie o jednostronnej perspektywie |
| 12. Zasady etyczne | zasada sekretów w karcie sprawy, brak automatycznego łączenia treści, brak ocen osoby nieobecnej |
| Ramka „Bezpieczeństwo i pilna pomoc” | `DEFAULT_SETTINGS.helplines` (edytowalne), `SafetyBox` |

## PDF 04 – Szablon raportu → generator

Wszystkie części: metadane (imię i nazwisko, wiek; data sesji; rodzaj; forma 60/90 min; psycholog), 1. Podsumowanie (+ powód zgłoszenia, etap decyzji), 2. Mocne strony, 3. Obszary napięcia (6 obszarów, opis + nasilenie niskie/umiarkowane/wysokie wybierane przez specjalistę), 4. Mechanizm konfliktu (cykl w jednym zdaniu; tabela: wyzwalacz, myśl automatyczna, emocja pod spodem, zachowanie na zewnątrz, niezaspokojona potrzeba; wzorce: krytyka, pogarda, defensywność, wycofanie; komentarz; próby naprawy), 5. Rekomendacje + rekomendowana ścieżka z formami pomocy + uzasadnienie, 6. Następne kroki (krok / kto / kiedy), „Ważne” (zastrzeżenia + akapit dla audytu indywidualnego + numery pomocy). Kod: `src/lib/report.ts`.

## PDF 07 – Ścieżka klienta → landing i raport

Etapy (zgłoszenie → kwestionariusz → sesja 60/90 → ocena i rekomendacja) rozszerzone o lejek DUO® (quiz → rozmowa telefoniczna → płatność i kwestionariusz → sesja → raport). Ścieżki A (terapia par, program odbudowy relacji), B (konstruktywny rozwód, opcjonalnie mediacja, terapia po rozstaniu), C (plan bezpieczeństwa, pomoc specjalistyczna, bez terapii par i mediacji) oraz zdanie „Rekomendacja jest propozycją. Decyzja o dalszej drodze zawsze należy do Ciebie.”

## Zmiany wprowadzone na prośbę właściciela usługi (odstępstwa od PDF)

- **Nazwa produktu**: „Audyt Relacji” → „Mapa Relacji” we wszystkich treściach dla klienta (kwestionariusze, zgody, podsumowanie); „audyt” → „konsultacja”.
- **Czas wypełniania**: „około 15-25 minut” zamiast „40-60 minut” (akapit „Zanim zaczniesz”, ekran powitalny, landing).
- **Dzieci (liczba i wiek)**: pole typu „lista dzieci” – imię i wiek każdego dziecka, z opcją „nie mamy dzieci”.
- **„Czy macie dzieci, których dotyczy ta sytuacja?”** (Twoja sytuacja, pyt. 2): wyświetlane tylko, gdy w metryczce wpisano dzieci (nie powtarzamy pytania osobom bez dzieci).
- Zmiany treści w kodzie są publikowane automatycznie jako nowa wersja szablonu przy wdrożeniu (`seedTemplate`, odcisk `source_hash`); sprawy założone wcześniej zachowują swoją wersję. Jeśli administrator edytował szablon w panelu, zmiany z kodu nie są nadpisywane (komunikat w logach).

## Decyzje i niejednoznaczności

- **Numeracja**: w PDF pytania otwarte w każdej części mają osobną numerację „1.” (osobne listy). W aplikacji numer wyświetlany jest tylko przy skalach i przesiewie (na nie powołują się wytyczne); klucze pytań zachowują jednoznaczność.
- **Pyt. warunkowe** „Jeśli partner(ka) nie chce uczestniczyć…” pokazywane tylko po wyborze tej odpowiedzi – brzmienie bez zmian.
- **„Nie dotyczy”** dodane jawnie przy pozycjach dotyczących dziecka (Cz. 7, poza pyt. 1 o podział obowiązków) i „Dzieci (liczba i wiek)” – PDF zawiera tę możliwość pośrednio (pytanie „Czy macie dzieci”).
- **Zgoda i podpis** zastąpione elektronicznym rejestrem zgód (wersja tekstu, data). Klauzula informacyjna z PDF jest domyślną treścią w ustawieniach z polem `{administrator}` – do zatwierdzenia przez prawnika/IOD.
- **„Wolę omówić na sesji”** – wyłącznie w przesiewie (tak jak w PDF). Pozostałe pytania nie są wymagane technicznie (poza zgodą, imieniem i nazwiskiem, krajem/miastem i oświadczeniem), więc wrażliwych treści nie trzeba ujawniać, by przekazać kwestionariusz.
