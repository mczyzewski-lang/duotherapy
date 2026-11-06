# SEO strony DUO

## Co jest zrobione
- **Mapa strony** `/sitemap.xml` – strona główna, Mapa Relacji, 3 ścieżki, /wiedza, 10 materiałów, lista i wszystkie artykuły (z datą aktualizacji
  i wygenerowanymi grafikami dla Google Grafika), /pomoc, /regulamin, /prywatnosc. Bez stron z tokenami, panelu, /demo, druku i podsumowań.
  Pilnuje test `tests/unit/seo.test.ts`.
- **robots.txt** – blokuje /app, /q/, /r/, /zamowienie/, /twoja-mapa, /api/, /wiedza/wypisz; wskazuje mapę strony.
- **Metadane** (`pageMeta` w `src/lib/seo.ts`): tytuł, opis, adres kanoniczny, Open Graph i karta Twitter na każdej stronie publicznej.
  Strony prywatne mają `noindex`.
- **Obrazki do udostępniania** `/og?t=Tytuł&k=Nadtytuł` – generowane w barwach DUO (1200×630, polskie znaki). Artykuł z wygenerowaną grafiką
  używa jej zamiast tego.
- **Dane strukturalne (JSON-LD)**: strona główna – ProfessionalService + WebSite + FAQ; Mapa Relacji – Service z wariantami i cenami + FAQ;
  ścieżki – Service + FAQ; materiały – LearningResource; artykuły – Article (autorka Klaudia Bosek) + FAQ; wszędzie okruszki (BreadcrumbList).
- **Linkowanie wewnętrzne**: artykuły linkują do siebie i materiałów, stopka – do popularnych tematów i listy artykułów.
- **Manifest** `/manifest.webmanifest`, ikony, `lang="pl"`.

## Do ustawienia na produkcji (Railway → Variables)
- `APP_URL=https://duo.pl` (adres docelowy, bez ukośnika na końcu) – od niego zależą adresy kanoniczne, mapa strony i obrazki OG.
- `GOOGLE_SITE_VERIFICATION=<kod z Google Search Console>` (opcjonalnie – albo weryfikacja przez DNS).
- W Google Search Console: dodaj usługę, zgłoś `https://duo.pl/sitemap.xml`.
