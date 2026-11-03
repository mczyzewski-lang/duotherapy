// Przykładowe odpowiedzi „pisane odręcznie” w podglądzie materiału na landingu (fikcyjne, krótkie, bez danych osobowych).
// Klucz: identyfikator pola z fields.ts (fid) – pole musi należeć do bloków podglądu (pilnuje test).
// true = odręczny ptaszek w checkliście.

export const SAMPLE_ANSWERS: Record<string, Record<string, string | true>> = {
  "mapa-trzech-drog": {
    "e32.0": "zmęczona, cicha, wciąż ważna",
    "e32.1": "że mijamy się w kuchni jak współlokatorzy",
  },
  "21-pytan-o-relacji": {
    q6: "O pieniądzach. Po dwóch zdaniach ktoś wychodzi z pokoju.",
    q12: "Na wakacjach – rozmawialiśmy do drugiej w nocy.",
  },
  "kryzys-czy-koniec-milosci": {
    q12: "Złość… ale pod nią chyba wciąż czułość.",
    "c24.b0.0": "brak czasu tylko dla nas",
    "c24.b0.1": "nie mówimy, co czujemy",
  },
  "7-dni-lepszych-rozmow": {
    d4: "Słuchałam bez przerywania. Trudniejsze, niż myślałam.",
  },
  "partner-nie-chce-ratowac-zwiazku": {
    "c26.b0.0": "jak zaczynam rozmowę",
    "c26.b0.1": "czy zechce przyjść na konsultację",
  },
  "po-zdradzie": { "k11.0": true, "k11.1": true },
  "swiadome-rozstanie": { "k29.0": true, "k29.1": true },
};
