# „Wiedza” – system 10 bezpłatnych materiałów (lead magnetów)

## Adresy

| # | Materiał | Landing | Pełny podgląd (noindex) | PDF |
|---|---|---|---|---|
| 1 | Mapa 3 dróg | `/wiedza/mapa-trzech-drog` | `/wiedza/mapa-trzech-drog/demo` | `/wiedza/mapa-trzech-drog/pdf` |
| 2 | 21 pytań o relacji | `/wiedza/21-pytan-o-relacji` | `…/demo` | `…/pdf` |
| 3 | Kryzys czy koniec miłości? | `/wiedza/kryzys-czy-koniec-milosci` | `…/demo` | `…/pdf` |
| 4 | 7 dni lepszych rozmów | `/wiedza/7-dni-lepszych-rozmow` | `…/demo` | `…/pdf` |
| 5 | Trudna rozmowa bez kłótni | `/wiedza/trudna-rozmowa` | `…/demo` | `…/pdf` |
| 6 | Gdy tylko jedna osoba chce ratować związek | `/wiedza/partner-nie-chce-ratowac-zwiazku` | `…/demo` | `…/pdf` |
| 7 | Pętla konfliktu | `/wiedza/petla-konfliktu` | `…/demo` | `…/pdf` |
| 8 | Pierwsze kroki po zdradzie | `/wiedza/po-zdradzie` | `…/demo` | `…/pdf` |
| 9 | Świadome rozstanie – co teraz? | `/wiedza/swiadome-rozstanie` | `…/demo` | `…/pdf` |
| 10 | Przykładowa Mapa Relacji | `/wiedza/przykladowa-mapa-relacji` | `…/demo` | `…/pdf` |

Strona zbiorcza: `/wiedza` (filtr kategorii). Wersja online po zapisie: `/wiedza/<slug>/material` (noindex). Wydrukowane PDF-y do przejrzenia: `docs/materialy/DUO-<slug>.pdf`.

## Architektura (jedno źródło treści)

- `src/knowledge/materials/*.ts` – treść każdego materiału jako lista bloków (nagłówki, pytania, ćwiczenia, tabele, dni wyzwania, dialogi, checklisty, diagramy). To jedyne źródło.
- `src/knowledge/registry.ts` – rejestr: kolejność, kategorie, ikony, SEO, „co otrzymasz”, „dla kogo”, fragmenty do podglądu, teksty CTA i 3 wiadomości.
- `src/components/knowledge/doc.tsx` – jeden renderer bloków: wersja online, `/demo`, fragmenty na landingu i wersja do druku `/wiedza/<slug>/druk`.
- PDF = wydruk strony `/druk` przez Chromium (`src/lib/material-pdf.ts`), buforowany według skrótu treści. Zmiana treści automatycznie daje nowy PDF.
- Przykładowa Mapa Relacji (nr 10) – renderowana **prawdziwym generatorem podsumowań** (`renderReportHtml`) z danymi fikcyjnymi, z wprowadzeniem o ograniczeniach; `/demo` i `/material` są przepisane w `next.config.ts` na `/mapa-relacji-przyklad/[view]`.
- Nowy, jedenasty materiał: plik z treścią + wpis w `MAGNETS` (+ ikona w `src/components/knowledge/icons.tsx`, jeśli nowa). Landing, demo, PDF, menu, sitemap i panel działają automatycznie.

## Menu „Wiedza”

Desktop: przycisk w nawigacji (klik lub najechanie myszą), panel w trzech kolumnach-kategoriach, ikony w stylu znaku Mapy Relacji, krótka nazwa i jedno zdanie, na dole „Zobacz wszystkie materiały”. Esc zamyka i wraca do przycisku, klik poza panelem zamyka, dotyk działa bez najechania.
Telefon: przycisk menu (hamburger) → linki strony + rozwijana sekcja „Wiedza” z kategoriami.

## Zapis e-maila i zgody

- Formularz: imię (opcjonalne), e-mail (wymagany). Pobranie **nie zależy** od zgody marketingowej.
- Osobne, domyślnie niezaznaczone pola: zgoda marketingowa (treść z briefu) i – tylko przy wyzwaniu 7 dni – zgoda na codzienne ćwiczenia e-mailem.
- Zapis w tabeli `content_leads` (osobno od „Zgłoszeń” – pobranie nie trafia do telefonów sprzedażowych): e-mail, imię, identyfikator materiału (nieopisowy `lm01…lm10`), UTM, data, statusy zgód, status dostarczenia, krok sekwencji.
- Każda zgoda (także informacja o dostarczeniu i wycofanie) w `content_lead_consents` z wersją i pełną treścią tekstu.
- Historia wiadomości: `content_lead_messages` (dostarczenie, sekwencja, dni wyzwania).
- Ochrona: pułapka na boty + minimalny czas wypełnienia, limit 8 zgłoszeń / 10 min z adresu, idempotencja (`request_id` – ponowione żądanie nie tworzy duplikatu ani drugiej wysyłki), ten sam e-mail i materiał w ciągu doby po udanym dostarczeniu – bez ponownej wysyłki.
- Dostęp: zapis tylko przez serwer (rola system), odczyt tylko administrator (Panel → **Wiedza**). Psycholodzy nie widzą tych zapisów. Bez profilu psychologicznego.
- Wypisanie: `/wiedza/wypisz?t=<token>` (link w każdej wiadomości sekwencji), potwierdzane przyciskiem.

