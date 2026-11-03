# Film VSL „Mapa Relacji” – scenariusz do nagrania

Prowadząca: **Klaudia** (psycholog DUO). Czas: ok. 4–5 min. Klaudia patrzy w kamerę i mówi bezpośrednio do widza.
Ton: spokojny, osobisty, profesjonalny – rozmowa, nie reklama.

Tekst mówiony jest identyczny z transkrypcją na stronie (`src/lib/vsl-script.ts`). Jeśli przy nagraniu zmienicie słowa, zaktualizujcie ten plik – transkrypcja i napisy muszą odpowiadać nagraniu.

> **Do potwierdzenia przed nagraniem**
> - Nazwisko: w materiałach strony występuje „Klaudia **Bosek**”, w briefie „Bosak”. W filmie pada tylko „Klaudia z DUO”; poprawną pisownię trzeba ujednolicić na stronie.
> - Online sprzedawany jest **wariant indywidualny** (60 min, jeden kwestionariusz) za 670 zł. Wariant dla pary (90 min, dwa kwestionariusze) ustala konsultant – tak mówi też film. Jeśli 670 zł ma obejmować także parę, trzeba zmienić tekst filmu i strony.
> - Kto prowadzi konsultacje kupione online (Klaudia czy także inni psycholodzy) – w filmie Klaudia mówi „przygotowuję”; jeśli konsultacje prowadzą też inne osoby, zmień na „psycholog przygotowuje”.

## Względem briefu zmieniono (zgodność z rzeczywistym produktem)

| Brief | W scenariuszu | Dlaczego |
|---|---|---|
| „wypełniasz szczegółowe kwestionariusze” | „szczegółowy kwestionariusz” + obszary pytań | wariant indywidualny = jeden kwestionariusz (10 części: komunikacja, cykl kłótni, bliskość, zaufanie, granice, obowiązki i dzieci, stres, potrzeby, gotowość do zmiany) |
| [rozwiń opis raportu] | list + 6 części podsumowania | dokładnie sekcje z `renderReportHtml` (szablon 04) |
| „konsultacja z psychologiem” | „online, przez godzinę; znam już Twoje odpowiedzi” | sesja indywidualna = 60 min (`session_minutes`), psycholog czyta kwestionariusz przed sesją |
| „nie będziemy udawać, że znamy uczucia drugiej osoby” | + „w podsumowaniu jasno to zaznaczam” | podsumowanie indywidualne zawiera klauzulę o perspektywie jednej osoby |
| „zamów i wybierz termin, następnie instrukcje” | „wybierz termin konsultacji. Zaraz potem otrzymasz dostęp do kwestionariusza” | tak działa strona zamówienia (rezerwacja → link i kod od razu) |
| cena 670 zł za „cały proces” | + zdanie o wariancie dla pary | jedna cena dotyczy wariantu indywidualnego |

---

## [0:00–0:35] Na początek

**KLAUDIA:**
„Cześć, jestem Klaudia z DUO. Przede wszystkim dziękuję Ci za odpowiedzi na nasze pytania.
Chciałabym powiedzieć Ci coś bardzo ważnego. Jeżeli jesteś teraz w momencie, w którym nie wiesz, czy ratować swoją relację, dać sobie jeszcze czas, czy się rozstać… to nie musisz dzisiaj podejmować tej decyzji.
Bo zanim zdecydujesz, co dalej, warto zrozumieć, co właściwie dzieje się między Wami. I właśnie w tym chcemy Ci pomóc.”

**Montaż:** bliski, spokojny kadr; pierwsze sekundy bez animacji i bez logo. Subtelny napis: „Nie musisz dziś znać wszystkich odpowiedzi”.

## [0:35–1:20] Dlaczego tak trudno zdecydować

**KLAUDIA:**
„Być może znasz to uczucie. Jednego dnia przypominasz sobie wszystko, co dobrego było między Wami. Wasze wspólne chwile, plany, to, co kiedyś Was łączyło. I myślisz: przecież nie chcę tego wszystkiego stracić.
Ale potem przychodzi kolejna kłótnia. Kolejny wieczór bez rozmowy. Albo kolejne rozczarowanie. I zastanawiasz się, czy naprawdę chcesz, żeby tak wyglądały następne lata Twojego życia.
To może być bardzo trudne. Bo można nadal kochać drugiego człowieka i jednocześnie nie być szczęśliwym w obecnej relacji. I można chcieć coś zmienić, ale kompletnie nie wiedzieć, od czego zacząć.
Dlatego samo pytanie »zostać czy odejść?« nie zawsze wystarcza. Najpierw potrzebujemy lepiej zrozumieć sytuację.”

