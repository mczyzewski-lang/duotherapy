// Zgodność szablonów z materiałami źródłowymi (05/06) – manifest z docs/source-mapping.md.
// Każda zmiana liczby pozycji, typów, wariantów lub kolejności musi zostać świadomie odnotowana tutaj i w mapowaniu.
import { describe, expect, it } from "vitest";
import { allQuestions, sourceTemplates } from "@/questionnaires";
import type { TemplateDef } from "@/questionnaires/types";

// sekcja: [liczba pozycji, sekwencja typów]
const INDIVIDUAL_MANIFEST: Record<string, [number, string]> = {
  profile: [13, "text date email phone country_city text single text single text single textarea date"],
  consent: [1, "consent"],
  situation: [5, "single textarea single single multi"],
  safety: [9, "screening screening screening screening screening screening screening screening info"],
  communication: [11, "scale5 ".repeat(9) + "textarea textarea"],
  cycle: [13, "text ".repeat(6) + "scale5 ".repeat(4) + "textarea textarea textarea"],
  closeness: [5, "scale5 ".repeat(4) + "textarea"],
  trust: [6, "scale5 ".repeat(5) + "textarea"],
  boundaries: [4, "scale5 ".repeat(3) + "textarea"],
  parenting: [8, "scale5 ".repeat(6) + "textarea textarea"],
  stress: [6, "scale5 ".repeat(5) + "textarea"],
  values: [4, "textarea ".repeat(4)],
  readiness: [8, "scale5 ".repeat(4) + "single single textarea textarea"],
  declaration: [1, "signature"],
};

const OPTION_COUNTS: Record<string, number> = {
  "m.status": 5,
  "m.together": 3,
  "m.therapy": 3,
  "sit.why_alone": 5,
  "sit.who_considers": 5,
  "sit.children": 2,
  "sit.goal": 6,
  "s10.position": 5,
  "s10.partner_position": 5,
};

const byKey = (t: TemplateDef) => Object.fromEntries(allQuestions(t).map((q) => [q.key, q]));

describe("szablony kwestionariuszy", () => {
  const all = sourceTemplates();
  const indiv = all.filter((t) => t.audience === "individual");

  it("istnieją cztery szablony z unikalnymi kluczami", () => {
    expect(all.map((t) => t.key).sort()).toEqual(["couple_female", "couple_male", "individual_female", "individual_male"]);
  });

  for (const t of indiv) {
    it(`${t.key}: sekcje, liczba pozycji i typy zgodne z manifestem`, () => {
      expect(t.sections.map((s) => s.key)).toEqual(Object.keys(INDIVIDUAL_MANIFEST));
      for (const s of t.sections) {
        const [count, types] = INDIVIDUAL_MANIFEST[s.key];
        expect(s.questions.length, s.key).toBe(count);
        expect(s.questions.map((q) => q.type).join(" "), s.key).toBe(types.trim());
      }
      expect(allQuestions(t)).toHaveLength(94);
      expect(t.intro).toHaveLength(6);
      expect(t.needsVerification).toBe(false);
    });

    it(`${t.key}: warianty odpowiedzi i numeracja w częściach`, () => {
      const q = byKey(t);
      for (const [k, n] of Object.entries(OPTION_COUNTS)) expect(q[k].options, k).toHaveLength(n);
      for (const s of t.sections.filter((x) => x.questions.some((y) => y.type === "scale5" || y.type === "screening"))) {
        const nums = s.questions.filter((y) => y.type === "scale5" || y.type === "screening").map((y) => Number(y.sourceNumber));
        // numeracja skal rośnie od 1 (w Cz. 3 skala "Mój udział" zaczyna się od 1 po pozycjach cyklu)
        const seq = s.key === "cycle" ? [1, 2, 3, 4] : nums.map((_, i) => i + 1);
        expect(nums, s.key).toEqual(seq);
      }
    });

    it(`${t.key}: unikalne klucze, źródło z plikiem i stroną`, () => {
      const qs = allQuestions(t);
      expect(new Set(qs.map((q) => q.key)).size).toBe(qs.length);
      for (const q of qs) {
        expect(q.source.file).toBe(t.sourceFile);
        expect(q.source.page).toBeGreaterThanOrEqual(1);
        expect(q.source.page).toBeLessThanOrEqual(10);
      }
    });

    it(`${t.key}: pytania przesiewowe 1-4 i 7 uruchamiają ścieżkę bezpieczeństwa`, () => {
      const triggers = allQuestions(t).filter((q) => q.tags?.includes("risk-trigger")).map((q) => q.sourceNumber);
      expect(triggers).toEqual(["1", "2", "3", "4", "7"]);
    });
  }

  it("formy gramatyczne: wersja męska i żeńska różnią się tylko formą", () => {
    const m = byKey(all.find((t) => t.key === "individual_male")!);
    const f = byKey(all.find((t) => t.key === "individual_female")!);
    expect(Object.keys(m)).toEqual(Object.keys(f));
    expect(m["sit.why_alone"].prompt).toBe("Dlaczego przychodzisz na audyt sam?");
    expect(f["sit.why_alone"].prompt).toBe("Dlaczego przychodzisz na audyt sama?");
    expect(m["s1.2"].prompt).toBe("Czy boisz się swojej partnerki lub jej reakcji?");
    expect(f["s1.2"].prompt).toBe("Czy boisz się swojego partnera lub jego reakcji?");
    expect(m["s10.4"].prompt).toContain("wyczerpany");
    expect(f["s10.4"].prompt).toContain("wyczerpana");
  });

  it("wersja indywidualna podkreśla perspektywę jednej osoby (pytania o przyjście samemu)", () => {
    const ind = byKey(all.find((t) => t.key === "individual_female")!);
    const cpl = byKey(all.find((t) => t.key === "couple_female")!);
    expect(ind["sit.why_alone"]).toBeDefined();
    expect(cpl["sit.why_alone"]).toBeUndefined();
    expect(ind["sit.refusal_reason"].showIf).toEqual({ questionKey: "sit.why_alone", anyOf: ["partner_refuses"] });
  });

  it("szablony dla pary są oznaczone do ręcznej weryfikacji (brak PDF 01/02)", () => {
    for (const t of all.filter((x) => x.audience === "couple")) {
      expect(t.needsVerification).toBe(true);
      expect(t.verificationNote).toMatch(/01\/02/);
      for (const q of allQuestions(t)) expect(q.source.file).toMatch(/^0[12]_/);
    }
  });
});
