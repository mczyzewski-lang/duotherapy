# Mapa Relacji – lejek, pomiar i testy

## Ścieżka klienta

```
Reels / reklama (UTM) ─► strona główna (/) ─► „Sprawdź, gdzie dziś jesteście”
   ─► quiz /start: 6 pytań, jedno na ekran, automatyczne przejście (ok. 2 min)
   ─► wstępne podsumowanie (parafraza odpowiedzi – bez ocen i prognoz)
   ─► „Porozmawiajmy o Twojej Mapie Relacji”: imię + telefon (+ e-mail, pora – opcjonalnie)
   ─► potwierdzenie ─► CRM (panel → Zgłoszenia) ─► telefon konsultanta ─► zakup
   ─► sprawa: kwestionariusze ─► konsultacja z psychologiem ─► Mapa Relacji (podsumowanie sesji)
```

## Zdarzenia (pierwszopartyjne, tabela `funnel_events`)

| Zdarzenie | Kiedy | Skąd |
|---|---|---|
| `landing_view` | wejście na stronę główną | przeglądarka |
| `hero_cta_click` | klik „Zacznij od 6 krótkich pytań” w hero | przeglądarka |
| `sticky_cta_click` | klik przyklejonego CTA na telefonie (pojawia się po przewinięciu hero) | przeglądarka |
| `sample_report_open` | otwarcie przykładowej Mapy Relacji (`/mapa-relacji-przyklad`) | przeglądarka |
| `quiz_started` | otwarcie quizu | przeglądarka |
| `quiz_step_completed` | odpowiedź na pytanie N (tylko numer kroku) | przeglądarka |
| `quiz_completed` | po 6. pytaniu | przeglądarka |
| `lead_form_viewed` | formularz telefonu pojawił się na ekranie | przeglądarka |
| `lead_submitted` | zgłoszenie **faktycznie zapisane** w bazie | serwer |
| `lead_submission_error` | błąd walidacji lub wysyłki | przeglądarka |

Zapisywane pola: nazwa zdarzenia, numer kroku, wariant A/B, `utm_source/medium/campaign`, ścieżka, losowy identyfikator sesji (`sessionStorage`, znika po zamknięciu karty). **Nigdy** treść odpowiedzi, imię, telefon ani IP. Do Meta Pixel / Google Analytics nic nie jest wysyłane (te skrypty nie są zainstalowane).

Pomiar można wyłączyć: *Ustawienia → Strona i lejek → Pomiar lejka*.

## Dalsze etapy (CRM i sprawy)

| Etap | Gdzie |
|---|---|
| Lead contacted | Zgłoszenia → „Próba kontaktu” |
| Conversation completed | „Rozmowa odbyta” |
| Mapa Relacji offered | „Mapa Relacji zaproponowana” |
| Mapa Relacji purchased | „Mapa Relacji opłacona” |
| Consultation completed | sprawa: zakończona sesja |
| Report delivered | sprawa: udostępnione podsumowanie |

Panel **Lejek** (`/app/funnel`, menu „Lejek”, administrator) pokazuje metryki 1–5 dla 7/30/90 dni, porównanie wariantów A/B (także klik w przyklejone CTA i otwarcia przykładowej Mapy), odpływ na pytaniach, źródła UTM (leady → rozmowy → sprzedaże), przychód z faktycznie wpisanych kwot oraz kalkulator CAC, zwrotu z reklamy i marży (6–7).

**Wartość sprzedaży**: w karcie zgłoszenia (Etap i termin rozmowy) konsultant wpisuje faktyczną kwotę zakupu. Panel Lejek liczy z niej przychód i średnią sprzedaż (używaną jako cena w kalkulatorze, jeśli nie wpiszesz innej). Dodzwanialność = etap „Próba kontaktu” → „Rozmowa odbyta”.

## Test A/B hero

Nagłówek jest wspólny: „Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.” Warianty różnią się rozwinięciem:

- A – nacisk na emocjonalny problem („Może chcesz jeszcze spróbować…”) + jedno zdanie o wartości,
- B – nacisk na konkretną wartość: zdanie o Mapie Relacji + trzy elementy usługi (kwestionariusz, konsultacja, pisemne podsumowanie).

Wariant losuje `src/middleware.ts` (50/50) i zapamiętuje w ciasteczku `duo_hero2` na 90 dni (od 2.11.2026 – zmiana nazwy ciasteczka rozlosowała odwiedzających od nowa; zdarzenia sprzed tej daty dotyczą starych nagłówków). Podgląd: `/?hero=A` lub `/?hero=B`. Wariant trafia do zdarzeń i do zgłoszenia. Wnioski wyciągaj dopiero przy kilkuset wejściach na wariant – i patrz na sprzedaże, nie tylko na leady.

