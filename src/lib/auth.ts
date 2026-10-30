// Uwierzytelnianie panelu (admin / psycholog): hasło + opcjonalne/wymuszane MFA (TOTP),
// sesje w ciasteczku httpOnly (w bazie wyłącznie hash tokenu).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, hashToken, newToken, verifyPassword, verifyTotp } from "./crypto";
import { system, withActor, type Actor, type Tx } from "./db";
import { env } from "./env";
import { audit } from "./audit";
import { hit } from "./rate-limit";

export const STAFF_COOKIE = "duo_staff";
const SESSION_HOURS = 10;
const IDLE_MINUTES = 60;

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "therapist";
  therapistId: string | null;
  mfaEnabled: boolean;
}

export interface StaffSession {
  user: StaffUser;
  actor: Actor;
  sessionId: string;
  mfaPassed: boolean;
}

export function actorFor(u: StaffUser): Actor {
  return u.role === "admin"
    ? { kind: "admin", userId: u.id, therapistId: u.therapistId }
    : { kind: "therapist", userId: u.id, therapistId: u.therapistId! };
}

export async function login(email: string, password: string, ip: string): Promise<{ ok: true; token: string; needsMfa: boolean } | { ok: false; error: string }> {
  const generic = "Nieprawidłowy e-mail lub hasło.";
  if (!(await hit(`login:ip:${ip}`, 20, 15 * 60))) return { ok: false, error: "Zbyt wiele prób. Spróbuj ponownie za kilkanaście minut." };
  return system(async (tx) => {
    const [u] = await tx`select * from users where lower(email) = lower(${email}) and not disabled`;
    if (!u) {
      await verifyPassword(password, "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA"); // wyrównanie czasu odpowiedzi
      return { ok: false as const, error: generic };
    }
    if (u.locked_until && new Date(u.locked_until) > new Date()) return { ok: false as const, error: "Konto czasowo zablokowane po nieudanych próbach. Spróbuj później." };
    if (!(await verifyPassword(password, u.password_hash))) {
      const fails = u.failed_logins + 1;
      await tx`update users set failed_logins = ${fails}, locked_until = ${fails >= 8 ? new Date(Date.now() + 15 * 60_000) : null} where id = ${u.id}`;
      await audit(tx, { kind: "system" }, "login_failed", "user", u.id);
      return { ok: false as const, error: generic };
    }
    await tx`update users set failed_logins = 0, locked_until = null where id = ${u.id}`;
    const token = newToken();
    await tx`insert into auth_sessions (user_id, token_hash, mfa_passed, expires_at)
             values (${u.id}, ${hashToken(token)}, false, ${new Date(Date.now() + SESSION_HOURS * 3600_000)})`;
    await audit(tx, { kind: "system" }, "login_password_ok", "user", u.id);
    return { ok: true as const, token, needsMfa: u.mfa_enabled };
  });
}

export async function setStaffCookie(token: string) {
  (await cookies()).set(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

async function loadSession(token: string): Promise<StaffSession | null> {
  return system(async (tx) => {
    const [s] = await tx`
      select s.id, s.mfa_passed, s.last_seen_at, u.id as user_id, u.email, u.name, u.role, u.mfa_enabled, t.id as therapist_id
      from auth_sessions s join users u on u.id = s.user_id left join therapists t on t.user_id = u.id
      where s.token_hash = ${hashToken(token)} and s.revoked_at is null and s.expires_at > now() and not u.disabled`;
    if (!s) return null;
    if (Date.now() - new Date(s.last_seen_at).getTime() > IDLE_MINUTES * 60_000) {
      await tx`update auth_sessions set revoked_at = now() where id = ${s.id}`;
      return null;
    }
    await tx`update auth_sessions set last_seen_at = now() where id = ${s.id}`;
    const user: StaffUser = { id: s.user_id, email: s.email, name: s.name, role: s.role, therapistId: s.therapist_id, mfaEnabled: s.mfa_enabled };
    return { user, actor: actorFor(user), sessionId: s.id, mfaPassed: s.mfa_passed };
  });
}

/** Sesja bez wymogu ukończonego MFA (ekrany logowania/konfiguracji MFA). */
export async function getStaffSessionRaw(): Promise<StaffSession | null> {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!token) return null;
  return loadSession(token);
}

/** Wymaga zalogowanego specjalisty z ukończonym MFA (jeśli włączone lub wymuszone). */
export async function requireStaff(role?: "admin"): Promise<StaffSession> {
  const s = await getStaffSessionRaw();
  if (!s) redirect("/app/login");
  if (s.user.mfaEnabled && !s.mfaPassed) redirect("/app/login/mfa");
  if (!s.user.mfaEnabled && env.requireMfa) redirect("/app/mfa-setup");
  if (role === "admin" && s.user.role !== "admin") redirect("/app?err=forbidden");
  return s;
}

export async function completeMfa(code: string): Promise<boolean> {
  const s = await getStaffSessionRaw();
  if (!s) return false;
  if (!(await hit(`mfa:${s.user.id}`, 6, 10 * 60))) return false;
  return system(async (tx) => {
    const [u] = await tx`select mfa_secret from users where id = ${s.user.id}`;
    const secret = decrypt<string>(u?.mfa_secret);
    if (!secret || !verifyTotp(secret, code)) {
      await audit(tx, { kind: "system" }, "mfa_failed", "user", s.user.id);
      return false;
    }
    await tx`update auth_sessions set mfa_passed = true where id = ${s.sessionId}`;
    await audit(tx, { kind: "system" }, "mfa_ok", "user", s.user.id);
    return true;
  });
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(STAFF_COOKIE)?.value;
  if (token) {
    await system((tx) => tx`update auth_sessions set revoked_at = now() where token_hash = ${hashToken(token)}`);
  }
  jar.delete(STAFF_COOKIE);
}

/** Skrót: transakcja jako zalogowany specjalista. */
export async function asStaff<T>(s: StaffSession, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return withActor(s.actor, fn);
}
