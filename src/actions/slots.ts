"use server";

// Wolne terminy konsultacji do rezerwacji online po zakupie Mapy Relacji.
import { revalidatePath } from "next/cache";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { zonedToUtc } from "@/lib/orders";

type R = { error?: string; ok?: string } | undefined;

export async function addSlotsAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const date = String(fd.get("date") ?? "");
  const times = String(fd.get("times") ?? "").split(/[\s,;]+/).filter(Boolean);
  const minutes = Number(fd.get("minutes")) === 90 ? 90 : 60;
  const therapistId = s.user.role === "admin" ? String(fd.get("therapist_id") || s.user.therapistId || "") : s.user.therapistId ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Wybierz dzień." };
  if (!times.length || times.some((t) => !/^([01]?\d|2[0-3]):[0-5]\d$/.test(t))) return { error: "Godziny w formacie 10:00, 12:30 (oddzielone przecinkami)." };
  if (!therapistId) return { error: "Wybierz psychologa." };
  const starts = times.map((t) => zonedToUtc(date, t.padStart(5, "0")));
  if (starts.some((d) => d.getTime() < Date.now())) return { error: "Nie można dodać terminu w przeszłości." };
  const added = await asStaff(s, async (tx) => {
    let n = 0;
    for (const at of starts) {
      const r = await tx`insert into booking_slots (therapist_id, starts_at, minutes, created_by) values (${therapistId}, ${at}, ${minutes}, ${s.user.id})
                         on conflict (therapist_id, starts_at) do nothing returning id`;
      n += r.length;
    }
    await audit(tx, s.actor, "slots_added", "therapist", therapistId, null, { count: n });
    return n;
  });
  revalidatePath("/app/terminy");
  return { ok: `Dodano terminy: ${added}${added < starts.length ? ` (pominięto ${starts.length - added} istniejące)` : ""}.` };
}

export async function deleteSlotAction(fd: FormData) {
  const s = await requireStaff();
  const id = String(fd.get("slot_id"));
  await asStaff(s, async (tx) => {
    // usuwamy tylko wolne terminy; zarezerwowanych nie da się usunąć z tej listy
    const r = await tx`delete from booking_slots where id = ${id} and status = 'free' returning id`;
    if (r.length) await audit(tx, s.actor, "slot_deleted", "booking_slot", id);
  });
  revalidatePath("/app/terminy");
}
