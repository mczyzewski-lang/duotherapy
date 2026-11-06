import type { Article } from "./types";

export const article: Article = {
  slug: "jak-wyglada-pierwsza-wizyta-terapia-malzenska",
  h1: "Jak wygląda pierwsza wizyta na terapii małżeńskiej? Przebieg krok po kroku",
  title: "Pierwsza wizyta na terapii małżeńskiej",
  seoTitle: "Pierwsza wizyta na terapii małżeńskiej – jak wygląda?",
  description: "Jak wygląda pierwsza wizyta na terapii małżeńskiej lub terapii par? O co pyta terapeuta, jak się przygotować i czego się nie bać – przebieg krok po kroku.",
  excerpt: "Stres przed pierwszym spotkaniem jest naturalny. Zobacz, jak zwykle wygląda pierwsza wizyta i jak się do niej przygotować.",
  keywords: ["pierwsza wizyta terapia małżeńska", "jak wygląda terapia par", "pierwsza sesja terapii par", "o co pyta terapeuta par", "jak przygotować się do terapii par", "poufność w terapii par"],
  tags: ["terapia par", "terapia małżeńska", "pierwsza wizyta"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 13,
  lead:
    "Pierwsza wizyta na terapii małżeńskiej budzi zwykle dużo pytań: o co zapyta terapeuta, czy będzie oceniał, czy trzeba od razu mówić o wszystkim? Spokojnie – pierwsze spotkanie służy przede wszystkim poznaniu się i zrozumieniu, z czym przychodzicie. Poniżej opisujemy przebieg krok po kroku, najczęstsze pytania terapeuty, zasady poufności i to, jak zadbać o siebie po spotkaniu.",
  hero: {
    prompt: "A calm, welcoming therapy room: two armchairs facing a third chair, a small plant, a window with soft daylight, a cup of tea on a side table; no people, peaceful atmosphere of a first visit.",
    alt: "Ilustracja: spokojny gabinet z dwoma fotelami i krzesłem terapeuty – atmosfera pierwszej wizyty na terapii par",
  },
  blocks: [
    { t: "h2", id: "zanim-przyjdziecie", text: "Zanim przyjdziecie: stres jest normalny" },
    {
      t: "p",
      text: "Przed pierwszą wizytą wiele osób ma w głowie czarne scenariusze: że terapeuta „wyda wyrok”, że wyjdą na jaw rzeczy, o których nie chce się mówić, albo że rozmowa skończy się kłótnią. To naturalne – idziecie przecież rozmawiać o czymś ważnym i trudnym. Dobra wiadomość jest taka, że pierwsze spotkanie ma przede wszystkim **pomóc Wam poczuć się bezpiecznie** i zrozumieć, jak może wyglądać dalsza praca.",
    },
    { t: "h2", id: "przebieg", text: "Przebieg pierwszej wizyty krok po kroku" },
    { t: "figure", graphic: "first-visit", title: "Pierwsza wizyta na terapii par – cztery etapy", caption: "Typowy przebieg początku terapii par. Szczegóły zależą od terapeuty i Waszej sytuacji." },
    {
      t: "list",
      ordered: true,
      items: [
        "**Krótki kontakt przed spotkaniem** – ustalacie termin i formę (stacjonarnie lub [online](/wiedza/artykuly/terapia-par-online)). Czasem terapeuta prosi o wypełnienie krótkiego kwestionariusza – każde z Was osobno.",
        "**Poznanie Waszej historii** – terapeuta pyta, co Was sprowadza, od kiedy trwa trudność i co już próbowaliście. Każde z Was ma przestrzeń, żeby powiedzieć to po swojemu, bez przerywania.",
        "**Ustalenie celów i zasad** – co chcecie osiągnąć, jak często będziecie się spotykać, jakie są zasady poufności i co, jeśli któreś z Was będzie chciało przerwać.",
        "**Plan dalszej pracy** – na koniec pierwszego lub kolejnego spotkania omawiacie, jak może wyglądać dalsza praca i czego możecie się spodziewać.",
      ],
    },
    {
      t: "art",
      key: "bezpieczna-przestrzen",
      title: "Gabinet jako bezpieczna przestrzeń dla obojga",
      prompt: "Two simple figures sitting in armchairs with a calm therapist figure between them; a soft protective circle or dome drawn around all three, empty speech bubbles from both partners of equal size, conveying balance and safety.",
      alt: "Ilustracja: para i terapeuta w bezpiecznym kręgu, oboje mają tyle samo miejsca na rozmowę",
      caption: "W skrócie: na terapii par każde z Was ma tyle samo miejsca. Terapeuta pilnuje, żeby rozmowa była bezpieczna dla obojga.",
    },
    { t: "h2", id: "o-co-pyta-terapeuta", text: "O co pyta terapeuta na pierwszym spotkaniu?" },
    {
      t: "list",
      items: [
        "Co sprawiło, że zdecydowaliście się przyjść właśnie teraz?",
        "Jak wygląda Wasza typowa kłótnia – od czego się zaczyna i jak się kończy?",
        "Co nadal dobrze działa w Waszej relacji? Kiedy ostatnio było Wam razem dobrze?",
        "Czego każde z Was chciałoby po terapii?",
        "Czy w przeszłości korzystaliście z pomocy psychologa – razem albo osobno?",
      ],
    },
    {
      t: "p",
      text: "Nie musisz mieć gotowych odpowiedzi. Terapeuta nie ocenia, kto ma rację – pomaga zobaczyć, **co dzieje się między Wami**. Jeśli chcesz się przygotować, przejrzyj [21 pytań o relacji](/wiedza/21-pytan-o-relacji) – to dobry punkt wyjścia do rozmowy.",
    },
    { t: "cta", magnet: "21-pytan-o-relacji", hook: "Przygotuj się do pierwszej wizyty: 21 pytań w pięciu obszarach pomoże Ci nazwać, co jest dla Ciebie najważniejsze." },
    { t: "h2", id: "poufnosc", text: "Poufność i zasady – co zostaje w gabinecie" },
    {
      t: "p",
      text: "Terapeuta jest zobowiązany do zachowania tajemnicy. To, o czym mówicie, nie wychodzi poza gabinet – z wyjątkiem sytuacji, w których ktoś jest w niebezpieczeństwie. Warto na początku zapytać, jak terapeuta podchodzi do **sekretów**: czy jeśli któreś z Was powie mu coś na osobności, zostanie to między nimi, czy wróci na wspólne spotkanie. Różni terapeuci mają różne zasady – ważne, żebyście je znali.",
    },
    { t: "h2", id: "jak-czesto", text: "Jak często i jak długo trwają spotkania?" },
    {
      t: "p",
      text: "Rytm spotkań ustalacie z terapeutą – często na początku są to spotkania regularne, a z czasem mogą być rzadsze. Długość całej terapii zależy od tego, z czym przychodzicie, i od tego, czego chcecie. Niektóre pary potrzebują kilku spotkań, żeby uporządkować sytuację, inne pracują dłużej nad głębszymi wzorcami.",
    },
    { t: "h2", id: "jak-sie-przygotowac", text: "Jak przygotować się do pierwszej wizyty?" },
    {
      t: "list",
      items: [
        "**Zapisz 2–3 sytuacje**, które najlepiej pokazują, co się dzieje.",
        "**Pomyśl, czego chcesz**, a nie tylko czego już nie chcesz.",
        "**Ustalcie, że nie kłócicie się w drodze** na spotkanie – trudne tematy zostawcie na sesję.",
        "**Daj sobie prawo do emocji** – płacz, złość czy milczenie są w gabinecie czymś zwykłym.",
        "**Zaplanuj czas po spotkaniu** – spacer, kawa, chwila ciszy. Nie wracaj od razu do pracy.",
      ],
    },
    { t: "h2", id: "klotnia-w-gabinecie", text: "Co, jeśli pokłócicie się w gabinecie?" },
    {
      t: "p",
      text: "To się zdarza i nie jest porażką. Terapeuta widzi wtedy na żywo, jak przebiega Wasza rozmowa, i może pomóc ją zatrzymać w momencie, w którym zwykle wymyka się spod kontroli. Często właśnie takie chwile są najbardziej pomocne – bo pierwszy raz udaje się zobaczyć [pętlę konfliktu](/wiedza/petla-konfliktu) z boku.",
    },
    { t: "h2", id: "obawy", text: "Najczęstsze obawy przed pierwszą wizytą" },
    {
      t: "list",
      items: [
        "**„Wyjdzie, że to moja wina”** – terapeuta par patrzy na to, co dzieje się między Wami, a nie szuka winnego.",
        "**„Będę musiał / musiała mówić o wszystkim”** – mówicie tyle, ile jesteście gotowi. Zaufanie buduje się stopniowo.",
        "**„Partner wykorzysta to przeciwko mnie”** – terapeuta dba o zasady rozmowy, a na niektóre tematy przychodzi czas później.",
        "**„To nic nie da”** – pierwsze spotkanie nie musi niczego „naprawić”. Ma pomóc zrozumieć, od czego zacząć.",
      ],
    },
    { t: "h2", id: "po-wizycie", text: "Po pierwszej wizycie – jak o niej rozmawiać" },
    {
      t: "p",
      text: "Po spotkaniu emocje mogą być silne. Nie musicie od razu „podsumowywać”. Dobrze działa prosta zasada: każde z Was mówi jedno zdanie o tym, co było dla niego ważne, bez komentowania słów drugiej osoby. Na szczegóły przyjdzie czas.",
    },
    {
      t: "art",
      key: "po-spotkaniu",
      title: "Po spotkaniu: oddech zamiast analizy",
      prompt: "Two figures walking side by side on a quiet tree-lined path after leaving a building, relaxed body language, a few soft leaves and gentle wind lines; calm, reflective mood.",
      alt: "Ilustracja: para spaceruje spokojną aleją po wizycie u terapeuty",
      caption: "W skrócie: po pierwszym spotkaniu nie musicie wszystkiego od razu analizować. Spacer i jedno zdanie od każdego wystarczą.",
    },
    { t: "h2", id: "czego-sie-nie-bac", text: "Czego nie trzeba się bać" },
    {
      t: "p",
      text: "Terapeuta nie stanie po niczyjej stronie i nie powie Wam, czy macie się rozstać. Jego rolą jest pomóc Wam zrozumieć sytuację i wybrać drogę, która będzie dobra dla Was – także wtedy, gdy rozważacie [rozstanie](/wiedza/artykuly/terapia-malzenska-czy-rozwod).",
    },
    {
      t: "callout",
      title: "Jeśli partner nie chce przyjść",
      text: "Pierwszą wizytę możesz odbyć sam lub sama. Zobacz, [co możesz zrobić, gdy partner nie chce iść na terapię par](/wiedza/artykuly/terapia-par-gdy-partner-nie-chce).",
    },
    { t: "h2", id: "w-duo", text: "Jak wygląda pierwszy krok w DUO" },
    {
      t: "p",
      text: "W DUO zaczynamy od [Mapy Relacji](/mapa-relacji). Najpierw wypełniasz poufny kwestionariusz – przy parze każde z Was ma własny. Mapa Relacji dla Ciebie to jedno spotkanie online z psychologiem, a Mapa Relacji dla Was – trzy spotkania: z każdym z Was osobno i jedno wspólne. Psycholog zna wcześniej Wasze odpowiedzi, więc nie zaczynacie od opowiadania wszystkiego od początku. Na końcu dostajecie pisemne podsumowanie z możliwymi kolejnymi krokami.",
    },
    {
      t: "p",
      text: "Nie jesteście pewni, czy to już ten moment? Przeczytaj [9 sygnałów, że warto iść na terapię par](/wiedza/artykuly/kiedy-isc-na-terapie-par).",
    },
    { t: "mapa" },
  ],
  faq: [
    { q: "Ile trwa pierwsza wizyta na terapii par?", a: "Zwykle tyle, ile standardowe spotkanie u danego terapeuty. Przy Mapie Relacji w DUO wariant dla Ciebie to 1 spotkanie (60 minut), a wariant dla Was – 3 spotkania: z każdym z Was osobno i jedno wspólne." },
    { q: "Czy terapeuta rozmawia z każdym z nas osobno?", a: "Zależy od metody pracy. Część terapeutów proponuje także spotkania indywidualne, ale zawsze z jasnymi zasadami dotyczącymi tego, co pozostaje poufne." },
    { q: "Czy muszę od razu mówić o wszystkim?", a: "Nie. Możesz mówić w swoim tempie. Terapeuta pomoże Wam ustalić, od czego zacząć." },
    { q: "Co, jeśli terapeuta nam nie odpowiada?", a: "Warto o tym powiedzieć – czasem wystarczy rozmowa o oczekiwaniach. Jeśli to nie pomaga, macie prawo poszukać innej osoby. Poczucie bezpieczeństwa jest podstawą tej pracy." },
  ],
  related: ["kiedy-isc-na-terapie-par", "terapia-par-online", "terapia-par-gdy-partner-nie-chce"],
  magnets: ["21-pytan-o-relacji", "trudna-rozmowa", "przykladowa-mapa-relacji"],
};
