import { PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";

export const metadata = { title: "Dziennik audytowy" };

export default async function AuditPage() {
  const s = await requireStaff("admin");
  const rows = await asStaff(s, (tx) => tx`
    select a.*, u.name, c.ref from audit_logs a left join users u on u.id = a.actor_id left join cases c on c.id = a.case_id order by a.id desc limit 300`);
  return (
    <>
      <PageTitle title="Dziennik audytowy" sub="Dostęp i zmiany: odpowiedzi, zgody, raporty, udostępnienia, logowania. Dziennik nie zawiera treści wrażliwych i jest tylko do dopisywania." />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-sand">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-linen/60 text-left text-xs text-muted"><tr><th className="px-4 py-2">Czas</th><th className="px-4 py-2">Kto</th><th className="px-4 py-2">Działanie</th><th className="px-4 py-2">Obiekt</th><th className="px-4 py-2">Sprawa</th><th className="px-4 py-2">Szczegóły</th></tr></thead>
          <tbody className="divide-y divide-sand/60">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-2 text-muted">{new Date(r.created_at).toLocaleString("pl-PL")}</td>
                <td className="px-4 py-2">{r.name ?? r.actor_kind}</td>
                <td className="px-4 py-2">{r.action}</td>
                <td className="px-4 py-2 text-muted">{r.entity}</td>
                <td className="px-4 py-2">{r.ref ?? ""}</td>
                <td className="px-4 py-2 text-xs text-muted">{Object.keys(r.meta).length ? JSON.stringify(r.meta) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
