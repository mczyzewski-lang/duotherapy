import { describe, expect, it } from "vitest";
import { compare, coupleSignals, personSignals, type PersonData } from "@/lib/analysis";
import { buildDraft, missingMarkers, MISSING, pathProblems, renderReportHtml } from "@/lib/report";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { LoadedVersion } from "@/lib/templates";
import { sourceTemplates } from "@/questionnaires";
import { isVisible, validateAnswer } from "@/questionnaires/validate";

// Wersja "w pamięci" (bez bazy) – identyfikatory pytań = klucze.
function version(key: string): LoadedVersion {
  const t = sourceTemplates().find((x) => x.key === key)!;
  return {
    id: key, templateKey: t.key, audience: t.audience, gender: t.gender, version: 1, status: "published", title: t.title, intro: t.intro, outro: t.outro ?? null,
    sourceFile: t.sourceFile, needsVerification: t.needsVerification, verificationNote: null,
    sections: t.sections.map((s) => ({
      key: s.key, title: s.title, area: s.area,
      questions: s.questions.map((q, i) => ({
        id: q.key, key: q.key, section_key: s.key, ord: i, source_number: q.sourceNumber ?? null, type: q.type, prompt: q.prompt, hint: q.hint ?? null,
        options: q.options ?? null, primary_pick: q.primaryPick ?? null, required: !!q.required, allow_na: !!q.allowNA, show_if: q.showIf ?? null, group_label: q.group ?? null, tags: q.tags ?? [], source: q.source,
      })),
    })),
  };
}
const person = (name: string, key: string, answers: Record<string, unknown>): PersonData => ({
  participantId: name, name, version: version(key),
  answers: Object.entries(answers).map(([k, v]) => ({ question_id: k, state: "answered" as const, value: v as never })),
});

describe("walidacja odpowiedzi", () => {
  const scale = { type: "scale5" as const };
  it("skala 1–5", () => {
    expect(validateAnswer(scale, "answered", 3).ok).toBe(true);
    expect(validateAnswer(scale, "answered", 6).ok).toBe(false);
    expect(validateAnswer(scale, "not_applicable", null).ok).toBe(false);
    expect(validateAnswer({ ...scale, allowNA: true }, "not_applicable", null).ok).toBe(true);
  });
  it("„wolę omówić na sesji” tylko w przesiewie", () => {
    expect(validateAnswer({ type: "screening" }, "discuss_in_session", null).ok).toBe(true);
    expect(validateAnswer(scale, "discuss_in_session", null).ok).toBe(false);
  });
  it("wybór spoza listy jest odrzucany, pole dodatkowe tylko dla opcji z detailLabel", () => {
    const q = { type: "single" as const, options: [{ value: "a", label: "A" }, { value: "other", label: "inny:", detailLabel: "inny:" }] };
    expect(validateAnswer(q, "answered", { choice: "x" }).ok).toBe(false);
    expect(validateAnswer(q, "answered", { choice: "a", detail: "ukryte" })).toEqual({ ok: true, value: { choice: "a" } });
    expect(validateAnswer(q, "answered", { choice: "other", detail: "coś" })).toEqual({ ok: true, value: { choice: "other", detail: "coś" } });
  });
  it("główny cel musi być wśród zaznaczonych", () => {
    const q = { type: "multi" as const, options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] };
    expect(validateAnswer(q, "answered", { choices: ["a"], primary: "b" }).ok).toBe(false);
    expect(validateAnswer(q, "answered", { choices: ["a", "b"], primary: "b" }).ok).toBe(true);
  });
  it("warunek wyświetlania", () => {
    const si = { questionKey: "sit.why_alone", anyOf: ["partner_refuses"] };
    expect(isVisible(si, { "sit.why_alone": { choice: "partner_refuses" } })).toBe(true);
    expect(isVisible(si, { "sit.why_alone": { choice: "separated" } })).toBe(false);
  });
});