**Montaż:** głównie Klaudia; najwyżej 2–3 spokojne przebitki (dłonie, okno, dwie filiżanki). Bez płaczu, kłótni i ciężkiej muzyki.

## [1:20–1:55] Czym jest Mapa Relacji

**KLAUDIA:**
„Właśnie dlatego stworzyliśmy Mapę Relacji. To proces, w którym z pomocą psychologa możesz przyjrzeć się temu, co dzieje się w Twojej relacji, lepiej zrozumieć najważniejsze trudności i zobaczyć możliwe dalsze kroki.
Nie jest to test, który powie Ci, czy Twój związek powinien się zakończyć. I nie jest to też ktoś, kto podejmie decyzję za Ciebie. Mapa Relacji ma pomóc Ci uporządkować to, co dzisiaj może wydawać się bardzo skomplikowane.”

**Montaż:** pierwszy raz logo „Mapa Relacji” (serce · klepsydra · strzałki, `public/brand/mapa-relacji-znak.svg`). Animacja jak w hero strony: „Tu jesteście dzisiaj” → węzeł Mapy Relacji → trzy drogi (nagranie ekranu strony głównej, sekcja hero).

## [1:55–2:55] Co konkretnie otrzymujesz – NAJWAŻNIEJSZA SEKCJA

**KLAUDIA:**
„Jak to wygląda w praktyce? Najpierw wypełniasz szczegółowy kwestionariusz – w swoim tempie, na prywatnym linku. Pytania dotyczą komunikacji i kłótni, bliskości, zaufania, granic, codziennych obowiązków, stresu, Twoich potrzeb i gotowości do zmiany. Dzięki temu możemy przyjrzeć się Waszej relacji w uporządkowany sposób.
Następnie odbywa się konsultacja z psychologiem – online, przez godzinę. Znam już wtedy Twoje odpowiedzi, więc nie musisz opowiadać wszystkiego od początku. To czas na rozmowę o Twojej sytuacji, potrzebach i trudnościach.
A na koniec powstaje Twoja Mapa Relacji – pisemne podsumowanie, które przygotowuję po rozmowie. Zaczyna się od krótkiego listu, a potem pokazuje: co jest teraz najważniejsze i gdzie jesteś z decyzją; co wspiera Waszą relację; gdzie jest najtrudniej – w sześciu obszarach, od komunikacji po stres i obowiązki; jak działa Wasz konflikt krok po kroku – co go wyzwala, jakie myśli i emocje pojawiają się pod spodem i jaka potrzeba nie jest zaspokojona; moje propozycje na najbliższy czas i możliwą dalszą drogę; a na końcu plan kolejnych kroków: co, kto i kiedy.
Dzięki temu po zakończeniu procesu masz nie tylko wspomnienie rozmowy. Masz też materiał – online i w PDF – do którego możesz wracać i który może pomóc Ci spokojniej zastanowić się nad przyszłością swojej relacji.”

**Montaż (wyłącznie dane demonstracyjne):**
1. Kwestionariusz: nagranie ekranu konta DEMO (`/q/...` w sprawie demonstracyjnej) – ekran powitalny „To bezpieczna przestrzeń”, jedno pytanie ze skalą, pasek postępu.
2. Przebieg: 4 kroki (kwestionariusz → konsultacja → podsumowanie → kolejne kroki) – plansza w kolorach DUO.
3. Przykładowa Mapa Relacji: `/mapa-relacji-przyklad` (prawdziwy szablon, dane fikcyjne Anna i Marek – widoczny znak „PRZYKŁAD · DANE FIKCYJNE”).
4. Powiększenia (2–3): tabela „Jak działa Wasz konflikt” (wyzwalacz → myśl → emocja → zachowanie → potrzeba), „Gdzie jest Wam najtrudniej” (6 obszarów i nasilenie), „Kolejne kroki” (co · kto · kiedy).
5. Krótkie podpisy korzyści: „Widzisz swój konflikt krok po kroku”, „Wiesz, od czego zacząć”.
Bez procentów, wyników, „zdrowia związku” – raport ich nie zawiera.