## Przykładowa Mapa Relacji

Sekcja „Co otrzymasz” na stronie i strona `/mapa-relacji-przyklad` pokazują **rzeczywistą strukturę podsumowania** (te same sekcje i ten sam szablon `renderReportHtml`, który generuje PDF dla klienta) wypełnioną danymi fikcyjnymi z `src/lib/report-sample.ts`. Treść jest wyraźnie oznaczona jako przykład, strona ma `noindex`. Test jednostkowy pilnuje, żeby przykład był kompletny (bez znaczników „do uzupełnienia”). Zmiana struktury podsumowania automatycznie zmienia przykład.

## Linki z UTM

Przykład dla Reelsa: `https://<domena>/?utm_source=instagram&utm_medium=reels&utm_campaign=mapa_relacji_listopad`. Parametry są zapamiętywane w sesji przeglądarki i zapisywane przy zgłoszeniu (widoczne w karcie zgłoszenia i w panelu Lejek).

## Dane zgłoszenia

`leads`: imię, telefon (znormalizowany do +48…), e-mail i pora kontaktu (opcjonalnie), segment z pytania 1, forma pierwszego kroku (pyt. 6), UTM, wariant, rejestr zgód (kontakt – wymagana; marketing – osobna, opcjonalna). Pełne odpowiedzi z quizu są **szyfrowane** (`quiz_enc`) i widoczne wyłącznie dla zespołu w karcie zgłoszenia.

Ochrona: walidacja telefonu, pułapka na boty (ukryte pole + minimalny czas wypełnienia), limit 5 zgłoszeń/h z adresu, RLS (rola publiczna może tylko dopisać zgłoszenie – bez odczytu).

## Wymaga danych biznesowych lub decyzji

- **Cena i warianty** Mapy Relacji – *Ustawienia → Strona i lejek* (cena indywidualna i dla pary). Po wpisaniu pojawią się w karcie „Cena” w sekcji „Jak to działa” i pod FAQ. Do tego czasu strona mówi uczciwie: „cenę przedstawi konsultant”. Nie publikujemy widełek 500–1000 zł, dopóki nie odpowiadają one konkretnym wariantom.
- **FAQ** – domyślna treść jest w kodzie (`src/lib/settings.ts`). Jeśli sekcja „Strona i lejek” została kiedyś zapisana w panelu, strona pokazuje FAQ z bazy – wtedy nowe pytania trzeba wkleić w Ustawieniach.
- **Referencje klientów** – na stronie nie ma opinii ani ocen. Jeśli DUO ma prawdziwe opinie z pisemną zgodą na publikację, najlepsze miejsce to pod sekcją „Kto pomaga” (cytat + imię lub inicjał, bez szczegółów sytuacji).
- **Czas oddzwonienia** – tylko jeśli jest realnie gwarantowany (*Czas oddzwonienia*); bez tego nie podajemy terminu.
- **Program „Odbudowa Więzi”, konsultacje decyzyjne** – nazwy pokazane jako możliwe dalsze wsparcie; potwierdź, że usługi istnieją, i uzupełnij linki/opis, gdy będą gotowe.
- **Droga rozstania** – landing nie wymienia Nowego Etapu; mówi tylko, że pomagamy wskazać najlepszą drogę rozstania lub rozwodu. Jeśli konsultant lub psycholog proponuje ofertę Nowego Etapu (marka powiązana), powinien przy tym poinformować o powiązaniu marek i dobrowolności – treść do zatwierdzenia (prawnik).
- **Konsultant DUO** – kto dzwoni (rola, scenariusz rozmowy w karcie zgłoszenia), w jakich godzinach.
- **Domena maparelacji.pl** – wystarczy podpiąć jako kolejną domenę usługi (Railway → Networking → Custom Domain) i ustawić `APP_URL`.
- **Wydatki reklamowe i koszt realizacji** – do kalkulatora CAC/marży w panelu Lejek.
- **Prawne (przed startem kampanii)**: podstawa i treść zgody na kontakt telefoniczny w sprawie oferty, przechowywanie odpowiedzi z quizu (zakres, okres, DPIA), informacja o pierwszopartyjnym pomiarze i ciasteczku A/B w polityce prywatności (ocena, czy wymagana jest zgoda na podstawie art. 173 Prawa telekomunikacyjnego / PKE).
