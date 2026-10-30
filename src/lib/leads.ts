export const LEAD_STAGES = [
  ["new", "Nowe"],
  ["contacted", "Próba kontaktu"],
  ["call_scheduled", "Rozmowa umówiona"],
  ["call_done", "Rozmowa odbyta"],
  ["payment_sent", "Link do płatności wysłany"],
  ["paid", "Opłacone"],
  ["converted", "Sprawa założona"],
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
