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
| `hero_cta_click` | klik „Sprawdź, gdzie dziś jesteście” w hero | przeglądarka |
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

Panel **Lejek** (`/app/funnel`, menu „Lejek”, administrator) pokazuje metryki 1–5 dla 7/30/90 dni, porównanie wariantów A/B, odpływ na pytaniach, źródła UTM (leady → rozmowy → sprzedaże) oraz kalkulator CAC i marży (6–7) z wpisanych wydatków, ceny i kosztu realizacji.

## Test A/B nagłówka

- A: „Nie wiesz, co dalej z Waszą relacją?”
- B: „Ratować związek, dać sobie czas czy się rozstać? Zacznij od zrozumienia.”

Wariant losuje `src/middleware.ts` (50/50) i zapamiętuje w ciasteczku `duo_hero` na 90 dni. Podgląd: `/?hero=A` lub `/?hero=B`. Wariant trafia do zdarzeń i do zgłoszenia (widoczny w CRM). Wnioski wyciągaj dopiero przy kilkuset wejściach na wariant.

## Linki z UTM

Przykład dla Reelsa: `https://<domena>/?utm_source=instagram&utm_medium=reels&utm_campaign=mapa_relacji_listopad`. Parametry są zapamiętywane w sesji przeglądarki i zapisywane przy zgłoszeniu (widoczne w karcie zgłoszenia i w panelu Lejek).

## Dane zgłoszenia

`leads`: imię, telefon (znormalizowany do +48…), e-mail i pora kontaktu (opcjonalnie), segment z pytania 1, forma pierwszego kroku (pyt. 6), UTM, wariant, rejestr zgód (kontakt – wymagana; marketing – osobna, opcjonalna). Pełne odpowiedzi z quizu są **szyfrowane** (`quiz_enc`) i widoczne wyłącznie dla zespołu w karcie zgłoszenia.

Ochrona: walidacja telefonu, pułapka na boty (ukryte pole + minimalny czas wypełnienia), limit 5 zgłoszeń/h z adresu, RLS (rola publiczna może tylko dopisać zgłoszenie – bez odczytu).

## Wymaga danych biznesowych lub decyzji

- **Cena i warianty** Mapy Relacji – *Ustawienia → Strona i lejek* (pojawią się w FAQ). Do tego czasu strona mówi uczciwie: „koszt przedstawi konsultant”.
- **Czas oddzwonienia** – tylko jeśli jest realnie gwarantowany (*Czas oddzwonienia*); bez tego nie podajemy terminu.
- **Program „Odbudowa Więzi”, konsultacje decyzyjne, oferta Nowego Etapu** – nazwy pokazane jako możliwe dalsze wsparcie; potwierdź, że usługi istnieją, i uzupełnij linki/opis, gdy będą gotowe.
- **Powiązanie DUO – Nowy Etap** – treść informacji o powiązaniu marek do zatwierdzenia (prawnik); obecnie: marka powiązana, skorzystanie dobrowolne, bez wpływu na rekomendacje psychologa.
- **Konsultant DUO** – kto dzwoni (rola, scenariusz rozmowy w karcie zgłoszenia), w jakich godzinach.
- **Domena maparelacji.pl** – wystarczy podpiąć jako kolejną domenę usługi (Railway → Networking → Custom Domain) i ustawić `APP_URL`.
- **Wydatki reklamowe i koszt realizacji** – do kalkulatora CAC/marży w panelu Lejek.
- **Prawne (przed startem kampanii)**: podstawa i treść zgody na kontakt telefoniczny w sprawie oferty, przechowywanie odpowiedzi z quizu (zakres, okres, DPIA), informacja o pierwszopartyjnym pomiarze i ciasteczku A/B w polityce prywatności (ocena, czy wymagana jest zgoda na podstawie art. 173 Prawa telekomunikacyjnego / PKE).
