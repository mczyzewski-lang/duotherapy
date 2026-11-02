"use server";

// Zakup Mapy Relacji online i rezerwacja terminu. Dane kontaktowe są już zapisane (quiz) –
// nie prosimy o nie ponownie. Status „opłacone” ustawia wyłącznie potwierdzenie operatora płatności.
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { decrypt, encrypt, hashToken, newToken } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { leadFromCookie, readCookie, ORDER_COOKIE, setOrderCookie } from "@/lib/lead-session";
import { bookSlot, orderByToken } from "@/lib/orders";
import { createCheckoutSession, salesAvailable } from "@/lib/payments";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

export async function startCheckout(input: { termsAccepted: boolean; startConsent: boolean }): Promise<CheckoutResult> {
  if (input.termsAccepted !== true) return { ok: false, error: "Zaakceptuj regulamin, aby przejść do płatności." };
  if (input.startConsent !== true) return { ok: false, error: "Potwierdź zgodę na rozpoczęcie usługi, aby przejść do płatności." };
  if (!(await hit(`checkout:${await clientIp()}`, 20, 60 * 60))) return { ok: false, error: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie." };

  const pre = await system(async (tx) => {
    const s = await readSettings(tx);
    const lead = await leadFromCookie(tx);
    if (!lead) return { error: "Nie znaleźliśmy Twojego zgłoszenia na tym urządzeniu. Wróć do quizu albo poczekaj na telefon konsultanta." } as const;
    if (!salesAvailable(s)) return { error: "Zakup online jest chwilowo niedostępny. Konsultant DUO zadzwoni zgodnie z Twoją prośbą i pomoże w zamówieniu." } as const;
    const orders = await tx`select * from orders where lead_id = ${lead.id} order by created_at desc`;
    const paid = orders.find((o) => o.status === "paid");
    if (paid) {
      const t = decrypt<string>(paid.token_enc);
      return t ? ({ redirect: `/zamowienie/${t}` } as const) : ({ error: "To zamówienie jest już opłacone." } as const);
    }
    // ponowne kliknięcie: ta sama, wciąż ważna sesja płatności (bez dublowania zamówień)
    const open = orders.find((o) => o.status === "open" && o.checkout_url && o.checkout_expires_at && +new Date(o.checkout_expires_at) > Date.now() + 5 * 60_000);
    if (open) {
      await tx`update orders set returned_cancel_at = null, updated_at = now() where id = ${open.id}`;
      return { redirect: open.checkout_url as string, token: decrypt<string>(open.token_enc) } as const;
    }
    const token = newToken();
    const id = randomUUID();
    const now = new Date();
    await tx`insert into orders (id, lead_id, amount_pln, status, access_token_hash, token_enc, terms_version, terms_accepted_at, start_consent_at)
             values (${id}, ${lead.id}, ${s.offer.pricePln}, 'created', ${hashToken(token)}, ${encrypt(token)}, ${s.offer.termsVersion}, ${now}, ${now})`;
    return { create: { id, token, lead, offer: s.offer } } as const;
  });

  if ("error" in pre) return { ok: false, error: pre.error as string };
  if ("redirect" in pre) {
    if ("token" in pre && pre.token) await setOrderCookie(pre.token);
    return { ok: true, url: pre.redirect as string };
  }

  const { id, token, lead, offer } = pre.create;
  const expiresAt = new Date(Date.now() + 60 * 60_000);
  try {
    const session = await createCheckoutSession({
      orderId: id,
      amountPln: offer.pricePln,
      productName: offer.productName,
      description: "Kwestionariusz, konsultacja online z psychologiem (60 min) i pisemna Mapa Relacji.",
      email: lead.email,
      successUrl: `${env.appUrl}/zamowienie/${token}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${env.appUrl}/api/payments/return?o=${id}`,
      expiresAt,
    });
    if (!session.url) throw new Error("Operator nie zwrócił adresu płatności");
    await system(async (tx) => {
      await tx`update orders set status = 'open', provider_session_id = ${session.id}, checkout_url = ${session.url}, checkout_expires_at = ${expiresAt}, updated_at = now() where id = ${id}`;
      await tx`insert into lead_activities (lead_id, kind, content) values (${lead.id}, 'system', 'Klient rozpoczął płatność online za Mapę Relacji.')`;
      const [l] = await tx`select anon_id, ab_variant, attribution from leads where id = ${lead.id}`;
      const [st] = await tx`select value->>'funnelTracking' as ft from app_settings where key = 'site'`;
      if (l?.anon_id && st?.ft !== "false") {
        const a = (l.attribution ?? {}) as Record<string, string>;
        await tx`insert into funnel_events (event, anon_id, variant, utm_source, utm_medium, utm_campaign, path)
                 values ('checkout_started', ${l.anon_id}, ${l.ab_variant}, ${a.utm_source ?? null}, ${a.utm_medium ?? null}, ${a.utm_campaign ?? null}, '/twoja-mapa')`;
      }
    });
    await setOrderCookie(token);
    return { ok: true, url: session.url };
  } catch (e) {
    console.error("Nie udało się utworzyć płatności:", (e as Error).message);
    await system((tx) => tx`update orders set failed_reason = 'nie utworzono sesji płatności', updated_at = now() where id = ${id} and status = 'created'`);
    return { ok: false, error: "Nie udało się połączyć z systemem płatności. Spróbuj ponownie za chwilę – albo poczekaj na telefon konsultanta DUO." };
  }
}

export async function bookConsultation(input: { token: string; slotId: string; gender: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.gender !== "male" && input.gender !== "female") return { ok: false, error: "Wybierz wersję kwestionariusza." };
  if (!/^[0-9a-f-]{36}$/.test(input.slotId)) return { ok: false, error: "Wybierz termin konsultacji." };
  if (!(await hit(`book:${await clientIp()}`, 30, 60 * 60))) return { ok: false, error: "Zbyt wiele prób. Odczekaj chwilę." };
  const r = await system(async (tx) => {
    const o = await orderByToken(tx, input.token);
    if (!o) return { ok: false as const, error: "Nie znaleziono zamówienia." };
    return bookSlot(tx, o.id, input.slotId, input.gender as "male" | "female", await readSettings(tx));
  });
  if (r.ok) {
    await setOrderCookie(input.token);
    revalidatePath(`/zamowienie/${input.token}`);
  }
  return r;
}

/** Czy ta przeglądarka ma już zamówienie (link „Twoje zamówienie” na stronie VSL). */
export async function currentOrderPath(): Promise<string | null> {
  const t = await readCookie(ORDER_COOKIE);
  return t ? `/zamowienie/${t}` : null;
}
