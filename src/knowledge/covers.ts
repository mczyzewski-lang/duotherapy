// Okładki materiałów: emocjonalny cytat, nastrój kolorystyczny i projekt zdjęcia (brief dla fotografa / generatora).
// Gdy zdjęcie zostanie dostarczone, wystarczy zapisać je jako public/img/wiedza/<slug>.jpg i ustawić photo: true.
// Bez stockowych zdjęć „par z uśmiechem” – detale, światło, przestrzeń, dłonie, codzienność.
import { COVERS_A } from "./materials/nowe-a.covers";
import { COVERS_B } from "./materials/nowe-b.covers";
import { COVERS_C } from "./materials/nowe-c.covers";
import { COVERS_D } from "./materials/nowe-d.covers";
import { COVERS_E } from "./materials/nowe-e.covers";
import { COVERS_F } from "./materials/nowe-f.covers";
import { COVERS_G } from "./materials/nowe-g.covers";
import { COVERS_H } from "./materials/nowe-h.covers";
import { COVERS_I } from "./materials/nowe-i.covers";

export interface CoverExtra {
  hook: string;
  /** Nazwa podsumowania w CTA „Podsumuj …”. Puste = materiał bez pól do uzupełnienia. */
  summary: string;
  /** Nastrój okładki zastępczej: [światło, cień] */
  mood: [string, string, string];
  photo: boolean;
  photoBrief: string;
  /** Okładka 2D: scena z maskotkami DUO (po angielsku – styl dokłada ART_STYLE). */
  artBrief: string;
}

