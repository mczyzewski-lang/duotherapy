import { addSlotsAction, deleteSlotAction } from "@/actions/slots";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card, Field, Input, PageTitle, Select } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { fmtWarsaw } from "@/lib/orders";

export const metadata = { title: "Terminy" };

export default async function SlotsPage() {
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => ({
    therapists: s.user.role === "admin" ? await tx`select id, display_name from therapists order by display_name` : [],
    slots: await tx`
      select b.id, b.starts_at, b.minutes, b.status, t.display_name as therapist, l.name as client, o.case_id
      from booking_slots b join therapists t on t.id = b.therapist_id
      left join orders o on o.id = b.order_id left join leads l on l.id = o.lead_id
      where b.starts_at > now() - interval '1 day' order by b.starts_at limit 300`,
  }));
  const free = d.slots.filter((x) => x.status === "free").length;
  return (
    <>
      <PageTitle title="Terminy konsultacji" sub="Wolne terminy, które klient może zarezerwować od razu po zakupie Mapy Relacji online. Czas: Europe/Warsaw." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-max p-6">
          <h2 className="font-display text-lg text-ink">Dodaj wolne terminy</h2>
          <ActionForm action={addSlotsAction as never} className="mt-4 space-y-4">
            {s.user.role === "admin" && (
              <Field label="Psycholog" htmlFor="th">
                <Select id="th" name="therapist_id" defaultValue={s.user.therapistId ?? ""}>
                  {d.therapists.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Dzień" htmlFor="date"><Input id="date" type="date" name="date" required /></Field>
            <Field label="Godziny rozpoczęcia" htmlFor="times" hint="np. 9:00, 12:00, 17:30"><Input id="times" name="times" placeholder="9:00, 12:00, 17:30" required /></Field>
            <Field label="Długość" htmlFor="min">
              <Select id="min" name="minutes" defaultValue="60"><option value="60">60 min – konsultacja indywidualna (sprzedaż online)</option><option value="90">90 min – konsultacja dla pary</option></Select>
            </Field>
            <SubmitButton size="sm">Dodaj terminy</SubmitButton>
          </ActionForm>
          <p className="mt-4 text-xs text-muted">Online rezerwowane są tylko terminy 60-minutowe (wariant indywidualny). Terminy dla par ustala konsultant.</p>
        </Card>
        <Card className="overflow-x-auto p-6">
          <h2 className="font-display text-lg text-ink">Najbliższe terminy <span className="text-sm text-muted">· wolne: {free}</span></h2>
          {d.slots.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Brak terminów. Bez wolnych terminów klient po zakupie zobaczy informację, że konsultant zadzwoni i ustali termin.</p>
          ) : (
            <table className="mt-4 w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="py-2">Termin</th><th>Psycholog</th><th>Status</th><th /></tr></thead>
              <tbody className="divide-y divide-sand/60">
                {d.slots.map((x) => (
                  <tr key={x.id}>
                    <td className="py-2 text-ink first-letter:uppercase">{fmtWarsaw(new Date(x.starts_at), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {x.minutes} min</td>
                    <td>{x.therapist}</td>
                    <td>{x.status === "free" ? <Badge tone="ok">wolny</Badge> : x.status === "booked" ? <Badge tone="forest">{x.client ?? "zarezerwowany"}</Badge> : <Badge>odwołany</Badge>}</td>
                    <td className="text-right">
                      {x.status === "free" && (
                        <form action={deleteSlotAction}><input type="hidden" name="slot_id" value={x.id} /><button className="text-xs text-clay hover:underline">Usuń</button></form>
                      )}
                      {x.case_id && <a href={`/app/cases/${x.case_id}`} className="text-xs text-forest hover:underline">sprawa</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
