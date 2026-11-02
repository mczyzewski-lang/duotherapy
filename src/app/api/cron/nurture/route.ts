// Wysyłka sekwencji „Wiedza” (3 wiadomości po zgodzie marketingowej + codzienne ćwiczenia wyzwania 7 dni).
// NIE uruchamia się sama: wymaga NURTURE_ENABLED=true, skonfigurowanego SMTP i wywołania z nagłówkiem
// Authorization: Bearer <CRON_SECRET> (np. z harmonogramu Railway raz na godzinę). Limit 50 wiadomości na wywołanie.
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyCustomer } from "@/lib/notify";
import { readSettings } from "@/lib/settings";
import { nurtureMail, seriesDayMail } from "@/knowledge/emails";
import { magnetById, magnetBySlug } from "@/knowledge/registry";

const authorized = (req: Request) => {
  const secret = process.env.CRON_SECRET ?? "";
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  return secret.length >= 24 && got.length === secret.length && timingSafeEqual(Buffer.from(got), Buffer.from(secret));
};

export async function POST(req: Request) {
  if (!authorized(req)) return new NextResponse(null, { status: 401 });
  if (process.env.NURTURE_ENABLED !== "true" || !process.env.SMTP_URL) return NextResponse.json({ sent: 0, reason: "wysyłka wyłączona (NURTURE_ENABLED / SMTP_URL)" });
  const s = await system((tx) => readSettings(tx));
  const contact = { email: s.site.contactEmail, phone: s.site.contactPhone };
  const challenge = magnetBySlug("7-dni-lepszych-rozmow")!;
  let sent = 0;

  const due = await system((tx) => tx`
    select id, email, magnet_id, nurture_step, nurture_next_at, series_day, series_next_at, unsubscribe_token_enc
    from content_leads
    where unsubscribed_at is null and (
      (marketing_consent and nurture_step < 3 and nurture_next_at <= now()) or
      (series_consent and series_day between 1 and 6 and series_next_at <= now()))
    order by created_at limit 50`);

  for (const r of due) {
    const m = magnetById(r.magnet_id);
    const token = decrypt<string>(r.unsubscribe_token_enc);
    if (!m || !token) continue;
    const unsub = `${env.appUrl}/wiedza/wypisz?t=${token}`;
    const jobs: { kind: string; subject: string; text: string; apply: string }[] = [];
    if (r.series_next_at && new Date(r.series_next_at) <= new Date() && r.series_day >= 1 && r.series_day <= 6) {
      const day = challenge.blocks.find((b) => b.t === "day" && b.n === r.series_day + 1);
      if (day && day.t === "day") jobs.push({ kind: `series_day_${day.n}`, ...seriesDayMail(day, env.appUrl, challenge.slug, contact, unsub), apply: "series" });
    }
    if (r.nurture_next_at && new Date(r.nurture_next_at) <= new Date() && r.nurture_step < 3) {
      const step = (r.nurture_step + 1) as 1 | 2 | 3;
      jobs.push({ kind: `nurture_${step}`, ...nurtureMail(m, step, env.appUrl, contact, unsub), apply: "nurture" });
    }
    for (const j of jobs) {
      const ok = await notifyCustomer(r.email, j.subject, j.text);
      await system(async (tx) => {
        await tx`insert into content_lead_messages (content_lead_id, kind, status, error) values (${r.id}, ${j.kind}, ${ok ? "sent" : "failed"}, ${ok ? null : "błąd SMTP"})`;
        if (!ok) return;
        if (j.apply === "series")
          await tx`update content_leads set series_day = series_day + 1, series_next_at = case when series_day + 1 >= 7 then null else now() + interval '1 day' end where id = ${r.id}`;
        else
          await tx`update content_leads set nurture_step = nurture_step + 1, nurture_next_at = case when nurture_step + 1 >= 3 then null else now() + interval '3 days' end where id = ${r.id}`;
      });
      if (ok) sent++;
    }
  }
  return NextResponse.json({ sent });
}
