// Dostęp uczestnika: unikatowy link (token 256-bit) + 6-cyfrowy kod przekazany innym kanałem.
// Token i kod przechowywane są wyłącznie jako hash. Po weryfikacji uczestnik dostaje sesję
// w ciasteczku ograniczonym do ścieżki swojego linku.
import { cookies } from "next/headers";
import { hashToken, newCode, newToken } from "./crypto";
import { system, type Tx } from "./db";
import { env } from "./env";
import { audit } from "./audit";
import { hit } from "./rate-limit";

const MAX_CODE_ATTEMPTS = 5;
const SESSION_HOURS = 12;

export function participantCookieName(token: string) {
  return `duo_p_${hashToken(token).slice(0, 16)}`;
}

/** Tworzy nowy link (unieważnia poprzednie aktywne). Zwraca surowe dane – pokazywane psychologowi jednorazowo. */
export async function createInvitation(tx: Tx, participantId: string, userId: string, days: number) {
  await tx`update invitations set revoked_at = now() where participant_id = ${participantId} and revoked_at is null`;
  const token = newToken();
  const code = newCode();
  const [inv] = await tx<{ id: string }[]>`
    insert into invitations (participant_id, token_hash, code_hash, expires_at, created_by)
    values (${participantId}, ${hashToken(token)}, ${hashToken("code:" + code)}, ${new Date(Date.now() + days * 86400_000)}, ${userId})
    returning id`;
  return { id: inv.id, token, code, url: `${env.appUrl}/q/${token}` };
}

export interface InvitationInfo {
  invitationId: string;
  participantId: string;
  firstName: string;
  status: "active" | "expired" | "revoked" | "locked";
}

export async function resolveInvitation(token: string): Promise<InvitationInfo | null> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  return system(async (tx) => {
    const [r] = await tx`
      select i.id, i.participant_id, i.expires_at, i.revoked_at, i.failed_attempts, p.display_name, p.anonymized_at
      from invitations i join participants p on p.id = i.participant_id where i.token_hash = ${hashToken(token)}`;
    if (!r) return null;
    const status = r.revoked_at || r.anonymized_at ? "revoked" : new Date(r.expires_at) < new Date() ? "expired" : r.failed_attempts >= MAX_CODE_ATTEMPTS ? "locked" : "active";
    return { invitationId: r.id, participantId: r.participant_id, firstName: String(r.display_name).split(" ")[0], status };
  });
}

export async function verifyInvitationCode(token: string, code: string, ip: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await hit(`code:ip:${ip}`, 30, 15 * 60))) return { ok: false, error: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie." };
  const inv = await resolveInvitation(token);
  // ta sama odpowiedź dla nieistniejącego linku – ochrona przed enumeracją
  if (!inv || inv.status !== "active") return { ok: false, error: "Link jest nieaktywny lub kod jest nieprawidłowy. Skontaktuj się z psychologiem prowadzącym." };
  return system(async (tx) => {
    const [r] = await tx`select code_hash, failed_attempts from invitations where id = ${inv.invitationId} for update`;
    if (r.code_hash !== hashToken("code:" + code.replace(/\s/g, ""))) {
      await tx`update invitations set failed_attempts = failed_attempts + 1 where id = ${inv.invitationId}`;
      await audit(tx, { kind: "system" }, "invitation_code_failed", "invitation", inv.invitationId);
      const left = MAX_CODE_ATTEMPTS - (r.failed_attempts + 1);
      return {
        ok: false as const,
        error: left > 0 ? `Kod jest nieprawidłowy. Pozostało prób: ${left}.` : "Link został zablokowany po zbyt wielu próbach. Poproś psychologa o nowy link.",
      };
    }
    const sessionToken = newToken();
    await tx`insert into participant_sessions (participant_id, invitation_id, token_hash, expires_at)
             values (${inv.participantId}, ${inv.invitationId}, ${hashToken(sessionToken)}, ${new Date(Date.now() + SESSION_HOURS * 3600_000)})`;
    await tx`update invitations set last_used_at = now(), failed_attempts = 0 where id = ${inv.invitationId}`;
    await audit(tx, { kind: "participant", participantId: inv.participantId }, "invitation_opened", "invitation", inv.invitationId);
    (await cookies()).set(participantCookieName(token), sessionToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "strict",
      path: `/q/${token}`,
      maxAge: SESSION_HOURS * 3600,
    });
    return { ok: true as const };
  });
}

/** Zwraca id uczestnika dla bieżącego linku, jeśli sesja jest ważna, a link nie został cofnięty. */
export async function participantFromSession(token: string, sessionToken: string | undefined): Promise<string | null> {
  if (!sessionToken) return null;
  return system(async (tx) => {
    const [r] = await tx`
      select s.participant_id from participant_sessions s join invitations i on i.id = s.invitation_id
      where s.token_hash = ${hashToken(sessionToken)} and i.token_hash = ${hashToken(token)}
        and s.revoked_at is null and s.expires_at > now() and i.revoked_at is null and i.expires_at > now()`;
    return r?.participant_id ?? null;
  });
}

export async function currentParticipant(token: string): Promise<string | null> {
  const c = (await cookies()).get(participantCookieName(token))?.value;
  return participantFromSession(token, c);
}
