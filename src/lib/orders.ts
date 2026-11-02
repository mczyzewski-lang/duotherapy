// Zamówienia Mapy Relacji online: stan płatności, skutki w CRM, rezerwacja terminu, reguły kontaktu telefonicznego.
// Wszystkie funkcje zapisujące działają jako rola system – wywołujący MUSI wcześniej zweryfikować token
// (ciasteczko / link zamówienia) albo podpis operatora płatności.
import { audit } from "./audit";
import { createCase, recomputeStatus } from "./cases";
import { decrypt, encrypt, hashToken } from "./crypto";
import type { Tx } from "./db";
import { createInvitation } from "./participant-auth";
import { nextOrderStatus, type Outcome } from "./payments";
import type { Settings } from "./settings";

export const TZ = "Europe/Warsaw";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  created: "Zamówienie rozpoczęte",
  open: "Płatność rozpoczęta",
  pending: "Płatność oczekuje na potwierdzenie operatora",
  paid: "Opłacono online",
  failed: "Płatność odrzucona",
  expired: "Płatność niedokończona (wygasła)",
};

export interface OrderRow {
  id: string;
  lead_id: string;
  status: string;
  amount_pln: number;
  created_at: Date;
  updated_at: Date;
  paid_at: Date | null;
  returned_cancel_at: Date | null;
  checkout_url: string | null;
  checkout_expires_at: Date | null;
  provider_session_id: string | null;
  case_id: string | null;
  access_enc: string | null;
  failed_reason: string | null;
  customer_email: string | null;
}

export const orderLabel = (o: Pick<OrderRow, "status" | "returned_cancel_at">) =>
  o.returned_cancel_at && (o.status === "open" || o.status === "created") ? "Płatność przerwana (powrót z bramki)" : ORDER_STATUS_LABEL[o.status] ?? o.status;

// ---------------------------------------------------------------------------
// Czas lokalny (Europe/Warsaw) bez zewnętrznych bibliotek

function parts(date: Date, tz = TZ) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p.weekday) + 1;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute, s: +p.second, dow };
}

function offsetMs(date: Date, tz = TZ) {
  const p = parts(date, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(date.getTime() / 1000) * 1000;
}

/** „2026-11-20” + „10:30” w czasie warszawskim → chwila UTC. */
export function zonedToUtc(date: string, time: string, tz = TZ): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const local = Date.UTC(y, m - 1, d, h, mi);
  let guess = local;
  for (let i = 0; i < 3; i++) guess = local - offsetMs(new Date(guess), tz);
  return new Date(guess);
}

export const fmtWarsaw = (d: Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "short" }) =>
  new Intl.DateTimeFormat("pl-PL", { timeZone: TZ, ...opts }).format(d);

const range = (s: string, min: number, max: number): [number, number] => {
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(s);
  const a = m ? Math.max(min, Math.min(max, +m[1])) : min;
  const b = m ? Math.max(min, Math.min(max, +m[2])) : max;
  return [a, b];
};

/** Najbliższa chwila >= from mieszcząca się w godzinach i dniach pracy konsultantów. */
export function nextCallWindow(from: Date, o: Pick<Settings["offer"], "callHours" | "callDays">): Date {
  const [h0, h1] = range(o.callHours, 0, 24);
  const [d0, d1] = range(o.callDays, 1, 7);
  let t = new Date(from);
  for (let i = 0; i < 24 * 15; i++) {
    const p = parts(t);
    const dayOk = p.dow >= d0 && p.dow <= d1;
    if (dayOk && p.h >= h0 && p.h < h1) return t;
    // przejdź do pełnej godziny (start okna dziennego, jeśli przed nim)
    const step = dayOk && p.h < h0 ? (h0 - p.h) * 60 - p.min : 60 - p.min;
    t = new Date(t.getTime() + step * 60_000 - p.s * 1000);
  }
  return from;
}

export interface CallStatus {
  kind: "paid" | "paying" | "pending" | "wait" | "call" | "none";
  label: string;
  at?: Date;
}

/**
 * Kiedy konsultant może zadzwonić do osoby, która poprosiła o kontakt.
 * Nie dzwonimy zaraz po wejściu na stronę oferty, nie dzwonimy do kogoś, kto właśnie płaci,
 * a osoby, które kupiły online, nie trafiają do telefonów sprzedażowych.
 */
