// Kwestionariusz Audytu Relacji, wersja indywidualna.
// Źródło: 05_kwestionariusz_indywidualny_dla_niego (M), 06_kwestionariusz_indywidualny_dla_niej (K).
// Wersje różnią się wyłącznie formami gramatycznymi – budujemy je z jednej definicji,
// a każdą różnicę zapisujemy jawnie przez g(męska, żeńska). Strony podajemy przez p(M, K).

import type { QuestionDef, SectionDef, TemplateDef } from "./types";
import { HAS_CHILDREN } from "./validate";

export type Gender = "male" | "female";

export interface Builder {
  g: (m: string, f: string) => string;
  p: (m: number, f: number) => number;
  file: string;
  gender: Gender;
}

export function builder(gender: Gender, files: { male: string; female: string }): Builder {
  return {
    gender,
    file: gender === "male" ? files.male : files.female,
    g: (m, f) => (gender === "male" ? m : f),
    p: (m, f) => (gender === "male" ? m : f),
  };
}

const SCALE_LEGEND = "1 = zupełnie nie, 5 = całkowicie tak";

export const SAFETY_INFO_KEY = "s1.info";

export function profileSection(b: Builder): SectionDef {
  const { p, file } = b;
  const src = (page: number) => ({ file, page });
  return {
    key: "profile",
    title: "Metryczka",
    area: "profile",
    intro:
      "Kraj i miasto zamieszkania są potrzebne, ponieważ sesja odbywa się online: pozwalają dobrać właściwe numery pomocy w nagłej sytuacji i uwzględnić strefę czasową.",
    questions: [
      { key: "m.name", type: "text", prompt: "Imię i nazwisko", required: true, group: "Dane", source: src(1) },
      { key: "m.birth", type: "date", prompt: "Data urodzenia (wiek)", group: "Dane", source: src(1) },
      { key: "m.email", type: "email", prompt: "E-mail", group: "Dane", source: src(1) },
      { key: "m.phone", type: "phone", prompt: "Telefon (z numerem kierunkowym kraju)", group: "Dane", source: src(1) },
      { key: "m.location", type: "country_city", prompt: "Kraj i miasto zamieszkania", required: true, group: "Dane", source: src(1) },
      { key: "m.job", type: "text", prompt: "Zawód, obecna praca", group: "Dane", source: src(1) },
      {
        key: "m.status",
        type: "single",
        prompt: "Status związku",
        group: "Związek",
        options: [
          { value: "informal", label: "związek nieformalny" },
          { value: "marriage", label: "małżeństwo" },
          { value: "separation", label: "separacja" },
          { value: "separating", label: "w trakcie rozstania" },
          { value: "other", label: "inny:", detailLabel: "inny:" },
        ],
        source: src(1),
      },
      { key: "m.length", type: "text", prompt: "Długość związku", group: "Związek", source: src(p(2, 1)) },
      {
        key: "m.together",
        type: "single",
        prompt: "Wspólne zamieszkanie",
        group: "Związek",
        options: [
          { value: "yes", label: "tak" },
          { value: "no", label: "nie" },
          { value: "partly", label: "częściowo" },
        ],
        source: src(2),
      },
      { key: "m.children", type: "children", prompt: "Dzieci (liczba i wiek)", hint: "Dodaj każde dziecko – imię i wiek.", group: "Związek", allowNA: true, source: src(2) },
      {
        key: "m.therapy",
        type: "single",
        prompt: "Wcześniejsza terapia",
        group: "Zdrowie i wcześniejsza pomoc",
        options: [
          { value: "no", label: "nie" },
          { value: "individual", label: "indywidualna", detailLabel: "Kiedy i jak długo:" },
          { value: "couple", label: "par", detailLabel: "Kiedy i jak długo:" },
        ],
        source: src(2),
      },
      {
        key: "m.treatment",
        type: "textarea",
        prompt: "Obecne leczenie lub leki (psychiatryczne i inne istotne)",
        group: "Zdrowie i wcześniejsza pomoc",
        source: src(2),
      },
      {
        key: "m.filled",
        type: "date",
        prompt: "Data wypełnienia",
        hint: "Uzupełniamy automatycznie dzisiejszą datą – możesz ją zmienić.",
        group: "Zdrowie i wcześniejsza pomoc",
        source: src(2),
      },
    ],
  };
}

