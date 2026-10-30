// Struktura danych szablonu kwestionariusza.
// Treść pytań żyje w danych (seed → baza, wersjonowana), a nie w komponentach React.

export type QuestionType =
  | "text" // krótka odpowiedź
  | "textarea" // długa odpowiedź
  | "date"
  | "email"
  | "phone"
  | "country_city" // kraj + miasto (dobór numerów pomocy, strefa czasowa)
  | "single" // pojedynczy wybór (opcjonalnie z "inny:")
  | "multi" // wielokrotny wybór (opcjonalnie z "inny:" i wskazaniem głównego)
  | "scale5" // skala 1–5
  | "screening" // nie / tak / wolę omówić na sesji
  | "consent" // zgoda (rejestrowana w tabeli consents)
  | "signature" // oświadczenie: imię i nazwisko + data
  | "info"; // blok informacyjny bez odpowiedzi

export interface Option {
  value: string;
  label: string;
  /** Wybranie tej opcji pokazuje pole tekstowe (np. "inny:", "Kiedy i jak długo:"). */
  detailLabel?: string;
}

export interface ShowIf {
  questionKey: string;
  /** Pokaż, gdy odpowiedź (pojedyncza lub dowolna z wielu) ma jedną z wartości. */
  anyOf: string[];
}

export interface QuestionDef {
  /** Stabilny identyfikator w obrębie szablonu, wspólny dla wariantów płci (umożliwia porównanie). */
  key: string;
  /** Numer wydrukowany w źródle (jeśli występuje). */
  sourceNumber?: string;
  type: QuestionType;
  prompt: string;
  hint?: string;
  options?: Option[];
  /** Dla "multi": pozwól wskazać główny cel / priorytet. */
  primaryPick?: string;
  required?: boolean;
  /** Pozwól na jawne "nie dotyczy" (np. pytania o dzieci). */
  allowNA?: boolean;
  showIf?: ShowIf;
  /** Nagłówek grupy (np. "Jak rozmawiamy, z mojej perspektywy"); pytania z tą samą grupą są na jednym ekranie. */
  group?: string;
  /** Tagi analityczne wg wytycznych 03 (np. "reversed", "contempt", "repair", "anxiety"). */
  tags?: string[];
  /** Źródło w dokumentach (plik/strona). */
  source: { file: string; page: number; note?: string };
}

export interface SectionDef {
  key: string;
  title: string;
  intro?: string;
  /** Legenda skali, np. "1 = zupełnie nie, 5 = całkowicie tak". */
  scaleLegend?: string;
  /** Obszar analizy (komunikacja, bliskość...) – do podsumowania i raportu. */
  area?: AreaKey;
  questions: QuestionDef[];
}

export type AreaKey =
  | "profile"
  | "consent"
  | "situation"
  | "safety"
  | "communication"
  | "cycle"
  | "closeness"
  | "trust"
  | "boundaries"
  | "parenting"
  | "stress"
  | "values"
  | "readiness"
  | "declaration";

export interface TemplateDef {
  key: "couple_male" | "couple_female" | "individual_male" | "individual_female";
  title: string;
  audience: "couple" | "individual";
  gender: "male" | "female";
  sourceFile: string;
  /** Szablon wymaga ręcznej weryfikacji (np. brak pliku źródłowego). */
  needsVerification: boolean;
  verificationNote?: string;
  /** "Zanim zaczniesz". */
  intro: string[];
  /** Tekst po zakończeniu (instrukcja przesłania). */
  outro?: string;
  sections: SectionDef[];
}

export type AnswerState = "answered" | "not_applicable" | "discuss_in_session";

/** Wartość odpowiedzi w zależności od typu pola. */
export type AnswerValue =
  | string
  | number
  | { choice: string; detail?: string }
  | { choices: string[]; primary?: string; detail?: string }
  | { country: string; city: string }
  | { name: string; date: string }
  | { granted: boolean }
  | null;
