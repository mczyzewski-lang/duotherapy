// Harmonogram i pytania pogłębiające – wg wytycznych dla psychologa (03, rozdz. 5, 6, 11).

export interface Stage {
  key: string;
  from: number;
  to: number;
  title: string;
  goal: string;
  questions?: string[];
}

export const INDIVIDUAL_PLAN: Stage[] = [
  { key: "contract", from: 0, to: 5, title: "Kontrakt i bezpieczeństwo", goal: "zasady, poufność, granice audytu, potwierdzenie przesiewu" },
  {
    key: "reason",
    from: 5,
    to: 15,
    title: "Powód zgłoszenia i cel",
    goal: '"Dlaczego teraz?", punkty zwrotne, cel audytu z kwestionariusza',
    questions: ["Co mówi o tym, dlaczego nie chce przyjść? Co może się za tym kryć poza odmową?"],
  },
  {
    key: "cycle",
    from: 15,
    to: 30,
    title: "Mapowanie cyklu konfliktu",
    goal: "analiza łańcucha (DBT) ostatniej kłótni, Four Horsemen, własny udział w cyklu",
    questions: [
      "Gdyby druga osoba tu była, jak opisałaby ten sam problem? Co by Pana/Panią zaskoczyło w jej wersji?",
      "Co z tego, co Pan/Pani opisał(a), zależy od Pana/Pani, a co nie?",
      "Jaki jest Pana/Pani pierwszy ruch w kłótni? Jak druga osoba prawdopodobnie go odbiera?",
      "Jak zaczyna się trudna rozmowa? Jakie pierwsze zdanie pada?",
      "Co robi Pan/Pani w pierwszych sekundach po usłyszeniu zarzutu?",
      "Czy zdarzają się żarty kosztem drugiej strony, przewracanie oczami, ton wyższości?",
      "Co dzieje się w ciele, zanim się Pan/Pani wyłączy?",
      "Analiza łańcucha: podatności (sen, praca, alkohol), wyzwalacz, myśli, emocje, impulsy, zachowanie, konsekwencje.",
      "W skali 0-100, jak silna była złość? Przy jakim poziomie przestaje Pan/Pani panować nad słowami?",
    ],
  },
  {
    key: "resources",
    from: 30,
    to: 40,
    title: "Zasoby, potrzeby, gotowość",
    goal: "naprawa, potrzeby przywiązaniowe, ambiwalencja, dzieci, wsparcie poza związkiem",
    questions: [
      "Po kłótni: kto robi pierwszy krok i jak? Czy to działa?",
      "Czego najbardziej się Pan/Pani boi, gdy druga osoba się dystansuje?",
      "Czy ten lęk zna Pan/Pani z wcześniejszych relacji?",
      "Jakim partnerem lub partnerką (i rodzicem, jeśli są dzieci) chce Pan/Pani być niezależnie od tego, co zrobi druga osoba?",
      "Kto Pana/Panią wspiera poza związkiem?",
      "Czy ten związek Panu/Pani służy? Po czym to Pan/Pani poznaje?",
      "Co przemawia za zostaniem, co za odejściem? Których argumentów się Pan/Pani boi?",
    ],
  },
  {
    key: "feedback",
    from: 40,
    to: 55,
    title: "Informacja zwrotna i rekomendacja",
    goal: "mechanizm w jednym zdaniu, wybór ścieżki, 1-3 następne kroki",
    questions: [
      "Co działa (2-3 mocne strony, konkretnie).",
      "Mechanizm konfliktu w jednym zdaniu.",
      "Czy związek służy i jaka jest gotowość.",
      "Rekomendowana ścieżka (jedna z trzech) i 1-3 pierwsze kroki. Zawsze podaj opcję „nic teraz nie wybieram”.",
      "Co zrobi Pan/Pani z wynikami audytu, jeśli druga osoba nie zechce nic zmieniać?",
    ],
  },
  { key: "closing", from: 55, to: 60, title: "Zamknięcie", goal: "pytania, termin raportu (zalecane do 5 dni roboczych), forma kontaktu" },
];

