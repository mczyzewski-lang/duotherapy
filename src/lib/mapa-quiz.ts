// Krótki quiz „Mapa Relacji” – 6 pytań kwalifikacyjnych (nie diagnoza).
// Jedno źródło prawdy: strona quizu, walidacja po stronie serwera i widok zgłoszenia w panelu.

export const QUIZ_VERSION = "mapa-v1";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: "q1" | "q2" | "q3" | "q4" | "q5" | "q6";
  title: string;
  hint?: string;
  options: QuizOption[];
  /** Krótki wspierający komunikat pokazywany NAD tym pytaniem (nie po każdym pytaniu). */
  note?: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    title: "Które zdanie najlepiej opisuje Waszą sytuację?",
    options: [
      { value: "rebuild", label: "Oddaliliśmy się od siebie, ale chcę spróbować to naprawić." },
      { value: "unsure", label: "Nie wiem już, co dalej z naszą relacją." },
      { value: "separate", label: "Coraz poważniej myślimy o rozstaniu." },
      { value: "one_sided", label: "Chcę coś zmienić, ale druga osoba niekoniecznie." },
    ],
  },
  {
    id: "q2",
    title: "Co jest dziś dla Ciebie najtrudniejsze?",
    note: "Nie musisz mieć dziś wszystkich odpowiedzi.",
    options: [
      { value: "talk", label: "Nie potrafimy spokojnie rozmawiać." },
      { value: "closeness", label: "Brakuje nam bliskości i zrozumienia." },
      { value: "trust", label: "Trudno mi odbudować zaufanie." },
      { value: "direction", label: "Nie wiem, czy nadal chcemy tego samego." },
      { value: "other", label: "Coś innego / wolę nie odpowiadać." },
    ],
  },
  {
    id: "q3",
    title: "Czy druga osoba chciałaby wspólnie poszukać rozwiązania?",
    hint: "Odpowiadasz ze swojej perspektywy – nie musisz wiedzieć na pewno.",
    options: [
      { value: "both", label: "Tak, oboje chcemy." },
      { value: "maybe", label: "Być może, jeszcze o tym nie rozmawialiśmy." },
      { value: "rather_not", label: "Raczej nie." },
      { value: "unknown", label: "Nie wiem." },
    ],
  },
  {
    id: "q4",
    title: "Co najbardziej chcesz zrozumieć?",
    note: "Mapę Relacji można rozpocząć również indywidualnie.",
    options: [
      { value: "can_rebuild", label: "Czy możemy jeszcze odbudować relację?" },
      { value: "repeating", label: "Dlaczego ciągle wracamy do tych samych problemów?" },
      { value: "decision", label: "Jak podjąć dobrą decyzję o przyszłości?" },
      { value: "separation", label: "Jak poradzić sobie z możliwym rozstaniem?" },
    ],
  },
  {
    id: "q5",
    title: "Jak długo czujesz, że coś między Wami nie działa?",
    options: [
      { value: "recent", label: "Od niedawna." },
      { value: "months", label: "Od kilku miesięcy." },
      { value: "year_plus", label: "Od ponad roku." },
      { value: "unknown", label: "Trudno powiedzieć / wolę nie odpowiadać." },
    ],
  },
  {
    id: "q6",
    title: "Jak chcesz zrobić pierwszy krok?",
    note: "Pierwszym krokiem nie zawsze jest decyzja. Czasem jest nim zrozumienie.",
    options: [
      { value: "solo", label: "Samodzielnie – chcę najpierw wszystko zrozumieć." },
      { value: "together", label: "Razem z partnerem lub partnerką." },
      { value: "unsure", label: "Jeszcze nie wiem, jaka forma będzie najlepsza." },
    ],
  },
];

export type QuizAnswers = Partial<Record<QuizQuestion["id"], string>>;

export function isValidAnswers(a: Record<string, unknown>): a is Required<QuizAnswers> {
  return QUIZ.every((q) => typeof a[q.id] === "string" && q.options.some((o) => o.value === a[q.id]));
}

export function optionLabel(qid: QuizQuestion["id"], value?: string): string {
  return QUIZ.find((q) => q.id === qid)?.options.find((o) => o.value === value)?.label ?? "—";
}

/** Wstępne podsumowanie – wyłącznie parafraza odpowiedzi, bez ocen i prognoz. */
export function summaryFor(a: QuizAnswers): { lead: string; points: string[] } {
  const lead =
    {
      rebuild: "Wygląda na to, że szczególnie zależy Ci na zrozumieniu, czy i jak można poprawić Waszą relację.",
      unsure: "Szukasz przede wszystkim jasności i przestrzeni do spokojnego zastanowienia się nad przyszłością relacji.",
      separate: "Rozważasz trudną zmianę i potrzebujesz lepiej zrozumieć możliwości oraz kolejne kroki.",
      one_sided: "Chcesz coś zmienić, nawet jeśli druga osoba nie jest jeszcze na to gotowa. To dobry moment, żeby najpierw zrozumieć własną perspektywę.",
    }[a.q1 ?? "unsure"] ?? "";
  const hardest: Record<string, string> = {
    talk: "trudność w spokojnej rozmowie",
    closeness: "brak bliskości i zrozumienia",
    trust: "odbudowanie zaufania",
    direction: "niepewność, czy nadal chcecie tego samego",
  };
  const want: Record<string, string> = {
    can_rebuild: "czy relację można jeszcze odbudować",
    repeating: "dlaczego wracacie do tych samych problemów",
    decision: "jak podjąć dobrą decyzję o przyszłości",
    separation: "jak poradzić sobie z możliwym rozstaniem",
  };
  const points: string[] = [];
  if (a.q2 && hardest[a.q2]) points.push(`Najbardziej obciąża Cię ${hardest[a.q2]}.`);
  if (a.q4 && want[a.q4]) points.push(`Chcesz zrozumieć, ${want[a.q4]}.`);
  if (a.q6 === "solo" || a.q3 === "rather_not" || a.q3 === "unknown") points.push("Możesz zacząć samodzielnie – udział drugiej osoby nie jest potrzebny, żeby zrobić pierwszy krok.");
  else if (a.q6 === "together" || a.q3 === "both") points.push("Mapę Relacji możecie przejść razem – każde z Was ma wtedy własny, poufny kwestionariusz.");
  return { lead, points };
}

export const PREFERRED_TIMES: QuizOption[] = [
  { value: "", label: "Dowolna pora" },
  { value: "morning", label: "Rano (8–12)" },
  { value: "afternoon", label: "Po południu (12–17)" },
  { value: "evening", label: "Wieczorem (17–20)" },
];

/** Parametry atrybucji zapisywane przy zgłoszeniu (bez danych osobowych). */
export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer", "landing_path"] as const;
export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

export const FUNNEL_EVENTS = [
  "landing_view",
  "hero_cta_click",
  "quiz_started",
  "quiz_step_completed",
  "quiz_completed",
  "lead_form_viewed",
  "lead_submitted",
  "lead_submission_error",
] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

/** Normalizacja numeru (PL domyślnie): zwraca format +48XXXXXXXXX lub null. */
export function normalizePhone(raw: string): string | null {
  const s = raw.replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(s)) return null;
  if (s.startsWith("+")) return s.length >= 10 && s.length <= 16 ? s : null;
  if (s.startsWith("00")) return normalizePhone("+" + s.slice(2));
  if (s.length === 9) return "+48" + s;
  if (s.length === 11 && s.startsWith("48")) return "+" + s;
  return null;
}
