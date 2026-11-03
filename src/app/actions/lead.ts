"use server";

// Prośba o telefon w sprawie Mapy Relacji (finał krótkiego quizu).
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { encrypt, hashToken, newToken } from "@/lib/crypto";
import { system, withActor } from "@/lib/db";
import { contentReader, loadAnswers } from "@/lib/content-access";
import { magnetBySlug } from "@/knowledge/registry";
import { ATTRIBUTION_KEYS, isValidAnswers, normalizePhone, QUIZ_VERSION } from "@/lib/mapa-quiz";
import { setLeadCookie } from "@/lib/lead-session";
import { notifyTeam } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";
import { filledCount, sanitizeAnswers } from "@/knowledge/fields";

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
  attachSlug: z.string().max(80).optional(),
  /** Odpowiedzi z podglądu /demo (zapisane w przeglądarce) – wysyłane tylko przy zgodzie na dołączenie. */
  attachData: z.record(z.string(), z.union([z.string().max(4000), z.boolean()])).optional(),
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
  const variant = (await cookies()).get("duo_hero2")?.value;
  const ab = variant === "A" || variant === "B" ? variant : null;
  const mode = a.q6 === "solo" ? "individual" : a.q6 === "together" ? "couple" : null;
  const intent = a.q1 === "separate" ? "separate" : a.q1 === "unsure" ? "unsure" : "rebuild";

  // token powiązania tej przeglądarki ze zgłoszeniem (strona po quizie) – w bazie tylko hash
  const accessToken = newToken();
  const anon = d.anonId && /^[a-zA-Z0-9]{8,64}$/.test(d.anonId) ? d.anonId : null;
  const leadId = randomUUID();
  await withActor({ kind: "public" }, async (tx) => {
    const s = await readSettings(tx);
    const lead = { id: leadId }; // bez RETURNING – rola publiczna nie ma prawa odczytu zgłoszeń
    await tx`
      insert into leads (id, name, email, phone, mode, intent, preferred_contact, quiz, quiz_enc, quiz_version, segment, preferred_time, attribution, ab_variant, access_token_hash, anon_id)
      values (${lead.id}, ${d.name}, ${d.email || null}, ${phone}, ${mode}, ${intent}, 'phone', ${tx.json({})}, ${encrypt(a)}, ${QUIZ_VERSION},
              ${a.q1}, ${d.preferredTime || null}, ${tx.json(attribution)}, ${ab}, ${hashToken(accessToken)}, ${anon})`;
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
  // dołączenie podsumowania z materiału „Wiedza” – tylko za wyraźną zgodą i tylko odpowiedzi tej osoby (ciasteczko)
  if (d.attachSlug) await attachAnswers(leadId, d.attachSlug, d.attachData);
  await setLeadCookie(accessToken);
  await notifyTeam("DUO – nowa prośba o telefon (Mapa Relacji)", "Nowa osoba prosi o kontakt w sprawie Mapy Relacji. Szczegóły w panelu: Zgłoszenia.");
  return { ok: true };
}

async function attachAnswers(leadId: string, slug: string, demoData?: Record<string, string | boolean>) {
  const m = magnetBySlug(slug);
  if (!m || m.special) return;
  await system(async (tx) => {
    // 1) odpowiedzi zapisane przy e-mailu (ciasteczko z materiału), 2) odpowiedzi z podglądu /demo z tej przeglądarki
    const who = await contentReader(tx);
    let answersId = who && who.magnets.includes(m.id) ? (await loadAnswers(tx, who.email, m.id))?.id ?? null : null;
    if (!answersId && demoData && JSON.stringify(demoData).length <= 120_000) {
      const clean = sanitizeAnswers(m, demoData);
      if (filledCount(clean) === 0) return;
      const [r] = await tx`insert into content_answers (email_lc, magnet_id, data_enc, filled, source)
                           values (null, ${m.id}, ${encrypt(clean)}, ${filledCount(clean)}, 'demo') returning id`;
      answersId = r.id as string;
    }
    if (!answersId) return;
    const s = await readSettings(tx);
    await tx`update leads set attached_answers_id = ${answersId}, attached_magnet_id = ${m.id} where id = ${leadId}`;
    await tx`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
             values (${leadId}, 'attach_answers', true, ${s.legal.version}, ${`Dołącz moje podsumowanie z materiału „${m.short}” do zgłoszenia. Psycholog DUO wykorzysta je przy rozmowie o Mapie Relacji™.`})`;
    await tx`insert into lead_activities (lead_id, kind, content) values (${leadId}, 'system', ${`Klient dołączył podsumowanie z materiału „${m.short}”.`})`;
  });
}