export const COUPLE_PLAN: Stage[] = [
  { key: "contract", from: 0, to: 5, title: "Kontrakt i bezpieczeństwo (wspólnie)", goal: "zasady, poufność, zasada sekretów, granice audytu" },
  {
    key: "individual",
    from: 5,
    to: 20,
    title: "Części indywidualne",
    goal: "po około 7-8 minut z każdą osobą osobno: bezpieczeństwo, gotowość 0-10, czego nie chce mówić przy partnerze lub partnerce",
    questions: [
      "W skali 0-10, na ile chce Pan/Pani pracować nad związkiem? Co musiałoby się wydarzyć, żeby ta liczba wzrosła?",
      "Czy jest coś, czego nie chce Pan/Pani mówić przy partnerze lub partnerce?",
      "Czy czuje się Pan/Pani bezpiecznie w tej relacji?",
    ],
  },
  {
    key: "history",
    from: 20,
    to: 35,
    title: "Historia i powód zgłoszenia (wspólnie)",
    goal: '"Dlaczego teraz?", oś czasu związku, rozbieżności z kwestionariuszy',
  },
  {
    key: "cycle",
    from: 35,
    to: 55,
    title: "Mapowanie cyklu konfliktu",
    goal: "analiza łańcucha ostatniej kłótni, Four Horsemen, wycofanie i pościg",
    questions: [
      "Jak zaczyna się trudna rozmowa? Jakie pierwsze zdanie pada?",
      "Co dokładnie się wydarzyło, że poczuł(a) się Pan/Pani zlekceważony(-a)?",
      "Co robi Pan/Pani w pierwszych sekundach po usłyszeniu zarzutu?",
      "Czy zdarzają się żarty kosztem drugiej strony, przewracanie oczami, ton wyższości?",
      "Co dzieje się w ciele, zanim się Pan/Pani wyłączy?",
      "Jaka myśl pojawia się, gdy słyszy Pan/Pani o rozstaniu?",
      "Jakie są dowody za i przeciw tej interpretacji?",
      "Walidacja: Co w reakcji drugiej osoby ma sens, nawet jeśli się Pan/Pani z nią nie zgadza?",
    ],
  },
  {
    key: "resources",
    from: 55,
    to: 70,
    title: "Zasoby, potrzeby, gotowość",
    goal: "bids, przyjaźń, naprawa, ambiwalencja, wizja życia, rodzicielstwo",
    questions: [
      "Jak wygląda zwykły wieczór? Kto do kogo się zwraca i co się dzieje dalej?",
      "Po kłótni: kto robi pierwszy krok i jak? Czy to działa?",
      "Czego najbardziej się Pan/Pani boi, gdy druga osoba się dystansuje?",
      "Czy macie podobną wizję życia (dzieci, miejsce, praca, wartości)? Gdzie są różnice nie do pogodzenia?",
      "Jeśli związek się skończy, jak chcecie chronić dzieci i ich relację z każdym z rodziców?",
    ],
  },
  {
    key: "feedback",
    from: 70,
    to: 85,
    title: "Informacja zwrotna i rekomendacja",
    goal: "mechanizm, czy związek służy obu osobom, wybór ścieżki, 1-3 następne kroki",
    questions: [
      "Co działa (2-3 mocne strony, konkretnie).",
      "Mechanizm konfliktu w jednym zdaniu.",
      "Czy związek służy obu osobom i jaka jest gotowość każdej z nich.",
      "Rekomendowana ścieżka (jedna z trzech) i 1-3 pierwsze kroki. Zawsze podaj opcję „nic teraz nie wybieram”.",
    ],
  },
  { key: "closing", from: 85, to: 90, title: "Zamknięcie", goal: "pytania, termin raportu (zalecane do 5 dni roboczych), forma kontaktu" },
];

export const SESSION_CONDITIONS = [
  "Potwierdź tożsamość, kraj i miejsce pobytu klienta. Ustal numer kontaktowy na wypadek przerwania połączenia.",
  "Zapytaj, czy klient jest sam w pomieszczeniu i czy nikt nie słucha. Przy podejrzeniu przemocy nie prowadź wspólnej sesji.",
  'Ustal słowo lub gest "stop", gdy rozmowa staje się zbyt intensywna.',
  "Bezpieczna platforma, brak nagrywania bez pisemnej zgody.",
];
