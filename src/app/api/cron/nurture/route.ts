// Harmonogram wiadomości (wywołanie z nagłówkiem Authorization: Bearer <CRON_SECRET>, np. z Railway co godzinę):
// 1) nurturing z panelu /app/mailing (Resend; wysyła tylko sekwencje włączone w panelu),
// 2) codzienne ćwiczenia wyzwania 7 dni (wymaga NURTURE_ENABLED=true i skonfigurowanej wysyłki). Limit 50 na wywołanie.
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { runMailing } from "@/lib/mailing";
import { customerMailConfigured, notifyCustomer } from "@/lib/notify";
import { readSettings } from "@/lib/settings";
import { seriesDayMail } from "@/knowledge/emails";
import { magnetById, magnetBySlug } from "@/knowledge/registry";

const authorized = (req: Request) => {
  const secret = process.env.CRON_SECRET ?? "";
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  return secret.length >= 24 && got.length === secret.length && timingSafeEqual(Buffer.from(got), Buffer.from(secret));
};

export async function POST(req: Request) {
  if (!authorized(req)) return new NextResponse(null, { status: 401 });
  const mailing = await runMailing(100);
  if (process.env.NURTURE_ENABLED !== "true" || !customerMailConfigured()) return NextResponse.json({ mailing, series: { sent: 0, reason: "seria wyłączona (NURTURE_ENABLED / wysyłka)" } });
  const s = await system((tx) => readSettings(tx));
  const contact = { email: s.site.contactEmail, phone: s.site.contactPhone };
  const challenge = magnetBySlug("7-dni-lepszych-rozmow")!;
  let sent = 0;

  const due = await system((tx) => tx`
    select id, email, magnet_id, nurture_step, nurture_next_at, series_day, series_next_at, unsubscribe_token_enc
    from content_leads
    where unsubscribed_at is null and (
      series_consent and series_day between 1 and 6 and series_next_at <= now())
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
    for (const j of jobs) {
      const ok = await notifyCustomer(r.email, j.subject, j.text);
      await system(async (tx) => {
        await tx`insert into content_lead_messages (content_lead_id, kind, status, error) values (${r.id}, ${j.kind}, ${ok ? "sent" : "failed"}, ${ok ? null : "błąd wysyłki"})`;
        if (!ok) return;
        await tx`update content_leads set series_day = series_day + 1, series_next_at = case when series_day + 1 >= 7 then null else now() + interval '1 day' end where id = ${r.id}`;
      });
      if (ok) sent++;
    }
  }
  return NextResponse.json({ mailing, series: { sent } });
}
