"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { withActor } from "@/lib/db";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";

const LeadSchema = z
  .object({
    name: z.string().trim().min(2, "Podaj imię.").max(80),
    email: z.string().trim().email("Podaj poprawny adres e-mail.").max(200),
    phone: z.string().trim().max(40).regex(/^[+\d\s()-]*$/, "Podaj numer w formacie +48 600 000 000.").optional().default(""),
    mode: z.enum(["individual", "couple"]),
    intent: z.enum(["rebuild", "unsure", "separate"]),
    preferredContact: z.enum(["phone", "email", "sms"]),
    contactConsent: z.literal(true, { error: "Zgoda na kontakt w sprawie zgłoszenia jest potrzebna, abyśmy mogli odpowiedzieć." }),
    marketingConsent: z.boolean().default(false),
    quiz: z
      .object({
        concerns: z.array(z.enum(["fights", "distance", "trust", "vision", "stress", "children", "unclear"])).max(7).default([]),
        length: z.enum(["lt2", "2to5", "5to10", "gt10", "separated", ""]).default(""),
        children: z.enum(["yes", "no", ""]).default(""),
        when: z.enum(["asap", "month", "talk_first", ""]).default(""),
        discreet: z.boolean().default(false),
      })
      .prefault({}),
    website: z.string().max(0).optional(), // honeypot
  })
  .refine((v) => v.preferredContact === "email" || v.phone.replace(/\D/g, "").length >= 9, {
    message: "Przy kontakcie telefonicznym lub SMS podaj numer telefonu.",
    path: ["phone"],
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
  if (d.website) return { ok: true }; // bot – udajemy sukces, nic nie zapisujemy
  const ip = await clientIp();
  if (!(await hit(`lead:${ip}`, 5, 60 * 60))) return { ok: false, error: "Wysłano już kilka zgłoszeń z tego urządzenia. Spróbuj ponownie później." };

  await withActor({ kind: "public" }, async (tx) => {
    const s = await readSettings(tx);
    // bez RETURNING – rola publiczna nie ma prawa odczytu zgłoszeń
    const lead = { id: randomUUID() };
    await tx`
      insert into leads (id, name, email, phone, mode, intent, preferred_contact, quiz)
      values (${lead.id}, ${d.name}, ${d.email}, ${d.phone || null}, ${d.mode}, ${d.intent}, ${d.preferredContact}, ${tx.json(d.quiz)})`;
    await tx`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
             values (${lead.id}, 'lead_contact', true, ${s.legal.version}, ${s.legal.leadContactConsent})`;
    await tx`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
             values (${lead.id}, 'lead_marketing', ${d.marketingConsent}, ${s.legal.version}, ${s.legal.leadMarketingConsent})`;
    await tx`insert into lead_activities (lead_id, kind, content) values (${lead.id}, 'system', 'Zgłoszenie z formularza na stronie (quiz).')`;
    await audit(tx, { kind: "public" }, "lead_created", "lead", lead.id);
  });
  return { ok: true };
}
