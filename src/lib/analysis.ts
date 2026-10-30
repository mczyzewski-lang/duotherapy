// Analiza jakościowa odpowiedzi wg wytycznych dla psychologa (03, rozdz. 7).
// Skale są autorskie i jakościowe: brak norm, brak wyników zbiorczych, brak diagnoz.
// Funkcje zwracają wyłącznie "sygnały do pogłębienia" z odwołaniem do konkretnych pytań szablonu.
import type { AnswerState, AnswerValue } from "@/questionnaires/types";
import type { LoadedVersion, QuestionRow } from "./templates";

export interface AnswerLite {
  question_id: string;
  state: AnswerState;
  value: AnswerValue;
}

export interface PersonData {
  participantId: string;
  name: string;
  version: LoadedVersion;
  answers: AnswerLite[];
}

export interface Signal {
  area: string;
  text: string;
  /** Identyfikatory pytań (klucz + numer w części), do których odnosi się sygnał. */
  refs: string[];
  who?: string;
  level: "deepen" | "safety";
}

export function questionRef(q: Pick<QuestionRow, "key" | "source_number" | "section_key">, v: LoadedVersion): string {
  const s = v.sections.find((x) => x.key === q.section_key);
  const part = s?.title.match(/^Część (\d+)/)?.[1];
  return part && q.source_number ? `Cz. ${part}, pyt. ${q.source_number}` : q.key;
}

function byTag(p: PersonData, tag: string) {
  const qs = p.version.sections.flatMap((s) => s.questions).filter((q) => q.tags.includes(tag));
  return qs.map((q) => ({ q, a: p.answers.find((a) => a.question_id === q.id) }));
}

function num(a?: AnswerLite): number | null {
  return a && a.state === "answered" && typeof a.value === "number" ? a.value : null;
}

function choice(a?: AnswerLite): string | null {
  return a && a.state === "answered" && a.value && typeof a.value === "object" && "choice" in a.value ? a.value.choice : null;
}

export function answerByKey(p: PersonData, key: string) {
  const q = p.version.sections.flatMap((s) => s.questions).find((x) => x.key === key);
  return { q, a: q ? p.answers.find((x) => x.question_id === q.id) : undefined };
}

/** Odpowiedzi "tak" / "wolę omówić" w przesiewie bezpieczeństwa. */
export function screeningFlags(p: PersonData) {
  const s = p.version.sections.find((x) => x.area === "safety");
  return (s?.questions ?? [])
    .filter((q) => q.type === "screening")
    .map((q) => {
      const a = p.answers.find((x) => x.question_id === q.id);
      const v = a?.state === "discuss_in_session" ? "discuss" : a?.state === "answered" ? (a.value as string) : null;
      return { q, value: v, trigger: q.tags.includes("risk-trigger") };
    })
    .filter((x) => x.value === "yes" || x.value === "discuss");
}