export const COVERS: Record<string, CoverExtra> = {
  "mapa-trzech-drog": {
    hook: "„Raz chcę walczyć, raz odejść. Nie wiem już, czego chcę.”",
    summary: "swoją Mapę 3 dróg",
    mood: ["#f6d9c8", "#a9512f", "#36493d"],
    photo: false,
    photoBrief: "Rozwidlenie leśnej ścieżki o świcie, mgła, ciepłe boczne światło; bez ludzi. Kadr pionowy, dużo powietrza u góry na tytuł.",
    artBrief: "The green and the terracotta mascot stand side by side, seen slightly from behind, at a gentle fork where one path splits into three soft roads (rose, terracotta and forest green) leading into calm hills; a small warm sun low on the horizon.",
  },
  "21-pytan-o-relacji": {
    hook: "„Chciałabym porozmawiać, tylko nie wiem, od czego zacząć.”",
    summary: "swoje odpowiedzi na 21 pytań",
    mood: ["#f3e2d3", "#c98b6a", "#46604f"],
    photo: false,
    photoBrief: "Dwa kubki na drewnianym stole przy oknie, poranne światło, notes i długopis; ślad obecności dwojga ludzi bez pokazywania twarzy.",
    artBrief: "The green and the terracotta mascot sit at a small round table with two mugs; one gently slides a small blank card toward the other; two empty thought bubbles and a tiny heart float between them.",
  },
  "kryzys-czy-koniec-milosci": {
    hook: "„Czy ja go jeszcze kocham – czy po prostu jestem zmęczona?”",
    summary: "swoje myśli – kryzys czy koniec miłości",
    mood: ["#f4dcd6", "#e07f78", "#4d4540"],
    photo: false,
    photoBrief: "Kobieta lub mężczyzna przy oknie, zamyślenie, profil w kontrze, deszcz na szybie; ciepłe wnętrze, chłodne światło z zewnątrz.",
    artBrief: "The terracotta mascot sits on a cushion by a big window, hugging its knees and thinking; outside soft rain on one side and a clearing sky on the other; one small cloud and one small heart in empty thought bubbles.",
  },
  "przykladowa-mapa-relacji": {
    hook: "„Chcę zobaczyć, co dokładnie dostanę.”",
    summary: "",
    mood: ["#e5ece6", "#46604f", "#a9512f"],
    photo: false,
    photoBrief: "Dłonie trzymające wydruk podsumowania przy stole, kubek herbaty, miękkie światło; dokument nieczytelny (rozmyty).",
    artBrief: "The green and the terracotta mascot hold a large unfolded paper map together, looking at it with curiosity; on the map three gentle coloured paths and a small heart marker, no writing.",
  },
  "7-dni-lepszych-rozmow": {
    hook: "„Kiedyś rozmawialiśmy godzinami. Teraz tylko o rachunkach.”",
    summary: "swój tydzień lepszych rozmów",
    mood: ["#f6e6c9", "#c98b6a", "#36493d"],
    photo: false,
    photoBrief: "Dwie osoby na kanapie wieczorem, widoczne tylko dłonie i kolana, ciepła lampa, telefony odłożone ekranem w dół.",
    artBrief: "The green and the terracotta mascot sit close on a cosy sofa in the evening, turned toward each other in calm conversation; phones lie face down on a little table, a warm lamp glows, a small heart between empty speech bubbles.",
  },
  "trudna-rozmowa": {
    hook: "„Każda ważna rozmowa kończy się kłótnią.”",
    summary: "swój plan trudnej rozmowy",
    mood: ["#f2dccd", "#a9512f", "#2a2522"],
    photo: false,
    photoBrief: "Dwa krzesła naprzeciw siebie przy kuchennym stole, jedno lekko odsunięte; wieczorne światło, spokojna, napięta cisza.",
    artBrief: "The green and the terracotta mascot sit opposite each other at a kitchen table with a small candle in the middle; one speaks gently with an open hand, the other listens leaning in; two soft empty speech bubbles.",
  },
  "partner-nie-chce-ratowac-zwiazku": {
    hook: "„Chcę ratować nas, a on już nie chce rozmawiać.”",
    summary: "swoją mapę wpływu",
    mood: ["#ece3d6", "#b89b7f", "#36493d"],
    photo: false,
    photoBrief: "Jedna osoba na brzegu łóżka, druga połowa pusta i zasłana; poranne światło; poczucie samotności bez dramatyzmu.",
    artBrief: "The terracotta mascot sits on one end of a long bench and holds out an open hand; the green mascot sits on the other end, turned slightly away; a soft warm glow on the bench between them suggests possibility, not pressure.",
  },
  "petla-konfliktu": {
    hook: "„Znowu to samo. Te same słowa, ta sama kłótnia.”",
    summary: "swoją pętlę konfliktu",
    mood: ["#f4dfd1", "#a9512f", "#46604f"],
    photo: false,
    photoBrief: "Spiralne schody z góry albo kręte schody w świetle; motyw powtarzającego się ruchu; ciepłe, ziemiste kolory.",
    artBrief: "The green and the terracotta mascot walk around a small circular track marked with gentle curved arrows; one of them notices a side path opening out of the loop toward a calm sunny meadow.",
  },
  "po-zdradzie": {
    hook: "„Wszystko rozpadło się w jeden wieczór.”",
    summary: "swoje pytania i potrzeby",
    mood: ["#f3dcd8", "#e07f78", "#36493d"],
    photo: false,
    photoBrief: "Dłoń na kubku z herbatą, koc, wczesny poranek, spokojne światło; poczucie troski o siebie, bez dramatu i symboli zdrady.",
    artBrief: "The terracotta mascot sits wrapped in a soft blanket holding a cup of tea; a sage mascot friend sits beside it, a hand gently on its shoulder; a small heart with a visible mended seam floats nearby; quiet early-morning light.",
  },
  "swiadome-rozstanie": {
    hook: "„Zdecydowaliśmy. Ale jak to zrobić, żeby dzieci nie ucierpiały?”",
    summary: "swoją checklistę rozstania",
    mood: ["#e5ece6", "#46604f", "#c98b6a"],
    photo: false,
    photoBrief: "Dziecięca dłoń w dłoni dorosłego na spacerze jesienią, kadr od tyłu; spokój i bezpieczeństwo, bez smutnych twarzy.",
    artBrief: "Two adult mascots, one green and one terracotta, walk on an autumn path on either side of a small rose child mascot, each holding one of the child's hands; falling leaves, calm and safe atmosphere.",
  },
  ...COVERS_A,
  ...COVERS_B,
  ...COVERS_C,
  ...COVERS_D,
  ...COVERS_E,
  ...COVERS_F,
  ...COVERS_G,
  ...COVERS_H,
  ...COVERS_I,
};

export const coverOf = (slug: string) => COVERS[slug];
