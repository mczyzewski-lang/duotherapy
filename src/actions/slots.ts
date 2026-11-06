"use server";

// Wolne terminy konsultacji do rezerwacji online po zakupie Mapy Relacji – kalendarz w panelu (dodawanie, usuwanie, wzory, kopiowanie tygodnia).
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff, type StaffSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import type { Tx } from "@/lib/db";
import { zonedToUtc } from "@/lib/orders";
import { addDays, fromMin, toMin, warsawParts, weekday } from "@/lib/slot-dates";

type R = { error?: string; ok?: string } | undefined;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;

function therapistFor(s: StaffSession, requested: unknown) {
  return s.user.role === "admin" ? String(requested || s.user.therapistId || "") : s.user.therapistId ?? "";
}

/** Dodaje termin, jeśli nie jest w przeszłości i nie nachodzi na inny (wolny lub zarezerwowany) termin tej osoby. */
async function addOne(tx: Tx, therapistId: string, start: Date, minutes: number, userId: string): Promise<boolean> {
  if (start.getTime() < Date.now()) return false;
  const r = await tx`
    insert into booking_slots (therapist_id, starts_at, minutes, created_by)
    select ${therapistId}, ${start}, ${minutes}, ${userId}
    where not exists (
      select 1 from booking_slots b where b.therapist_id = ${therapistId} and b.status <> 'cancelled'
        and b.starts_at < ${new Date(start.getTime() + minutes * 60_000)}
        and b.starts_at + make_interval(mins => b.minutes) > ${start})
    on conflict (therapist_id, starts_at) do nothing returning id`;
  return r.length > 0;
}

const done = (added: number, tried: number, removed = 0): R => {
  const parts = [];
  if (tried) parts.push(`Dodano terminy: ${added}${added < tried ? ` (pominięto ${tried - added} – zajęte lub w przeszłości)` : ""}`);
  if (removed) parts.push(`usunięto: ${removed}`);
  return { ok: `${parts.join(", ") || "Brak zmian"}.` };
};

/** Zmiany z kalendarza: nowe terminy (data + godzina) i usunięcie wolnych. */
export async function applySlotChangesAction(input: { therapistId?: string; minutes: number; add: { date: string; time: string }[]; remove: string[] }): Promise<R> {
  const s = await requireStaff();
  const therapistId = therapistFor(s, input.therapistId);
  if (!therapistId) return { error: "Wybierz psychologa." };
  const minutes = input.minutes === 90 ? 90 : 60;
  const add = (input.add ?? []).filter((a) => DATE.test(a.date) && TIME.test(a.time)).slice(0, 200);
  const remove = (input.remove ?? []).filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 200);
  const res = await asStaff(s, async (tx) => {
    let removed = 0;
    for (const id of remove) {
      // usuwamy tylko wolne terminy tej osoby; zarezerwowanych nie da się usunąć
      const r = await tx`delete from booking_slots where id = ${id} and therapist_id = ${therapistId} and status = 'free' returning id`;
      removed += r.length;
    }
    let added = 0;
    for (const a of add) if (await addOne(tx, therapistId, zonedToUtc(a.date, a.time.padStart(5, "0")), minutes, s.user.id)) added++;
    if (added || removed) await audit(tx, s.actor, "slots_changed", "therapist", therapistId, null, { added, removed });
    return { added, removed };
  });
  revalidatePath("/app/terminy");
  return done(res.added, add.length, res.removed);
}