export function callStatus(
  lead: { created_at: Date; stage: string },
  orders: (Pick<OrderRow, "status" | "updated_at" | "created_at"> & { returned_cancel_at?: Date | string | null })[],
  o: Pick<Settings["offer"], "callHours" | "callDays" | "callDelayMinutes" | "checkoutGraceMinutes">,
  now = new Date(),
): CallStatus {
  if (orders.some((x) => x.status === "paid")) return { kind: "paid", label: "Opłacono online – bez telefonu sprzedażowego" };
  if (!["new", "contacted", "call_scheduled"].includes(lead.stage)) return { kind: "none", label: "" };
  // zamówienia bez utworzonej płatności (status „created”) nie wpływają na kontakt
  const last = [...orders].filter((x) => x.status !== "created").sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];
  const graceEnd = last ? new Date(+new Date(last.updated_at) + o.checkoutGraceMinutes * 60_000) : null;
  if (last && last.status === "open" && !last.returned_cancel_at && graceEnd && graceEnd > now)
    return { kind: "paying", label: "Trwa płatność online – poczekaj", at: graceEnd };
  if (last?.status === "pending") return { kind: "pending", label: "Płatność czeka na potwierdzenie operatora – sprawdź przed telefonem" };
  let earliest = new Date(+new Date(lead.created_at) + o.callDelayMinutes * 60_000);
  if (graceEnd && graceEnd > earliest) earliest = graceEnd;
  const at = nextCallWindow(earliest > now ? earliest : now, o);
  const prefix = last?.returned_cancel_at ? "Płatność przerwana – " : last?.status === "failed" ? "Płatność odrzucona – " : "";
  if (+at <= +now + 60_000) return { kind: "call", label: `${prefix}${prefix ? "można" : "Można"} dzwonić`, at };
  return { kind: "wait", label: `${prefix}${prefix ? "dzwoń" : "Dzwoń"} od ${fmtWarsaw(at, { weekday: "short", hour: "2-digit", minute: "2-digit" })}`, at };
}

// ---------------------------------------------------------------------------
// Skutki zmiany stanu płatności

async function funnel(tx: Tx, event: string, leadId: string) {
  const [l] = await tx`select anon_id, ab_variant, attribution from leads where id = ${leadId}`;
  if (!l?.anon_id) return;
  const [st] = await tx`select value->>'funnelTracking' as ft from app_settings where key = 'site'`;
  if (st && st.ft === "false") return;
  const a = (l.attribution ?? {}) as Record<string, string>;
  await tx`insert into funnel_events (event, anon_id, variant, utm_source, utm_medium, utm_campaign, path)
           values (${event}, ${l.anon_id}, ${l.ab_variant}, ${a.utm_source ?? null}, ${a.utm_medium ?? null}, ${a.utm_campaign ?? null}, '/twoja-mapa')`;
}

/** Zapisuje wynik płatności (z webhooka lub zapytania do operatora). Idempotentne. Zwraca nowy status lub null. */
export async function applyPaymentOutcome(
  tx: Tx,
  orderId: string,
  outcome: Outcome,
  info: { paymentId?: string | null; email?: string | null; reason?: string | null } = {},
): Promise<string | null> {
  const [o] = await tx<OrderRow[]>`select * from orders where id = ${orderId} for update`;
  if (!o) return null;
  const next = nextOrderStatus(o.status, outcome);
  if (!next) return null;
  await tx`update orders set status = ${next}, updated_at = now(),
             provider_payment_id = coalesce(${info.paymentId ?? null}, provider_payment_id),
             customer_email = coalesce(${info.email ?? null}, customer_email),
             paid_at = case when ${next} = 'paid' then now() else paid_at end,
             failed_reason = case when ${next} = 'failed' then ${info.reason ?? "odrzucona przez operatora"} else failed_reason end
           where id = ${orderId}`;
  const note = (content: string) => tx`insert into lead_activities (lead_id, kind, content) values (${o.lead_id}, 'system', ${content})`;
  if (next === "paid") {
    await tx`update leads set stage = case when stage = 'converted' then stage else 'paid' end,
               sale_amount_pln = coalesce(sale_amount_pln, ${o.amount_pln}), updated_at = now() where id = ${o.lead_id}`;
    await note(`Mapa Relacji opłacona online: ${o.amount_pln} zł (potwierdzenie operatora płatności). Klient wybiera termin na stronie zamówienia – bez telefonu sprzedażowego.`);
    await funnel(tx, "purchase_completed", o.lead_id);
  } else if (next === "failed") {
    await note("Płatność online odrzucona. Klient pozostaje w kontakcie telefonicznym – może potrzebować pomocy przy płatności.");
    await funnel(tx, "purchase_failed", o.lead_id);
  } else if (next === "expired") {
    await note("Płatność online nie została dokończona (sesja wygasła). Klient pozostaje w kontakcie telefonicznym.");
  } else if (next === "pending") {
    await note("Płatność online rozpoczęta – czeka na potwierdzenie operatora (metoda odroczona).");
  }
  await audit(tx, { kind: "system" }, `order_${next}`, "order", orderId);
  return next;
}

