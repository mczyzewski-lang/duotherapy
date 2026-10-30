// Walidacja odpowiedzi po stronie serwera (Zod) – niezależna od formularza w przeglądarce.
import { z } from "zod";
import type { AnswerState, AnswerValue, Option, QuestionType, ShowIf } from "./types";

export interface QuestionLike {
  type: QuestionType;
  options?: Option[] | null;
  allowNA?: boolean;
  allow_na?: boolean;
  required?: boolean;
}

const text = (max: number) => z.string().trim().max(max);

export function validateAnswer(q: QuestionLike, state: AnswerState, value: unknown): { ok: true; value: AnswerValue } | { ok: false; error: string } {
  const allowNA = q.allowNA ?? q.allow_na ?? false;
  if (state === "not_applicable") return allowNA ? { ok: true, value: null } : { ok: false, error: "To pytanie nie ma opcji „nie dotyczy”." };
  if (state === "discuss_in_session") {
    return q.type === "screening" ? { ok: true, value: null } : { ok: false, error: "Opcja „wolę omówić na sesji” dotyczy pytań przesiewowych." };
  }
  const values = new Set((q.options ?? []).map((o) => o.value));
  const detailFor = new Set((q.options ?? []).filter((o) => o.detailLabel).map((o) => o.value));
  let schema: z.ZodType<AnswerValue>;
  switch (q.type) {
    case "text":
    case "email":
    case "phone":
      schema = q.type === "email" ? z.union([z.literal(""), z.string().trim().email("Podaj poprawny adres e-mail.").max(200)]) : text(q.type === "phone" ? 40 : 2000);
      break;
    case "textarea":
      schema = text(10000);
      break;
    case "date":
      schema = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowa data.")]);
      break;
    case "country_city":
      schema = z.object({ country: text(100), city: text(100) });
      break;
    case "scale5":
      schema = z.number().int().min(1).max(5);
      break;
    case "screening":
      schema = z.enum(["no", "yes"]);
      break;
    case "single":
      schema = z
        .object({ choice: z.string(), detail: text(1000).optional() })
        .refine((v) => values.has(v.choice), "Nieznana opcja.")
        .transform((v) => (detailFor.has(v.choice) ? v : { choice: v.choice }));
      break;
    case "multi":
      schema = z
        .object({ choices: z.array(z.string()).max(20), primary: z.string().optional(), detail: text(1000).optional() })
        .refine((v) => v.choices.every((c) => values.has(c)), "Nieznana opcja.")
        .refine((v) => !v.primary || v.choices.includes(v.primary), "Główny cel musi być zaznaczony.")
        .transform((v) => ({ choices: [...new Set(v.choices)], primary: v.primary, detail: v.choices.some((c) => detailFor.has(c)) ? v.detail : undefined }));
      break;
    case "consent":
      schema = z.object({ granted: z.boolean() });
      break;
    case "signature":
      schema = z.object({ name: text(200).min(2, "Wpisz imię i nazwisko."), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
      break;
    case "info":
      return { ok: false, error: "Blok informacyjny nie przyjmuje odpowiedzi." };
    default:
      return { ok: false, error: "Nieznany typ pytania." };
  }
  const r = schema.safeParse(value);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Nieprawidłowa odpowiedź." };
  return { ok: true, value: r.data };
}

/** Czy pytanie warunkowe jest widoczne przy danych odpowiedziach. */
export function isVisible(showIf: ShowIf | null | undefined, answersByKey: Record<string, AnswerValue | undefined>): boolean {
  if (!showIf) return true;
  const v = answersByKey[showIf.questionKey];
  if (v && typeof v === "object" && "choice" in v) return showIf.anyOf.includes(v.choice);
  if (v && typeof v === "object" && "choices" in v) return v.choices.some((c) => showIf.anyOf.includes(c));
  if (typeof v === "string") return showIf.anyOf.includes(v);
  return false;
}

/** Czy odpowiedź jest "pusta" (np. pusty tekst) – wtedy traktujemy ją jak brak odpowiedzi. */
export function isEmptyAnswer(type: QuestionType, value: AnswerValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (type === "country_city" && typeof value === "object" && "country" in value) return !value.country.trim() && !value.city.trim();
  if (type === "multi" && typeof value === "object" && "choices" in value) return value.choices.length === 0;
  if (type === "consent" && typeof value === "object" && "granted" in value) return !value.granted;
  return false;
}

export const RISK_TRIGGER_TAG = "risk-trigger";