export function consentSection(b: Builder): SectionDef {
  return {
    key: "consent",
    title: "Poufność i ochrona danych osobowych",
    area: "consent",
    questions: [
      {
        key: "c.processing",
        type: "consent",
        prompt:
          "Wyrażam zgodę na przetwarzanie moich danych osobowych, w tym danych dotyczących zdrowia, w celu przeprowadzenia Audytu Relacji.",
        hint: "Treść klauzuli informacyjnej (administrator danych, podstawy prawne, prawa) pochodzi z ustawień usługi i jest zapisywana razem z wersją w rejestrze zgód. Data zgody zapisuje się automatycznie.",
        required: true,
        source: { file: b.file, page: 2, note: "Pola 'Data' i 'Podpis' zastąpione rejestrem zgody z datą i wersją tekstu." },
      },
    ],
  };
}

export function screeningSection(b: Builder): SectionDef {
  const { g, p, file } = b;
  const src = (page: number) => ({ file, page });
  const groupLabel = "W ciągu ostatnich 12 miesięcy...";
  const q = (n: number, prompt: string, page: number, tags: string[] = []): QuestionDef => ({
    key: `s1.${n}`,
    sourceNumber: String(n),
    type: "screening",
    prompt,
    group: groupLabel,
    tags,
    source: src(page),
  });
  return {
    key: "safety",
    title: "Część 1. Pytania przesiewowe o bezpieczeństwo",
    area: "safety",
    intro:
      "Te pytania zadaję każdej osobie. Pomagają ustalić, czy Audyt Relacji jest teraz właściwą formą pomocy, czy najpierw potrzebne jest inne wsparcie.",
    questions: [
      q(1, "Czy ktoś w związku popychał, uderzył, szarpał lub w inny sposób fizycznie skrzywdził drugą osobę?", 3, ["risk-trigger", "violence"]),
      q(2, g("Czy boisz się swojej partnerki lub jej reakcji?", "Czy boisz się swojego partnera lub jego reakcji?"), 3, ["risk-trigger", "fear"]),
      q(
        3,
        "Czy ktoś kontroluje telefon, pieniądze, kontakty lub wyjścia drugiej osoby albo grozi (odejściem z dzieckiem, ujawnieniem informacji, zrobieniem sobie krzywdy)?",
        3,
        ["risk-trigger", "coercive-control"],
      ),
      q(4, "Czy doszło do kontaktu seksualnego wbrew woli którejś ze stron?", 3, ["risk-trigger", "sexual-violence"]),
      q(
        5,
        "Czy picie alkoholu, używanie substancji, hazard lub inne kompulsywne zachowania kogoś z Was wpływają na relację lub bezpieczeństwo?",
        3,
        ["addiction"],
      ),
      q(6, "Czy w ostatnich tygodniach czujesz się w głębokim kryzysie (brak snu, bezradność, trudność z codziennym funkcjonowaniem)?", 3, ["crisis"]),
      q(7, "Czy pojawiają się u Ciebie myśli, że nie warto żyć, lub myśli o odebraniu sobie życia?", 3, ["risk-trigger", "suicidal"]),
      q(8, "Czy toczy się postępowanie sądowe (rozwód, opieka nad dzieckiem, zakaz zbliżania się, niebieska karta)?", p(4, 3), ["legal"]),
      {
        key: SAFETY_INFO_KEY,
        type: "info",
        prompt: g(
          'Jeśli zaznaczyłeś "tak" przy pytaniach 1-4 lub 7, przeczytaj poniższą ramkę teraz, a nie dopiero po wypełnieniu całości.',
          'Jeśli zaznaczyłaś "tak" przy pytaniach 1-4 lub 7, przeczytaj poniższą ramkę teraz, a nie dopiero po wypełnieniu całości.',
        ),
        hint: "Ramka „Bezpieczeństwo i pilna pomoc” – wyświetlana z ustawień numerów pomocy, także automatycznie po odpowiedzi „tak”.",
        source: src(4),
      },
    ],
  };
}

