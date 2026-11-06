"use server";

// Zarządzanie zespołem (administrator): konta, role, profile psychologów, hasła, MFA, blokady, przekazanie spraw.
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem } from "@/lib/crypto";
import { system, type Tx } from "@/lib/db";

type R = { error?: string; ok?: string } | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // bez znaków mylących (l/1, o/0, i)

/** Czytelne hasło tymczasowe, np. „duo-k7mq-x3tp-9vhe”. */
function tempPassword(): string {
  const b = randomBytes(12);
  const chars = [...b].map((x) => ALPHABET[x % ALPHABET.length]);
  return `duo-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}`;
}

const revokeSessions = (userId: string) => system((tx) => tx`update auth_sessions set revoked_at = now() where user_id = ${userId} and revoked_at is null`);

function refresh(id?: string) {
  revalidatePath("/app/zespol");
  if (id) revalidatePath(`/app/zespol/${id}`);
}

/** Liczba aktywnych administratorów poza wskazaną osobą – chroni przed odcięciem dostępu do panelu. */
async function otherActiveAdmins(tx: Tx, userId: string) {
  const [r] = await tx<{ n: number }[]>`select count(*)::int as n from users where role = 'admin' and not disabled and id <> ${userId}`;
  return r.n;
}

export async function createMemberAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const title = String(fd.get("title") ?? "").trim();
  const role = fd.get("role") === "admin" ? "admin" : "therapist";
  const typed = String(fd.get("password") ?? "");
  const pw = typed || tempPassword();
  if (name.length < 3) return { error: "Podaj imię i nazwisko." };
  if (!EMAIL.test(email)) return { error: "Podaj poprawny adres e-mail." };
  const prob = passwordProblem(pw);
  if (prob) return { error: prob };
  const hash = await hashPassword(pw);
  let id = "";
  try {
    id = await asStaff(s, async (tx) => {
      const [u] = await tx<{ id: string }[]>`insert into users (email, name, role, password_hash) values (${email}, ${name}, ${role}, ${hash}) returning id`;
      await tx`insert into therapists (user_id, display_name, title) values (${u.id}, ${name}, ${title || null})`;
      await audit(tx, s.actor, "user_created", "user", u.id, null, { role });
      return u.id;
    });
  } catch {
    return { error: "Konto o tym adresie e-mail już istnieje." };
  }
  refresh(id);
  return {
    ok: typed
      ? `Dodano: ${name}. Przekaż hasło tymczasowe bezpiecznym kanałem.`
      : `Dodano: ${name}. Hasło tymczasowe (widoczne tylko teraz): ${pw} – przekaż je bezpiecznym kanałem, nie w tym samym mailu co login.`,
  };
}

export async function updateMemberAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const role = fd.get("role") === "admin" ? "admin" : "therapist";
  if (name.length < 3) return { error: "Podaj imię i nazwisko." };
  if (!EMAIL.test(email)) return { error: "Podaj poprawny adres e-mail." };
  try {
    const err = await asStaff(s, async (tx) => {
      const [u] = await tx<{ role: string }[]>`select role from users where id = ${id}`;
      if (!u) return "Nie znaleziono konta.";
      if (u.role === "admin" && role !== "admin") {
        if (id === s.user.id) return "Nie możesz odebrać uprawnień administratora samemu sobie.";
        if ((await otherActiveAdmins(tx, id)) === 0) return "To jedyny aktywny administrator – najpierw nadaj tę rolę innej osobie.";
      }
      await tx`update users set email = ${email}, name = ${name}, role = ${role} where id = ${id}`;
      await audit(tx, s.actor, "user_updated", "user", id, null, { role, roleChanged: u.role !== role });
      return null;
    });
    if (err) return { error: err };
  } catch {
    return { error: "Ten adres e-mail jest już przypisany do innego konta." };
  }
  refresh(id);
  return { ok: "Zapisano dane konta." };
}

export async function memberProfileAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  const displayName = String(fd.get("display_name") ?? "").trim();
  if (displayName.length < 3) return { error: "Podaj imię i nazwisko do podsumowań." };
  await asStaff(s, async (tx) => {
    await tx`insert into therapists (user_id, display_name, title, bio, is_public)
             values (${id}, ${displayName}, ${String(fd.get("title") ?? "").trim() || null}, ${String(fd.get("bio") ?? "").trim() || null}, ${fd.get("is_public") === "on"})
             on conflict (user_id) do update set display_name = excluded.display_name, title = excluded.title, bio = excluded.bio, is_public = excluded.is_public`;
    await audit(tx, s.actor, "therapist_profile_updated", "user", id);
  });
  refresh(id);
  revalidatePath("/", "layout");
  return { ok: "Zapisano profil." };
}

