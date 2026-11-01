import { describe, expect, it } from "vitest";
import { isValidAnswers, normalizePhone, QUIZ, summaryFor } from "@/lib/mapa-quiz";

describe("quiz Mapa Relacji", () => {
  it("ma 6 pytań z unikalnymi odpowiedziami", () => {
    expect(QUIZ).toHaveLength(6);
    for (const q of QUIZ) expect(new Set(q.options.map((o) => o.value)).size).toBe(q.options.length);
    expect(QUIZ.map((q) => q.options.length)).toEqual([4, 5, 4, 4, 4, 3]);
  });

  it("wymaga kompletu poprawnych odpowiedzi", () => {
    const ok = { q1: "rebuild", q2: "talk", q3: "both", q4: "repeating", q5: "months", q6: "solo" };
    expect(isValidAnswers(ok)).toBe(true);
    expect(isValidAnswers({ ...ok, q6: undefined })).toBe(false);
    expect(isValidAnswers({ ...ok, q2: "xyz" })).toBe(false);
  });

  it("normalizuje i waliduje numer telefonu", () => {
    expect(normalizePhone("600 100 200")).toBe("+48600100200");
    expect(normalizePhone("+48 600-100-200")).toBe("+48600100200");
    expect(normalizePhone("0048600100200")).toBe("+48600100200");
    expect(normalizePhone("+44 7700 900123")).toBe("+447700900123");
    expect(normalizePhone("12")).toBeNull();
    expect(normalizePhone("600 abc 200")).toBeNull();
  });

  it("wstępne podsumowanie parafrazuje odpowiedzi – bez ocen, prognoz i diagnoz", () => {
    for (const q1 of ["rebuild", "unsure", "separate", "one_sided"]) {
      for (const q6 of ["solo", "together", "unsure"]) {
        const { lead, points } = summaryFor({ q1, q2: "trust", q3: "unknown", q4: "decision", q5: "year_plus", q6 });
        const text = [lead, ...points].join(" ");
        expect(lead.length).toBeGreaterThan(20);
        expect(text).not.toMatch(/%|szans|prognoz|diagnoz|toksyczn|powinieneś|powinnaś|rozwód jest/i);
      }
    }
  });
});
