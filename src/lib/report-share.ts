// Dostęp odbiorcy do udostępnionego raportu: link + kod (oba przechowywane jako hash).
import { cookies } from "next/headers";
import { audit } from "./audit";
import { hashToken, newToken } from "./crypto";
import { system, withActor } from "./db";
import { env } from "./env";
import { hit } from "./rate-limit";

const cookieName = (token: string) => `duo_r_${hashToken(token).slice(0, 16)}`;

export async function shareStatus(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  return system(async (tx) => {
    const [r] = await tx`select id, expires_at, revoked_at, failed_attempts from report_shares where token_hash = ${hashToken(token)}`;
    if (!r) return null;
    return { id: r.id as string, active: !r.revoked_at && new Date(r.expires_at) > new Date() && r.failed_attempts < 5 };
  });
}

export async function verifyShareCode(token: string, code: string, ip: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await hit(`rcode:${ip}`, 30, 900))) return { ok: false, error: "Zbyt wiele prób. Spróbuj później." };
  const st = await shareStatus(token);
  if (!st?.active) return { ok: false, error: "Link jest nieaktywny lub kod jest nieprawidłowy." };
  return system(async (tx) => {
    const [r] = await tx`select code_hash from report_shares where id = ${st.id}`;
    if (r.code_hash !== hashToken("code:" + code.replace(/\s/g, ""))) {
      await tx`update report_shares set failed_attempts = failed_attempts + 1 where id = ${st.id}`;
      return { ok: false, error: "Kod jest nieprawidłowy." };
    }
    // sesja odbiorcy: podpisany identyfikator udostępnienia (HMAC) w ciasteczku ograniczonym do ścieżki
    const nonce = newToken();
    (await cookies()).set(cookieName(token), `${nonce}.${hashToken(`share:${st.id}:${nonce}`)}`, { httpOnly: true, secure: env.isProd, sameSite: "strict", path: `/r/${token}`, maxAge: 3600 });
    await tx`update report_shares set viewed_at = coalesce(viewed_at, now()) where id = ${st.id}`;
    await audit(tx, { kind: "report_viewer", shareId: st.id }, "report_share_opened", "report_share", st.id);
    return { ok: true };
  });
}

export async function sharedReport(token: string) {
  const st = await shareStatus(token);
  if (!st?.active) return null;
  const c = (await cookies()).get(cookieName(token))?.value;
  if (!c) return null;
  const [nonce, mac] = c.split(".");
  if (mac !== hashToken(`share:${st.id}:${nonce}`)) return null;
  return withActor({ kind: "report_viewer", shareId: st.id }, async (tx) => {
    const [v] = await tx`select content_enc, version from report_versions where id = app_share_version()`;
    return v ? { shareId: st.id, content_enc: v.content_enc as string } : null;
  });
}