export function personSignals(p: PersonData): Signal[] {
  const out: Signal[] = [];
  const v = p.version;
  const ref = (q: QuestionRow) => questionRef(q, v);
  const high = (tag: string) => byTag(p, tag).filter((x) => (num(x.a) ?? 0) >= 4);
  const low = (tag: string) => byTag(p, tag).filter((x) => {
    const n = num(x.a);
    return n !== null && n <= 2;
  });

  for (const x of high("contempt"))
    out.push({ area: "Komunikacja", level: "deepen", refs: [ref(x.q)], who: p.name, text: `Pogarda (sarkazm, przewracanie oczami, ton wyższości) zaznaczona na ${num(x.a)}. W badaniach Gottmana najsilniejszy sygnał ryzyka – pogłębić na sesji.` });
  for (const x of low("repair"))
    out.push({ area: "Komunikacja", level: "deepen", refs: [ref(x.q)], who: p.name, text: `Naprawa po kłótni oceniona na ${num(x.a)} – sprawdzić, jakie próby naprawy są podejmowane i co nie dociera.` });
  const horsemen = ["criticism", "defensiveness", "stonewalling"].flatMap((t) => high(t));
  if (horsemen.length)
    out.push({ area: "Komunikacja", level: "deepen", refs: horsemen.map((x) => ref(x.q)), who: p.name, text: `Wysokie wartości (4-5) w pozycjach odwróconych: ${horsemen.map((x) => `„${x.q.prompt}” (${num(x.a)})`).join("; ")}.` });
  for (const x of low("emotional-safety"))
    out.push({ area: "Bliskość", level: "deepen", refs: [ref(x.q)], who: p.name, text: `Poczucie bezpieczeństwa emocjonalnego: ${num(x.a)} – pogłębić.` });
  const anx = high("anxiety");
  const avo = high("avoidance");
  if (anx.length && avo.length)
    out.push({ area: "Zaufanie", level: "deepen", refs: [...anx, ...avo].map((x) => ref(x.q)), who: p.name, text: "Jednocześnie wysoki lęk i unikanie bliskości u tej samej osoby – pogłębić w kontekście historii relacji." });
  for (const x of low("boundaries-respected"))
    out.push({ area: "Granice", level: "deepen", refs: [ref(x.q)], who: p.name, text: `„Moje granice są szanowane”: ${num(x.a)} – sprawdź, czy nie występuje kontrola.` });
  const child = [...high("child-witness"), ...high("child-triangulation")];
  if (child.length)
    out.push({ area: "Rodzicielstwo", level: "deepen", refs: child.map((x) => ref(x.q)), who: p.name, text: "Dziecko bywa świadkiem lub jest wciągane w konflikt – priorytet psychoedukacji." });
  const over = high("overload");
  const sleep = low("sleep");
  if (over.length >= 2 || (over.length && sleep.length))
    out.push({ area: "Stres", level: "deepen", refs: [...over, ...sleep].map((x) => ref(x.q)), who: p.name, text: "Wysokie przeciążenie (praca, stres, sen) – rozważ najpierw pracę indywidualną." });
  for (const x of high("exhaustion"))
    out.push({ area: "Gotowość", level: "deepen", refs: [ref(x.q)], who: p.name, text: `Wyczerpanie i brak siły do dalszych prób: ${num(x.a)}.` });
  for (const f of screeningFlags(p))
    out.push({
      area: "Bezpieczeństwo",
      level: "safety",
      refs: [ref(f.q)],
      who: p.name,
      text: `${f.value === "yes" ? "„Tak”" : "„Wolę omówić na sesji”"}: ${f.q.prompt}${f.trigger && f.value === "yes" ? " – wymaga kontaktu przed sesją lub krótkiej rozmowy przesiewowej na jej początku." : ""}`,
    });
  return out;
}

const READINESS_RANK: Record<string, number> = { stay_work: 4, stay_doubt: 3, torn: 2, lean_leave: 1, leave: 0 };

export function readinessMean(p: PersonData): number | null {
  const vals = byTag(p, "readiness").map((x) => num(x.a)).filter((n): n is number => n !== null);
  return vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : null;
}

/** Sygnały wynikające z porównania dwóch osób (para). Pokazujemy dwie perspektywy, nie werdykt. */
export function coupleSignals(a: PersonData, b: PersonData): Signal[] {
  const out: Signal[] = [];
  const hi = (p: PersonData, tag: string) => byTag(p, tag).some((x) => (num(x.a) ?? 0) >= 4);
  for (const [x, y] of [[a, b], [b, a]] as const) {
    if (hi(x, "anxiety") && hi(y, "avoidance"))
      out.push({ area: "Zaufanie", level: "deepen", refs: ["Cz. 5, pyt. 2, 4 / pyt. 3"], text: `Wysoki lęk u osoby: ${x.name} i unikanie bliskości u osoby: ${y.name} – możliwy wzorzec pościgu i wycofania do pogłębienia.` });
  }
  const pa = choice(answerByKey(a, "s10.position").a);
  const pb = choice(answerByKey(b, "s10.position").a);
  const ra = readinessMean(a);
  const rb = readinessMean(b);
  const posGap = pa && pb ? Math.abs(READINESS_RANK[pa] - READINESS_RANK[pb]) : 0;
  if (posGap >= 2 || (ra !== null && rb !== null && Math.abs(ra - rb) >= 1.5))
    out.push({ area: "Gotowość", level: "deepen", refs: ["Cz. 10"], text: "Wyraźna asymetria gotowości – rozważ ścieżkę decyzyjną (w duchu Discernment Counseling) zamiast od razu terapii par." });
  return out;
}

