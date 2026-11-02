// Przykładowa Mapa Relacji do prezentacji na stronie – DANE FIKCYJNE.
// Struktura i sekcje są identyczne z rzeczywistym podsumowaniem (ReportContent / renderReportHtml),
// treść jest wymyślona na potrzeby pokazu i nie dotyczy żadnej prawdziwej osoby.
import type { ReportContent } from "./report";

export const SAMPLE_REPORT: ReportContent = {
  audience: "joint",
  caseKind: "couple",
  meta: {
    participants: [
      { name: "Anna Przykładowa", age: "38" },
      { name: "Marek Przykładowy", age: "40" },
    ],
    sessionDate: "2026-10-14",
    minutes: 90,
    therapist: "Psycholog DUO (przykład)",
  },
  summary: {
    text: "Przyszliście w momencie, w którym od kilku miesięcy więcej jest między Wami napięcia niż rozmowy. Oboje mówicie, że wciąż Wam na sobie zależy, ale coraz częściej unikacie trudnych tematów, żeby nie wywołać kolejnej kłótni. Najważniejsze jest teraz dla Was zrozumienie, dlaczego wracacie do tych samych sporów – zanim zdecydujecie o przyszłości.",
    reason: "Powracające kłótnie o obowiązki i poczucie oddalenia po narodzinach drugiego dziecka.",
    decisionStage: "Anna rozważa rozstanie, Marek chce spróbować pracy nad relacją. Oboje zgadzacie się, że potrzebujecie czasu na spokojną decyzję.",
  },
  strengths: [
    "Obojgu zależy Wam na dobru dzieci i dobrze współpracujecie w codziennych sprawach rodzinnych.",
    "Macie wspólną historię dobrych lat – oboje pamiętacie, co wtedy pomagało Wam być blisko.",
    "Każde z Was potrafiło w rozmowie nazwać własny udział w konflikcie.",
  ],
  tensions: [
    { area: "communication", label: "Komunikacja i konflikt", text: "Rozmowy o trudnych sprawach szybko zamieniają się w wymianę zarzutów; po kłótni długo nie wracacie do tematu.", severity: "high" },
    { area: "closeness", label: "Bliskość i intymność", text: "Brakuje czasu tylko dla Was dwojga; bliskość zeszła na dalszy plan.", severity: "moderate" },
    { area: "trust", label: "Zaufanie", text: "Zaufanie jest zachowane; pojawia się wątpliwość, czy druga strona naprawdę chce zmiany.", severity: "low" },
    { area: "boundaries", label: "Granice", text: "Różnicie się w tym, ile miejsca w Waszym życiu zajmuje rodzina pochodzenia.", severity: "moderate" },
    { area: "parenting", label: "Obowiązki i rodzicielstwo", text: "Poczucie nierównego podziału obowiązków to najczęstszy początek kłótni.", severity: "high" },
    { area: "stress", label: "Stres i praca", text: "Praca zmianowa Marka i powrót Anny do pracy ograniczają czas i energię.", severity: "moderate" },
  ],
  mechanism: {
    oneLiner:
      "Gdy Anna czuje się zostawiona z obowiązkami, mówi o tym z narastającą frustracją; Marek słyszy w tym krytykę i się wycofuje – a Anna odbiera to jako dowód, że jest sama.",
    columns: ["Anna", "Marek"],
    rows: [
      { key: "trigger", label: "Typowy wyzwalacz", values: ["Wieczór, gdy zostaje sama z dziećmi i obowiązkami", "Uwagi o tym, czego nie zrobił"] },
      { key: "thought", label: "Myśl automatyczna", values: ["„Wszystko jest na mojej głowie”", "„Cokolwiek zrobię, i tak będzie źle”"] },
      { key: "emotion", label: "Emocja pod spodem", values: ["Zmęczenie, samotność, żal", "Bezradność, wstyd"] },
      { key: "behavior", label: "Zachowanie na zewnątrz", values: ["Podnosi głos, wylicza zaniedbania", "Milknie, wychodzi z pokoju"] },
      { key: "need", label: "Potrzeba, która nie jest zaspokojona", values: ["Wsparcia i poczucia, że są drużyną", "Docenienia i spokoju w rozmowie"] },
    ],
    patterns: { criticism: true, contempt: false, defensiveness: true, stonewalling: true },
    patternsComment:
      "W rozmowie widać przede wszystkim krytykę i wycofanie. To częsty układ w parach pod dużym obciążeniem – nie świadczy o braku uczuć, tylko o tym, że rozmowa przestała być bezpieczna.",
    repair: "Działa: humor i wspólne wyjścia z dziećmi. Nie dociera: przeprosiny w trakcie kłótni – druga osoba nie jest jeszcze gotowa ich usłyszeć.",
  },
  recommendations: [
    "Umówcie się na stały, krótki czas rozmowy o organizacji tygodnia – poza momentami napięcia.",
    "Gdy rozmowa robi się zbyt gorąca, róbcie 20-minutową przerwę i wracajcie do tematu – przerwa to nie ucieczka.",
    "Każde z Was zapisze trzy sytuacje z ostatniego miesiąca, w których poczuło się wspierane.",
  ],
  path: {
    main: "rebuild",
    options: ["couple_therapy"],
    rationale:
      "Oboje chcecie zrozumieć sytuację i potraficie nazwać własny udział w konflikcie. Kilka spotkań terapii par może pomóc przerwać cykl krytyki i wycofania – i spokojniej podjąć decyzję. Anna nie musi dziś deklarować, że zostaje.",
  },
  nextSteps: [
    { what: "Pierwsza rozmowa o podziale obowiązków według propozycji z punktu 5", who: "Anna i Marek", when: "w ciągu 2 tygodni" },
    { what: "Decyzja, czy rozpoczynacie terapię par", who: "Anna i Marek", when: "po 2–3 tygodniach" },
    { what: "Konsultacja indywidualna dotycząca decyzji", who: "Anna", when: "jeśli będzie potrzebna" },
  ],
  riskFlag: false,
  sourcesNote: "",
};