## [2:55–3:30] Trzy możliwe drogi

**KLAUDIA:**
„I teraz najważniejsze. Mapa Relacji nie ma przekonywać Cię do jednej konkretnej decyzji.
Bo być może po przyjrzeniu się swojej sytuacji zdecydujesz, że chcesz pracować nad odbudową relacji. Być może uznasz, że potrzebujesz jeszcze czasu i lepszego zrozumienia swoich uczuć. A być może decyzja o rozstaniu już dojrzewa i chcesz przygotować się do tego etapu.
Każda z tych dróg wymaga trochę innego rodzaju wsparcia. A my nie chcemy wybierać za Ciebie. Chcemy pomóc Ci lepiej zrozumieć możliwości, żebyś to Ty mógł lub mogła podjąć swoją decyzję.”

**Montaż:** trzy ścieżki ze znakami (serce – odbudowa relacji, klepsydra – więcej jasności, strzałki – świadome rozstanie), z „lub” między nimi; żadna nie jest wyróżniona (jednakowa wielkość i czas na ekranie).

## [3:30–4:00] Bez zobowiązań na miesiące

**KLAUDIA:**
„Co ważne, nie musisz od razu zobowiązywać się do wielomiesięcznej terapii. Mapa Relacji to osobna usługa, z określonym początkiem i końcem.
Możesz też rozpocząć ten proces sam lub sama, jeżeli partner lub partnerka nie chce teraz uczestniczyć we wspólnych spotkaniach. W takiej sytuacji pracujemy na Twojej perspektywie. Nie będziemy udawać, że znamy uczucia czy intencje drugiej osoby bez rozmowy z nią – w podsumowaniu jasno to zaznaczam.
I nie obiecuję Ci, że po jednej konsultacji wszystkie Wasze trudności znikną. Ale możesz zacząć od czegoś bardzo konkretnego: lepszego zrozumienia własnej sytuacji.”

## [4:00–4:45] Jak zacząć

**KLAUDIA:**
„Mapa Relacji kosztuje 670 złotych. W tej cenie otrzymujesz cały proces, o którym Ci opowiedziałam: szczegółowy kwestionariusz, godzinną konsultację online z psychologiem oraz pisemne podsumowanie w formie Mapy Relacji. Jeśli chcecie przejść ją we dwoje, porozmawiaj o tym z naszym konsultantem.
Nie płacisz więc za krótki test internetowy. Płacisz za profesjonalne wsparcie w przyjrzeniu się jednej z najważniejszych relacji w Twoim życiu.
Jeśli czujesz, że tego właśnie teraz potrzebujesz, możesz rozpocząć od razu. Kliknij przycisk pod nagraniem, zamów Mapę Relacji i wybierz termin konsultacji. Zaraz potem otrzymasz dostęp do kwestionariusza.
A jeżeli masz jeszcze pytania, możesz zaczekać na rozmowę z naszym konsultantem.
Pamiętaj – nie musisz dzisiaj decydować o całej przyszłości swojego związku. Możesz zacząć od zrozumienia, gdzie naprawdę jesteś.”

**Montaż:** Klaudia na pełnym ekranie; przy cenie dyskretnie „Mapa Relacji – 670 zł”; na końcu graficzny przycisk „Zamawiam Mapę Relacji”. Bez odliczania i presji.

---

## Technicznie

- Format: MP4 (H.264 + AAC), 1920×1080, ok. 4–5 min; plik ≤ 150 MB. Hosting z HTTPS i nagłówkiem CORS (np. Bunny Stream / Cloudflare R2 / S3 + CDN).
- Napisy: plik WebVTT po polsku (`.vtt`), zsynchronizowany z nagraniem – z tej samej domeny co wideo albo z CORS. Wersja dla osób niesłyszących: napisy z opisem dźwięków (np. „[spokojna muzyka]”).
- Obraz startowy: jasny kadr Klaudii z dyskretnym logo, bez napisów i strzałek (domyślnie `public/img/vsl-poster.jpg`).
- Konfiguracja: Panel → Ustawienia → **Oferta i płatności** → „Film VSL – plik wideo”, „obraz startowy”, „napisy PL”. Do czasu wgrania filmu strona pokazuje zastępnik z tekstem wiadomości (bez udawanego odtwarzacza).
