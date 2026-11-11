// Materiał „Wiedza” nr 10 (przykładowa Mapa Relacji): /wiedza/przykladowa-mapa-relacji/demo i /material (przepisane w next.config).
// Ten sam generator podsumowań co PDF dla klienta, dane fikcyjne, wprowadzenie o ograniczeniach.
import { magnetBySlug, mapaHref, SAMPLE_INTRO } from "@/knowledge/registry";
import { embeddedFontCss } from "@/lib/pdf";
import { renderReportHtml } from "@/lib/report";
import { SAMPLE_REPORT } from "@/lib/report-sample";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (view !== "demo" && view !== "material") return new Response("Nie znaleziono", { status: 404 });
  const m = magnetBySlug("przykladowa-mapa-relacji")!;
  const settings = await getSettings();
  const html = renderReportHtml(SAMPLE_REPORT, settings, {
    fontCss: embeddedFontCss(),
    sample: true,
    intro: SAMPLE_INTRO,
    topTitle: view === "demo" ? "Podgląd materiału DUO · Przykładowa Mapa Relacji" : "Twój materiał DUO · Przykładowa Mapa Relacji",
    back: { href: `/wiedza/${m.slug}`, label: "← opis materiału" },
    bottomCta: { text: `Własna Mapa Relacji z psychologiem – ${settings.offer.pricePln} zł`, href: mapaHref(m, `report_${view}`), label: "Poznaj usługę →" },
  });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" } });
}
