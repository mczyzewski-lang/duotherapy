// Przykładowa Mapa Relacji: prawdziwy szablon podsumowania (renderReportHtml) z danymi FIKCYJNYMI.
import { embeddedFontCss } from "@/lib/pdf";
import { renderReportHtml } from "@/lib/report";
import { SAMPLE_REPORT } from "@/lib/report-sample";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const html = renderReportHtml(SAMPLE_REPORT, await getSettings(), { fontCss: embeddedFontCss(), draft: false, sample: true });
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300", "x-robots-tag": "noindex" },
  });
}
