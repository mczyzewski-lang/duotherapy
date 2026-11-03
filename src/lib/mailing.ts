// Nurturing e-mailowy przez Resend: kontakty z tagami, sekwencje z krokami, warunki tagów, wysyłka i linki śledzące.
// Link w mailu: {APP_URL}/{kod maila}/{kod osoby}, np. /n3/k7m2p9xq – klik zapisuje się przy osobie, potem przekierowanie na stronę.
// Do Resend trafia tylko adres, temat i treść wiadomości – bez tagów i bez informacji o pobranych materiałach.
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { hashToken, safeEqualHex } from "./crypto";
import { system, type Tx } from "./db";
import { env } from "./env";
import { DEFAULT_SEQUENCES, DEFAULT_STEPS } from "./mailing-defaults";

export const STEP_CODE_RE = /^[a-z]{1,2}[0-9]{1,3}$/;
export const CONTACT_CODE_RE = /^[a-z0-9]{8}$/;
export const CONTACT_COOKIE = "duo_mc";
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export type SequenceId = "lead" | "customer";

export interface StepRow {
  id: string;
  sequence_id: SequenceId;
  code: string;
  position: number;
  delay_days: number;
  subject: string;
  preheader: string;
  body: string;
  cta_label: string;
  cta_url: string;
  include_tags: string[];
  exclude_tags: string[];
  active: boolean;
}

