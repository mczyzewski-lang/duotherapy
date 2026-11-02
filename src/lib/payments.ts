// Operator płatności: Stripe Checkout (bez dodatkowych bibliotek – REST + weryfikacja podpisu HMAC).
// Status „opłacone” ustalamy WYŁĄCZNIE na podstawie danych od operatora: podpisanego powiadomienia (webhook)
// albo zapytania do API operatora kluczem tajnym. Samo przekierowanie na stronę sukcesu niczego nie zmienia.
import { createHmac, timingSafeEqual } from "node:crypto";

export interface CheckoutSession {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  payment_intent: string | null;
  client_reference_id: string | null;
  metadata: Record<string, string>;
  customer_details?: { email?: string | null } | null;
  expires_at?: number;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: CheckoutSession };
}

export type Outcome = "open" | "pending" | "paid" | "failed" | "expired";

const apiBase = () => process.env.STRIPE_API_BASE || "https://api.stripe.com";

export function paymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/** Sprzedaż online możliwa: skonfigurowany operator, włączona sprzedaż i zatwierdzony regulamin (poza trybem DEMO). */
export function salesAvailable(s: { offer: { onlineSales: boolean; termsApproved: boolean } }): boolean {
  return paymentsConfigured() && s.offer.onlineSales && (s.offer.termsApproved || process.env.DEMO_MODE === "true");
}

/** Kodowanie parametrów w formacie Stripe: a[b][0][c]=… */
export function encodeForm(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? encodeForm(x as Record<string, unknown>, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(x))));
    else if (typeof v === "object") encodeForm(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe<T>(method: "GET" | "POST", path: string, params?: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Brak STRIPE_SECRET_KEY");
  const res = await fetch(apiBase() + path, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: method === "POST" && params ? encodeForm(params).toString() : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) throw new Error(json.error?.message || `Operator płatności zwrócił błąd ${res.status}`);
  return json;
}

export async function createCheckoutSession(o: {
  orderId: string;
  amountPln: number;
  productName: string;
  description: string;
  email?: string | null;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
}): Promise<CheckoutSession> {
  return stripe<CheckoutSession>(
    "POST",
    "/v1/checkout/sessions",
    {
      mode: "payment",
      locale: "pl",
      client_reference_id: o.orderId,
      metadata: { order_id: o.orderId },
      payment_intent_data: { metadata: { order_id: o.orderId }, description: o.productName },
      line_items: [{ quantity: 1, price_data: { currency: "pln", unit_amount: o.amountPln * 100, product_data: { name: o.productName, description: o.description } } }],
      billing_address_collection: "required",
      customer_email: o.email || undefined,
      success_url: o.successUrl,
      cancel_url: o.cancelUrl,
      expires_at: Math.floor(o.expiresAt.getTime() / 1000),
    },
    // ten sam klucz = ta sama sesja przy ponowieniu żądania (bez podwójnych zamówień u operatora)
    `checkout-${o.orderId}`,
  );
}

export function retrieveSession(id: string): Promise<CheckoutSession> {
  if (!/^[A-Za-z0-9_]{6,255}$/.test(id)) throw new Error("Niepoprawny identyfikator sesji płatności");
  return stripe<CheckoutSession>("GET", `/v1/checkout/sessions/${id}`);
}

/** Weryfikacja nagłówka Stripe-Signature (t=…, v1=…). Zwraca zdarzenie albo null. */
export function verifyWebhook(payload: string, header: string | null, secret = process.env.STRIPE_WEBHOOK_SECRET ?? "", toleranceSec = 300, now = Date.now()): StripeEvent | null {
  if (!header || !secret) return null;
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(t) || sigs.length === 0) return null;
  if (Math.abs(now / 1000 - t) > toleranceSec) return null;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex"));
  const ok = sigs.some((s) => {
    const b = Buffer.from(s);
    return b.length === expected.length && timingSafeEqual(b, expected);
  });
  if (!ok) return null;
  try {
    return JSON.parse(payload) as StripeEvent;
  } catch {
    return null;
  }
}

/** Podpis jak u operatora – używany w testach (atrapa operatora) i w narzędziach diagnostycznych. */
export function signWebhook(payload: string, secret: string, t = Math.floor(Date.now() / 1000)): string {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex")}`;
}

/** Stan płatności na podstawie danych operatora. */
export function sessionOutcome(s: Pick<CheckoutSession, "status" | "payment_status">, eventType?: string): Outcome {
  if (eventType === "checkout.session.async_payment_failed") return "failed";
  if (s.payment_status === "paid" || s.payment_status === "no_payment_required") return "paid";
  if (s.status === "expired") return "expired";
  if (s.status === "complete") return "pending"; // metody odroczone (np. przelew) – czekamy na potwierdzenie
  return "open";
}

/** Dozwolone przejścia statusu zamówienia (opłacone jest ostateczne; nic nie cofa statusu). */
export function nextOrderStatus(current: string, outcome: Outcome): string | null {
  if (current === "paid") return null;
  if (outcome === "paid") return "paid";
  if (current === "failed" || current === "expired") return null;
  if (outcome === "open") return current === "created" ? "open" : null;
  if (outcome === current) return null;
  return outcome;
}
