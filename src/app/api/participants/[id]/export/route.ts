// Eksport danych uczestnika (prawo dostępu / przenoszenia). Tylko dla uprawnionego specjalisty.
import { NextResponse } from "next/server";
import { formatAnswer } from "@/lib/analysis";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { loadAnswers } from "@/lib/cases";
import { loadVersion } from "@/lib/templates";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireStaff();
  const data = await asStaff(s, async (tx) => {
    const [p] = await tx`select id, case_id, display_name, email, phone, q_status, q_submitted_at, template_version_id, created_at from participants where id = ${id}`;
    if (!p) return null;
    const v = (await loadVersion(tx, p.template_version_id))!;
    const answers = await loadAnswers(tx, id);
    const consents = await tx`select kind, granted, text_version, text_snapshot, scope, created_at from consents where participant_id = ${id} order by created_at`;
    await audit(tx, s.actor, "participant_exported", "participant", id, p.case_id);
    return {
      exported_at: new Date().toISOString(),
      participant: { name: p.display_name, email: p.email, phone: p.phone, questionnaire_status: p.q_status, submitted_at: p.q_submitted_at },
      questionnaire: { title: v.title, version: v.version },
      answers: v.sections.flatMap((sec) =>
        sec.questions.filter((q) => q.type !== "info").map((q) => {
          const a = answers.find((x) => x.question_id === q.id);
          return { section: sec.title, question: q.prompt, answer: a ? formatAnswer(q, a) : null };
        }),
      ),
      consents,
    };
  });
  if (!data) return NextResponse.json({ error: "Brak dostępu" }, { status: 404 });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="eksport-uczestnika-${id.slice(0, 8)}.json"`, "cache-control": "no-store" },
  });
}
