// Atrapa operatora płatności (Stripe Checkout) – WYŁĄCZNIE do testów e2e i lokalnego sprawdzenia przepływu.
// Osobny proces, poza aplikacją. Implementuje: utworzenie i odczyt sesji, stronę płatności,
// podpisane powiadomienie (webhook) do aplikacji i przekierowanie na success_url / cancel_url.
// Uruchom: STRIPE_MOCK_PORT=3199 APP_WEBHOOK=http://localhost:3100/api/payments/stripe/webhook STRIPE_WEBHOOK_SECRET=whsec_test node tests/e2e/stripe-mock.mjs
import { createHmac, randomBytes } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.STRIPE_MOCK_PORT || 3199);
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";
const WEBHOOK = process.env.APP_WEBHOOK || "http://localhost:3100/api/payments/stripe/webhook";
const sessions = new Map();

const body = (req) => new Promise((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b)); });
const json = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };

async function sendEvent(type, s) {
  const payload = JSON.stringify({ id: `evt_${randomBytes(8).toString("hex")}`, type, data: { object: s } });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", SECRET).update(`${t}.${payload}`).digest("hex");
  const r = await fetch(WEBHOOK, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}`, "content-type": "application/json" }, body: payload });
  return { status: r.status, payload };
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
  if (!req.headers.authorization?.startsWith("Bearer ") && url.pathname.startsWith("/v1/")) return json(res, 401, { error: { message: "no key" } });

  if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") {
    const p = new URLSearchParams(await body(req));
    const key = req.headers["idempotency-key"];
    const existing = [...sessions.values()].find((s) => s._idem && s._idem === key);
    if (existing) return json(res, 200, existing);
    const id = `cs_test_${randomBytes(10).toString("hex")}`;
    const s = {
      id,
      object: "checkout.session",
      url: `http://localhost:${PORT}/pay/${id}`,
      status: "open",
      payment_status: "unpaid",
      payment_intent: null,
      client_reference_id: p.get("client_reference_id"),
      metadata: { order_id: p.get("metadata[order_id]") },
      customer_details: null,
      amount_total: Number(p.get("line_items[0][price_data][unit_amount]")),
      currency: p.get("line_items[0][price_data][currency]"),
      success_url: p.get("success_url"),
      cancel_url: p.get("cancel_url"),
      expires_at: Number(p.get("expires_at")),
      _idem: key,
    };
    sessions.set(id, s);
    return json(res, 200, s);
  }
  const m = url.pathname.match(/^\/v1\/checkout\/sessions\/([\w]+)$/);
  if (req.method === "GET" && m) {
    const s = sessions.get(m[1]);
    return s ? json(res, 200, s) : json(res, 404, { error: { message: "No such session" } });
  }

  const pay = url.pathname.match(/^\/pay\/([\w]+)(\/(confirm|cancel|fail))?$/);
  if (pay) {
    const s = sessions.get(pay[1]);
    if (!s) { res.writeHead(404); return res.end("no session"); }
    if (req.method === "GET" && !pay[2]) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(`<!doctype html><meta name="viewport" content="width=device-width"><title>Atrapa płatności</title>
<body style="font-family:sans-serif;padding:24px"><h1>Atrapa operatora płatności (test)</h1>
<p>Kwota: ${(s.amount_total / 100).toFixed(2)} ${String(s.currency).toUpperCase()}</p>
<form method="post" action="/pay/${s.id}/confirm"><label>E-mail <input name="email" value="test@example.com"></label> <button>Zapłać</button></form>
<form method="post" action="/pay/${s.id}/fail" style="margin-top:12px"><button>Odrzuć płatność</button></form>
<form method="post" action="/pay/${s.id}/cancel" style="margin-top:12px"><button>Wróć do sklepu</button></form></body>`);
    }
    if (req.method === "POST") {
      const p = new URLSearchParams(await body(req));
      if (pay[3] === "cancel") { res.writeHead(303, { location: s.cancel_url }); return res.end(); }
      if (pay[3] === "fail") {
        s.status = "complete"; s.payment_status = "unpaid";
        await sendEvent("checkout.session.async_payment_failed", s);
        res.writeHead(303, { location: s.success_url.replace("{CHECKOUT_SESSION_ID}", s.id) }); return res.end();
      }
      s.status = "complete"; s.payment_status = "paid"; s.payment_intent = `pi_test_${randomBytes(6).toString("hex")}`;
      s.customer_details = { email: p.get("email") || null };
      // powiadomienie wysyłane dwukrotnie – aplikacja musi je przetworzyć tylko raz
      const ev = await sendEvent("checkout.session.completed", s);
      const t = Math.floor(Date.now() / 1000);
      await fetch(WEBHOOK, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${createHmac("sha256", SECRET).update(`${t}.${ev.payload}`).digest("hex")}` }, body: ev.payload });
      res.writeHead(303, { location: s.success_url.replace("{CHECKOUT_SESSION_ID}", s.id) });
      return res.end();
    }
  }
  json(res, 404, { error: { message: "not found" } });
}).listen(PORT, () => console.log(`stripe-mock na :${PORT}`));