export async function resetPasswordAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  const typed = String(fd.get("password") ?? "");
  const pw = typed || tempPassword();
  const prob = passwordProblem(pw);
  if (prob) return { error: prob };
  const hash = await hashPassword(pw);
  await asStaff(s, async (tx) => {
    await tx`update users set password_hash = ${hash}, failed_logins = 0, locked_until = null where id = ${id}`;
    await audit(tx, s.actor, "user_password_reset", "user", id);
  });
  if (id !== s.user.id) await revokeSessions(id);
  refresh(id);
  return { ok: typed ? "Ustawiono nowe hasło. Aktywne sesje tej osoby zostały wylogowane." : `Nowe hasło tymczasowe (widoczne tylko teraz): ${pw} – aktywne sesje tej osoby zostały wylogowane.` };
}

export async function resetMfaAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  if (id === s.user.id) return { error: "Własne MFA zmienisz w ustawieniach konta." };
  await asStaff(s, async (tx) => {
    await tx`update users set mfa_enabled = false, mfa_secret = null where id = ${id}`;
    await audit(tx, s.actor, "user_mfa_reset", "user", id);
  });
  await revokeSessions(id);
  refresh(id);
  return { ok: "Zresetowano MFA. Przy następnym logowaniu osoba skonfiguruje je od nowa." };
}

export async function setDisabledAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  const disable = fd.get("disable") === "1";
  if (disable && id === s.user.id) return { error: "Nie możesz wyłączyć własnego konta." };
  const err = await asStaff(s, async (tx) => {
    const [u] = await tx<{ role: string }[]>`select role from users where id = ${id}`;
    if (!u) return "Nie znaleziono konta.";
    if (disable && u.role === "admin" && (await otherActiveAdmins(tx, id)) === 0) return "To jedyny aktywny administrator.";
    await tx`update users set disabled = ${disable}, failed_logins = 0, locked_until = null where id = ${id}`;
    if (disable) await tx`update therapists set is_public = false where user_id = ${id}`;
    await audit(tx, s.actor, disable ? "user_disabled" : "user_enabled", "user", id);
    return null;
  });
  if (err) return { error: err };
  if (disable) await revokeSessions(id);
  refresh(id);
  return { ok: disable ? "Konto wyłączone – osoba nie zaloguje się, a jej sesje zostały zakończone. Sprawy i historia zostają." : "Konto ponownie aktywne." };
}

export async function unlockAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  await asStaff(s, async (tx) => {
    await tx`update users set failed_logins = 0, locked_until = null where id = ${id}`;
    await audit(tx, s.actor, "user_unlocked", "user", id);
  });
  refresh(id);
  return { ok: "Odblokowano logowanie." };
}

/** Przekazanie wszystkich otwartych spraw, zgłoszeń i wolnych terminów innemu psychologowi (np. przy odejściu z zespołu). */
export async function reassignWorkAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  const to = String(fd.get("to_therapist") ?? "");
  if (!to) return { error: "Wybierz osobę, która przejmie sprawy." };
  const res = await asStaff(s, async (tx) => {
    const [from] = await tx<{ id: string }[]>`select id from therapists where user_id = ${id}`;
    if (!from || from.id === to) return null;
    const cases = await tx`update cases set therapist_id = ${to} where therapist_id = ${from.id} and status <> 'closed' returning id`;
    const leads = await tx`update leads set assigned_therapist_id = ${to} where assigned_therapist_id = ${from.id} returning id`;
    await audit(tx, s.actor, "therapist_work_reassigned", "user", id, null, { to, cases: cases.length, leads: leads.length });
    return { cases: cases.length, leads: leads.length };
  });
  if (!res) return { error: "Wybierz inną osobę." };
  refresh(id);
  return { ok: `Przekazano: ${res.cases} spraw(y) i ${res.leads} zgłoszeń. Terminy w kalendarzu zostają – zmień je w zakładce Terminy.` };
}

/** Usunięcie konta – tylko gdy osoba nie ma żadnej historii (sprawy, terminy, wpisy). W innym razie: wyłączenie. */
export async function deleteMemberAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = String(fd.get("user_id"));
  if (id === s.user.id) return { error: "Nie możesz usunąć własnego konta." };
  try {
    const err = await asStaff(s, async (tx) => {
      const [u] = await tx<{ role: string }[]>`select role from users where id = ${id}`;
      if (!u) return "Nie znaleziono konta.";
      if (u.role === "admin" && (await otherActiveAdmins(tx, id)) === 0) return "To jedyny aktywny administrator.";
      await tx`delete from users where id = ${id}`;
      await audit(tx, s.actor, "user_deleted", "user", id);
      return null;
    });
    if (err) return { error: err };
  } catch {
    return { error: "Tej osoby nie można usunąć, bo ma historię w systemie (sprawy, terminy, notatki lub wpisy). Wyłącz konto – dane i historia zostaną zachowane." };
  }
  await revokeSessions(id).catch(() => {});
  revalidatePath("/app/zespol");
  redirect("/app/zespol?deleted=1");
}
