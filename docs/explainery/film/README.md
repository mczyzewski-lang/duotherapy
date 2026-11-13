# Film „Mgła” (9:16, hook H1) – źródła montażu

- `shots.json` – opisy 13 kadrów (styl i strefy bezpieczne są w promptach w projekcie ElevenLabs „DUO – explainer »Mgła« – produkcja (H1)”).
- `timeline.json` – czasy segmentów lektora, napisów i kadrów.
- `film.html` – animacja na canvasie 1080×1920 (ruch kamery, mgła, napisy, plansza z logo). Strefy bezpieczne Reels:
  góra 270 px, dół 480 px, lewa 90 px, prawa 180 px.
- `render.js` – renderuje klatki przez Playwright (`node render.js frames 0 2304`), potem `ffmpeg` składa je z lektorem.

Do odtworzenia potrzebne są obok: kadry `s01.png`–`s13.png`, segmenty lektora `v01.mp3`–`v11.mp3` (głos ElevenLabs
`OtIWAuy1FmuND2I8ifh5`, model v4: hook osobno, reszta jako jedno nagranie `body_v4.mp3`, czasy słów z transkrypcji) i katalog `fonts/` z czcionkami Inter i Fraunces z `node_modules/@fontsource-variable`.

Podmiana hooka: nowy `v01.mp3` + tekst tytułu w `film.html` (sekcja „hook”) + przeliczenie `timeline.json`.

## Wersja v5 – ruchome kadry i dźwięk

- Każdy kadr `sNN.png` ma klip 4–5 s (image-to-video, 9:16, 720p, bez dźwięku) rozłożony na klatki
  `clips/sNN/f0001.jpg…` (30 kl./s). `timeline.json → clips` podaje liczbę klatek; gdy ujęcie jest
  dłuższe niż klip, klatki odtwarzane są tam i z powrotem (ping-pong). Bez katalogu `clips/` film
  renderuje się z nieruchomych obrazów.
- Nakładki rysowane na kanwie: nagłówek hooka nad sceną, tagi PRACA · DZIECI · ZAKUPY, symbol DUO
  nad wzgórzem przy „Dlatego w DUO…”, trzy warstwy mapy (Co Was trzyma · Gdzie najtrudniej ·
  Wasz konflikt), trzy drogi, plansze końcowe – wszystko wyśrodkowane w osi kadru (x = 540).
- `mix.sh` składa dźwięk: lektor + podkład muzyczny + tło mgły i łąki + akcenty (pop, dzwonek).
  Pliki audio i klipy nie są trzymane w repozytorium.

## Wersja v6

- Hook: kadr startuje zbliżony i odjeżdża, nagłówek wchodzi słowo po słowie (ostatnie słowo w plakietce),
  na scenie linia i strzałki pokazują dystans, przy telefonach pulsują kręgi; klip otwierający ma małą
  historię (jedna osoba próbuje zagadać, druga nie zauważa).
- „Dlatego w DUO…”: symbol marki wschodzi zza linii wzgórz (maska `RIDGE`, mgiełka przy horyzoncie,
  mieszanie `multiply`), więc jest częścią pejzażu, a nie naklejką.
- Lektor: zdanie „Dlatego w DUO zaczynamy od Mapy Relacji.” nagrane ponownie spokojnym tonem i wklejone
  w ścieżkę głosu (`voice2.m4a`) w miejsce poprzedniego.

## Wersja v7

- Hook: kadr rozrywa się na dwie połowy (`SPLIT` w `drawShot`), które odjeżdżają od siebie; dźwięk rozdarcia.
- „Praca, dzieci, zakupy” to trzy osobne sceny na twardych cięciach (`s02a`–`s02c`, zbiór `HARD`),
  każda z dużą plakietką i szelestem cięcia.
- Sekwencja mgły: bezsenna noc (`s03a`) z myślami „kryzys?” / „koniec?”, pokój we mgle z mocnym
  najazdem (`s03`), zbliżenie ręki szukającej we mgle (`s03c`).

## Wersja v8

- „Zostać. Odejść. Czekać.” – trzy sceny we mgle na twardych cięciach (`s04a`–`s04c`) z plakietkami.
- „U lekarza nikt nie zaczyna od leczenia…” – gabinet (`s05`: lekarz wstrzymuje leki) i lekarz
  zamyślony nad zdjęciem RTG (`s05b`).
- „Wierzymy, że każdy ma prawo do szczęścia. Ale na szczęście trzeba pracować.” – łąka, na której każdy
  jest szczęśliwy po swojemu (`s11b`), i wspólne sadzenie drzewka (`s11c`).

## Wersja v9

- Otwarcie: nowy kadr `s01` – para siedzi bliżej siebie, w całości w strefie ochronnej rolki; kadr
  jest przesunięty (`SHIFTX`), a rozdarcie biegnie przez środek sofy między nimi.
- Mapa: trzy punkty mają numerowane znaczniki z pulsującym kręgiem, reszta kadru jest przyciemniona
  z „reflektorami” na punktach, etykiety są większe i połączone z punktami pełną linią.

## Wersja v10

