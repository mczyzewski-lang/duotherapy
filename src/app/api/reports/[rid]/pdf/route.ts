// PDF najnowszej wersji podsumowania – tylko dla uprawnionego specjalisty. Generowany lokalnie.
import { NextResponse } from "next/server";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { decrypt } from "@/lib/crypto";
import { embeddedFontCss, htmlToPdf } from "@/lib/pdf";
import { renderReportHtml, type ReportContent } from "@/lib/report";
import { readSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ rid: string }> }) {
  const { rid } = await params;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const [v] = await tx`select v.*, r.case_id from report_versions v join reports r on r.id = v.report_id where v.report_id = ${rid} order by version desc limit 1`;
    if (!v) return null;
    await audit(tx, s.actor, "report_pdf_exported", "report", rid, v.case_id, { version: v.version });
    return { v, settings: await readSettings(tx) };
  });
  if (!d) return NextResponse.json({ error: "Brak dostępu" }, { status: 404 });
  const content = decrypt<ReportContent>(d.v.content_enc)!;
  const pdf = await htmlToPdf(renderReportHtml(content, d.settings, { fontCss: embeddedFontCss(), draft: !d.v.approved_at }));
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="podsumowanie-audyt-relacji-v${d.v.version}.pdf"`, "cache-control": "no-store" },
  });
}