## Dostarczanie

- Po zapisie: ekran „Twój materiał jest gotowy” z przyciskami „Otwórz materiał” i „Pobierz PDF”.
- E-mail „Twój bezpłatny materiał DUO: [nazwa]” – wysyłany **tylko gdy skonfigurowano `SMTP_URL`** (+ `SMTP_FROM`). Bez tego status „wysyłka nieskonfigurowana”, a ekran podziękowania nie twierdzi, że e-mail wyszedł.

## Sekwencje (nurturing)

- 3 wiadomości na materiał (rozwinięcie problemu → ćwiczenie → Mapa Relacji), po 2 i kolejnych 3 dniach – **tylko po zgodzie marketingowej**.
- Wyzwanie 7 dni: dni 2–7 codziennie – tylko po osobnej zgodzie (dzień 1 jest w materiale).
- Wysyłka **nie uruchamia się sama**: `POST /api/cron/nurture` z nagłówkiem `Authorization: Bearer <CRON_SECRET>` (min. 24 znaki), przy `NURTURE_ENABLED=true` i skonfigurowanym SMTP. Limit 50 wiadomości na wywołanie. Harmonogram (np. co godzinę) – do ustawienia po akceptacji treści.

## Analityka (pierwszopartyjna)

`knowledge_hub_view`, `lead_magnet_landing_view`, `lead_magnet_form_view`, `lead_magnet_form_started`, `lead_magnet_demo_view`, `lead_magnet_pdf_download`, `mapa_relacji_cta_click` (przeglądarka) oraz `lead_magnet_submitted`, `lead_magnet_delivery_success`, `lead_magnet_delivery_error` (tylko serwer). Numer materiału zapisywany jako krok 1–10, ścieżka jako `/wiedza/*` – bez tytułów (tematy mogą być wrażliwe). Nic nie jest wysyłane do pikseli reklamowych.
Linki do Mapy Relacji z materiałów mają `utm_source=duo_wiedza&utm_campaign=lmXX` – panel **Wiedza** pokazuje per materiał: wejścia → formularz → zapisy → dostarczenie → podgląd/PDF → kliknięcia w Mapę → zakupy Mapy (z kwotą).

## SEO

`/wiedza` i landingi: unikalne title i description, jeden H1, canonical, Open Graph, dane strukturalne `LearningResource`, w `sitemap.xml`. `/demo`, `/material`, `/druk`, `/pdf`: `noindex, nofollow` (meta + nagłówek), poza sitemapą. `robots.txt` wyklucza panel, kwestionariusze, zamówienia i wypisanie. Uwaga: adresy `/demo` są publicznie dostępne dla osoby, która je zna – materiały nie zawierają danych poufnych.

## Wymaga akceptacji merytorycznej psycholożki (wszystkie 10)

Każdy materiał ma oznaczenie `needsReview` (widoczne na `/demo`). Szczególnie:
- **Po zdradzie** – reakcje emocjonalne, granice, przebaczenie a pozostanie w związku.
- **Świadome rozstanie** – rozmowa z dziećmi, mediacja, informacje organizacyjno-prawne (charakter informacyjny).
- **Pętla konfliktu** i **Trudna rozmowa** – przykłady dialogów i opis wzorców (bez diagnozowania stron).
- **Gdy tylko jedna osoba chce ratować związek** – granice, nacisk vs prośba.
- **Kryzys czy koniec miłości?** – rozróżnienie uczucia i satysfakcji, rola przeciążenia.
- Ramki bezpieczeństwa i numery pomocy (112, 116 123, 800 70 2222, 800 120 002) – weryfikacja aktualności.
- Opis kwalifikacji Klaudii na landingach (z zatwierdzonej sekcji „Kto pomaga”). Pisownia nazwiska: na stronie „Bosek”, w briefie „Bosak” – do potwierdzenia.

## Przed publikacją

1. Akceptacja treści przez psycholożkę (powyżej).
2. Teksty zgód i informacji pod formularzem (Ustawienia → Dane prawne) – weryfikacja RODO / PKE; polityka prywatności uzupełniona o materiały i newsletter.
3. `SMTP_URL`, `SMTP_FROM` (adres w domenie DUO z SPF/DKIM) – test wysyłki na własny adres, nie na adresy klientów.
4. Decyzja o sekwencjach: `CRON_SECRET`, `NURTURE_ENABLED=true`, harmonogram wywołania.
5. Dane kontaktowe DUO w Ustawieniach (pojawiają się w stopkach wiadomości).