function scale(
  b: Builder,
  key: string,
  n: number,
  prompt: string,
  page: number,
  group: string,
  tags: string[] = [],
  extra: Partial<QuestionDef> = {},
): QuestionDef {
  return { key, sourceNumber: String(n), type: "scale5", prompt, group, tags, source: { file: b.file, page }, ...extra };
}

function open(b: Builder, key: string, prompt: string, page: number, extra: Partial<QuestionDef> = {}): QuestionDef {
  return { key, type: "textarea", prompt, source: { file: b.file, page }, ...extra };
}

export function communicationSection(b: Builder): SectionDef {
  const { g, p } = b;
  const grp = "Jak rozmawiamy, z mojej perspektywy";
  return {
    key: "communication",
    title: "Część 2. Komunikacja i konflikt",
    scaleLegend: SCALE_LEGEND,
    area: "communication",
    questions: [
      scale(b, "s2.1", 1, "Potrafię powiedzieć, czego potrzebuję, bez oskarżania.", p(5, 4), grp, ["resource", "soft-startup"]),
      scale(b, "s2.2", 2, "Słucham do końca, zanim odpowiem.", p(5, 4), grp, ["resource"]),
      scale(b, "s2.3", 3, 'W sporze używam uogólnień typu "zawsze" i "nigdy".', p(5, 4), grp, ["reversed", "criticism"]),
      scale(b, "s2.4", 4, "Zdarza mi się krytykować osobę, a nie konkretne zachowanie.", 5, grp, ["reversed", "criticism"]),
      scale(b, "s2.5", 5, "Zdarza mi się sarkazm, przewracanie oczami lub ton wyższości.", 5, grp, ["reversed", "contempt"]),
      scale(b, "s2.6", 6, g("Kiedy czuję się atakowany, tłumaczę się lub kontratakuję.", "Kiedy czuję się atakowana, tłumaczę się lub kontratakuję."), 5, grp, [
        "reversed",
        "defensiveness",
      ]),
      scale(b, "s2.7", 7, "Zdarza mi się wyłączyć, zamilknąć lub wyjść z rozmowy.", 5, grp, ["reversed", "stonewalling", "withdraw"]),
      scale(
        b,
        "s2.8",
        8,
        g("Mam wrażenie, że partnerka często się wyłącza lub unika rozmowy.", "Mam wrażenie, że partner często się wyłącza lub unika rozmowy."),
        5,
        grp,
        ["reversed", "partner-perspective", "partner-withdraw"],
      ),
      scale(b, "s2.9", 9, "Po kłótni potrafię zrobić pierwszy krok do naprawy.", 5, grp, ["resource", "repair"]),
      open(
        b,
        "s2.o1",
        g(
          "Opisz ostatnią poważną kłótnię: o co poszło, co powiedziałeś Ty, co ona, jak się skończyła?",
          "Opisz ostatnią poważną kłótnię: o co poszło, co powiedziałaś Ty, co on, jak się skończyła?",
        ),
        5,
        { tags: ["last-argument"] },
      ),
      open(
        b,
        "s2.o2",
        g(
          "Gdyby partnerka opisywała tę samą kłótnię, co według Ciebie by powiedziała? (to Twoje przypuszczenie, nie fakt)",
          "Gdyby partner opisywał tę samą kłótnię, co według Ciebie by powiedział? (to Twoje przypuszczenie, nie fakt)",
        ),
        5,
        { tags: ["partner-perspective"] },
      ),
    ],
  };
}

