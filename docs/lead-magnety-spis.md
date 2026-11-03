# Lead magnety DUO – spis dla agenta

Kontekst: DUO® to terapia par i osób w kryzysie związku. Płatny produkt to **Mapa Relacji** (670 zł jednorazowo:
kwestionariusz + konsultacja online z psychologiem + pisemne podsumowanie). Lead magnety („Wiedza”) to 10 bezpłatnych
materiałów, które zbierają e-maile i prowadzą – delikatnie, bez presji – do Mapy Relacji.

## Lista (10 materiałów)

| # | ID | Slug (adres `/wiedza/<slug>`) | Nazwa | Kategoria | Forma | Czas |
|---|----|------|-------|-----------|-------|------|
| 1 | lm01 | `mapa-trzech-drog` | Mapa 3 dróg | Zrozumienie i decyzje | Poradnik i workbook | ok. 25 min + ćwiczenia |
| 2 | lm02 | `21-pytan-o-relacji` | 21 pytań o relacji | Zrozumienie i decyzje | Karty do rozmowy i workbook | 15 min na start |
| 3 | lm03 | `kryzys-czy-koniec-milosci` | Kryzys czy koniec miłości? | Zrozumienie i decyzje | Workbook | ok. 30 min |
| 4 | lm04 | `7-dni-lepszych-rozmow` | 7 dni lepszych rozmów | Rozmowa i odbudowa | Wyzwanie 7 dni (online i PDF) | 10–20 min dziennie |
| 5 | lm05 | `trudna-rozmowa` | Trudna rozmowa bez kłótni | Rozmowa i odbudowa | Checklista i scenariusz | ok. 20 min |
| 6 | lm06 | `partner-nie-chce-ratowac-zwiazku` | Gdy tylko jedna osoba chce ratować związek | Rozmowa i odbudowa | Poradnik z ćwiczeniem | ok. 25 min |
| 7 | lm07 | `petla-konfliktu` | Pętla konfliktu | Rozmowa i odbudowa | Workbook z arkuszem | ok. 20 min |
| 8 | lm08 | `po-zdradzie` | Pierwsze kroki po zdradzie | Trudne sytuacje | Przewodnik z ćwiczeniem | ok. 25 min |
| 9 | lm09 | `swiadome-rozstanie` | Świadome rozstanie – co teraz? | Trudne sytuacje | Checklista i poradnik | ok. 30 min |
| 10 | lm10 | `przykladowa-mapa-relacji` | Przykładowa Mapa Relacji | Zrozumienie i decyzje | Przykładowy raport (dane fikcyjne) | ok. 10 min |

## Każdy materiał w skrócie

1. **Mapa 3 dróg** – „Ratować związek, dać sobie czas czy się rozstać?” Trzy możliwe kierunki (odbudowa / czas na decyzję /
   świadome rozstanie) i pytania przed decyzją. Dla osób, którym myśli o związku krążą w kółko. Podsumowanie: „swoją Mapę 3 dróg”.
2. **21 pytań o relacji** – pytania do rozmowy lub refleksji w 5 obszarach (komunikacja, bliskość, zaufanie, …). Dla osób,
   które nie wiedzą, od czego zacząć rozmowę. Podsumowanie: „swoje odpowiedzi na 21 pytań”.
3. **Kryzys czy koniec miłości?** – 10 pytań do autorefleksji + ćwiczenia (moje trudności, niezaspokojone potrzeby). Dla osób,
   które nie wiedzą, czy to „koniec”, czy trudny okres. Podsumowanie: „swoje myśli – kryzys czy koniec miłości”.
4. **7 dni lepszych rozmów** – jedno małe ćwiczenie dziennie przez 7 dni (słuchanie, potrzeby, docenianie, …). Opcjonalna
   codzienna seria e-mail (zgoda „seria”). Większość ćwiczeń można robić samodzielnie. Podsumowanie: „swój tydzień lepszych rozmów”.
5. **Trudna rozmowa bez kłótni** – plan rozmowy krok po kroku: dobry moment, przygotowanie, przerwa, zakończenie.
   Podsumowanie: „swój plan trudnej rozmowy”.
6. **Gdy tylko jedna osoba chce ratować związek** – na co masz wpływ, czego nie brać na siebie, granice; arkusz „moja
   odpowiedzialność / odpowiedzialność partnera”. Podsumowanie: „swoją mapę wpływu”.
7. **Pętla konfliktu** – cykl konfliktu w 7 krokach (wyzwalacz → interpretacja → emocje → reakcja → reakcja drugiej osoby
   → eskalacja → punkt przerwania) i arkusz do wypełnienia. Podsumowanie: „swoją pętlę konfliktu”.
8. **Pierwsze kroki po zdradzie** – przewodnik: emocje pierwszych dni, checklista bezpieczeństwa i wsparcia, granice,
   bez presji natychmiastowej decyzji. Podsumowanie: „swoje pytania i potrzeby”.
9. **Świadome rozstanie – co teraz?** – checklista po decyzji o rozstaniu: sprawy emocjonalne, rodzinne (dzieci),
   organizacyjne. Podsumowanie: „swoją checklistę rozstania”.
