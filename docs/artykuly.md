# Artykuły „Wiedzy” – jak dodać nowy (SEO, długi ogon)

Adresy: spis `/wiedza/artykuly`, artykuł `/wiedza/artykuly/<slug>`. Lista pokazuje się też pod materiałami na `/wiedza`,
a na stronie materiału – sekcja „Przeczytaj też” z artykułami, które go polecają.

## Nowy artykuł w 3 krokach

1. Skopiuj `src/content/articles/terapia-par-online.ts` jako `src/content/articles/<slug>.ts` i podmień treść.
2. Dopisz import i wpis do tablicy `ARTICLES` w `src/content/articles/index.ts`.
3. Uruchom `npx vitest run tests/unit/articles.test.ts` – test sprawdzi długości tytułu i opisu, frazę w H1, linki, materiały.

## Pola i zasady SEO

- `slug` – fraza z długiego ogona, małe litery i myślniki (np. `terapia-par-gdy-partner-nie-chce`).
- `seoTitle` – do 60 znaków, z główną frazą na początku. `description` – 120–165 znaków, z frazą i obietnicą treści.
- `keywords` – 3–6 fraz z długiego ogona; pierwsza = główna (musi pojawić się w H1 albo tytule SEO).
- `h1` – pełny nagłówek; `title` – krótka nazwa do kart i okruszków.
- `faq` – 2–4 pytania (trafiają do danych strukturalnych FAQPage – szansa na rozszerzony wynik w Google).
- `related` – 2–3 artykuły do „Przeczytaj też” (reszta dobiera się po wspólnych `tags`).
- `magnets` – materiały pasujące do tematu: pierwszy niepowtórzony w treści trafia do bocznego panelu, wszystkie na koniec.

## Bloki treści

`h2` (z `id` – kotwica do spisu treści), `h3`, `p`, `list` (`ordered`), `quote`, `callout` (`tone: "safety"` dla treści o bezpieczeństwie),
`figure` (infografika HTML), `art` (ilustracja z OpenAI), `cta` (kontener z materiałem i własnym zdaniem `hook` dopasowanym do miejsca w tekście), `mapa` (dyskretny odnośnik do Mapy Relacji).

W tekście: `**pogrubienie**` i `[tekst linku](/adres)`. **Każdy artykuł linkuje w treści do co najmniej jednego innego artykułu** (pilnuje test) oraz do materiałów i ścieżek (`/odbudowa`, `/czas-na-decyzje`, `/swiadome-rozstanie`, `/mapa-relacji`).

## Grafiki i infografiki

- **Grafika na górze** (`hero.prompt`, `hero.alt`) i **ilustracje-infografiki** (blok `art`: `key`, `title`, `prompt`, `alt`, `caption`) –
  generowane w panelu: **Panel → Wiedza → Grafiki artykułów** (OpenAI, klucz na serwerze). Minimalistyczne, w barwach DUO,
  z delikatnymi elementami komiksowymi, **bez tekstu w obrazie** – tytuł i podpis („W skrócie: …” – podsumowanie idei) są pod grafiką w HTML
  (czytelne dla Google). Logo DUO w narożniku dokłada strona. Dopóki grafika nie jest wygenerowana, widać spokojne tło w barwach marki.
- Każdy artykuł ma **min. 2 ilustracje** (`art`) i grafikę na górze; pilnuje test. Prompty piszemy po angielsku, opisując scenę (styl dokłada system).
- **Wszystkie naraz:** przycisk „Wygeneruj wszystkie brakujące” w tej samej karcie – generuje w tle (po 2 naraz, ponawia przy limitach OpenAI,
  przerywa po 3 błędach z rzędu). Postęp odświeża się sam; stronę można zamknąć. Po restarcie serwera wystarczy kliknąć ponownie – robią się tylko brakujące.
- **Spójne postacie:** `ART_STYLE` w `src/lib/article-images.ts` opisuje stały projekt postaci (ludzie infograficzni: fryzura, ubranie, prosta twarz;
  nigdy manekiny z kropką zamiast głowy). W promptach artykułów pisz „people / person”, nie „figures”. Zmiana stylu → podbij `ART_STYLE_VERSION`;
  panel oznaczy starsze grafiki jako „stary styl” i pozwoli je odświeżyć hurtowo.
- Przed dodaniem do rejestru sprawdź plik: `npx tsx scripts/check-article.ts src/content/articles/<slug>.ts` (te same zasady co test + typografia).
- Autorka wszystkich artykułów: **Klaudia Bosek** (`AUTHOR` w `src/content/articles/index.ts`) – widoczna pod tytułem, w ramce na końcu i w danych strukturalnych.

## Infografiki HTML

HTML/CSS w barwach DUO z logo w narożniku (`src/components/articles/infographics.tsx`) – ostre na każdym ekranie, lekkie,
z tekstem czytelnym dla Google i czytników ekranu. Nowa infografika: funkcja w tym pliku + klucz w `GraphicKey` (`types.ts`).
Każda ma tytuł i podpis (`figcaption`).

## Zasady treści

Bez fikcyjnych badań, statystyk, opinii i danych specjalistów; bez obietnic efektów i presji. Półpauza „–”, polskie cudzysłowy „…”.
Tematy przemocy zawsze z informacją o bezpieczeństwie (Niebieska Linia 800 120 002, 112).

## Pomiar

`article_view` i `article_cta_click` (krok = numer materiału) w `funnel_events` – bez tytułów, ścieżka zanonimizowana do `/wiedza/*`.