export function cycleSection(b: Builder): SectionDef {
  const { g, p, file } = b;
  const grpCycle = "Cykl kłótni";
  const cycle = (n: number, key: string, prompt: string, tags: string[]): QuestionDef => ({
    key,
    sourceNumber: String(n),
    type: "text",
    prompt,
    group: grpCycle,
    tags,
    source: { file, page: 5 },
  });
  const grp = "Mój udział";
  return {
    key: "cycle",
    title: "Część 3. Cykl kłótni i mój udział w nim",
    scaleLegend: SCALE_LEGEND,
    area: "cycle",
    questions: [
      cycle(1, "s3.trigger", "Typowy wyzwalacz:", ["cycle-trigger"]),
      cycle(2, "s3.thought", "Co wtedy myślę:", ["cycle-thought"]),
      cycle(3, "s3.feeling", "Co wtedy czuję:", ["cycle-emotion"]),
      cycle(4, "s3.action", "Co robię:", ["cycle-behavior"]),
      cycle(5, "s3.partner", g("Co według mnie robi wtedy partnerka:", "Co według mnie robi wtedy partner:"), ["cycle-partner", "partner-perspective"]),
      cycle(6, "s3.end", "Jak to się zwykle kończy:", ["cycle-end"]),
      scale(b, "s3.1", 1, "Widzę, w którym momencie moje zachowanie podkręca konflikt.", p(6, 5), grp, ["own-part"]),
      scale(b, "s3.2", 2, "Potrafię zatrzymać się, zanim powiem coś, czego żałuję.", 6, grp, ["own-part", "regulation"]),
      scale(b, "s3.3", 3, g("Wiem, co w moim zachowaniu jest dla partnerki najtrudniejsze.", "Wiem, co w moim zachowaniu jest dla partnera najtrudniejsze."), 6, grp, [
        "own-part",
      ]),
      scale(
        b,
        "s3.4",
        4,
        g(
          "Mam wpływ na to, jak przebiega nasza rozmowa, nawet jeśli nie mam wpływu na nią.",
          "Mam wpływ na to, jak przebiega nasza rozmowa, nawet jeśli nie mam wpływu na niego.",
        ),
        6,
        grp,
        ["own-part"],
      ),
      open(b, "s3.o1", "Co w cyklu kłótni zależy ode mnie? Wypisz 2-3 rzeczy.", 6, { tags: ["own-part"] }),
      open(b, "s3.o2", "Co nie zależy ode mnie i muszę to zaakceptować lub odpuścić?", 6),
      open(b, "s3.o3", "Jedna konkretna zmiana po mojej stronie, którą mogę wprowadzić od jutra:", 6, { tags: ["own-part", "resource"] }),
    ],
  };
}

export function closenessSection(b: Builder): SectionDef {
  const { g } = b;
  const grp = "Bliskość, z mojej perspektywy";
  return {
    key: "closeness",
    title: "Część 4. Bliskość i intymność",
    scaleLegend: SCALE_LEGEND,
    area: "closeness",
    questions: [
      scale(
        b,
        "s4.1",
        1,
        g(
          "Zauważam drobne próby kontaktu ze strony partnerki i na nie odpowiadam.",
          "Zauważam drobne próby kontaktu ze strony partnera i na nie odpowiadam.",
        ),
        6,
        grp,
        ["bids"],
      ),
      scale(b, "s4.2", 2, "Czuję, że moje próby kontaktu są zauważane.", 6, grp, ["bids"]),
      scale(b, "s4.3", 3, g("Czuję się przy niej bezpiecznie emocjonalnie.", "Czuję się przy nim bezpiecznie emocjonalnie."), 6, grp, ["emotional-safety"]),
      scale(b, "s4.4", 4, g("Jestem zadowolony z naszej czułości i życia seksualnego.", "Jestem zadowolona z naszej czułości i życia seksualnego."), 6, grp, [
        "intimacy",
      ]),
      open(b, "s4.o1", g("Kiedy ostatnio poczułeś się blisko? Czego najbardziej Ci brakuje?", "Kiedy ostatnio poczułaś się blisko? Czego najbardziej Ci brakuje?"), 6),
    ],
  };
}

