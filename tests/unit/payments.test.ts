import { describe, expect, it } from "vitest";
import { callStatus, nextCallWindow, zonedToUtc } from "@/lib/orders";
import { encodeForm, nextOrderStatus, sessionOutcome, signWebhook, verifyWebhook } from "@/lib/payments";

const OFFER = { callHours: "9-18", callDays: "1-5", callDelayMinutes: 60, checkoutGraceMinutes: 30 };

describe("powiadomienia operatora płatności", () => {
  const secret = "whsec_unit";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_1" } } });

  it("akceptuje poprawny podpis", () => {
    expect(verifyWebhook(payload, signWebhook(payload, secret), secret)?.id).toBe("evt_1");
  });
  it("odrzuca zmienioną treść, zły sekret i stary znacznik czasu", () => {
    const sig = signWebhook(payload, secret);
    expect(verifyWebhook(payload.replace("evt_1", "evt_2"), sig, secret)).toBeNull();
    expect(verifyWebhook(payload, sig, "whsec_inny")).toBeNull();
    const old = signWebhook(payload, secret, Math.floor(Date.now() / 1000) - 3600);
    expect(verifyWebhook(payload, old, secret)).toBeNull();
    expect(verifyWebhook(payload, null, secret)).toBeNull();
  });
});

describe("stan zamówienia", () => {
  it("opłacone tylko przy potwierdzeniu operatora", () => {
    expect(sessionOutcome({ status: "complete", payment_status: "paid" })).toBe("paid");
    expect(sessionOutcome({ status: "complete", payment_status: "unpaid" })).toBe("pending");
    expect(sessionOutcome({ status: "open", payment_status: "unpaid" })).toBe("open");
    expect(sessionOutcome({ status: "expired", payment_status: "unpaid" })).toBe("expired");
    expect(sessionOutcome({ status: "complete", payment_status: "unpaid" }, "checkout.session.async_payment_failed")).toBe("failed");
  });
  it("opłacone jest ostateczne, powtórzenia nic nie zmieniają", () => {
    expect(nextOrderStatus("open", "paid")).toBe("paid");
    expect(nextOrderStatus("paid", "expired")).toBeNull();
    expect(nextOrderStatus("paid", "paid")).toBeNull();
    expect(nextOrderStatus("pending", "pending")).toBeNull();
    expect(nextOrderStatus("pending", "paid")).toBe("paid");
    expect(nextOrderStatus("expired", "open")).toBeNull();
    expect(nextOrderStatus("created", "open")).toBe("open");
  });
  it("koduje parametry w formacie operatora", () => {
    const f = encodeForm({ line_items: [{ quantity: 1, price_data: { unit_amount: 67000 } }], metadata: { order_id: "x" } }).toString();
    expect(decodeURIComponent(f)).toContain("line_items[0][price_data][unit_amount]=67000");
    expect(decodeURIComponent(f)).toContain("metadata[order_id]=x");
  });
});

describe("czas warszawski i reguły kontaktu", () => {
  it("przelicza czas lokalny z uwzględnieniem zmiany czasu", () => {
    expect(zonedToUtc("2026-07-01", "10:00").toISOString()).toBe("2026-07-01T08:00:00.000Z");
    expect(zonedToUtc("2026-12-01", "10:00").toISOString()).toBe("2026-12-01T09:00:00.000Z");
  });
  it("przesuwa telefon do godzin i dni pracy", () => {
    // sobota 12:00 → poniedziałek 9:00
    expect(nextCallWindow(zonedToUtc("2026-11-07", "12:00"), OFFER).toISOString()).toBe(zonedToUtc("2026-11-09", "09:00").toISOString());
    // wtorek 20:30 → środa 9:00
    expect(nextCallWindow(zonedToUtc("2026-11-10", "20:30"), OFFER).toISOString()).toBe(zonedToUtc("2026-11-11", "09:00").toISOString());
  });
  it("nie dzwoni od razu po zgłoszeniu ani w trakcie płatności, nie dzwoni sprzedażowo po zakupie", () => {
    const now = zonedToUtc("2026-11-10", "12:00");
    const fresh = { created_at: new Date(+now - 5 * 60_000), stage: "new" };
    expect(callStatus(fresh, [], OFFER, now).kind).toBe("wait");
    const old = { created_at: new Date(+now - 3 * 3600_000), stage: "new" };
    expect(callStatus(old, [], OFFER, now).kind).toBe("call");
    const paying = [{ status: "open", created_at: new Date(+now - 5 * 60_000), updated_at: new Date(+now - 5 * 60_000) }];
    expect(callStatus(old, paying, OFFER, now).kind).toBe("paying");
    const cancelled = [{ ...paying[0], returned_cancel_at: new Date(+now - 4 * 60_000) }];
    expect(callStatus(old, cancelled, OFFER, now).label).toMatch(/^Płatność przerwana/);
    const paid = [{ status: "paid", created_at: now, updated_at: now }];
    expect(callStatus({ ...old, stage: "paid" }, paid, OFFER, now).kind).toBe("paid");
    const pending = [{ status: "pending", created_at: now, updated_at: now }];
    expect(callStatus(old, pending, OFFER, now).kind).toBe("pending");
  });
});
