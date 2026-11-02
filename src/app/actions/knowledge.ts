"use server";

// Zapis na bezpłatny materiał „Wiedza”. Pobranie NIE jest uzależnione od zgody marketingowej.
// Zgłoszenie nie trafia do telefonów sprzedażowych (osobna tabela, nie „leads”).
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { encrypt, hashToken, newToken } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { ATTRIBUTION_KEYS } from "@/lib/mapa-quiz";
import { notifyCustomer } from "@/lib/notify";
import { setContentCookie } from "@/lib/content-access";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";
import { deliveryMail } from "@/knowledge/emails";
import { magnetBySlug } from "@/knowledge/registry";

const Schema = z.object({
  slug: z.string().max(80),
  email: z.string().trim().toLowerCase().email("Podaj poprawny adres e-mail.").max(200),
  name: z.string().trim().max(80).default(""),
  marketing: z.boolean().default(false),
  series: z.boolean().default(false),
  requestId: z.string().uuid(),
  attribution: z.record(z.string(), z.string().max(300)).default({}),
  anonId: z.string().max(64).optional(),
  startedAt: z.number().optional(),
  website: z.string().max(0).optional(), // pułapka na boty
});

export type KnowledgeResult = { ok: true; emailSent: boolean } | { ok: false; error: string; field?: string };

export async function submitKnowledgeLead(input: z.input<typeof Schema>): Promise<KnowledgeResult> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i.message, field: String(i.path[0] ?? "") };
  }
  const d = parsed.data;
  const m = magnetBySlug(d.slug);
  if (!m) return { ok: false, error: "Nie znaleziono materiału." };
  // boty: udajemy sukces, nic nie zapisujemy
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 1500)) return { ok: true, emailSent: false };
  if (!(await hit(`kl:${await clientIp()}`, 8, 10 * 60))) return { ok: false, error: "Wysłano już kilka zgłoszeń. Spróbuj ponownie za kilka minut." };

  const anon = d.anonId && /^[a-zA-Z0-9]{8,64}$/.test(d.anonId) ? d.anonId : null;
  const attribution = Object.fromEntries(Object.entries(d.attribution).filter(([k]) => (ATTRIBUTION_KEYS as readonly string[]).includes(k)));
  const unsubscribe = newToken();
  // dostęp do wersji online z autozapisem (ciasteczko w tej przeglądarce + link w e-mailu)
  const access = newToken();

  const r = await system(async (tx) => {
    const s = await readSettings(tx);
    // idempotencja: ponowione żądanie z tym samym identyfikatorem
    const [same] = await tx`select id, delivery_status from content_leads where request_id = ${d.requestId}`;
    if (same) {
      await tx`update content_leads set access_token_hash = ${hashToken(access)} where id = ${same.id}`;
      return { id: same.id as string, status: same.delivery_status as string, send: false, s };
    }
    // ta sama osoba i ten sam materiał w ciągu doby, już dostarczony – bez ponownej wysyłki
    const [recent] = await tx`select id, delivery_status from content_leads
      where lower(email) = ${d.email} and magnet_id = ${m.id} and created_at > now() - interval '24 hours' and delivery_status = 'sent' order by created_at desc limit 1`;
    if (recent) {
      await tx`update content_leads set access_token_hash = ${hashToken(access)} where id = ${recent.id}`;
      return { id: recent.id as string, status: "sent", send: false, s };
    }
    const series = m.slug === "7-dni-lepszych-rozmow" && d.series;
    const [row] = await tx<{ id: string }[]>`
      insert into content_leads (request_id, email, name, magnet_id, attribution, anon_id, marketing_consent, series_consent, unsubscribe_token_hash, unsubscribe_token_enc,
                                 nurture_next_at, series_day, series_next_at)
      values (${d.requestId}, ${d.email}, ${d.name || null}, ${m.id}, ${tx.json(attribution)}, ${anon}, ${d.marketing}, ${series}, ${hashToken(unsubscribe)}, ${encrypt(unsubscribe)},
              ${d.marketing ? new Date(Date.now() + 2 * 86400_000) : null}, ${series ? 1 : 0}, ${series ? new Date(Date.now() + 86400_000) : null})
      returning id`;
    const v = s.legal.version;
    await tx`insert into content_lead_consents (content_lead_id, kind, granted, text_version, text_snapshot) values
      (${row.id}, 'delivery_info', true, ${v}, ${s.legal.contentDeliveryInfo}),
      (${row.id}, 'marketing', ${d.marketing}, ${v}, ${s.legal.contentMarketingConsent})`;
    if (m.slug === "7-dni-lepszych-rozmow")
      await tx`insert into content_lead_consents (content_lead_id, kind, granted, text_version, text_snapshot) values (${row.id}, 'challenge_series', ${series}, ${v}, ${s.legal.contentSeriesConsent})`;
    if (s.site.funnelTracking && anon)
      await tx`insert into funnel_events (event, anon_id, step, utm_source, utm_medium, utm_campaign, path)
               values ('lead_magnet_submitted', ${anon}, ${m.n}, ${attribution.utm_source ?? null}, ${attribution.utm_medium ?? null}, ${attribution.utm_campaign ?? null}, '/wiedza/*')`;
    await tx`update content_leads set access_token_hash = ${hashToken(access)} where id = ${row.id}`;
    return { id: row.id, status: "pending", send: true, s };
  });

  await setContentCookie(access);
  if (!r.send) return { ok: true, emailSent: r.status === "sent" };

  // dostarczenie: tylko gdy skonfigurowano wysyłkę – nie udajemy, że e-mail wyszedł
  const mail = deliveryMail(m, d.name || null, env.appUrl, { email: r.s.site.contactEmail, phone: r.s.site.contactPhone }, access);
  const configured = Boolean(process.env.SMTP_URL);
  const sent = configured ? await notifyCustomer(d.email, mail.subject, mail.text) : false;
  const status = !configured ? "not_configured" : sent ? "sent" : "failed";
  await system(async (tx) => {
    await tx`update content_leads set delivery_status = ${status}, delivered_at = ${sent ? new Date() : null} where id = ${r.id}`;
    await tx`insert into content_lead_messages (content_lead_id, kind, status, error) values (${r.id}, 'delivery', ${status}, ${status === "failed" ? "błąd wysyłki SMTP" : null})`;
    if (configured && r.s.site.funnelTracking && anon)
      await tx`insert into funnel_events (event, anon_id, step, path) values (${sent ? "lead_magnet_delivery_success" : "lead_magnet_delivery_error"}, ${anon}, ${m.n}, '/wiedza/*')`;
  });
  revalidatePath("/app/wiedza");
  return { ok: true, emailSent: sent };
}

/** Wypisanie z wiadomości (link w e-mailu). Wycofanie zgody zapisujemy w historii zgód. */
export async function unsubscribeKnowledge(token: string): Promise<{ ok: boolean }> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return { ok: false };
  return system(async (tx) => {
    const s = await readSettings(tx);
    const r = await tx`update content_leads set unsubscribed_at = coalesce(unsubscribed_at, now()), marketing_consent = false, series_consent = false,
                         nurture_next_at = null, series_next_at = null where unsubscribe_token_hash = ${hashToken(token)} returning id`;
    if (!r.length) return { ok: false };
    await tx`insert into content_lead_consents (content_lead_id, kind, granted, text_version, text_snapshot) values (${r[0].id}, 'withdrawn', false, ${s.legal.version}, 'Wypisanie z wiadomości (link w e-mailu)')`;
    return { ok: true };
  });
}
