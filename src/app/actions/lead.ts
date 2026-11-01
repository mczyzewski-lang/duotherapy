"use server";

// Prośba o telefon w sprawie Mapy Relacji (finał krótkiego quizu).
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { encrypt } from "@/lib/crypto";
import { withActor } from "@/lib/db";
import { ATTRIBUTION_KEYS, isValidAnswers, normalizePhone, QUIZ_VERSION } from "@/lib/mapa-quiz";
import { notifyTeam } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";

const LeadSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię.").max(80),
  phone: z.string().trim().min(1, "Podaj numer telefonu.").max(40),
  email: z.union([z.literal(""), z.string().trim().email("Podaj poprawny adres e-mail lub zostaw puste pole.").max(200)]).default(""),
  preferredTime: z.enum(["", "morning", "afternoon", "evening"]).default(""),
  contactConsent: z.literal(true, { error: "Zaznacz zgodę na kontakt – bez niej nie możemy zadzwonić." }),
  marketingConsent: z.boolean().default(false),
  answers: z.record(z.string(), z.string()),
  attribution: z.record(z.string(), z.string().max(300)).default({}),
  anonId: z.string().max(64).optional(),
  startedAt: z.number().optional(),
  website: z.string().max(0).optional(), // honeypot
});

export type LeadInput = z.input<typeof LeadSchema>;
export type LeadResult = { ok: true } | { ok: false; error: string; field?: string };

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const parsed = LeadSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i.message, field: String(i.path[0] ?? "") };
  }
  const d = parsed.data;
  // boty: wypełnione ukryte pole albo formularz wysłany nierealnie szybko – udajemy sukces, nic nie zapisujemy
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) return { ok: true };
  const phone = normalizePhone(d.phone);
  if (!phone) return { ok: false, error: "Podaj poprawny numer telefonu, np. 600 100 200 lub +48 600 100 200.", field: "phone" };
  if (!isValidAnswers(d.answers)) return { ok: false, error: "Odpowiedzi z quizu są niekompletne. Wróć do pytań i spróbuj ponownie." };
  if (!(await hit(`lead:${await clientIp()}`, 5, 60 * 60))) return { ok: false, error: "Wysłano już kilka zgłoszeń z tego urządzenia. Spróbuj ponownie później." };

  const a = d.answers;
  const attribution = Object.fromEntries(Object.entries(d.attribution).filter(([k]) => (ATTRIBUTION_KEYS as readonly string[]).includes(k)));
  const variant = (await cookies()).get("duo_hero")?.value;
  const ab = variant === "A" || variant === "B" ? variant : null;
  const mode = a.q6 === "solo" ? "individual" : a.q6 === "together" ? "couple" : null;
  const intent = a.q1 === "separate" ? "separate" : a.q1 === "unsure" ? "unsure" : "rebuild";

  await withActor({ kind: "public" }, async (tx) => {
    const s = await readSettings(tx);
    const lead = { id: randomUUID() }; // bez RETURNING – rola publiczna nie ma prawa odczytu zgłoszeń
    await tx`
      insert into leads (id, name, email, phone, mode, intent, preferred_contact, quiz, quiz_enc, quiz_version, segment, preferred_time, attribution, ab_variant)
      values (${lead.id}, ${d.name}, ${d.email || null}, ${phone}, ${mode}, ${intent}, 'phone', ${tx.json({})}, ${encrypt(a)}, ${QUIZ_VERSION},
              ${a.q1}, ${d.preferredTime || null}, ${tx.json(attribution)}, ${ab})`;
    await tx`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
             values (${lead.id}, 'lead_contact', true, ${s.legal.version}, ${s.legal.leadContactConsent})`;
    await tx`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
             values (${lead.id}, 'lead_marketing', ${d.marketingConsent}, ${s.legal.version}, ${s.legal.leadMarketingConsent})`;
    await tx`insert into lead_activities (lead_id, kind, content) values (${lead.id}, 'system', 'Prośba o telefon w sprawie Mapy Relacji (quiz na stronie).')`;
    if (s.site.funnelTracking && d.anonId && d.anonId.length >= 8) {
      await tx`insert into funnel_events (event, anon_id, variant, utm_source, utm_medium, utm_campaign, path)
               values ('lead_submitted', ${d.anonId}, ${ab}, ${attribution.utm_source ?? null}, ${attribution.utm_medium ?? null}, ${attribution.utm_campaign ?? null}, '/start')`;
    }
    await audit(tx, { kind: "public" }, "lead_created", "lead", lead.id);
  });
  await notifyTeam("DUO – nowa prośba o telefon (Mapa Relacji)", "Nowa osoba prosi o kontakt w sprawie Mapy Relacji. Szczegóły w panelu: Zgłoszenia.");
  return { ok: true };
}
