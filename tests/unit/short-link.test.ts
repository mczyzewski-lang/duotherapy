// Krótki link do materiału: podpisana wartość dostępu, odporna na podrobienie.
import { describe, expect, it } from "vitest";
import { leadByAccess, newShortCode, SHORT_CODE_RE, shortAccess } from "@/lib/content-access";
import { system } from "@/lib/db";

describe("krótki link /plan/<kod>", () => {
  it("kod 7 znaków, wartość dostępu tylko z poprawnym podpisem", async () => {
    const code = newShortCode();
    expect(code).toMatch(SHORT_CODE_RE);
    const email = `short.${Date.now()}@example.test`;
    await system((tx) => tx`insert into content_leads (request_id, email, magnet_id, unsubscribe_token_hash, unsubscribe_token_enc, short_code)
      values (gen_random_uuid(), ${email}, 'lm08', ${`u-${code}-${Date.now()}`}, 'x', ${code})`);
    const ok = await system((tx) => leadByAccess(tx, shortAccess(code)));
    expect(ok?.email).toBe(email);
    const forged = `${code}.${"0".repeat(24)}`;
    expect(await system((tx) => leadByAccess(tx, forged))).toBeNull();
    expect(await system((tx) => leadByAccess(tx, code))).toBeNull();
  });
});
