import { describe, expect, it } from "vitest";
import type { StepRow } from "@/lib/mailing";
import { parseStepsCsv, stepsToCsv } from "@/lib/mailing-csv";

const step: StepRow = {
  id: "x", sequence_id: "lead", code: "n3", position: 3, delay_days: 5, subject: "Temat; z „cytatem”", preheader: "Zajawka",
  body: "Cześć {imie},\n\nAkapit drugi, z \"cudzysłowem\".", cta_label: "Zobacz", cta_url: "/mapa-relacji", include_tags: ["lm-petla-konfliktu"], exclude_tags: ["klient"], active: false,
};

describe("e-maile w CSV", () => {
  it("eksport → import daje te same dane", () => {
    const { rows, errors } = parseStepsCsv(stepsToCsv([step]));
    expect(errors).toEqual([]);
    const { id: _id, ...rest } = step;
    expect(rows[0]).toEqual(rest);
  });
  it("błędy z numerami wierszy; powtórzony kod; brak kolumn", () => {
    const csv = "sciezka;kod;temat;tresc;link\nlead;n1;A;B;/\nzla;n2;A;B;/\nlead;n1;A;B;/\ncustomer;k1;;B;/\nlead;n4;A;B;http://x\n";
    const { errors } = parseStepsCsv(csv);
    expect(errors).toEqual([
      expect.stringContaining("Wiersz 3: ścieżka"),
      expect.stringContaining("Wiersz 4: kod „n1” powtarza się"),
      expect.stringContaining("Wiersz 5: temat"),
      expect.stringContaining("Wiersz 6: link"),
    ]);
    expect(parseStepsCsv("kod;temat\nn1;A").errors[0]).toContain("Brak kolumn: sciezka, tresc");
  });
});
