import type { Article } from "./types";

export const article: Article = {
  slug: "terapia-malzenska-czy-rozwod",
  h1: "Terapia małżeńska czy rozwód? Jak podjąć decyzję bez pośpiechu",
  title: "Terapia małżeńska czy rozwód?",
  seoTitle: "Terapia małżeńska czy rozwód? Jak podjąć decyzję",
  description: "Ratować małżeństwo, dać sobie czas czy się rozstać? Zobacz trzy możliwe drogi, pytania przed decyzją i to, jak terapia par pomaga wybrać spokojnie – bez presji.",
  excerpt: "Między „ratujemy” a „rozwód” jest więcej możliwości. Zobacz trzy drogi i pytania, które pomagają wybrać spokojnie.",
  keywords: ["terapia małżeńska czy rozwód", "ratować małżeństwo czy się rozstać", "jak podjąć decyzję o rozwodzie", "kryzys w małżeństwie co robić", "czy warto ratować małżeństwo"],
  tags: ["terapia małżeńska", "decyzja", "rozstanie", "kryzys w związku"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 8,
  lead:
    "W kryzysie łatwo myśleć zero-jedynkowo: albo ratujemy związek, albo rozwód. W praktyce między tymi biegunami jest więcej możliwości – a decyzja podjęta pod wpływem najgorszego tygodnia rzadko jest tą, której później jesteśmy pewni.",
  blocks: [
    { t: "h2", id: "trzy-drogi", text: "Trzy możliwe drogi, nie dwie" },
    { t: "figure", graphic: "decision-roads", title: "Od kryzysu przez zrozumienie do jednej z trzech dróg", caption: "Najpierw zrozumienie sytuacji, potem wybór drogi. Żadna z dróg nie jest „lepsza” – ważne, żeby była wybrana świadomie." },
    {
      t: "list",
      items: [
        "**[Odbudowa relacji](/odbudowa)** – gdy oboje chcecie spróbować i jesteście gotowi pracować nad komunikacją, zaufaniem i bliskością.",
        "**[Czas na decyzję](/czas-na-decyzje)** – gdy nie wiesz jeszcze, czego chcesz, i potrzebujesz spokojnej przestrzeni, żeby to sprawdzić.",
        "**[Świadome rozstanie](/swiadome-rozstanie)** – gdy decyzja dojrzewa lub zapadła, a chcecie przejść przez nią z szacunkiem, szczególnie dla dzieci.",
      ],
    },
    { t: "cta", magnet: "mapa-trzech-drog", hook: "Mapa 3 dróg pomoże Ci zobaczyć wszystkie możliwości i pytania, które warto zadać sobie przed decyzją." },
    { t: "h2", id: "pytania-przed-decyzja", text: "Pytania, które warto sobie zadać przed decyzją" },
    {
      t: "list",
      ordered: true,
      items: [
        "Co czuję do partnera, gdy myślę o nim spokojnie – nie w trakcie kłótni?",
        "Czy problem dotyczy jednego obszaru (np. pieniędzy), czy całej relacji?",
        "Czy próbowaliśmy już czegoś innego niż te same rozmowy?",
        "Czego się boję – zostać czy odejść?",
        "Jak każda z dróg wpłynie na nasze dzieci (jeśli są)?",
      ],
    },
    {
      t: "p",
      text: "Jeśli odpowiedzi zmieniają się z dnia na dzień, to normalne. Pomaga materiał [Kryzys czy koniec miłości?](/wiedza/kryzys-czy-koniec-milosci) – 10 pytań, które porządkują myśli.",
    },
    { t: "h2", id: "jak-pomaga-terapia", text: "Jak terapia małżeńska pomaga w decyzji" },
    {
      t: "p",
      text: "Terapia par nie ma z góry założonego celu „uratowania małżeństwa za wszelką cenę”. Jej celem jest **zrozumienie**: co się dzieje, co jeszcze Was łączy, co Was rani. Dopiero z tego miejsca łatwiej wybrać drogę, której nie będziecie żałować. Jeśli zastanawiacie się, czy to już ten moment, zobacz [9 sygnałów, że warto iść na terapię par](/wiedza/artykuly/kiedy-isc-na-terapie-par).",
    },
    {
      t: "callout",
      title: "Gdy decyzja o rozstaniu już zapadła",
      text: "Rozstanie też może być przemyślane. Zobacz [checklistę pierwszych kroków po decyzji](/wiedza/swiadome-rozstanie) – sprawy emocjonalne, rodzinne i organizacyjne.",
    },
    { t: "cta", magnet: "swiadome-rozstanie", hook: "Checklista po decyzji o rozstaniu: jak rozmawiać z dziećmi, co ustalić i o co zadbać w pierwszych tygodniach." },
    { t: "mapa" },
  ],
  faq: [
    { q: "Czy terapia małżeńska ma sens, jeśli jedno z nas chce rozwodu?", a: "Może mieć. Pomaga zrozumieć, skąd ta decyzja, i przejść przez nią spokojniej – albo odkryć, że jest jeszcze coś do zrobienia." },
    { q: "Jak długo myśleć przed decyzją o rozwodzie?", a: "Nie ma jednej odpowiedzi. Ważniejsze od czasu jest to, czy decyzja wynika ze zrozumienia sytuacji, a nie z jednego bardzo trudnego okresu." },
    { q: "Czy terapeuta powie nam, czy mamy się rozstać?", a: "Nie. Terapeuta pomaga zobaczyć możliwości i konsekwencje, ale decyzja zawsze należy do Was." },
  ],
  related: ["kiedy-isc-na-terapie-par", "terapia-par-gdy-partner-nie-chce", "jak-wyglada-pierwsza-wizyta-terapia-malzenska"],
  magnets: ["mapa-trzech-drog", "kryzys-czy-koniec-milosci", "swiadome-rozstanie"],
};
