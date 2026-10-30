import type { CaseRow } from "@/components/panel/cases-table";
import type { Tx } from "./db";

export async function listCases(tx: Tx, f: { q?: string; status?: string; kind?: string; therapist?: string; risk?: boolean; limit?: number }): Promise<CaseRow[]> {
  const q = f.q?.trim() ? `%${f.q.trim()}%` : null;
  return tx<CaseRow[]>`
    select c.id, c.ref, c.kind, c.status, c.session_at, c.payment_status, c.updated_at, t.display_name as therapist_name,
      (select string_agg(display_name, ' & ' order by position) from participants where case_id = c.id) as names,
      (select string_agg(case q_status when 'submitted' then '✓' when 'not_started' then '–' else '…' end, ' / ' order by position) from participants where case_id = c.id) as progress,
      exists (select 1 from risk_review_statuses r where r.case_id = c.id and r.status in ('needs_review', 'contacted')) as risk
    from cases c join therapists t on t.id = c.therapist_id
    where (${f.status ?? null}::text is null or c.status = ${f.status ?? null})
      and (${f.kind ?? null}::text is null or c.kind = ${f.kind ?? null})
      and (${f.therapist ?? null}::uuid is null or c.therapist_id = ${f.therapist ?? null})
      and (${q}::text is null or c.ref ilike ${q} or exists (select 1 from participants p where p.case_id = c.id and (p.display_name ilike ${q} or p.email ilike ${q})))
      and (${f.risk ?? false} = false or exists (select 1 from risk_review_statuses r where r.case_id = c.id and r.status in ('needs_review', 'contacted')))
    order by c.updated_at desc limit ${f.limit ?? 200}`;
}