export function trustSection(b: Builder): SectionDef {
  const { g } = b;
  const grp = "Zaufanie i poczucie bezpieczeństwa";
  return {
    key: "trust",
    title: "Część 5. Zaufanie i przywiązanie",
    scaleLegend: SCALE_LEGEND,
    area: "trust",
    questions: [
      scale(b, "s5.1", 1, g("Ufam, że partnerka dotrzymuje słowa.", "Ufam, że partner dotrzymuje słowa."), 7, grp, ["trust"]),
      scale(
        b,
        "s5.2",
        2,
        g(
          "Gdy ona się dystansuje, szybko pojawia się u mnie niepokój lub złość.",
          "Gdy on się dystansuje, szybko pojawia się u mnie niepokój lub złość.",
        ),
        7,
        grp,
        ["anxiety"],
      ),
      scale(b, "s5.3", 3, "Kiedy robi się blisko, mam ochotę się zdystansować.", 7, grp, ["avoidance"]),
      scale(b, "s5.4", 4, "Boję się odrzucenia lub porzucenia.", 7, grp, ["anxiety"]),
      scale(b, "s5.5", 5, "W związku było poważne naruszenie zaufania (z czyjejkolwiek strony).", 7, grp, ["breach"]),
      open(b, "s5.o1", "Czy podobne lęki lub reakcje znasz z wcześniejszych relacji albo z domu rodzinnego?", 7),
    ],
  };
}

export function boundariesSection(b: Builder): SectionDef {
  const { g } = b;
  const grp = "Granice";
  return {
    key: "boundaries",
    title: "Część 6. Granice",
    scaleLegend: SCALE_LEGEND,
    area: "boundaries",
    questions: [
      scale(b, "s6.1", 1, g('Potrafię powiedzieć "nie" i nie czuć się winny.', 'Potrafię powiedzieć "nie" i nie czuć się winna.'), 7, grp),
      scale(b, "s6.2", 2, "Moje granice są szanowane.", 7, grp, ["boundaries-respected"]),
      scale(b, "s6.3", 3, g("Szanuję granice partnerki, nawet gdy mi się nie podobają.", "Szanuję granice partnera, nawet gdy mi się nie podobają."), 7, grp),
      open(b, "s6.o1", "Która granica jest dla Ciebie najważniejsza? Co robisz, gdy jest przekraczana?", 7),
    ],
  };
}

export function parentingSection(b: Builder): SectionDef {
  const grp = "Dom i dzieci";
  const childNA = { allowNA: true, hint: "Jeśli nie macie dzieci, wybierz „nie dotyczy”." };
  return {
    key: "parenting",
    title: "Część 7. Obowiązki, rodzicielstwo i kontakt z dzieckiem",
    scaleLegend: SCALE_LEGEND,
    area: "parenting",
    questions: [
      scale(b, "s7.1", 1, "Podział obowiązków i opieki jest dla mnie sprawiedliwy.", 8, grp, ["chores"]),
      scale(b, "s7.2", 2, "Dziecko bywa świadkiem naszych kłótni.", 8, grp, ["child-witness", "reversed"], childNA),
      scale(b, "s7.3", 3, "Dziecko bywa wciągane w konflikt.", 8, grp, ["child-triangulation", "reversed"], childNA),
      scale(b, "s7.4", 4, "Jako rodzice umiemy współpracować, nawet gdy jako para jest źle.", 8, grp, ["coparenting"], childNA),
      scale(b, "s7.5", 5, "Boję się utraty kontaktu z dzieckiem lub ograniczenia tego kontaktu.", 8, grp, ["child-contact-fear"], childNA),
      scale(b, "s7.6", 6, "Mam dziś dobry, regularny kontakt z dzieckiem.", 8, grp, ["child-contact"], childNA),
      open(b, "s7.o1", "Jak dziecko przeżywa obecną sytuację? Po czym to widać?", 8, { allowNA: true }),
      open(b, "s7.o2", "Co mogę zrobić po swojej stronie, żeby chronić relację z dzieckiem niezależnie od losów związku?", 8, { allowNA: true }),
    ],
  };
}

