export const LEAD_STAGES = [
  ["new", "Nowe"],
  ["contacted", "Próba kontaktu"],
  ["call_scheduled", "Rozmowa umówiona"],
  ["call_done", "Rozmowa odbyta"],
  ["payment_sent", "Mapa Relacji zaproponowana"],
  ["paid", "Mapa Relacji opłacona"],
  ["converted", "W realizacji (sprawa)"],
  ["lost", "Bez kontynuacji"],
] as const;

export const INTENT_LABEL: Record<string, string> = {
  rebuild: "Chcemy spróbować odbudować relację",
  unsure: "Nie wiemy, czy zostać razem",
  separate: "Myślimy o rozstaniu z szacunkiem",
};

export const CONCERN_LABEL: Record<string, string> = {
  fights: "Powracające kłótnie",
  distance: "Oddalenie, brak bliskości",
  trust: "Naruszone zaufanie",
  vision: "Różne wizje przyszłości",
  stress: "Stres, praca, obowiązki",
  children: "Troska o dzieci",
  unclear: "Trudno nazwać",
};

/** Segment z pierwszego pytania quizu „Mapa Relacji”. */
export const SEGMENT_LABEL: Record<string, string> = {
  rebuild: "Chce spróbować naprawić",
  unsure: "Nie wie, co dalej",
  separate: "Myśli o rozstaniu",
  one_sided: "Chce zmiany, druga osoba niekoniecznie",
};

export const PREFERRED_TIME_LABEL: Record<string, string> = { morning: "rano (8–12)", afternoon: "po południu (12–17)", evening: "wieczorem (17–20)" };

export const leadSummary = (l: { segment?: string | null; intent?: string | null }) =>
  (l.segment && SEGMENT_LABEL[l.segment]) || (l.intent && INTENT_LABEL[l.intent]) || "—";
