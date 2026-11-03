// Domyślne sekwencje e-mail (wstawiane raz, potem edytowane w panelu: /app/mailing).
// Bez fikcyjnych opinii, obietnic skutków i sztucznej presji czasu. {imie} = imię osoby (albo puste).
// Tagi: lm-<slug materiału>, seria-7-dni, quiz, klient (nadawany automatycznie przy zakupie).

export interface DefaultStep {
  code: string;
  delay_days: number;
  subject: string;
  preheader: string;
  body: string;
  cta_label: string;
  cta_url: string;
  include_tags?: string[];
  exclude_tags?: string[];
}

export const DEFAULT_SEQUENCES = [
  { id: "lead", name: "Przed zakupem → Mapa Relacji", trigger: "lead", requires_consent: true },
  { id: "customer", name: "Po zakupie (bez Mapy Relacji)", trigger: "purchase", requires_consent: false },
] as const;

export const DEFAULT_STEPS: Record<"lead" | "customer", DefaultStep[]> = {
  lead: [
    {
      code: "n1",
      delay_days: 1,
      subject: "Co dalej z materiałem – i z Wami?",
      preheader: "Kilka słów o tym, co możesz zrobić z odpowiedziami, które już masz.",
      body: `Dziękuję, że sięgnąłeś / sięgnęłaś po materiał DUO. Samo to, że szukasz informacji, często oznacza, że coś w relacji ważnego dzieje się właśnie teraz.

Materiał pomaga uporządkować myśli. Czasem jednak zostaje pytanie: „i co z tym dalej zrobić?”.

Do tego powstała Mapa Relacji – proces z psychologiem, który pomaga zrozumieć Waszą sytuację i świadomiej wybrać kolejne kroki. Bez oceniania i bez gotowych odpowiedzi narzuconych z zewnątrz.`,
      cta_label: "Zobacz, czym jest Mapa Relacji",
      cta_url: "/mapa-relacji",
    },
    {
      code: "n2",
      delay_days: 3,
      subject: "Ratować, dać sobie czas czy się rozstać?",
      preheader: "Zwykle widzimy dwie drogi. W praktyce są co najmniej trzy.",
      body: `W kryzysie łatwo myśleć w dwóch kategoriach: „zostajemy” albo „odchodzę”.

W pracy z parami widzimy częściej trzy drogi:
– odbudowę relacji, jeśli oboje chcecie spróbować,
– czas na decyzję, kiedy nie wiesz jeszcze, czego chcesz,
– świadome rozstanie, które oszczędza Was i dzieci tam, gdzie to możliwe.

Żadna z nich nie jest „lepsza”. Ważne, żeby wybrać ją świadomie, a nie pod wpływem najgorszego tygodnia. Mapa Relacji pomaga zobaczyć, gdzie dziś jesteście.`,
      cta_label: "Sprawdź, jak to działa",
      cta_url: "/mapa-relacji",
    },
    {
      code: "n3",
      delay_days: 5,
      subject: "Jak wygląda Mapa Relacji krok po kroku",
      preheader: "Kwestionariusz, rozmowa z psychologiem i pisemne podsumowanie.",
      body: `Krótko, jak to wygląda:

1. Wypełniasz kwestionariusz na prywatnym linku. Przy konsultacji dla pary każde z Was ma własny – druga osoba nie widzi Twoich odpowiedzi.
2. Rozmawiasz z psychologiem online. Psycholog zna już odpowiedzi, więc od razu rozmawiacie o tym, co najważniejsze.
3. Dostajesz pisemne podsumowanie z możliwymi kolejnymi krokami – pod prywatnym linkiem i do pobrania jako PDF.

Możesz zobaczyć przykładową Mapę Relacji przygotowaną na fikcyjnych danych.`,
      cta_label: "Zobacz przykładową Mapę",
      cta_url: "/wiedza/przykladowa-mapa-relacji",
    },
    {
      code: "n4",
      delay_days: 7,
      subject: "Jeśli myślisz o rozstaniu",
      preheader: "Rozstanie też może być przemyślane – dla Ciebie i dla dzieci.",
      body: `Myślenie o rozstaniu nie oznacza, że już podjąłeś / podjęłaś decyzję. Często oznacza zmęczenie i potrzebę, żeby wreszcie coś się zmieniło.

Zanim zrobisz pierwszy formalny krok, warto uporządkować kilka spraw: czego naprawdę chcesz, co jest ustalone, a co jest tylko obawą, i jak to wpłynie na dzieci.

Mapa Relacji może pomóc wskazać najlepszą dla Was drogę – także wtedy, gdy będzie to rozstanie.`,
      cta_label: "Poznaj Mapę Relacji",
      cta_url: "/mapa-relacji",
      include_tags: ["lm-swiadome-rozstanie", "lm-partner-nie-chce-ratowac-zwiazku", "lm-kryzys-czy-koniec-milosci"],
    },
    {
      code: "n5",
      delay_days: 7,
      subject: "Po zdradzie nie musisz decydować od razu",
      preheader: "Pierwsze tygodnie to zwykle za wcześnie na ostateczne decyzje.",
      body: `Po zdradzie wiele osób czuje presję, żeby szybko zdecydować: wybaczyć albo odejść.

Tymczasem emocje w pierwszych tygodniach są tak silne, że trudno usłyszeć siebie. Daj sobie prawo do czasu – i do wsparcia w tym, żeby zrozumieć, co się wydarzyło i czego teraz potrzebujesz.

Mapa Relacji to spokojna rozmowa z psychologiem o tym, gdzie jesteś – sam / sama albo we dwoje.`,
      cta_label: "Zobacz, jak możemy pomóc",
      cta_url: "/mapa-relacji",
      include_tags: ["lm-po-zdradzie"],
    },
    {
      code: "n6",
      delay_days: 10,
      subject: "6 krótkich pytań o to, gdzie dziś jesteście",
      preheader: "Na końcu możesz zostawić numer telefonu – albo nie.",
      body: `Jeśli nie wiesz, od czego zacząć, zacznij od 6 krótkich pytań o to, gdzie dziś jesteście.

Na końcu zobaczysz krótkie podsumowanie swoich odpowiedzi i możesz zostawić numer telefonu. Konsultant wyjaśni, jak wygląda Mapa Relacji i czy pasuje do Waszej sytuacji. Decydujesz po rozmowie.`,
      cta_label: "Odpowiedz na 6 pytań",
      cta_url: "/start",
      exclude_tags: ["quiz"],
    },
    {
      code: "n7",
      delay_days: 14,
      subject: "A jeśli partner nie chce rozmawiać?",
      preheader: "Mapę Relacji możesz zrobić także samodzielnie.",
      body: `Częste pytanie: „a co, jeśli on / ona nie chce iść do psychologa?”.

Mapę Relacji możesz zrobić samodzielnie. Rozmowa dotyczy wtedy Ciebie: tego, czego potrzebujesz, co możesz zrobić i jakie masz możliwości. To często pierwszy krok, który porządkuje sytuację – niezależnie od tego, co zdecyduje druga osoba.`,
      cta_label: "Zobacz wariant indywidualny",
      cta_url: "/mapa-relacji",
    },
    {
      code: "n8",
      delay_days: 21,
      subject: "Ostatnia wiadomość z tej serii",
      preheader: "Bez pośpiechu – materiały zostają dla Ciebie.",
      body: `To ostatnia wiadomość z tej serii. Nie ma tu żadnego terminu ani promocji – jeśli to nie jest dobry moment, to w porządku.

Kiedy będziesz gotowy / gotowa, Mapa Relacji będzie na Ciebie czekać. A materiały, które pobrałeś / pobrałaś, zostają dostępne.

Trzymam kciuki za Ciebie – niezależnie od tego, jaką drogę wybierzesz.`,
      cta_label: "Mapa Relacji",
      cta_url: "/mapa-relacji",
    },
  ],
  customer: [
    {
      code: "k1",
      delay_days: 1,
      subject: "Pierwsze kroki po zamówieniu",
      preheader: "Termin, kwestionariusz i jak się przygotować.",
      body: `Dziękujemy za zaufanie.

Przypominamy: termin konsultacji wybierasz i kwestionariusz otwierasz na prywatnej stronie zamówienia – link jest w wiadomości z potwierdzeniem zakupu.

Jeśli chcesz się przygotować, możesz przejrzeć 21 pytań o relację. Nie musisz odpowiadać na wszystkie – wystarczy, że zauważysz, które są dla Ciebie najważniejsze.`,
      cta_label: "21 pytań o relację",
      cta_url: "/wiedza/21-pytan-o-relacji",
    },
    {
      code: "k2",
      delay_days: 3,
      subject: "Jak przygotować się do rozmowy z psychologiem",
      preheader: "Kilka prostych rzeczy, które pomagają.",
      body: `Kilka rzeczy, które pomagają w konsultacji online:

– spokojne miejsce, w którym nikt Wam nie przeszkodzi,
– słuchawki, jeśli w domu są inne osoby,
– kartka z 2–3 sprawami, o których na pewno chcesz powiedzieć.

Nie musisz mieć gotowych odpowiedzi. Od tego jest rozmowa.`,
      cta_label: "Materiały DUO",
      cta_url: "/wiedza",
    },
    {
      code: "k3",
      delay_days: 10,
      subject: "Jak korzystać z podsumowania",
      preheader: "Podsumowanie, do którego możesz wracać.",
      body: `Po konsultacji otrzymujesz pisemne podsumowanie przygotowane przez psychologa.

Warto przeczytać je dwa razy: raz od razu, drugi raz po kilku dniach – wtedy często widać więcej. Jeśli pracujecie we dwoje, umówcie się na spokojną rozmowę o nim, a nie „przy okazji”.

Jeśli trudno Wam rozmawiać bez kłótni, może pomóc materiał o trudnej rozmowie.`,
      cta_label: "Jak przeprowadzić trudną rozmowę",
      cta_url: "/wiedza/trudna-rozmowa",
    },
    {
      code: "k4",
      delay_days: 21,
      subject: "Co może być dalej",
      preheader: "Odbudowa, czas na decyzję albo świadome rozstanie.",
      body: `Mapa Relacji to początek – pomaga zobaczyć, gdzie jesteście i co możecie zrobić.

Jeśli chcecie iść dalej, w DUO pracujemy w trzech ścieżkach: odbudowa relacji, wsparcie w decyzji i świadome rozstanie. Możesz przeczytać, jak każda z nich wygląda, i wrócić do tego, kiedy będziesz gotowy / gotowa.`,
      cta_label: "Zobacz ścieżki DUO",
      cta_url: "/",
    },
  ],
};