export function stressSection(b: Builder): SectionDef {
  const { g, p } = b;
  const grp = "Stres i zasoby";
  return {
    key: "stress",
    title: "Część 8. Stres, praca i wsparcie",
    scaleLegend: SCALE_LEGEND,
    area: "stress",
    questions: [
      scale(b, "s8.1", 1, "Praca lub inne obowiązki pochłaniają większość mojej energii.", 8, grp, ["overload"]),
      scale(b, "s8.2", 2, "Przynoszę stres z pracy do domu.", 8, grp, ["overload"]),
      scale(b, "s8.3", 3, "Śpię wystarczająco i mam sposoby na regenerację.", 8, grp, ["sleep", "resource"]),
      scale(b, "s8.4", 4, "Mam osoby, z którymi mogę szczerze porozmawiać o tym, co przeżywam.", 8, grp, ["support", "resource"]),
      scale(
        b,
        "s8.5",
        5,
        g("Korzystam ze wsparcia innych, zamiast radzić sobie ze wszystkim sam.", "Korzystam ze wsparcia innych, zamiast radzić sobie ze wszystkim sama."),
        p(9, 8),
        grp,
        ["support", "resource"],
      ),
      open(b, "s8.o1", "Kto jest Twoim wsparciem (rodzina, przyjaciele, inni)? Kogo brakuje?", p(9, 8)),
    ],
  };
}

export function valuesSection(b: Builder): SectionDef {
  const { g } = b;
  return {
    key: "values",
    title: "Część 9. Moje potrzeby i wartości",
    area: "values",
    questions: [
      open(b, "s9.o1", "Trzy najważniejsze potrzeby, które chcę mieć zaspokojone w związku:", 9, { tags: ["needs"] }),
      open(
        b,
        "s9.o2",
        g(
          "Jakie wartości są dla mnie ważne jako partnera i rodzica (np. uczciwość, spokój, lojalność, rozwój)?",
          "Jakie wartości są dla mnie ważne jako partnerki i rodzica (np. uczciwość, spokój, lojalność, rozwój)?",
        ),
        9,
        { tags: ["values"] },
      ),
      open(
        b,
        "s9.o3",
        g(
          "Na ile obecnie żyję w zgodzie z tymi wartościami, niezależnie od zachowania partnerki?",
          "Na ile obecnie żyję w zgodzie z tymi wartościami, niezależnie od zachowania partnera?",
        ),
        9,
      ),
      open(
        b,
        "s9.o4",
        g(
          "Czego według mnie potrzebuje partnerka? Co ona mówi o związku? (moja perspektywa)",
          "Czego według mnie potrzebuje partner? Co on mówi o związku? (moja perspektywa)",
        ),
        9,
        { tags: ["partner-perspective"] },
      ),
    ],
  };
}

