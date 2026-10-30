import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { decrypt } from "@/lib/crypto";
import { withActor } from "@/lib/db";
import { embeddedFontCss, htmlToPdf } from "@/lib/pdf";
import { renderReportHtml, type ReportContent } from "@/lib/report";
import { sharedReport } from "@/lib/report-share";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rep = await sharedReport(token);
  if (!rep) return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  await withActor({ kind: "report_viewer", shareId: rep.shareId }, (tx) => audit(tx, { kind: "report_viewer", shareId: rep.shareId }, "report_share_pdf", "report_share", rep.shareId));
  const pdf = await htmlToPdf(renderReportHtml(decrypt<ReportContent>(rep.content_enc)!, await getSettings(), { fontCss: embeddedFontCss() }));
  return new NextResponse(new Uint8Array(pdf), { headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="raport-audyt-relacji.pdf"', "cache-control": "no-store" } });
}
