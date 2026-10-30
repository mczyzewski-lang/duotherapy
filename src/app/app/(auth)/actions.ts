"use server";

import { redirect } from "next/navigation";
import { completeMfa, getStaffSessionRaw, login, logout, setStaffCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { decrypt, encrypt, newTotpSecret, verifyTotp } from "@/lib/crypto";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { clientIp } from "@/lib/request";

export async function loginAction(_: unknown, fd: FormData) {
  const r = await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""), await clientIp());
  if (!r.ok) return { error: r.error };
  await setStaffCookie(r.token);
  redirect(r.needsMfa ? "/app/login/mfa" : env.requireMfa ? "/app/mfa-setup" : "/app");
}

export async function mfaAction(_: unknown, fd: FormData) {
  if (!(await completeMfa(String(fd.get("code") ?? "")))) return { error: "Nieprawidłowy kod. Spróbuj ponownie." };
  redirect("/app");
}

export async function logoutAction() {
  await logout();
  redirect("/app/login");
}

/** Generuje (jednorazowo) sekret TOTP do skonfigurowania w aplikacji uwierzytelniającej. */
export async function startMfaSetup(): Promise<{ secret: string; uri: string } | null> {
  const s = await getStaffSessionRaw();
  if (!s || s.user.mfaEnabled) return null;
  return system(async (tx) => {
    const [u] = await tx`select mfa_secret from users where id = ${s.user.id}`;
    let secret = decrypt<string>(u.mfa_secret);
    if (!secret) {
      secret = newTotpSecret();
      await tx`update users set mfa_secret = ${encrypt(secret)} where id = ${s.user.id}`;
    }
    const uri = `otpauth://totp/DUO:${encodeURIComponent(s.user.email)}?secret=${secret}&issuer=DUO&digits=6&period=30`;
    return { secret, uri };
  });
}

export async function confirmMfaSetup(_: unknown, fd: FormData) {
  const s = await getStaffSessionRaw();
  if (!s) redirect("/app/login");
  const ok = await system(async (tx) => {
    const [u] = await tx`select mfa_secret from users where id = ${s.user.id}`;
    const secret = decrypt<string>(u.mfa_secret);
    if (!secret || !verifyTotp(secret, String(fd.get("code") ?? ""))) return false;
    await tx`update users set mfa_enabled = true where id = ${s.user.id}`;
    await tx`update auth_sessions set mfa_passed = true where id = ${s.sessionId}`;
    await audit(tx, s.actor, "mfa_enabled", "user", s.user.id);
    return true;
  });
  if (!ok) return { error: "Kod nie pasuje. Sprawdź czas w telefonie i spróbuj ponownie." };
  redirect("/app");
}