export function readinessSection(b: Builder): SectionDef {
  const { g, p } = b;
  const grp = "Gotowość";
  return {
    key: "readiness",
    title: "Część 10. Gotowość do zmiany i decyzja",
    scaleLegend: SCALE_LEGEND,
    area: "readiness",
    questions: [
      scale(b, "s10.1", 1, "Wierzę, że ten związek może się poprawić.", 9, grp, ["readiness"]),
      scale(
        b,
        "s10.2",
        2,
        g(
          "Jestem gotowy zmienić własne zachowania, nawet jeśli partnerka nie zmieni się od razu.",
          "Jestem gotowa zmienić własne zachowania, nawet jeśli partner nie zmieni się od razu.",
        ),
        9,
        grp,
        ["readiness"],
      ),
      scale(b, "s10.3", 3, "Widzę swój udział w problemach, a nie tylko udział drugiej strony.", p(10, 9), grp, ["readiness", "own-part"]),
      scale(
        b,
        "s10.4",
        4,
        g("Czuję się wyczerpany i nie mam siły dalej próbować.", "Czuję się wyczerpana i nie mam siły dalej próbować."),
        p(10, 9),
        grp,
        ["exhaustion", "reversed"],
      ),
      {
        key: "s10.position",
        type: "single",
        prompt: "Gdzie jesteś teraz?",
        group: "Decyzja",
        tags: ["decision-self"],
        options: [
          { value: "stay_work", label: "chcę zostać i pracować" },
          { value: "stay_doubt", label: "chcę zostać, ale wątpię" },
          { value: "torn", label: g("jestem rozdarty", "jestem rozdarta") },
          { value: "lean_leave", label: "skłaniam się do odejścia" },
          { value: "leave", label: g("zdecydowałem się odejść", "zdecydowałam się odejść") },
        ],
        source: { file: b.file, page: 10 },
      },
      {
        key: "s10.partner_position",
        type: "single",
        prompt: g("Jak myślisz, gdzie jest ona? (moja perspektywa)", "Jak myślisz, gdzie jest on? (moja perspektywa)"),
        group: "Decyzja",
        tags: ["decision-partner", "partner-perspective"],
        options: [
          { value: "stay", label: "chce zostać" },
          { value: "torn", label: g("rozdarta", "rozdarty") },
          { value: "lean_leave", label: "skłania się do odejścia" },
          { value: "leave", label: g("zdecydowała o odejściu", "zdecydował o odejściu") },
          { value: "unknown", label: "nie wiem" },
        ],
        source: { file: b.file, page: 10 },
      },
      open(
        b,
        "s10.o1",
        g(
          "Jak według Ciebie partnerka zareagowałaby, gdybyś zaczął zmieniać swoje zachowanie?",
          "Jak według Ciebie partner zareagowałby, gdybyś zaczęła zmieniać swoje zachowanie?",
        ),
        10,
        { tags: ["partner-perspective"] },
      ),
      open(b, "s10.o2", "Co chcesz wynieść z audytu niezależnie od tego, czy związek przetrwa?", 10, { tags: ["goal"] }),
    ],
  };
}

export function declarationSection(b: Builder, text: string): SectionDef {
  return {
    key: "declaration",
    title: "Oświadczenie",
    area: "declaration",
    questions: [
      {
        key: "d.statement",
        type: "signature",
        prompt: text,
        hint: "Wpisz imię i nazwisko – to potwierdzenie zapoznania się z oświadczeniem. Data zapisze się automatycznie.",
        required: true,
        source: { file: b.file, page: 10, note: "Podpis odręczny zastąpiony wpisaniem imienia i nazwiska z datą." },
      },
    ],
  };
}