- Kadr hooka wypełnia całą szerokość ekranu (bez wygaszonych boków) – także we wszystkich wariantach hooka.
- Po hooku u góry, na środku, stoi logo: symbol i napis „DUO.pl®” z przebłyskiem (jak w krótkich poradach);
  znika przed planszą marki.
- Napisy: aktualnie wypowiadane słowo podświetla się w kolorze marki (czasy słów szacowane z długości słów).
- „ZOSTAĆ?” → „NAPRAWIAĆ?”: plakietka i lektor („Naprawiać. Odejść. Czekać.” – słowo dograne i wklejone
  do ścieżki `voice3.m4a`); ujęcie s04a zaczyna się 0,12 s wcześniej.

## Warianty hooka (`variants.py`)

- `python3 variants.py prep` – tnie ścieżkę głosu na części (hook, zdanie przejścia, reszta) i wyrównuje głośność.
- `python3 variants.py build H05 H11 …` – dla każdego hooka buduje oś czasu (`timeline_HXX.json`), głos i miks,
  renderuje tylko pierwsze ujęcie i dokleja wspólną resztę filmu (klatki od cięcia do sceny „PRACA”).
- Konfiguracja w słowniku `HOOKS`: nagranie hooka, wersy nagłówka, który wers jest plakietką, kadr otwierający
  (z pozycją rozdarcia i przesunięciem do strefy ochronnej) oraz zdanie przejścia.
- Kadry otwierające: sofa (H1, H2, H9), rozmowa obok siebie (H3, H4), cisza przy stole (H5, H15), kłótnia
  (H6, H11, H12), walizka i zdjęcie (H7), skorupki jajek (H8), więdnąca roślina (H10), ławka pod kocami (H14),
  rodzice z dziećmi (H16), pęknięte zdjęcie (H17).

## Krótkie porady (`tips.html`, `tips.py`)

- Format 15–20 s: hook (scena z problemem, nagłówek z plakietką) → porada (scena z rozwiązaniem, napisy)
  → wezwanie. T01–T10 kończą się „Zapisz na później” albo „Wyślij dalej”; T11–T20 prowadzą do bezpłatnego
  materiału: „Jeżeli chcesz bezpłatnie X, skomentuj: SŁOWO” – okładka 3D materiału wjeżdża od dołu, a pod
  nią pojawia się plakietka „Skomentuj: SŁOWO”. Wysyłkę materiału po komentarzu trzeba podpiąć osobno
  (automat odpowiedzi na komentarze) – film tylko to zapowiada.
- Logo na środku u góry, bez tła: symbol (co kilka sekund postaci „zamieniają dwa zdania”) i napis
  „DUO.pl®” z przebłyskiem przechodzącym przez litery. Pojawia się po chwili od wejścia porady.
- Kadr wypełnia całą szerokość ekranu; ekran końcowy z okładką jest wyśrodkowany tak jak logo.
- Znacznik tematu to dyskretny tekst u góry po lewej (np. „#kłótnia #duo”) – słownik `TAGS` w `tips.py`;
  nie pokazuje się w trakcie hooka ani na ekranie końcowym. Napisy stoją nisko, żeby nie zasłaniać środka kadru.
- Napisy: aktualnie wypowiadane słowo podświetla się w kolorze marki. Czasy słów są szacowane
  proporcjonalnie do długości słów w zdaniu (bez transkrypcji), więc mogą odbiegać o ułamek sekundy.
- Cytat (tekst w „…”) pokazuje się w dymku wychodzącym od mówiącej postaci, a nie w napisach;
  jednostkę z cytatem i punkt nad głową postaci podaje słownik `BUB` w `tips.py`.
- Klip sceny z poradą odtwarza się raz, z wyhamowaniem i przenikaniem sąsiednich klatek – bez zapętlania
  w tył.
- Dźwięk: lektor, muzyka, tło sceny (dom, kuchnia albo ptaki – słownik `AMB`), krótki motyw napięcia pod
  hookiem, akcenty przy dymku, okładce i plakietce.
- Treści porad (zdania lektora, nagłówki, karty, wezwania, kadry, okładki) są w słowniku `TIPS` w `tips.py`.
  `python3 tips.py plan` pokazuje wyrównanie zdań do nagrania, `python3 tips.py build T03` składa film.
  Okładki (`covers/<slug>.png`) to zrzuty komponentu okładki ze stron `/wiedza/<slug>` (`covers.js`) –
  z przezroczystym tłem i z grafiką 2D; lokalna baza musi mieć wgrane grafiki okładek (tabela `cover_images`)
  i wybrany wariant „Grafika 2D”.
- Seria „pielęgnacja związku” (P01–P10, scenariusze: `../duo_porady_pielegnacja-zwiazku.md`) ma pionowe,
  pełnoekranowe kadry (`full` w osi czasu): ilustracja wypełnia cały ekran 9:16, jasne tło zostaje tylko pod
  nagłówkiem i logo, bez znacznika tematu. Punkt dymka podaje `BUBF` jako ułamek kadru.
- Zasada na przyszłość: nowe ilustracje generujemy jako pionowe sceny 9:16 wypełniające kadr od krawędzi do
  krawędzi (wysokie wnętrze, spokojna góra na nagłówek, postaci pośrodku, podłoga na dole) – nie jako poziomą
  scenkę osadzoną na jasnym tle.
