"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { encrypt } from "@/lib/crypto";
import { withActor } from "@/lib/db";
import { notifyTeam } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";

const Schema = z.object({
  name: z.string().trim().min(2, "Podaj imię.").max(80),
  email: z.string().trim().email("Podaj poprawny adres e-mail.").max(200),
  message: z.string().trim().min(5, "Napisz kilka słów.").max(3000, "Wiadomość jest za długa (maks. 3000 znaków)."),
  consent: z.literal(true, { error: "Zgoda jest potrzebna, żebyśmy mogli odpowiedzieć." }),
  website: z.string().max(0).optional(), // honeypot
});

export async function sendInquiry(input: z.input<typeof Schema>): Promise<{ ok: true } | { ok: false; error: string; field?: string }> {
  const r = Schema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0].message, field: String(r.error.issues[0].path[0] ?? "") };
  if (r.data.website) return { ok: true };
  if (!(await hit(`inquiry:${await clientIp()}`, 5, 3600))) return { ok: false, error: "Wysłano już kilka wiadomości z tego urządzenia. Spróbuj ponownie później." };
  const id = randomUUID();
  await withActor({ kind: "public" }, async (tx) => {
    const s = await readSettings(tx);
    await tx`insert into inquiries (id, name, email, message_enc, consent_text, consent_version)
             values (${id}, ${r.data.name}, ${r.data.email}, ${encrypt(r.data.message)}, ${s.legal.inquiryConsent}, ${s.legal.version})`;
    await audit(tx, { kind: "public" }, "inquiry_created", "inquiry", id);
  });
  await notifyTeam("DUO – nowe pytanie ze strony", "Na stronie pojawiło się nowe pytanie. Treść jest dostępna wyłącznie w panelu.");
  return { ok: true };
}
