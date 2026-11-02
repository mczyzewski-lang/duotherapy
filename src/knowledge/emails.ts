// Szablony wiadomości „Wiedza”: dostarczenie materiału, 3 wiadomości po zgodzie marketingowej, codzienne ćwiczenia (wyzwanie 7 dni).
// Bez treści o sytuacji odbiorcy; temat pochodzi wyłącznie z wybranego materiału.
import type { Block, LeadMagnet } from "./types";

export interface Mail {
  subject: string;
  text: string;
}

const footer = (appUrl: string, contact: { email?: string; phone?: string }, unsubscribeUrl?: string) =>
  [
    "",
    "—",
    "DUO® · Mapa Relacji",
    [contact.email, contact.phone].filter(Boolean).join(" · ") || appUrl,
    unsubscribeUrl ? `Nie chcesz więcej wiadomości? Wypisz się: ${unsubscribeUrl}` : "",
    "Materiały DUO mają charakter edukacyjny i nie zastępują pomocy specjalisty. W sytuacji zagrożenia: 112.",
  ]
    .filter((x) => x !== "")
    .join("\n");

export function deliveryMail(m: LeadMagnet, name: string | null, appUrl: string, contact: { email?: string; phone?: string }): Mail {
  return {
    subject: `Twój bezpłatny materiał DUO: ${m.short}`,
    text: [
      `${name ? `${name}, dziękujemy` : "Dziękujemy"} za pobranie materiału „${m.title}”.`,
      "",
      m.purpose,
      "",
      `Otwórz materiał online: ${appUrl}/wiedza/${m.slug}/material`,
      `Pobierz PDF: ${appUrl}/wiedza/${m.slug}/pdf`,
      "",
      `Jak korzystać: ${m.howTo}`,
      footer(appUrl, contact),
    ].join("\n"),
  };
}

export function nurtureMail(m: LeadMagnet, step: 1 | 2 | 3, appUrl: string, contact: { email?: string; phone?: string }, unsubscribeUrl: string): Mail {
  const e = m.emails[step - 1];
  const link = step === 3 ? `\n\nPoznaj Mapę Relacji: ${appUrl}/?utm_source=duo_wiedza&utm_medium=email&utm_campaign=${m.id}#co-otrzymasz` : `\n\nTwój materiał: ${appUrl}/wiedza/${m.slug}/material`;
  return { subject: e.subject, text: e.body + link + "\n" + footer(appUrl, contact, unsubscribeUrl) };
}

export function seriesDayMail(day: Extract<Block, { t: "day" }>, appUrl: string, slug: string, contact: { email?: string; phone?: string }, unsubscribeUrl: string): Mail {
  return {
    subject: `Dzień ${day.n}: ${day.title} – 7 dni lepszych rozmów`,
    text: [
      `Dzień ${day.n} · ${day.title} (${day.minutes})`,
      "",
      day.intro,
      "",
      "Ćwiczenie:",
      ...day.task.map((t, i) => `${i + 1}. ${t}`),
      "",
      `Przykład: ${day.example}`,
      `Wariant indywidualny: ${day.solo}`,
      "",
      `Całe wyzwanie online: ${appUrl}/wiedza/${slug}/material`,
      footer(appUrl, contact, unsubscribeUrl),
    ].join("\n"),
  };
}