export function buildIndividual(gender: Gender): TemplateDef {
  const b = builder(gender, { male: "05_kwestionariusz_indywidualny_dla_niego.pdf", female: "06_kwestionariusz_indywidualny_dla_niej.pdf" });
  const { g, file } = b;
  const partnerWord = g("partnerka", "partner");

  const situation: SectionDef = {
    key: "situation",
    title: "Twoja sytuacja i cel audytu",
    area: "situation",
    questions: [
      {
        key: "sit.why_alone",
        sourceNumber: "1",
        type: "single",
        prompt: g("Dlaczego przychodzisz na audyt sam?", "Dlaczego przychodzisz na audyt sama?"),
        options: [
          { value: "partner_refuses", label: g("Partnerka nie chce uczestniczyć.", "Partner nie chce uczestniczyć.") },
          { value: "partner_unaware", label: g("Partnerka nie wie, że korzystam z audytu.", "Partner nie wie, że korzystam z audytu.") },
          { value: "first_myself", label: g("Wolę najpierw sam uporządkować swoją sytuację.", "Wolę najpierw sama uporządkować swoją sytuację.") },
          { value: "separated", label: "Jesteśmy już po rozstaniu lub w trakcie." },
          { value: "other", label: "Inny powód:", detailLabel: "Inny powód:" },
        ],
        source: { file, page: 2 },
      },
      {
        key: "sit.refusal_reason",
        sourceNumber: "2",
        type: "textarea",
        prompt: g(
          "Jeśli partnerka nie chce uczestniczyć: jak to uzasadnia, według Ciebie?",
          "Jeśli partner nie chce uczestniczyć: jak to uzasadnia, według Ciebie?",
        ),
        showIf: { questionKey: "sit.why_alone", anyOf: ["partner_refuses"] },
        tags: ["partner-perspective"],
        source: { file, page: b.p(3, 2) },
      },
      {
        key: "sit.who_considers",
        sourceNumber: "1",
        type: "single",
        prompt: "Kto obecnie rozważa rozstanie?",
        options: [
          { value: "me", label: "ja" },
          { value: "partner", label: partnerWord },
          { value: "both", label: "oboje" },
          { value: "nobody", label: "nikt" },
          { value: "unknown", label: "nie wiem" },
        ],
        tags: ["decision-stage"],
        source: { file, page: 3 },
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
        // pokazywane, gdy w metryczce wpisano dzieci (decyzja właściciela usługi – bez powtarzania pytania osobom bez dzieci)
        showIf: { questionKey: "m.children", anyOf: [HAS_CHILDREN] },
        source: { file, page: 3 },
      },
      {
        key: "sit.goal",
        sourceNumber: "3",
        type: "multi",
        prompt: "Co jest Twoim głównym celem audytu? (możesz zaznaczyć więcej niż jedno, a główny cel podkreśl)",
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
        source: { file, page: 3 },
      },
    ],
  };

  return {
    key: gender === "male" ? "individual_male" : "individual_female",
    title: "Kwestionariusz Audytu Relacji, wersja indywidualna",
    audience: "individual",
    gender,
    sourceFile: file,
    needsVerification: false,
    intro: [
      "Kwestionariusz przygotowuje Cię do indywidualnej sesji Audytu Relacji online. Jest przeznaczony dla osoby, która przychodzi na audyt sama.",
      "Wypełnienie zajmuje około 15-25 minut. Sesja audytu indywidualnego trwa 60 minut. Rób to w spokoju, w miejscu, w którym nikt nie czyta Ci przez ramię.",
      g(
        "Ten audyt dotyczy związku, ale patrzymy na niego z Twojej perspektywy. Pytania o partnerkę dotyczą tego, jak Ty ją widzisz i jak rozumiesz jej słowa. Nie oceniamy osoby, której nie ma na sesji.",
        "Ten audyt dotyczy związku, ale patrzymy na niego z Twojej perspektywy. Pytania o partnera dotyczą tego, jak Ty go widzisz i jak rozumiesz jego słowa. Nie oceniamy osoby, której nie ma na sesji.",
      ),
      "Nie ma dobrych ani złych odpowiedzi. Największą wartość ma szczerość wobec siebie, także w pytaniach o Twój własny udział w trudnościach.",
      "Skale są autorskie i służą do rozmowy na sesji. Nie są testem diagnostycznym.",
      g(
        'Słowo "partnerka" oznacza osobę, z którą jesteś (lub byłeś) w związku, niezależnie od formalnego statusu.',
        'Słowo "partner" oznacza osobę, z którą jesteś (lub byłaś) w związku, niezależnie od formalnego statusu.',
      ),
    ],
    outro: "Wypełniony kwestionariusz prześlij zgodnie z otrzymaną instrukcją, najpóźniej 48 godzin przed sesją.",
    sections: [
      profileSection(b),
      consentSection(b),
      situation,
      screeningSection(b),
      communicationSection(b),
      cycleSection(b),
      closenessSection(b),
      trustSection(b),
      boundariesSection(b),
      parentingSection(b),
      stressSection(b),
      valuesSection(b),
      readinessSection(b),
      declarationSection(
        b,
        "Rozumiem, że Audyt Relacji jest konsultacją psychologiczną, a nie terapią ani pomocą kryzysową, oraz że opiera się na mojej perspektywie. Wiem, gdzie szukać pilnej pomocy, jeśli będzie potrzebna.",
      ),
    ],
  };
}
