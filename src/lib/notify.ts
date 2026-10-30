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
