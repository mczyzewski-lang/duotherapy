import { CalendarCheck } from "lucide-react";
import { type CalSlot, SlotCalendar } from "@/components/panel/slot-calendar";
import { Alert, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { fmtWarsaw, zonedToUtc } from "@/lib/orders";
import { addDays, mondayOf, todayWarsaw, toMin, warsawParts } from "@/lib/slot-dates";

export const metadata = { title: "Terminy" };
export const dynamic = "force-dynamic";

export default async function SlotsPage({ searchParams }: { searchParams: Promise<{ w?: string; t?: string }> }) {
  const s = await requireStaff();
  const sp = await searchParams;
  const today = todayWarsaw();
  const weekStart = mondayOf(/^\d{4}-\d{2}-\d{2}$/.test(sp.w ?? "") ? sp.w! : today);
  const isAdmin = s.user.role === "admin";
  const d = await asStaff(s, async (tx) => {
    const therapists = isAdmin ? await tx<{ id: string; display_name: string }[]>`select t.id, t.display_name from therapists t join users u on u.id = t.user_id where not u.disabled order by t.display_name` : [];
    const therapistId = isAdmin ? (therapists.find((t) => t.id === sp.t)?.id ?? s.user.therapistId ?? therapists[0]?.id ?? "") : s.user.therapistId ?? "";
    const rows = therapistId
      ? await tx<{ id: string; starts_at: Date; minutes: number; status: "free" | "booked"; client: string | null; case_id: string | null }[]>`
          select b.id, b.starts_at, b.minutes, b.status, l.name as client, o.case_id
          from booking_slots b left join orders o on o.id = b.order_id left join leads l on l.id = o.lead_id
          where b.therapist_id = ${therapistId} and b.status <> 'cancelled'
            and b.starts_at >= ${zonedToUtc(weekStart, "00:00")} and b.starts_at < ${zonedToUtc(addDays(weekStart, 7), "00:00")}
          order by b.starts_at`
      : [];
    const upcoming = therapistId
      ? await tx<{ id: string; starts_at: Date; minutes: number; client: string | null; case_id: string | null }[]>`
          select b.id, b.starts_at, b.minutes, l.name as client, o.case_id
          from booking_slots b left join orders o on o.id = b.order_id left join leads l on l.id = o.lead_id
          where b.therapist_id = ${therapistId} and b.status = 'booked' and b.starts_at > now() - interval '2 hours'
          order by b.starts_at limit 8`
      : [];
    const [{ free }] = therapistId
      ? await tx<{ free: number }[]>`select count(*)::int as free from booking_slots where therapist_id = ${therapistId} and status = 'free' and starts_at > now()`
      : [{ free: 0 }];
    return { therapists, therapistId, rows, upcoming, free };
  });
  const slots: CalSlot[] = d.rows.map((r) => ({ id: r.id, ...warsawParts(new Date(r.starts_at)), minutes: r.minutes, status: r.status, client: r.client, caseId: r.case_id }));
  const now = warsawParts(new Date());

  return (
    <>
      <PageTitle title="Terminy konsultacji" sub="Wolne terminy, które klient rezerwuje od razu po zakupie Mapy Relacji online. Czas: Europa/Warszawa." />
      {!d.therapistId ? (
        <Alert tone="warn">To konto nie ma profilu psychologa. Wybierz osobę w zakładce Zespół albo dodaj profil.</Alert>
      ) : (
        <div className="space-y-6">
          {d.free === 0 && (
            <Alert tone="warn">Nie ma żadnych wolnych terminów w przyszłości. Klient po zakupie zobaczy informację, że konsultant zadzwoni i ustali termin.</Alert>
          )}
          <SlotCalendar
            key={`${weekStart}-${d.therapistId}`}
            weekStart={weekStart}
            today={today}
            nowMin={toMin(now.time)}
            slots={slots}
            therapistId={d.therapistId}
            therapists={d.therapists.map((t) => ({ id: t.id, name: t.display_name }))}
            isAdmin={isAdmin}
          />
          <Card className="p-5" data-testid="upcoming-bookings">
            <h2 className="flex items-center gap-2 font-display text-lg text-ink"><CalendarCheck size={18} className="text-forest" aria-hidden /> Najbliższe rezerwacje <span className="text-sm text-muted">· wolnych terminów w przyszłości: {d.free}</span></h2>
            {d.upcoming.length ? (
              <ul className="mt-3 divide-y divide-sand/70 text-sm">
                {d.upcoming.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="first-letter:uppercase">{fmtWarsaw(new Date(u.starts_at), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} · {u.minutes} min</span>
                    <span className="flex items-center gap-3">
                      <strong className="font-medium text-ink">{u.client ?? "Klient"}</strong>
                      {u.case_id && <a href={`/app/cases/${u.case_id}`} className="text-forest hover:underline">sprawa →</a>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Brak nadchodzących rezerwacji.</p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
