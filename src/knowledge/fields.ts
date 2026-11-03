// Pola do uzupełnienia w materiałach (wersja online z autozapisem) – identyfikatory wspólne dla renderera,
// zapisu i podsumowania. Identyfikator = pozycja bloku + pozycja w bloku (stabilny, dopóki treść się nie zmienia).
import type { Block, LeadMagnet } from "./types";

export const fid = {
  question: (i: number) => `q${i}`,
  prompt: (i: number, k: number) => `e${i}.${k}`,
  cell: (i: number, row: number) => `c${i}.${row}`,
  blankCell: (i: number, row: number, col: number) => `c${i}.b${row}.${col}`,
  day: (i: number) => `d${i}`,
  check: (i: number, k: number) => `k${i}.${k}`,
  loop: (i: number, k: number) => `l${i}.${k}`,
};

export const LOOP_STEPS = [
  "1. Wyzwalacz – co się wydarzyło?",
  "2. Moja interpretacja – co sobie pomyślałem / pomyślałam?",
  "3. Emocje – co czułem / czułam pod spodem?",
  "4. Moja reakcja – co zrobiłem / zrobiłam?",
  "5. Reakcja drugiej osoby",
  "6. Eskalacja – jak to się potoczyło?",
  "7. Punkt przerwania – co mogę zrobić inaczej?",
];

export interface Field {
  id: string;
  kind: "text" | "check";
  section: string;
  label: string;
}

/** Wszystkie pola materiału w kolejności dokumentu. */
export function fieldsOf(m: LeadMagnet): Field[] {
  const out: Field[] = [];
  let section = m.title;
  m.blocks.forEach((b: Block, i) => {
    if (b.t === "h2") section = b.text;
    else if (b.t === "question") out.push({ id: fid.question(i), kind: "text", section, label: `${b.n}. ${b.q}` });
    else if (b.t === "exercise") b.prompts?.forEach((p, k) => out.push({ id: fid.prompt(i, k), kind: "text", section: b.title, label: p }));
    else if (b.t === "columns") {
      b.rows?.forEach((r, k) => {
        if (!r[1]) out.push({ id: fid.cell(i, k), kind: "text", section: b.title ?? section, label: r[0] });
      });
      for (let r = 0; r < (b.blankRows ?? 0); r++)
        b.cols.forEach((c, col) => out.push({ id: fid.blankCell(i, r, col), kind: "text", section: b.title ?? section, label: `${c} (${r + 1})` }));
    } else if (b.t === "day") out.push({ id: fid.day(i), kind: "text", section: `Dzień ${b.n}: ${b.title}`, label: "Moja notatka" });
    else if (b.t === "checklist") b.items.forEach((x, k) => out.push({ id: fid.check(i, k), kind: "check", section: b.title ?? section, label: x }));
    else if (b.t === "loopBlank") LOOP_STEPS.forEach((x, k) => out.push({ id: fid.loop(i, k), kind: "text", section: "Mój arkusz pętli", label: x }));
  });
  return out;
}

export type Answers = Record<string, string | boolean>;

/** Czyści i ogranicza odpowiedzi do pól, które istnieją w materiale. */
export function sanitizeAnswers(m: LeadMagnet, data: unknown): Answers {
  const allowed = new Map(fieldsOf(m).map((f) => [f.id, f.kind]));
  const out: Answers = {};
  if (!data || typeof data !== "object") return out;
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    const kind = allowed.get(k);
    if (kind === "check" && typeof v === "boolean") out[k] = v;
    else if (kind === "text" && typeof v === "string" && v.trim()) out[k] = v.slice(0, 4000);
  }
  return out;
}

export const filledCount = (a: Answers) => Object.values(a).filter((v) => v === true || (typeof v === "string" && v.trim())).length;

export type SummaryGroup = { section: string; items: { label: string; value: string }[] };

/** Podsumowanie: uzupełnione pola pogrupowane według części materiału. */
export function groupAnswers(fields: Field[], a: Answers): SummaryGroup[] {
  const groups: SummaryGroup[] = [];
  for (const f of fields) {
    const v = a[f.id];
    if (v === undefined || v === false || (typeof v === "string" && !v.trim())) continue;
    const value = v === true ? "✓" : String(v);
    let g = groups.find((x) => x.section === f.section);
    if (!g) groups.push((g = { section: f.section, items: [] }));
    g.items.push({ label: f.label, value });
  }
  return groups;
}

export const summarize = (m: LeadMagnet, a: Answers) => groupAnswers(fieldsOf(m), a);

/** Minimum do podsumowania: co najmniej 1 odpowiedź w każdej z pierwszych (maks. 3) części materiału z polami. */
export interface Requirement { section: string; ids: string[] }
export const MAX_REQUIRED_SECTIONS = 3;
export function requirementsOf(fields: Field[]): Requirement[] {
  const out: Requirement[] = [];
  for (const f of fields) {
    let r = out.find((x) => x.section === f.section);
    if (!r) {
      if (out.length >= MAX_REQUIRED_SECTIONS) continue;
      out.push((r = { section: f.section, ids: [] }));
    }
    r.ids.push(f.id);
  }
  return out;
}

const isFilled = (v: string | boolean | undefined) => v === true || (typeof v === "string" && v.trim().length > 0);
export const missingRequirements = (reqs: Requirement[], a: Answers) => reqs.filter((r) => !r.ids.some((id) => isFilled(a[id])));