/** Wzór: wybrane dni tygodnia, godziny od–do co X minut, w zakresie dat. */
export async function fillPatternAction(input: { therapistId?: string; from: string; to: string; days: number[]; start: string; end: string; every: number; minutes: number }): Promise<R> {
  const s = await requireStaff();
  const therapistId = therapistFor(s, input.therapistId);
  if (!therapistId) return { error: "Wybierz psychologa." };
  if (!DATE.test(input.from) || !DATE.test(input.to) || input.to < input.from) return { error: "Sprawdź zakres dat." };
  if (!TIME.test(input.start) || !TIME.test(input.end) || toMin(input.end) <= toMin(input.start)) return { error: "Godzina końca musi być po godzinie początku." };
  if (!input.days?.length) return { error: "Zaznacz co najmniej jeden dzień tygodnia." };
  const minutes = input.minutes === 90 ? 90 : 60;
  const every = Math.max(minutes, [60, 90, 120].includes(input.every) ? input.every : minutes);
  const starts: { date: string; time: string }[] = [];
  for (let d = input.from, i = 0; d <= input.to && i < 120; d = addDays(d, 1), i++) {
    if (!input.days.includes(weekday(d))) continue;
    for (let m = toMin(input.start); m + minutes <= toMin(input.end); m += every) starts.push({ date: d, time: fromMin(m) });
  }
  if (!starts.length) return { error: "Wzór nie daje żadnego terminu – wydłuż godziny albo zakres dat." };
  if (starts.length > 300) return { error: `To ${starts.length} terminów naraz – skróć zakres (maks. 300).` };
  const added = await asStaff(s, async (tx) => {
    let n = 0;
    for (const a of starts) if (await addOne(tx, therapistId, zonedToUtc(a.date, a.time), minutes, s.user.id)) n++;
    if (n) await audit(tx, s.actor, "slots_pattern", "therapist", therapistId, null, { added: n });
    return n;
  });
  revalidatePath("/app/terminy");
  return done(added, starts.length);
}

/** Kopiuje terminy z danego tygodnia (wolne i zarezerwowane – jako wolne) na kolejne tygodnie. */
export async function copyWeekAction(input: { therapistId?: string; weekStart: string; weeks: number }): Promise<R> {
  const s = await requireStaff();
  const therapistId = therapistFor(s, input.therapistId);
  if (!therapistId || !DATE.test(input.weekStart)) return { error: "Brak danych tygodnia." };
  const weeks = Math.min(12, Math.max(1, Math.floor(input.weeks) || 1));
  const res = await asStaff(s, async (tx) => {
    const src = await tx<{ starts_at: Date; minutes: number }[]>`
      select starts_at, minutes from booking_slots where therapist_id = ${therapistId} and status <> 'cancelled'
        and starts_at >= ${zonedToUtc(input.weekStart, "00:00")} and starts_at < ${zonedToUtc(addDays(input.weekStart, 7), "00:00")}`;
    let n = 0;
    for (let w = 1; w <= weeks; w++)
      for (const x of src) {
        const p = warsawParts(new Date(x.starts_at));
        if (await addOne(tx, therapistId, zonedToUtc(addDays(p.date, 7 * w), p.time), x.minutes, s.user.id)) n++;
      }
    if (n) await audit(tx, s.actor, "slots_week_copied", "therapist", therapistId, null, { added: n, weeks });
    return { n, tried: src.length * weeks };
  });
  if (!res.tried) return { error: "W tym tygodniu nie ma terminów do skopiowania." };
  revalidatePath("/app/terminy");
  return done(res.n, res.tried);
}

/** Usuwa wszystkie wolne terminy w tygodniu (zarezerwowane zostają). */
export async function clearWeekAction(input: { therapistId?: string; weekStart: string }): Promise<R> {
  const s = await requireStaff();
  const therapistId = therapistFor(s, input.therapistId);
  if (!therapistId || !DATE.test(input.weekStart)) return { error: "Brak danych tygodnia." };
  const n = await asStaff(s, async (tx) => {
    const r = await tx`delete from booking_slots where therapist_id = ${therapistId} and status = 'free'
      and starts_at >= ${zonedToUtc(input.weekStart, "00:00")} and starts_at < ${zonedToUtc(addDays(input.weekStart, 7), "00:00")} returning id`;
    if (r.length) await audit(tx, s.actor, "slots_week_cleared", "therapist", therapistId, null, { removed: r.length });
    return r.length;
  });
  revalidatePath("/app/terminy");
  return { ok: n ? `Usunięto wolne terminy: ${n}.` : "W tym tygodniu nie było wolnych terminów." };
}
