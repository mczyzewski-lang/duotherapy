"use server";

// Automatyzacje w panelu Mailing (tylko administrator): treści i przełączniki e-mail / SMS po potwierdzeniu numeru.
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { readAutomations, type Automations } from "@/lib/automations";

type R = { error?: string; ok?: string } | undefined;
const EM = String.fromCharCode(0x2014);

export async function saveSmsVerifiedAutomationAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const get = (k: string) => String(fd.get(k) ?? "").split(EM).join("–").trim();
  const subject = get("subject");
  const body = get("body");
  const sms = get("sms");
  const emailOn = fd.get("email_enabled") === "1";
  const smsOn = fd.get("sms_enabled") === "1";
  if (emailOn && (!subject || !body)) return { error: "Uzupełnij temat i treść e-maila albo wyłącz e-mail." };
  if (emailOn && !body.includes("{link}")) return { error: "Treść e-maila musi zawierać {link} – bez niego osoba nie zaloguje się kodem SMS." };
  if (smsOn && (!sms || !sms.includes("{link}"))) return { error: "Treść SMS-a musi zawierać {link}." };
  if (sms.length > 300) return { error: "SMS jest za długi (maks. 300 znaków przed wstawieniem linku)." };
  if (subject.length > 150 || body.length > 5000) return { error: "Temat lub treść e-maila są za długie." };
  await asStaff(s, async (tx) => {
    const cur = await readAutomations(tx);
    const next: Automations = { ...cur, smsVerified: { email: { enabled: emailOn, subject, body }, sms: { enabled: smsOn, text: sms } } };
    await tx`insert into app_settings (key, value, updated_by, updated_at) values ('automations', ${tx.json(next as never)}, ${s.user.id}, now())
             on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
    await audit(tx, s.actor, "automation_saved", "automation", null, null, { trigger: "sms_verified", email: emailOn, sms: smsOn });
  });
  revalidatePath("/app/mailing");
  return { ok: "Zapisano automatyzację." };
}