export type CompareStatus = "similar" | "divergent" | "missing" | "different_choice" | "same_choice" | "text";

export interface CompareRow {
  key: string;
  section: string;
  prompt: [string, string];
  ref: string;
  type: string;
  values: [AnswerLite | undefined, AnswerLite | undefined];
  status: CompareStatus;
}

/** Porównanie pozycja po pozycji (dopasowanie po kluczu pytania – wspólnym dla wersji on/ona). */
export function compare(a: PersonData, b: PersonData): CompareRow[] {
  const rows: CompareRow[] = [];
  for (const s of a.version.sections) {
    if (s.area === "consent" || s.area === "declaration" || s.area === "profile") continue;
    for (const qa of s.questions) {
      if (qa.type === "info") continue;
      const qb = b.version.sections.flatMap((x) => x.questions).find((x) => x.key === qa.key);
      if (!qb) continue;
      const va = a.answers.find((x) => x.question_id === qa.id);
      const vb = b.answers.find((x) => x.question_id === qb.id);
      let status: CompareStatus = "text";
      if (!va || !vb || va.state !== "answered" || vb.state !== "answered") status = qa.type === "textarea" || qa.type === "text" ? "text" : "missing";
      else if (qa.type === "scale5") status = Math.abs((va.value as number) - (vb.value as number)) >= 2 ? "divergent" : "similar";
      else if (qa.type === "single" || qa.type === "screening") status = JSON.stringify(choiceOf(va.value)) === JSON.stringify(choiceOf(vb.value)) ? "same_choice" : "different_choice";
      rows.push({ key: qa.key, section: s.title, prompt: [qa.prompt, qb.prompt], ref: questionRef(qa, a.version), type: qa.type, values: [va, vb], status });
    }
  }
  return rows;
}

function choiceOf(v: AnswerValue) {
  return v && typeof v === "object" && "choice" in v ? v.choice : v;
}

/** Czytelna forma odpowiedzi (do widoku i cytatów). */
export function formatAnswer(q: Pick<QuestionRow, "type" | "options">, a?: AnswerLite): string {
  if (!a) return "—";
  if (a.state === "not_applicable") return "nie dotyczy";
  if (a.state === "discuss_in_session") return "wolę omówić na sesji";
  const v = a.value;
  if (v === null || v === undefined) return "—";
  const label = (val: string) => q.options?.find((o) => o.value === val)?.label ?? val;
  switch (q.type) {
    case "scale5":
      return `${v} / 5`;
    case "screening":
      return v === "yes" ? "tak" : "nie";
    case "single": {
      const s = v as { choice: string; detail?: string };
      return label(s.choice) + (s.detail ? ` ${s.detail}` : "");
    }
    case "multi": {
      const m = v as { choices: string[]; primary?: string; detail?: string };
      return m.choices.map((c) => (c === m.primary ? `${label(c)} (główny)` : label(c))).join("; ") + (m.detail ? ` – ${m.detail}` : "");
    }
    case "children": {
      const c = (v as { children: { name: string; age: string }[] }).children.filter((x) => x.name.trim() || x.age.trim());
      return c.length ? c.map((x) => [x.name.trim(), x.age.trim() && `${x.age.trim()} l.`].filter(Boolean).join(", ")).join("; ") : "—";
    }
    case "country_city": {
      const c = v as { country: string; city: string };
      return [c.country, c.city].filter(Boolean).join(", ");
    }
    case "consent":
      return (v as { granted: boolean }).granted ? "zgoda udzielona" : "brak zgody";
    case "signature": {
      const s = v as { name: string; date: string };
      return `${s.name}, ${s.date}`;
    }
    default:
      return String(v);
  }
}
