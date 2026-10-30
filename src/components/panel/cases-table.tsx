import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { statusLabel } from "@/lib/cases";

export interface CaseRow {
  id: string;
  ref: string;
  kind: string;
  status: string;
  therapist_name: string;
  names: string;
  progress: string;
  risk: boolean;
  session_at: Date | null;
  payment_status: string;
  updated_at: Date;
}

export function CasesTable({ rows }: { rows: CaseRow[] }) {
  if (!rows.length) return <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted ring-1 ring-sand">Brak spraw spełniających kryteria.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-sand">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-linen/60 text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Sprawa</th>
            <th className="px-4 py-3 font-medium">Uczestnicy</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Ankiety</th>
            <th className="px-4 py-3 font-medium">Sesja</th>
            <th className="px-4 py-3 font-medium">Prowadzący</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand/70">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-ivory">
              <td className="px-4 py-3">
                <Link href={`/app/cases/${r.id}`} className="font-medium text-forest hover:underline">{r.ref}</Link>
                <div className="text-xs text-muted">{r.kind === "couple" ? "para · 90 min" : "indywidualny · 60 min"}</div>
              </td>
              <td className="px-4 py-3 text-ink">
                {r.names}
                {r.risk && (
                  <Badge tone="alert" className="ml-2"><AlertTriangle size={12} aria-hidden /> pilny przegląd</Badge>
                )}
              </td>
              <td className="px-4 py-3"><Badge tone={r.status === "closed" ? "neutral" : "forest"}>{statusLabel(r.status)}</Badge>{r.payment_status === "unpaid" && <Badge tone="clay" className="ml-1">nieopłacone</Badge>}</td>
              <td className="px-4 py-3 text-ink-soft">{r.progress}</td>
              <td className="px-4 py-3 text-ink-soft">{r.session_at ? new Date(r.session_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
              <td className="px-4 py-3 text-ink-soft">{r.therapist_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
