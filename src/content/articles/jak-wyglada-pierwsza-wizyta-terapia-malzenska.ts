import type { Article } from "./types";

export const article: Article = {
  slug: "jak-wyglada-pierwsza-wizyta-terapia-malzenska",
  h1: "Jak wygląda pierwsza wizyta na terapii małżeńskiej? Przebieg krok po kroku",
  title: "Pierwsza wizyta na terapii małżeńskiej",
  seoTitle: "Pierwsza wizyta na terapii małżeńskiej – jak wygląda?",
  description: "Jak wygląda pierwsza wizyta na terapii małżeńskiej lub terapii par? O co pyta terapeuta, jak się przygotować i czego się nie bać – przebieg krok po kroku.",
  excerpt: "Stres przed pierwszym spotkaniem jest naturalny. Zobacz, jak zwykle wygląda pierwsza wizyta i jak się do niej przygotować.",
  keywords: ["pierwsza wizyta terapia małżeńska", "jak wygląda terapia par", "pierwsza sesja terapii par", "o co pyta terapeuta par", "jak przygotować się do terapii par"],
  tags: ["terapia par", "terapia małżeńska", "pierwsza wizyta"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 6,
  lead:
    "Pierwsza wizyta na terapii małżeńskiej budzi zwykle dużo pytań: o co zapyta terapeuta, czy będzie oceniał, czy trzeba od razu mówić o wszystkim? Spokojnie – pierwsze spotkanie służy przede wszystkim poznaniu się i zrozumieniu, z czym przychodzicie.",
  blocks: [
    { t: "h2", id: "przebieg", text: "Przebieg pierwszej wizyty krok po kroku" },
    { t: "figure", graphic: "first-visit", title: "Pierwsza wizyta na terapii par – cztery etapy", caption: "Typowy przebieg początku terapii par. Szczegóły zależą od terapeuty i Waszej sytuacji." },
    {
      t: "list",
      ordered: true,
      items: [
        "**Krótki kontakt przed spotkaniem** – ustalacie termin i formę (stacjonarnie lub [online](/wiedza/artykuly/terapia-par-online)). Czasem terapeuta prosi o wypełnienie krótkiego kwestionariusza.",
        "**Poznanie Waszej historii** – terapeuta pyta, co Was sprowadza, od kiedy trwa trudność i co już próbowaliście. Każde z Was ma przestrzeń, żeby powiedzieć to po swojemu.",
        "**Ustalenie celów i zasad** – co chcecie osiągnąć, jak często będziecie się spotykać, jakie są zasady poufności.",
        "**Plan dalszej pracy** – na koniec pierwszego lub kolejnego spotkania omawiacie, jak może wyglądać dalsza praca.",
      ],
    },
    { t: "h2", id: "o-co-pyta-terapeuta", text: "O co pyta terapeuta na pierwszym spotkaniu?" },
    {
      t: "list",
      items: [
        "Co sprawiło, że zdecydowaliście się przyjść właśnie teraz?",
        "Jak wygląda Wasza typowa kłótnia – od czego się zaczyna i jak się kończy?",
        "Co nadal dobrze działa w Waszej relacji?",
        "Czego każde z Was chciałoby po terapii?",
      ],
    },
    {
      t: "p",
      text: "Nie musisz mieć gotowych odpowiedzi. Terapeuta nie ocenia, kto ma rację – pomaga zobaczyć, **co dzieje się między Wami**. Jeśli chcesz się przygotować, przejrzyj [21 pytań o relacji](/wiedza/21-pytan-o-relacji).",
    },
    { t: "cta", magnet: "21-pytan-o-relacji", hook: "Przygotuj się do pierwszej wizyty: 21 pytań w pięciu obszarach pomoże Ci nazwać, co jest dla Ciebie najważniejsze." },
    { t: "h2", id: "jak-sie-przygotowac", text: "Jak przygotować się do pierwszej wizyty?" },
    {
      t: "list",
      items: [
        "**Zapisz 2–3 sytuacje**, które najlepiej pokazują, co się dzieje.",
        "**Pomyśl, czego chcesz**, a nie tylko czego już nie chcesz.",
        "**Ustalcie, że nie kłócicie się w drodze** na spotkanie – trudne tematy zostawcie na sesję.",
        "**Daj sobie prawo do emocji** – płacz, złość czy milczenie są w gabinecie czymś zwykłym.",
      ],
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
    { t: "mapa" },
  ],
  faq: [
    { q: "Ile trwa pierwsza wizyta na terapii par?", a: "Zwykle tyle, ile standardowe spotkanie u danego terapeuty. Przy Mapie Relacji w DUO konsultacja dla pary trwa 90 minut, a indywidualna 60 minut." },
    { q: "Czy terapeuta rozmawia z każdym z nas osobno?", a: "Zależy od metody pracy. Część terapeutów proponuje także spotkania indywidualne, ale zawsze z jasnymi zasadami dotyczącymi tego, co pozostaje poufne." },
    { q: "Czy muszę od razu mówić o wszystkim?", a: "Nie. Możesz mówić w swoim tempie. Terapeuta pomoże Wam ustalić, od czego zacząć." },
  ],
  related: ["kiedy-isc-na-terapie-par", "terapia-par-online", "terapia-par-gdy-partner-nie-chce"],
  magnets: ["21-pytan-o-relacji", "trudna-rozmowa", "przykladowa-mapa-relacji"],
};
