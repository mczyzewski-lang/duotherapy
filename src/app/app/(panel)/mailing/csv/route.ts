// Eksport e-maili nurturingu do CSV (tylko administrator).
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import type { StepRow } from "@/lib/mailing";
import { stepsToCsv } from "@/lib/mailing-csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireStaff("admin");
  const steps = await asStaff(s, async (tx) => {
    const r = await tx<StepRow[]>`select * from mail_steps order by sequence_id desc, position`;
    await audit(tx, s.actor, "mail_steps_exported", "mail_step", null, null, { count: r.length });
    return r;
  });
  const day = new Date().toISOString().slice(0, 10);
  return new Response(stepsToCsv(steps), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="duo-emaile-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
