// Powiadomienia e-mail dla zespołu (opcjonalne). Działa tylko, gdy skonfigurowano SMTP_URL i NOTIFY_EMAIL.
// Wiadomość NIE zawiera treści przesłanej przez osobę – tylko informację, że w panelu czeka nowe pytanie.
import nodemailer from "nodemailer";
import { env } from "./env";

export function notificationsEnabled() {
  return Boolean(process.env.SMTP_URL && process.env.NOTIFY_EMAIL);
}

export async function notifyTeam(subject: string, text: string): Promise<boolean> {
  if (!notificationsEnabled()) return false;
  try {
    const t = nodemailer.createTransport(process.env.SMTP_URL!);
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.NOTIFY_EMAIL, to: process.env.NOTIFY_EMAIL, subject, text: `${text}\n\n${env.appUrl}/app/inquiries` });
    return true;
  } catch (e) {
    console.error("Powiadomienie e-mail nie zostało wysłane:", (e as Error).message);
    return false;
  }
}

/** Czy można wysyłać wiadomości do klientów (Resend albo SMTP). */
export const customerMailConfigured = () => Boolean((process.env.RESEND_API_KEY && process.env.MAIL_FROM) || process.env.SMTP_URL);

/** Wiadomość do klienta (np. potwierdzenie zakupu). Bez treści wrażliwych – tylko informacja i link. Resend, a bez niego SMTP. */
export async function notifyCustomer(to: string, subject: string, text: string): Promise<boolean> {
  if (!to) return false;
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], reply_to: process.env.MAIL_REPLY_TO || undefined, subject, text }),
      });
      if (!res.ok) console.error("Resend odrzucił wiadomość:", res.status);
      return res.ok;
    } catch (e) {
      console.error("Wiadomość do klienta nie została wysłana:", (e as Error).message);
      return false;
    }
  }
  if (!process.env.SMTP_URL) return false;
  try {
    const t = nodemailer.createTransport(process.env.SMTP_URL);
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.NOTIFY_EMAIL, to, subject, text });
    return true;
  } catch (e) {
    console.error("Wiadomość do klienta nie została wysłana:", (e as Error).message);
    return false;
  }
}