// ---------------------------------------------------------------------------
// Strona zamówienia i rezerwacja

export async function orderByToken(tx: Tx, token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const [o] = await tx<(OrderRow & { lead_name: string; lead_phone: string | null; lead_email: string | null })[]>`
    select o.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email
    from orders o join leads l on l.id = o.lead_id where o.access_token_hash = ${hashToken(token)}`;
  return o ?? null;
}

export async function freeSlots(tx: Tx, minHours: number, minutes = 60) {
  return tx<{ id: string; starts_at: Date; minutes: number; therapist: string }[]>`
    select s.id, s.starts_at, s.minutes, t.display_name as therapist
    from booking_slots s join therapists t on t.id = s.therapist_id
    where s.status = 'free' and s.minutes = ${minutes} and s.starts_at > now() + make_interval(hours => ${minHours}::int)
    order by s.starts_at limit 80`;
}

export interface QuestionnaireAccess {
  url: string;
  code: string;
  sessionAt: string;
  therapist: string;
}

export const readAccess = (o: Pick<OrderRow, "access_enc">) => decrypt<QuestionnaireAccess>(o.access_enc);

/**
 * Rezerwacja terminu po opłaceniu: zajmuje termin (atomowo), zakłada sprawę i uczestnika,
 * tworzy link i kod do kwestionariusza zgodnie z dotychczasowym przebiegiem.
 */
export async function bookSlot(tx: Tx, orderId: string, slotId: string, gender: "male" | "female", s: Settings): Promise<{ ok: true } | { ok: false; error: string }> {
  const [o] = await tx<(OrderRow & { lead_name: string; lead_phone: string | null; lead_email: string | null; intent: string | null })[]>`
    select o.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email, l.intent from orders o join leads l on l.id = o.lead_id where o.id = ${orderId} for update of o`;
  if (!o || o.status !== "paid") return { ok: false, error: "Zamówienie nie jest jeszcze opłacone." };
  if (o.case_id) return { ok: true };
  const [slot] = await tx<{ id: string; therapist_id: string; starts_at: Date; minutes: number }[]>`
    update booking_slots set status = 'booked', order_id = ${orderId}
    where id = ${slotId} and status = 'free' and minutes = 60 and starts_at > now() + make_interval(hours => ${s.offer.minBookingHours}::int)
    returning id, therapist_id, starts_at, minutes`;
  if (!slot) return { ok: false, error: "Ten termin został właśnie zajęty albo jest już niedostępny. Wybierz inny." };
  const caseId = await createCase(tx, { kind: "system" }, {
    kind: "individual",
    therapistId: slot.therapist_id,
    participants: [{ name: o.lead_name, gender, phone: o.lead_phone ?? undefined, email: o.lead_email ?? o.customer_email ?? undefined }],
    intent: o.intent,
    leadId: o.lead_id,
    isDemo: process.env.DEMO_MODE === "true",
  });
  await tx`update cases set session_at = ${slot.starts_at}, payment_status = 'paid',
             payment_note = ${`Opłacono online ${o.amount_pln} zł (zamówienie ${orderId.slice(0, 8)})`}, updated_at = now() where id = ${caseId}`;
  const [p] = await tx<{ id: string }[]>`select id from participants where case_id = ${caseId} and position = 1`;
  const inv = await createInvitation(tx, p.id, null, Math.max(s.flow.invitationDays, 14));
  await recomputeStatus(tx, caseId);
  const [th] = await tx`select display_name from therapists where id = ${slot.therapist_id}`;
  const access: QuestionnaireAccess = { url: inv.url, code: inv.code, sessionAt: slot.starts_at.toISOString(), therapist: th?.display_name ?? "" };
  await tx`update orders set case_id = ${caseId}, access_enc = ${encrypt(access)}, updated_at = now() where id = ${orderId}`;
  await tx`insert into lead_activities (lead_id, kind, content)
           values (${o.lead_id}, 'system', ${`Klient zarezerwował konsultację online: ${fmtWarsaw(slot.starts_at)}. Założono sprawę i udostępniono kwestionariusz.`})`;
  await audit(tx, { kind: "system" }, "order_booked", "order", orderId, caseId);
  return { ok: true };
}
