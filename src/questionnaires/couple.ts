// Kwestionariusz Mapy Relacji dla pary (każda osoba wypełnia osobno).
//
// UWAGA – WYMAGA WERYFIKACJI: pliki źródłowe 01_kwestionariusz_dla_niego.pdf oraz
// 02_kwestionariusz_dla_niej.pdf NIE zostały dostarczone. Do czasu ich otrzymania szablony
// "couple_*" są wersją roboczą zbudowaną z pozycji wspólnych z wersją indywidualną (05/06),
// bez pytań dotyczących przychodzenia na audyt samodzielnie. Wytyczne 03 (rozdz. 7) wskazują,
// że wersja dla pary ma w Części 2 co najmniej 10 pozycji (pyt. 10 = naprawa) oraz w Części 3
// skalę nacisku i wycofania – tych pozycji nie dopisujemy, bo nie znamy ich brzmienia.
// Panel psychologa wyświetla ostrzeżenie przy każdej sprawie używającej tych szablonów.
// Lista kontrolna: docs/source-mapping.md → "Elementy wymagające ręcznej weryfikacji".

import type { SectionDef, TemplateDef } from "./types";
import { HAS_CHILDREN } from "./validate";
import {
  boundariesSection,
  builder,
  closenessSection,
  communicationSection,
  consentSection,
  cycleSection,
  declarationSection,
  parentingSection,
  profileSection,
  readinessSection,
  screeningSection,
  stressSection,
  trustSection,
  valuesSection,
  type Gender,
} from "./individual";

const VERIFY = "Brak PDF 01/02 – pozycja przeniesiona z wersji indywidualnej (05/06); zweryfikuj brzmienie i numerację.";

export function buildCouple(gender: Gender): TemplateDef {
  const b = builder(gender, { male: "01_kwestionariusz_dla_niego.pdf", female: "02_kwestionariusz_dla_niej.pdf" });
  const { g } = b;
  // Pozycje pochodzą z wersji indywidualnej – oznaczamy źródło i notatkę weryfikacyjną.
  const fromIndividual = (s: SectionDef): SectionDef => ({
    ...s,
    questions: s.questions.map((q) => ({
      ...q,
      source: { file: b.file, page: 0, note: `${VERIFY} Odpowiednik: ${gender === "male" ? "05" : "06"}, str. ${q.source.page}.` },
    })),
  });

  const situation: SectionDef = {
    key: "situation",
    title: "Twoja sytuacja i cel konsultacji",
    area: "situation",
    questions: [
      {
        key: "sit.who_considers",
        sourceNumber: "1",
        type: "single",
        prompt: "Kto obecnie rozważa rozstanie?",
        options: [
          { value: "me", label: "ja" },
          { value: "partner", label: g("partnerka", "partner") },
          { value: "both", label: "oboje" },
          { value: "nobody", label: "nikt" },
          { value: "unknown", label: "nie wiem" },
        ],
        tags: ["decision-stage"],
        source: { file: b.file, page: 0 },
      },
      {
        key: "sit.children",
        sourceNumber: "2",
        type: "single",
        prompt: "Czy macie dzieci, których dotyczy ta sytuacja?",
        options: [
          { value: "yes", label: "tak" },
          { value: "no", label: "nie" },
        ],
        tags: ["children"],
        showIf: { questionKey: "m.children", anyOf: [HAS_CHILDREN] },
        source: { file: b.file, page: 0 },
      },
      {
        key: "sit.goal",
        sourceNumber: "3",
        type: "multi",
        prompt: "Co jest Twoim głównym celem konsultacji? (możesz zaznaczyć więcej niż jedno, a główny cel podkreśl)",
        primaryPick: "Który cel jest główny?",
        options: [
          { value: "assess", label: "ocena, czy ten związek mi służy" },
          { value: "rebuild", label: "odbudowa związku" },
          { value: "decide", label: "podjęcie decyzji: zostać czy odejść" },
          { value: "separate_respect", label: "rozstanie z szacunkiem, zwłaszcza jeśli są dzieci" },
          { value: "self", label: "zrozumienie siebie i swojego udziału w tym, co się dzieje" },
          { value: "other", label: "inny:", detailLabel: "inny:" },
        ],
        tags: ["goal"],
        source: { file: b.file, page: 0 },
      },
    ],
  };

  return {
    key: gender === "male" ? "couple_male" : "couple_female",
    title: "Kwestionariusz Mapy Relacji dla pary",
    audience: "couple",
    gender,
    sourceFile: b.file,
    needsVerification: true,
    verificationNote:
      "Plik źródłowy 01/02 nie został dostarczony. Szablon roboczy zbudowany z pozycji wspólnych z wersją indywidualną. Przed użyciem z prawdziwymi klientami porównaj z PDF i opublikuj poprawioną wersję w edytorze szablonów.",
    intro: [
      "Kwestionariusz przygotowuje Cię do wspólnej konsultacji Mapy Relacji online (90 minut). Każde z Was wypełnia go osobno, na własnym, prywatnym linku.",
      "Wypełnienie zajmuje około 15-25 minut. Rób to w spokoju, w miejscu, w którym nikt nie czyta Ci przez ramię – także druga osoba w związku.",
      g(
        "Twoje odpowiedzi nie są pokazywane partnerce. Psycholog nie ujawnia treści jednej osoby drugiej bez zgody.",
        "Twoje odpowiedzi nie są pokazywane partnerowi. Psycholog nie ujawnia treści jednej osoby drugiej bez zgody.",
      ),
      "Nie ma dobrych ani złych odpowiedzi. Największą wartość ma szczerość wobec siebie, także w pytaniach o Twój własny udział w trudnościach.",
      "Skale są autorskie i służą do rozmowy na sesji. Nie są testem diagnostycznym.",
    ],
    outro: "Wypełniony kwestionariusz prześlij zgodnie z otrzymaną instrukcją, najpóźniej 48 godzin przed sesją.",
    sections: [
      fromIndividual(profileSection(b)),
      fromIndividual(consentSection(b)),
      situation,
      fromIndividual(screeningSection(b)),
      fromIndividual(communicationSection(b)),
      fromIndividual(cycleSection(b)),
      fromIndividual(closenessSection(b)),
      fromIndividual(trustSection(b)),
      fromIndividual(boundariesSection(b)),
      fromIndividual(parentingSection(b)),
      fromIndividual(stressSection(b)),
      fromIndividual(valuesSection(b)),
      fromIndividual(readinessSection(b)),
      fromIndividual(
        declarationSection(
          b,
          "Rozumiem, że Mapa Relacji jest konsultacją psychologiczną, a nie terapią ani pomocą kryzysową, oraz że opiera się na mojej perspektywie. Wiem, gdzie szukać pilnej pomocy, jeśli będzie potrzebna.",
        ),
      ),
    ],
  };
}
