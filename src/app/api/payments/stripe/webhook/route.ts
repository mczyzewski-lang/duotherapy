// Powiadomienia operatora płatności (Stripe). Podpis weryfikowany przed jakimkolwiek zapisem;
// każde zdarzenie przetwarzane raz (powtórzenia operatora są bezpieczne).
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyCustomer, notifyTeam } from "@/lib/notify";
import { applyPaymentOutcome } from "@/lib/orders";
import { sessionOutcome, verifyWebhook } from "@/lib/payments";

const HANDLED = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"];

export async function POST(req: Request) {
  const payload = await req.text();
  const event = verifyWebhook(payload, req.headers.get("stripe-signature"));
  if (!event) return new NextResponse("invalid signature", { status: 400 });
  if (!HANDLED.includes(event.type)) return NextResponse.json({ received: true });
  const s = event.data.object;
  const orderId = s.metadata?.order_id || s.client_reference_id || "";
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return NextResponse.json({ received: true, ignored: "no order" });

  const result = await system(async (tx) => {
    const [o] = await tx`select id, provider_session_id from orders where id = ${orderId}`;
    if (!o || (o.provider_session_id && o.provider_session_id !== s.id)) return { skip: true as const };
    const ins = await tx`insert into payment_events (id, order_id, type) values (${event.id}, ${orderId}, ${event.type}) on conflict (id) do nothing returning id`;
    if (ins.length === 0) return { skip: true as const }; // to samo powiadomienie już przetworzone
    const next = await applyPaymentOutcome(tx, orderId, sessionOutcome(s, event.type), { paymentId: s.payment_intent, email: s.customer_details?.email ?? null });
    if (next !== "paid") return { next };
    const [d] = await tx`select o.token_enc, coalesce(o.customer_email, l.email) as email from orders o join leads l on l.id = o.lead_id where o.id = ${orderId}`;
    return { next, email: d?.email as string | null, token: decrypt<string>(d?.token_enc) };
  });

  if ("next" in result && result.next === "paid") {
    if (result.email && result.token) {
      await notifyCustomer(
        result.email,
        "DUO – dziękujemy za zamówienie Mapy Relacji",
        `Dziękujemy za zamówienie Mapy Relacji.\n\nNa stronie zamówienia wybierzesz termin konsultacji i otrzymasz dostęp do kwestionariusza:\n${env.appUrl}/zamowienie/${result.token}\n\nTen link jest prywatny – nie przekazuj go innym osobom.\n\nZespół DUO`,
      );
    }
    await notifyTeam("DUO – Mapa Relacji opłacona online", "Nowy zakup Mapy Relacji online. Klient wybiera termin na stronie zamówienia. Szczegóły w panelu: Zgłoszenia.");
  }
  return NextResponse.json({ received: true });
}