describe("analiza jakościowa (wytyczne 03)", () => {
  it("pogarda 4-5 i naprawa 1-2 dają sygnały do pogłębienia z odwołaniem do pytań", () => {
    const p = person("A", "individual_female", { "s2.5": 5, "s2.9": 1 });
    const s = personSignals(p);
    expect(s.some((x) => x.text.startsWith("Pogarda") && x.refs[0] === "Cz. 2, pyt. 5")).toBe(true);
    expect(s.some((x) => x.text.startsWith("Naprawa") && x.refs[0] === "Cz. 2, pyt. 9")).toBe(true);
  });
  it("„tak” w przesiewie to sygnał bezpieczeństwa (bez rozpoznania)", () => {
    const s = personSignals(person("A", "individual_male", { "s1.1": "yes" }));
    expect(s.find((x) => x.level === "safety")?.text).toContain("wymaga kontaktu przed sesją");
  });
  it("porównanie pary: rozbieżność ≥2 i asymetria gotowości, bez werdyktu", () => {
    const a = person("A", "couple_female", { "s2.9": 5, "s10.1": 5, "s10.2": 5, "s10.position": { choice: "stay_work" } });
    const b = person("B", "couple_male", { "s2.9": 1, "s10.1": 1, "s10.2": 2, "s10.position": { choice: "leave" } });
    const rows = compare(a, b);
    expect(rows.find((r) => r.key === "s2.9")?.status).toBe("divergent");
    expect(coupleSignals(a, b).some((x) => x.text.includes("asymetria gotowości"))).toBe(true);
    // wyłącznie opisowe statusy – bez punktacji ani „kto ma rację”
    expect(new Set(rows.map((r) => r.status))).toEqual(new Set(["missing", "text", "divergent", "different_choice"]));
    expect(Object.keys(rows[0]).sort()).toEqual(["key", "prompt", "ref", "section", "status", "type", "values"]);
  });
});

describe("raport", () => {
  const base = { sessionDate: new Date("2026-11-10"), therapist: "Psycholog", reason: null, riskFlag: false };
  it("raport wspólny nie zawiera odpowiedzi z kwestionariuszy, tylko notatki dopuszczone", () => {
    const d = buildDraft({ ...base, audience: "joint", caseKind: "couple", participants: [{ name: "A" }, { name: "B" }], ownData: null, notes: [{ area: "communication", body: "Wspólna obserwacja", participantName: null }] });
    expect(d.mechanism.columns).toEqual(["A", "B"]);
    expect(d.mechanism.rows.every((r) => r.values.every((v) => v === MISSING))).toBe(true);
    expect(d.tensions[0].text).toContain("Wspólna obserwacja");
  });
  it("raport indywidualny opisuje osobę nieobecną wyłącznie jako perspektywę uczestnika", () => {
    const own = person("Ewa", "individual_female", { "s3.trigger": "brak odpowiedzi na wiadomość", "s3.partner": "wychodzi z pokoju" });
    const d = buildDraft({ ...base, audience: "participant", caseKind: "individual", participants: [{ name: "Ewa" }], ownData: own, notes: [] });
    expect(d.mechanism.columns[1]).toMatch(/perspektywie uczestnika/);
    expect(d.mechanism.rows[0].values[0]).toContain("brak odpowiedzi na wiadomość");
    expect(d.mechanism.rows.find((r) => r.key === "behavior")!.values[1]).toBe("W opisie uczestnika: wychodzi z pokoju");
    expect(d.mechanism.rows.find((r) => r.key === "need")!.values[1]).toBe(MISSING); // brak fikcyjnych danych
    expect(renderReportHtml(d, DEFAULT_SETTINGS)).toContain("Przy audycie indywidualnym: raport opiera się wyłącznie na perspektywie jednej osoby");
  });
  it("zatwierdzenie blokują braki; przy zagrożeniu terapia par i mediacja są niedozwolone", () => {
    const d = buildDraft({ ...base, riskFlag: true, audience: "joint", caseKind: "couple", participants: [{ name: "A" }, { name: "B" }], ownData: null, notes: [] });
    expect(missingMarkers(d).length).toBeGreaterThan(10);
    d.path = { main: "rebuild", options: ["couple_therapy"], rationale: "x" };
    expect(pathProblems(d)[0]).toMatch(/nie rekomenduje się terapii par/);
    d.path = { main: "safety", options: ["safety_plan"], rationale: "x" };
    expect(pathProblems(d)).toEqual([]);
  });
  it("HTML raportu zawiera wszystkie części szablonu i numery pomocy", () => {
    const html = renderReportHtml(buildDraft({ ...base, audience: "joint", caseKind: "couple", participants: [{ name: "A" }, { name: "B" }], ownData: null, notes: [] }), DEFAULT_SETTINGS);
    for (const h of ["1. Podsumowanie", "2. Mocne strony relacji", "3. Obszary napięcia", "4. Mechanizm konfliktu", "5. Rekomendacje", "6. Następne kroki", "Ważne", "116 123", "800 120 002", "na razie bez dalszej pracy"]) expect(html).toContain(h);
    expect(html).not.toContain("<script");
  });
});
