# Struktura strony: DUO → Mapa Relacji → trzy ścieżki

| Adres | Co to jest | Główne CTA |
|---|---|---|
| `/` | Strona główna DUO (marka, „Jak pomagamy”, psycholożka, Wiedza, FAQ) | Zacznij od Mapy Relacji |
| `/mapa-relacji` | Landing Mapy Relacji (dawna strona główna; test A/B hero, quiz, sprzedaż 670 zł) | 6 krótkich pytań → quiz |
| `/odbudowa` | Droga 1 – program „6 tygodni” z terapeutą par | Rozmowa o programie (formularz) |
| `/czas-na-decyzje` | Droga 2 – wsparcie w decyzji | Rozmowa o wsparciu w decyzji |
| `/swiadome-rozstanie` | Droga 3 – najlepsza droga rozstania, wsparcie indywidualne, pary i dzieci | Rozmowa o wsparciu w rozstaniu |
| `/wiedza` | 10 bezpłatnych materiałów | — |

Menu „Jak pomagamy” (desktop i telefon) pokazuje hierarchię: **Mapa Relacji – zacznij tutaj**, pod nią rozgałęzienie „Możliwe drogi po Mapie Relacji” z trzema ścieżkami. Logo Mapy Relacji jest tylko na stronach Mapy (landing, quiz, strona po quizie, zamówienie, przykład); w nagłówku i stopce reszty strony – tylko DUO. Na stronie głównej i w podstronach Mapa występuje jako usługa (mały znak w karcie), nie jako logo.

Zapytania z podstron ścieżek trafiają do Panelu → Wiadomości z tematem w nawiasie, np. „[Odbudowa relacji – 6 tygodni] …”.

Treść ścieżek: `src/content/paths.ts` (jedno źródło dla podstron, kart i menu).

## Do potwierdzenia przez DUO (treść opisuje propozycję programu)

- **Odbudowa:** 6 cotygodniowych sesji online, Mapa Relacji jako start programu, ćwiczenia ok. 15 min dziennie, przegląd po 3. tygodniu, plan utrzymania – czy tak wygląda usługa? Długość sesji, cena (strona jej nie podaje).
- **Czas na decyzję:** liczba spotkań („zwykle kilka”), forma indywidualna i wspólna, cena.
- **Świadome rozstanie:** dostępność psychologa dziecięcego (formy pracy, wiek dzieci), spotkania pary jako rodziców, cena.
- Teksty „Do czego dążymy” są kierunkiem pracy, nie obietnicą efektu – zostawić to zastrzeżenie.
- Akceptacja merytoryczna treści przez psycholożkę.
