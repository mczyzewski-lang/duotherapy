import { afterEach, describe, expect, it, vi } from "vitest";
import { maskPhone, normalizePhone, sendSms } from "@/lib/sms";

describe("sms", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.SMSAPI_TOKEN; });

  it("normalizuje polskie numery komórkowe", () => {
    for (const x of ["600100123", "600 100 123", "+48 600-100-123", "0048600100123", "48600100123"]) expect(normalizePhone(x), x).toBe("+48600100123");
    for (const x of ["12", "100100123", "+49600100123", "6001001234", "abc"]) expect(normalizePhone(x), x).toBeNull();
    expect(maskPhone("+48600100123")).toBe("••• ••• 123");
  });

  it("bez tokenu SMSAPI nie udaje wysyłki", async () => {
    expect(await sendSms("+48600100123", "x")).toEqual({ ok: false, error: "Wysyłka SMS nie jest jeszcze skonfigurowana." });
  });

  it("wysyła przez SMSAPI z nadawcą DUO; błąd SMSAPI wraca czytelnie", async () => {
    process.env.SMSAPI_TOKEN = "t";
    const f = vi.fn(async (_u: string, init: RequestInit) => new Response(JSON.stringify(String(init.body).includes("from=DUO") ? { count: 1 } : { error: 13, message: "Invalid sender" }), { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await sendSms("+48600100123", "Kod 1234")).toEqual({ ok: true });
    const body = String(f.mock.calls[0][1].body);
    expect(body).toContain("to=48600100123");
    expect(f.mock.calls[0][1].headers).toMatchObject({ Authorization: "Bearer t" });
    process.env.SMSAPI_SENDER = "XX";
    expect(await sendSms("+48600100123", "Kod")).toEqual({ ok: false, error: "SMSAPI: Invalid sender" });
    delete process.env.SMSAPI_SENDER;
  });
});
