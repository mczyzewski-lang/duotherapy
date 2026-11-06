import type { Article } from "./types";

export const article: Article = {
  slug: "terapia-malzenska-czy-rozwod",
  h1: "Terapia małżeńska czy rozwód? Jak podjąć decyzję bez pośpiechu",
  title: "Terapia małżeńska czy rozwód?",
  seoTitle: "Terapia małżeńska czy rozwód? Jak podjąć decyzję",
  description: "Ratować małżeństwo, dać sobie czas czy się rozstać? Zobacz trzy możliwe drogi, pytania przed decyzją i to, jak terapia par pomaga wybrać spokojnie – bez presji.",
  excerpt: "Między „ratujemy” a „rozwód” jest więcej możliwości. Zobacz trzy drogi i pytania, które pomagają wybrać spokojnie.",
  keywords: ["terapia małżeńska czy rozwód", "ratować małżeństwo czy się rozstać", "jak podjąć decyzję o rozwodzie", "kryzys w małżeństwie co robić", "czy warto ratować małżeństwo", "jak powiedzieć dzieciom o rozstaniu"],
  tags: ["terapia małżeńska", "decyzja", "rozstanie", "kryzys w związku"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 15,
  lead:
    "W kryzysie łatwo myśleć zero-jedynkowo: albo ratujemy związek, albo rozwód. W praktyce między tymi biegunami jest więcej możliwości – a decyzja podjęta pod wpływem najgorszego tygodnia rzadko jest tą, której później jesteśmy pewni. W tym artykule pokazujemy trzy możliwe drogi, pułapki, w które łatwo wpaść w kryzysie, pytania warte zadania sobie przed decyzją i to, jak terapia małżeńska pomaga wybrać spokojnie.",
  hero: {
    prompt: "A calm crossroads in a gentle landscape with three soft paths: one with a small heart-shaped tree, one with a simple hourglass-shaped stone, one with two parallel paths diverging peacefully; a person standing at the start looking ahead calmly.",
    alt: "Ilustracja: rozdroże z trzema ścieżkami – odbudowa, czas na decyzję i świadome rozstanie",
  },
  blocks: [
    { t: "h2", id: "dlaczego-trudno", text: "Dlaczego ta decyzja jest tak trudna" },
    {
      t: "p",
      text: "Decyzja o przyszłości małżeństwa dotyka wszystkiego naraz: uczuć, wspólnej historii, dzieci, pieniędzy, domu, rodziny i przyjaciół. Do tego dochodzi **ambiwalencja** – jednego dnia chcesz walczyć, drugiego odejść. To nie jest oznaka słabości ani niezdecydowania. To naturalna reakcja na sytuację, w której każda droga coś daje i coś odbiera.",
    },
    {
      t: "art",
      key: "ambiwalencja",
      title: "Ambiwalencja: dwa głosy naraz",
      prompt: "A single calm person sitting thoughtfully with two small empty thought bubbles above, one containing a heart icon and one containing an open door icon; balanced composition, gentle and non-dramatic.",
      alt: "Ilustracja: osoba z dwiema chmurkami myśli – serce i otwarte drzwi – symbol ambiwalencji w kryzysie",
      caption: "W skrócie: chcieć zostać i chcieć odejść jednocześnie to normalne w kryzysie. To informacja, a nie błąd.",
    },
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
    { t: "h2", id: "pulapki", text: "Pułapki decyzji w kryzysie" },
    {
      t: "list",
      items: [
        "**Decyzja w gniewie** – po wyjątkowo trudnej kłótni wszystko wydaje się przesądzone. Dzień później obraz bywa inny.",
        "**Presja otoczenia** – rodzina i przyjaciele często mają gotowe odpowiedzi. Ale to Wy będziecie żyć z decyzją.",
        "**„Zostajemy dla dzieci”** – dzieci potrzebują przede wszystkim spokojnych rodziców. Czasem to oznacza odbudowę, czasem dobre rozstanie.",
        "**Odkładanie w nieskończoność** – brak decyzji też jest decyzją. Długie zawieszenie potrafi męczyć bardziej niż każda z dróg.",
      ],
    },
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
        "Jak chcę wspominać ten czas za pięć lat?",
      ],
    },
    {
      t: "p",
      text: "Jeśli odpowiedzi zmieniają się z dnia na dzień, to normalne. Pomaga materiał [Kryzys czy koniec miłości?](/wiedza/kryzys-czy-koniec-milosci) – 10 pytań, które porządkują myśli.",
    },
    { t: "h2", id: "dac-sobie-czas", text: "Jak dać sobie czas na decyzję – konkretnie" },
    {
      t: "list",
      items: [
        "**Umówcie się na czas** – np. kilka tygodni, w których nie podejmujecie ostatecznych kroków, tylko obserwujecie i rozmawiacie.",
        "**Ustalcie zasady na ten czas** – jak rozmawiacie, co mówicie dzieciom, co zostaje bez zmian.",
        "**Zapisuj obserwacje** – co pomaga, co rani, kiedy czujesz bliskość, a kiedy dystans.",
        "**Skorzystajcie ze wsparcia** – konsultacja z psychologiem pomaga zobaczyć sytuację z zewnątrz.",
      ],
    },
    { t: "h2", id: "jak-pomaga-terapia", text: "Jak terapia małżeńska pomaga w decyzji" },
    {
      t: "p",
      text: "Terapia par nie ma z góry założonego celu „uratowania małżeństwa za wszelką cenę”. Jej celem jest **zrozumienie**: co się dzieje, co jeszcze Was łączy, co Was rani. Dopiero z tego miejsca łatwiej wybrać drogę, której nie będziecie żałować. Jeśli zastanawiacie się, czy to już ten moment, zobacz [9 sygnałów, że warto iść na terapię par](/wiedza/artykuly/kiedy-isc-na-terapie-par).",
    },
    {
      t: "art",
      key: "zrozumienie-przed-decyzja",
      title: "Najpierw zrozumienie, potem decyzja",
      prompt: "A simple map unfolding on a table with two hands gently holding it from both sides; on the map three soft paths and a small compass in sage green; calm, thoughtful mood.",
      alt: "Ilustracja: dwie osoby wspólnie rozkładają mapę z trzema ścieżkami i kompasem",
      caption: "W skrócie: decyzja oparta na zrozumieniu sytuacji jest spokojniejsza niż ta podjęta w najgorszym tygodniu.",
    },
    { t: "h2", id: "jedno-chce-odejsc", text: "Co, jeśli tylko jedno z Was chce odejść" },
    {
      t: "p",
      text: "To jedna z najtrudniejszych sytuacji: jedna osoba jest już „w drodze do wyjścia”, druga wciąż chce walczyć. Pomaga uczciwość – także wobec siebie. Osoba, która chce odejść, często potrzebuje przestrzeni, żeby sprawdzić, czy to decyzja, czy ucieczka od bólu. Osoba, która chce zostać, potrzebuje wsparcia, żeby nie zgubić siebie w próbach ratowania związku za wszelką cenę.",
    },
    {
      t: "p",
      text: "W takiej sytuacji dobrze sprawdza się wspólna rozmowa ze specjalistą, nastawiona nie na „przekonanie” kogokolwiek, tylko na zrozumienie. Czasem prowadzi do odbudowy, czasem do spokojniejszego rozstania. W obu przypadkach zmniejsza chaos i poczucie krzywdy.",
    },
    { t: "h2", id: "dzieci", text: "Rozmowa z dziećmi – zasady ogólne" },
    {
      t: "p",
      text: "Niezależnie od tego, jaką drogę wybierzecie, dzieci potrzebują poczucia bezpieczeństwa i przewidywalności. Najczęściej pomaga: rozmowa razem, prostym językiem dopasowanym do wieku, zapewnienie, że to nie ich wina, i konkretne informacje o tym, co się zmieni, a co zostanie. Szczegółowe wskazówki znajdziesz w [checkliście po decyzji o rozstaniu](/wiedza/swiadome-rozstanie).",
    },
    {
      t: "callout",
      title: "Gdy decyzja o rozstaniu już zapadła",
      text: "Rozstanie też może być przemyślane. W DUO pomagamy wskazać najlepszą dla Was drogę rozstania – ze wsparciem indywidualnym, dla pary i dla dzieci. Zobacz ścieżkę [Świadome rozstanie](/swiadome-rozstanie).",
    },
    { t: "cta", magnet: "swiadome-rozstanie", hook: "Checklista po decyzji o rozstaniu: jak rozmawiać z dziećmi, co ustalić i o co zadbać w pierwszych tygodniach." },
    {
      t: "p",
      text: "A jeśli Twój partner nie chce rozmawiać o terapii, przeczytaj, [co możesz zrobić, gdy tylko jedno z Was chce terapii par](/wiedza/artykuly/terapia-par-gdy-partner-nie-chce).",
    },
    { t: "mapa" },
  ],
  faq: [
    { q: "Czy terapia małżeńska ma sens, jeśli jedno z nas chce rozwodu?", a: "Może mieć. Pomaga zrozumieć, skąd ta decyzja, i przejść przez nią spokojniej – albo odkryć, że jest jeszcze coś do zrobienia." },
    { q: "Jak długo myśleć przed decyzją o rozwodzie?", a: "Nie ma jednej odpowiedzi. Ważniejsze od czasu jest to, czy decyzja wynika ze zrozumienia sytuacji, a nie z jednego bardzo trudnego okresu." },
    { q: "Czy terapeuta powie nam, czy mamy się rozstać?", a: "Nie. Terapeuta pomaga zobaczyć możliwości i konsekwencje, ale decyzja zawsze należy do Was." },
    { q: "Czy można rozstać się bez wojny?", a: "Często tak. Pomaga wspólne ustalenie zasad komunikacji, spraw dzieci i finansów – najlepiej ze wsparciem specjalisty, zanim emocje przejmą kontrolę." },
  ],
  related: ["kiedy-isc-na-terapie-par", "terapia-par-gdy-partner-nie-chce", "jak-wyglada-pierwsza-wizyta-terapia-malzenska"],
  magnets: ["mapa-trzech-drog", "kryzys-czy-koniec-milosci", "swiadome-rozstanie"],
};
