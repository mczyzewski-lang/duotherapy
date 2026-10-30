# DUO® – architektura i mapa ekranów

## Produkty

1. **Landing `/`** – lejek: hero z trzema intencjami → treści (dla kogo, jak to działa, co otrzymasz, co dalej, poufność, FAQ, opcjonalnie wideo i zespół) → krótki quiz (6 pytań) → formularz zgłoszenia z oddzielnymi zgodami → zapis w `leads`.
2. **Onboarding klienta `/q/[token]`** – link + 6-cyfrowy kod → powitanie → „Zanim zaczniesz” → zgoda → wieloetapowy kwestionariusz z autozapisem → podsumowanie → przekazanie → wybór terminu sesji, informacja o płatności.
3. **Panel `/app`** – logowanie (hasło + TOTP), pulpit, pipeline zgłoszeń, sprawy, karta sprawy, odpowiedzi z notatkami, porównanie pary, tryb sesji, raporty, kwestionariusze (edytor wersji), ustawienia, dziennik audytowy.
4. **Raport dla klienta `/r/[token]`** – link + kod → podgląd i PDF zatwierdzonej wersji.

## Lejek DUO®

```
Landing + quiz ──► Zgłoszenie (leads.stage = new)
   │                   │  pipeline: Próba kontaktu → Rozmowa umówiona → Rozmowa odbyta
   │                   │            → Link do płatności wysłany → Opłacone
   │                   ▼
   │             Załóż sprawę (cases) ─► uczestnicy (1 lub 2) z przypiętą wersją kwestionariusza
   │                   ▼
   │             Link + kod dla każdej osoby ─► kwestionariusz (40–60 min)
   │                   ▼
   │             Terminy: psycholog proponuje, klient wybiera, psycholog potwierdza
   │                   ▼
   │             Sesja (tryb sesji, 60/90 min) ─► Raport (szkic → wersje → zatwierdzenie → PDF → udostępnienie)
```

Statusy sprawy: nowe zgłoszenie → oczekuje na ankietę → ankieta częściowo wypełniona → gotowe do sesji (automatycznie) → sesja odbyta → raport w przygotowaniu → raport zatwierdzony → raport udostępniony (automatycznie przy akcjach) → zamknięte (ręcznie). Status można też zmienić ręcznie.

## Warstwy

| Warstwa | Technologia | Pliki |
|---|---|---|
| UI | Next.js 15 App Router, React 19, Tailwind 4, komponenty w stylu shadcn/ui, lucide | `src/app`, `src/components` |
| Formularze | React Hook Form (quiz), akcje serwera + Zod (walidacja serwerowa) | `src/actions`, `src/questionnaires/validate.ts` |
| Domena | TypeScript | `src/lib/*.ts` |
| Dane | PostgreSQL 15+, klient `postgres`, migracje SQL | `db/migrations` |
| Autoryzacja | RLS w bazie + kontrola w akcjach serwera | `002_rls.sql`, `src/lib/auth.ts`, `src/lib/participant-auth.ts` |
| PDF | Chromium (playwright-core) lokalnie, bez sieci | `src/lib/pdf.ts` |

## Model danych

`users` – `therapists` (1:1) · `auth_sessions` · `rate_limits` · `app_settings` · `leads` – `lead_activities` · `questionnaire_templates` – `questionnaire_template_versions` – `questions` · `cases` – `participants` (1–2, każdy z `template_version_id`) – `invitations` – `participant_sessions` · `consents` · `answers` – `answer_revisions` · `session_notes` · `risk_review_statuses` · `session_slots` · `reports` – `report_versions` – `report_shares` · `audit_logs`.

Relacja kluczowa: sprawa → 1/2 uczestników → osobne, wersjonowane formularze → osobne odpowiedzi → sesja i notatki → raporty (wspólny lub osobny) → wersje → udostępnienia konkretnej osobie.

## Bezpieczeństwo (skrót)

- Rola bazy `duo_app` bez uprawnień właściciela; każda transakcja ustawia kontekst aktora (`app.kind`, `app.user_id`, `app.therapist_id`, `app.participant_id`, `app.share_id`). Bez kontekstu – zero wierszy.
- Uczestnik widzi i zapisuje tylko własne odpowiedzi, tylko gdy kwestionariusz jest otwarty; nie widzi drugiej osoby, notatek, statusów ryzyka.
- Psycholog widzi wyłącznie sprawy, do których jest przypisany. Administrator – wszystkie (z dziennikiem audytowym).
- Odpowiedzi, historia zmian, notatki, notatki przeglądu ryzyka i treść raportów szyfrowane AES-256-GCM (klucz w zmiennej środowiskowej).
- Tokeny linków (256 bit) i kody przechowywane jako HMAC; limit prób kodu (5) i limity na IP; ciasteczka sesji uczestnika ograniczone do ścieżki linku.
- Opublikowane wersje szablonów, zatwierdzone wersje raportów i dziennik audytowy chronione triggerami.
- Nagłówki CSP, HSTS, X-Frame-Options, brak skryptów analitycznych, `noindex` dla linków klientów.

## Ekrany panelu

| Ścieżka | Zawartość |
|---|---|
| `/app` | alerty bezpieczeństwa, liczniki statusów, ostatnie sprawy, nowe zgłoszenia, ostrzeżenie o niezatwierdzonych tekstach prawnych |
| `/app/leads` | kanban 8 etapów |
| `/app/leads/[id]` | dane, quiz, zgody, ściągawka rozmowy, historia kontaktu, termin rozmowy, założenie sprawy |
| `/app/cases` | wyszukiwarka, filtry: status, rodzaj, prowadzący |
| `/app/cases/[id]` | uczestnicy, linki (generuj/kopiuj/cofnij), postęp, przegląd bezpieczeństwa, ponowne otwarcie, zgoda na ujawnienie, eksport, usunięcie danych; status, płatność, zasada sekretów; terminy; zgody; oś czasu; raporty |
| `/app/cases/[id]/answers` | odpowiedzi 1:1 z pytaniami, filtr sekcji, sygnały do pogłębienia, notatki przy pytaniach, korekta z historią |
| `/app/cases/[id]/compare` | porównanie pary obok siebie, filtr rozbieżności, pytania do pogłębienia |
| `/app/cases/[id]/session` | zegar, harmonogram, pytania pogłębiające, notatnik z autozapisem i oznaczeniami, rozbieżności, kluczowe odpowiedzi |
| `/app/cases/[id]/reports/[rid]` | edytor sekcja po sekcji, podgląd, wersje, zatwierdzenie, PDF, udostępnienie |
| `/app/templates`, `/app/templates/[vid]` | wersje, edytor szkicu, publikacja |
| `/app/settings` | profil, dane prawne i zgody, strona i lejek, przebieg, numery pomocy, zespół, integracje |
| `/app/audit` | dziennik audytowy |