export interface ContactLite {
  id?: string;
  code: string;
  email_lc: string;
  name: string | null;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Konfiguracja

export const resendConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

export function newContactCode() {
  return Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

/** Tag: małe litery, cyfry i myślniki (bez #). */
export function normTag(t: string) {
  return t.trim().toLowerCase().replace(/^#+/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
export const parseTags = (s: string) => [...new Set(s.split(/[,\s]+/).map(normTag).filter(Boolean))];

/** Czy krok może trafić do osoby z tymi tagami. include: którykolwiek z tagów (puste = wszyscy); exclude: żaden. */
export function tagsAllow(step: Pick<StepRow, "include_tags" | "exclude_tags">, tags: string[]): { ok: boolean; reason?: string } {
  const has = new Set(tags);
  const blocked = step.exclude_tags.find((t) => has.has(t));
  if (blocked) return { ok: false, reason: `ma tag #${blocked}` };
  if (step.include_tags.length && !step.include_tags.some((t) => has.has(t))) return { ok: false, reason: `brak tagu ${step.include_tags.map((t) => `#${t}`).join(" / ")}` };
  return { ok: true };
}

/** Wstawia domyślne sekwencje i kroki, jeśli ich jeszcze nie ma. */
export async function ensureDefaults(tx: Tx) {
  for (const s of DEFAULT_SEQUENCES)
    await tx`insert into mail_sequences (id, name, trigger, requires_consent) values (${s.id}, ${s.name}, ${s.trigger}, ${s.requires_consent}) on conflict (id) do nothing`;
  const [{ n }] = await tx`select count(*)::int as n from mail_steps`;
  if (n > 0) return;
  for (const seq of ["lead", "customer"] as const)
    for (const [i, st] of DEFAULT_STEPS[seq].entries())
      await tx`insert into mail_steps (sequence_id, code, position, delay_days, subject, preheader, body, cta_label, cta_url, include_tags, exclude_tags)
               values (${seq}, ${st.code}, ${i + 1}, ${st.delay_days}, ${st.subject}, ${st.preheader}, ${st.body}, ${st.cta_label}, ${st.cta_url},
                       ${st.include_tags ?? []}, ${st.exclude_tags ?? []})`;
}

// ---------------------------------------------------------------------------
// Kontakty, tagi, zapis do sekwencji

/** Tworzy kontakt albo dopisuje tagi / zgodę do istniejącego. Zgoda marketingowa nigdy nie jest tu cofana. */
export async function upsertContact(tx: Tx, c: { email: string; name?: string | null; tags?: string[]; marketing?: boolean }): Promise<{ id: string; code: string }> {
  const email = c.email.trim().toLowerCase();
  const tags = [...new Set((c.tags ?? []).map(normTag).filter(Boolean))];
  for (let i = 0; i < 5; i++) {
    const [r] = await tx<{ id: string; code: string }[]>`
      insert into mail_contacts (code, email_lc, name, tags, marketing_consent)
      values (${newContactCode()}, ${email}, ${c.name || null}, ${tags}, ${!!c.marketing})
      on conflict (email_lc) do update set
        tags = (select array(select distinct unnest(mail_contacts.tags || excluded.tags))),
        name = coalesce(mail_contacts.name, excluded.name),
        marketing_consent = mail_contacts.marketing_consent or excluded.marketing_consent,
        updated_at = now()
      returning id, code`.catch((e) => {
      if (String(e.message).includes("mail_contacts_code_key")) return [];
      throw e;
    });
    if (r) return r;
  }
  throw new Error("Nie udało się nadać kodu kontaktu");
}

export async function enroll(tx: Tx, contactId: string, sequence: SequenceId) {
  // ścieżka do Mapy Relacji nie startuje dla osoby, która już kupiła
  await tx`insert into mail_enrollments (contact_id, sequence_id)
           select ${contactId}, ${sequence} where ${sequence} <> 'lead' or not exists (select 1 from mail_contacts where id = ${contactId} and purchased_at is not null)
           on conflict (contact_id, sequence_id) do nothing`;
}

/** Zapis z formularza (materiał / quiz): kontakt + tagi + ścieżka „przed zakupem”. */
export async function captureContact(tx: Tx, c: { email: string; name?: string | null; tags: string[]; marketing: boolean }) {
  await ensureDefaults(tx);
  const r = await upsertContact(tx, c);
  await enroll(tx, r.id, "lead");
  return r;
}

/** Zakup: tag #klient, koniec ścieżki do Mapy Relacji, start ścieżki po zakupie. */
export async function markPurchase(tx: Tx, p: { contactId?: string | null; email?: string | null }): Promise<string | null> {
  await ensureDefaults(tx);
  let id = p.contactId ?? null;
  if (!id && p.email) id = (await upsertContact(tx, { email: p.email, tags: ["klient"] })).id;
  if (!id) return null;
  await tx`update mail_contacts set purchased_at = coalesce(purchased_at, now()),
             tags = (select array(select distinct unnest(tags || array['klient']))), updated_at = now() where id = ${id}`;
  await tx`update mail_enrollments set status = 'stopped', stopped_reason = 'zakup' where contact_id = ${id} and sequence_id = 'lead' and status = 'active'`;
  await enroll(tx, id, "customer");
  return id;
}

/** Kontakt powiązany z tą przeglądarką (kliknięcie w link z maila). */
export async function contactFromCookie(tx: Tx): Promise<string | null> {
  const code = (await cookies()).get(CONTACT_COOKIE)?.value ?? "";
  if (!CONTACT_CODE_RE.test(code)) return null;
  const [r] = await tx`select id from mail_contacts where code = ${code}`;
  return (r?.id as string) ?? null;
}

// ---------------------------------------------------------------------------
// Treść wiadomości

export const unsubscribeSig = (code: string) => hashToken(`mail-unsub:${code}`).slice(0, 32);
export const verifyUnsubscribe = (k: string) => {
  const [code, sig] = k.split(".");
  return CONTACT_CODE_RE.test(code ?? "") && /^[0-9a-f]{32}$/.test(sig ?? "") && safeEqualHex(sig, unsubscribeSig(code)) ? code : null;
};
export const trackingUrl = (stepCode: string, contactCode: string) => `${env.appUrl}/${stepCode}/${contactCode}`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const firstName = (n: string | null) => (n ?? "").trim().split(/\s+/)[0] ?? "";

export function renderMail(step: Pick<StepRow, "code" | "sequence_id" | "subject" | "preheader" | "body" | "cta_label">, contact: Pick<ContactLite, "code" | "name">) {
  const name = firstName(contact.name);
  const body = step.body.replaceAll("{imie}", name);
  const greeting = name ? `Cześć ${name},` : "Cześć,";
  const link = trackingUrl(step.code, contact.code);
  const unsub = `${env.appUrl}/wiedza/wypisz?k=${contact.code}.${unsubscribeSig(contact.code)}`;
  const why = step.sequence_id === "customer"
    ? "Otrzymujesz tę wiadomość, bo zamówiłeś / zamówiłaś Mapę Relacji DUO."
    : "Otrzymujesz tę wiadomość, bo pobrałeś / pobrałaś materiał DUO i zgodziłeś / zgodziłaś się na wiadomości.";
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const text = [greeting, "", ...paras.flatMap((p) => [p, ""]), step.cta_label ? `${step.cta_label}: ${link}` : link, "", "Zespół DUO", "", "–", why, `Wypisz się: ${unsub}`].join("\n");
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(step.subject)}</title></head>
<body style="margin:0;background:#f4eee6;font-family:Helvetica,Arial,sans-serif;color:#2a2522">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(step.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4eee6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf9f5;border-radius:20px;border:1px solid #eadccb">
<tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;font-size:22px;color:#36493d;letter-spacing:.5px">DUO</td></tr>
<tr><td style="padding:8px 28px 0;font-size:16px;line-height:1.6">
<p style="margin:0 0 16px">${esc(greeting)}</p>
${paras.map((p) => `<p style="margin:0 0 16px">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
</td></tr>
${step.cta_label ? `<tr><td style="padding:8px 28px 24px"><a href="${esc(link)}" style="display:inline-block;background:#a9512f;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:999px">${esc(step.cta_label)} →</a></td></tr>` : ""}
<tr><td style="padding:0 28px 28px;font-size:16px;line-height:1.6">Zespół DUO</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6a605a">${esc(why)}<br><a href="${esc(unsub)}" style="color:#6a605a">Wypisz się z wiadomości</a></p>
</td></tr></table></body></html>`;
  return { subject: step.subject, html, text, unsub };
}

// ---------------------------------------------------------------------------
// Wysyłka

export async function sendViaResend(to: string, mail: { subject: string; html: string; text: string; unsub: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resendConfigured()) return { ok: false, error: "Resend nieskonfigurowany (RESEND_API_KEY, MAIL_FROM)" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [to],
        reply_to: process.env.MAIL_REPLY_TO || undefined,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        headers: { "List-Unsubscribe": `<${mail.unsub}>` },
      }),
    });
    const j = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    return res.ok ? { ok: true, id: j.id } : { ok: false, error: (j.message ?? `HTTP ${res.status}`).slice(0, 300) };
  } catch (e) {
    return { ok: false, error: (e as Error).message.slice(0, 300) };
  }
}

export interface RunResult { sent: number; skipped: number; failed: number; reason?: string }

/** Przetwarza aktywne zapisy: max. 1 wiadomość na osobę na wywołanie, limit wiadomości na wywołanie. */
export async function runMailing(limit = 100, send = sendViaResend): Promise<RunResult> {
  const out: RunResult = { sent: 0, skipped: 0, failed: 0 };
  if (send === sendViaResend && !resendConfigured()) return { ...out, reason: "Resend nieskonfigurowany – nic nie wysłano" };
  const { rows, steps, done } = await system(async (tx) => {
    await ensureDefaults(tx);
    const rows = await tx<{ eid: string; contact_id: string; sequence_id: SequenceId; enrolled_at: Date; code: string; email_lc: string; name: string | null; tags: string[] }[]>`
      select e.id as eid, e.contact_id, e.sequence_id, e.enrolled_at, c.code, c.email_lc, c.name, c.tags
      from mail_enrollments e join mail_contacts c on c.id = e.contact_id join mail_sequences s on s.id = e.sequence_id
      where e.status = 'active' and s.active and c.unsubscribed_at is null and (not s.requires_consent or c.marketing_consent)
      order by e.enrolled_at limit 1000`;
    const steps = await tx<StepRow[]>`select * from mail_steps where active order by sequence_id, position, delay_days`;
    const done = rows.length
      ? await tx<{ contact_id: string; step_id: string }[]>`select contact_id, step_id from mail_sends where contact_id = any(${rows.map((r) => r.contact_id)}::uuid[])`
      : [];
    return { rows, steps, done };
  });
  const handled = new Set(done.map((d) => `${d.contact_id}:${d.step_id}`));
  const now = Date.now();

  for (const r of rows) {
    if (out.sent + out.failed >= limit) break;
    const seqSteps = steps.filter((s) => s.sequence_id === r.sequence_id);
    let allHandled = true;
    for (const st of seqSteps) {
      if (handled.has(`${r.contact_id}:${st.id}`)) continue;
      if (new Date(r.enrolled_at).getTime() + st.delay_days * 86400_000 > now) { allHandled = false; break; }
      const allow = tagsAllow(st, r.tags);
      if (!allow.ok) {
        await system((tx) => tx`insert into mail_sends (contact_id, step_id, status, reason) values (${r.contact_id}, ${st.id}, 'skipped', ${allow.reason ?? null}) on conflict do nothing`);
        out.skipped++;
        continue;
      }
      // rezerwacja kroku (chroni przed podwójną wysyłką przy równoległych wywołaniach)
      const claimed = await system((tx) => tx`insert into mail_sends (contact_id, step_id, status, reason) values (${r.contact_id}, ${st.id}, 'failed', 'w trakcie wysyłki') on conflict do nothing returning id`);
      if (!claimed.length) { allHandled = false; break; }
      const res = await send(r.email_lc, renderMail(st, r));
      if (!res.ok) {
        // błąd operatora (np. zły klucz) – zwalniamy krok, żeby wysłać go przy kolejnym wywołaniu, i przerywamy
        await system((tx) => tx`delete from mail_sends where id = ${claimed[0].id}`);
        out.failed++;
        return { ...out, reason: `Błąd wysyłki: ${res.error ?? "nieznany"} – wysyłka przerwana, kolejna próba przy następnym uruchomieniu` };
      }
      await system((tx) => tx`update mail_sends set status = 'sent', reason = null, provider_id = ${res.id ?? null}, created_at = now() where id = ${claimed[0].id}`);
      out.sent++;
      allHandled = false; // jedna wiadomość na osobę na wywołanie; resztę oceni kolejne wywołanie
      break;
    }
    if (allHandled) await system((tx) => tx`update mail_enrollments set status = 'done' where id = ${r.eid} and status = 'active'`);
  }
  return out;
}