10. **Przykładowa Mapa Relacji** – materiał specjalny (`special: "sample-report"`): prawdziwy szablon podsumowania na
    fikcyjnych danych (Anna i Marek), renderowany tym samym generatorem co raporty klientów. Bez pól do uzupełnienia.

## Adresy (dla każdego slugu)

- `/wiedza` – strona zbiorcza z filtrem kategorii; `/wiedza/<slug>` – landing materiału (hero z okładką, podgląd fragmentu
  z rozmyciem, „Dla kogo”, formularz `#odbierz`, sticky bar „Pobierz bezpłatnie”).
- `/wiedza/<slug>/demo` – pełny podgląd bez e-maila; pola zapisują się tylko w przeglądarce; „Podsumuj moje odpowiedzi”
  → `/wiedza/<slug>/demo/podsumowanie`.
- `/wiedza/<slug>/material` – wersja po zapisie: pola z autozapisem przypisanym do e-maila (ciasteczko `duo_cl`);
  „Podsumuj …” → `/wiedza/<slug>/podsumowanie`.
- `/wiedza/<slug>/pdf` – PDF (Playwright z `/wiedza/<slug>/druk`), `/wiedza/<slug>/otworz?t=…` – link z e-maila.
- `/start?dolacz=<slug>` – quiz Mapy Relacji z opcjonalnym dołączeniem odpowiedzi z materiału do zgłoszenia.
- `/wiedza-okladki/<slug>` – zdjęcie okładki z bazy (generowane w panelu).
- Wszystko poza `/wiedza` i `/wiedza/<slug>` jest `noindex`.

## Jak działa lejek

1. Formularz na landingu: imię i e-mail (wymagane; reszta pojawia się po wpisaniu kompletnego e-maila), „Jesteśmy: parą / małżeństwem”, „Dzieci: mamy / nie mamy” (wymagane)
   i jedna wymagana zgoda (materiał + wiadomości e-mail; przy lm04 obejmuje codzienne ćwiczenia przez 7 dni).
   Zapis w `content_leads`; materiał wysyłany e-mailem (Resend, zapasowo SMTP) albo dostępny od razu na stronie.
2. Kontakt w mailingu (`mail_contacts`) dostaje tag `#lm-<slug>` (np. `#lm-po-zdradzie`), `#para` albo `#malzenstwo`,
   `#dzieci` albo `#bez-dzieci`, `#seria-7-dni`, później `#quiz` i `#klient`. Ścieżka „Przed zakupem → Mapa Relacji” (e-maile n1–n8) idzie tylko do osób ze zgodą marketingową;
   część e-maili ma warunki tagów (np. n5 tylko `#lm-po-zdradzie`, n4 tylko tagi rozstania/kryzysu).
3. Odpowiedzi z materiału → podsumowanie → quiz `/start?dolacz=<slug>` → zgłoszenie z dołączonym podsumowaniem
   (psycholog widzi je w panelu: Zgłoszenia).
4. Minimum do podsumowania: min. 1 odpowiedź w każdej z pierwszych 3 części materiału z polami.

## Gdzie co jest w kodzie

- Treści: `src/knowledge/materials/{decyzje,rozmowa,trudne}.ts` (bloki: h2, p, question, exercise, columns, day,
  checklist, loopBlank, …); rejestr i kategorie: `src/knowledge/registry.ts`; typy: `src/knowledge/types.ts`.
- Okładki (cytat, nastrój, projekt zdjęcia `photoBrief`, nazwa podsumowania): `src/knowledge/covers.ts`.
- Pola i podsumowania: `src/knowledge/fields.ts`; renderer (ekran/druk): `src/components/knowledge/doc.tsx`.
- Landing: `src/app/wiedza/[slug]/page.tsx`; e-mail z materiałem: `src/knowledge/emails.ts`.
- Mailing/nurturing: `src/lib/mailing.ts`, domyślne e-maile `src/lib/mailing-defaults.ts`, panel `/app/mailing`.
- Panel materiałów i okładek: `/app/wiedza` (statystyki, zapisy, generowanie okładek przez OpenAI).
- Dokumentacja szczegółowa: `docs/wiedza-lead-magnety.md`, `docs/mailing-nurturing.md`, `docs/okladki-materialow.md`.

## Zasady (obowiązkowe)

- Treści edukacyjne – bez diagnoz, bez obietnic efektów, bez fikcyjnych opinii, źródeł i danych specjalistów,
  bez sztucznej presji czasu. Przykłady tylko na danych fikcyjnych.
- Nazwy pobranego materiału **nie** przesyłamy do pikseli reklamowych ani zewnętrznej analityki (w analityce tylko numer 1–10
  i ścieżka `/wiedza/*`); do Resend trafia tylko adres, temat i treść e-maila.
- Typografia: półpauza „–”, nigdy pauza (pilnuje test `tests/unit/typography.test.ts`); polskie cudzysłowy „…”.
- Nie publikować na produkcji i nie wysyłać wiadomości do prawdziwych kontaktów bez zatwierdzenia właściciela.
