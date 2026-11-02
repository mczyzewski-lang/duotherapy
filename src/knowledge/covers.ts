// Okładki materiałów: emocjonalny cytat, nastrój kolorystyczny i projekt zdjęcia (brief dla fotografa / generatora).
// Gdy zdjęcie zostanie dostarczone, wystarczy zapisać je jako public/img/wiedza/<slug>.jpg i ustawić photo: true.
// Bez stockowych zdjęć „par z uśmiechem” – detale, światło, przestrzeń, dłonie, codzienność.

export interface CoverExtra {
  hook: string;
  /** Nazwa podsumowania w CTA „Podsumuj …”. Puste = materiał bez pól do uzupełnienia. */
  summary: string;
  /** Nastrój okładki zastępczej: [światło, cień] */
  mood: [string, string, string];
  photo: boolean;
  photoBrief: string;
}

export const COVERS: Record<string, CoverExtra> = {
  "mapa-trzech-drog": {
    hook: "„Raz chcę walczyć, raz odejść. Nie wiem już, czego chcę.”",
    summary: "swoją Mapę 3 dróg",
    mood: ["#f6d9c8", "#a9512f", "#36493d"],
    photo: false,
    photoBrief: "Rozwidlenie leśnej ścieżki o świcie, mgła, ciepłe boczne światło; bez ludzi. Kadr pionowy, dużo powietrza u góry na tytuł.",
  },
  "21-pytan-o-relacji": {
    hook: "„Chciałabym porozmawiać, tylko nie wiem, od czego zacząć.”",
    summary: "swoje odpowiedzi na 21 pytań",
    mood: ["#f3e2d3", "#c98b6a", "#46604f"],
    photo: false,
    photoBrief: "Dwa kubki na drewnianym stole przy oknie, poranne światło, notes i długopis; ślad obecności dwojga ludzi bez pokazywania twarzy.",
  },
  "kryzys-czy-koniec-milosci": {
    hook: "„Czy ja go jeszcze kocham – czy po prostu jestem zmęczona?”",
    summary: "swoje myśli – kryzys czy koniec miłości",
    mood: ["#f4dcd6", "#e07f78", "#4d4540"],
    photo: false,
    photoBrief: "Kobieta lub mężczyzna przy oknie, zamyślenie, profil w kontrze, deszcz na szybie; ciepłe wnętrze, chłodne światło z zewnątrz.",
  },
  "przykladowa-mapa-relacji": {
    hook: "„Chcę zobaczyć, co dokładnie dostanę.”",
    summary: "",
    mood: ["#e5ece6", "#46604f", "#a9512f"],
    photo: false,
    photoBrief: "Dłonie trzymające wydruk podsumowania przy stole, kubek herbaty, miękkie światło; dokument nieczytelny (rozmyty).",
  },
  "7-dni-lepszych-rozmow": {
    hook: "„Kiedyś rozmawialiśmy godzinami. Teraz tylko o rachunkach.”",
    summary: "swój tydzień lepszych rozmów",
    mood: ["#f6e6c9", "#c98b6a", "#36493d"],
    photo: false,
    photoBrief: "Dwie osoby na kanapie wieczorem, widoczne tylko dłonie i kolana, ciepła lampa, telefony odłożone ekranem w dół.",
  },
  "trudna-rozmowa": {
    hook: "„Każda ważna rozmowa kończy się kłótnią.”",
    summary: "swój plan trudnej rozmowy",
    mood: ["#f2dccd", "#a9512f", "#2a2522"],
    photo: false,
    photoBrief: "Dwa krzesła naprzeciw siebie przy kuchennym stole, jedno lekko odsunięte; wieczorne światło, spokojna, napięta cisza.",
  },
  "partner-nie-chce-ratowac-zwiazku": {
    hook: "„Chcę ratować nas, a on już nie chce rozmawiać.”",
    summary: "swoją mapę wpływu",
    mood: ["#ece3d6", "#b89b7f", "#36493d"],
    photo: false,
    photoBrief: "Jedna osoba na brzegu łóżka, druga połowa pusta i zasłana; poranne światło; poczucie samotności bez dramatyzmu.",
  },
  "petla-konfliktu": {
    hook: "„Znowu to samo. Te same słowa, ta sama kłótnia.”",
    summary: "swoją pętlę konfliktu",
    mood: ["#f4dfd1", "#a9512f", "#46604f"],
    photo: false,
    photoBrief: "Spiralne schody z góry albo kręte schody w świetle; motyw powtarzającego się ruchu; ciepłe, ziemiste kolory.",
  },
  "po-zdradzie": {
    hook: "„Wszystko rozpadło się w jeden wieczór.”",
    summary: "swoje pytania i potrzeby",
    mood: ["#f3dcd8", "#e07f78", "#36493d"],
    photo: false,
    photoBrief: "Dłoń na kubku z herbatą, koc, wczesny poranek, spokojne światło; poczucie troski o siebie, bez dramatu i symboli zdrady.",
  },
  "swiadome-rozstanie": {
    hook: "„Zdecydowaliśmy. Ale jak to zrobić, żeby dzieci nie ucierpiały?”",
    summary: "swoją checklistę rozstania",
    mood: ["#e5ece6", "#46604f", "#c98b6a"],
    photo: false,
    photoBrief: "Dziecięca dłoń w dłoni dorosłego na spacerze jesienią, kadr od tyłu; spokój i bezpieczeństwo, bez smutnych twarzy.",
  },
};

export const coverOf = (slug: string) => COVERS[slug];
