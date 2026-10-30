import { buildCouple } from "./couple";
import { buildIndividual } from "./individual";
import type { QuestionDef, TemplateDef } from "./types";

export * from "./types";

/** Definicje źródłowe czterech szablonów (seed wersji 1 w bazie). */
export function sourceTemplates(): TemplateDef[] {
  return [buildCouple("male"), buildCouple("female"), buildIndividual("male"), buildIndividual("female")];
}

export const TEMPLATE_LABELS: Record<TemplateDef["key"], string> = {
  couple_male: "Para – on",
  couple_female: "Para – ona",
  individual_male: "Indywidualny – on",
  individual_female: "Indywidualny – ona",
};

export function allQuestions(t: Pick<TemplateDef, "sections">): QuestionDef[] {
  return t.sections.flatMap((s) => s.questions);
}
