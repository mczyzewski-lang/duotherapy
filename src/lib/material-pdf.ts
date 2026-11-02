// PDF materiałów „Wiedza” – generowany z kanonicznego źródła i buforowany według skrótu treści.
import { contentHash } from "@/knowledge/hash";
import { SAMPLE_INTRO } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";
import { embeddedFontCss, htmlToPdf, urlToPdf } from "./pdf";
import { renderReportHtml } from "./report";
import { SAMPLE_REPORT } from "./report-sample";
import { readSettings } from "./settings";
import { system } from "./db";

const cache = new Map<string, Promise<Buffer>>();

export async function materialPdf(m: LeadMagnet, origin: string): Promise<Buffer> {
  const key = `${m.slug}:${contentHash(m)}`;
  if (!cache.has(key)) {
    const job = (async () => {
      if (m.special === "sample-report") {
        const s = await system((tx) => readSettings(tx));
        // przykładowy raport = prawdziwy generator podsumowań (ten sam szablon co PDF dla klienta)
        return htmlToPdf(renderReportHtml(SAMPLE_REPORT, s, { fontCss: embeddedFontCss(), sample: true, intro: SAMPLE_INTRO }));
      }
      return urlToPdf(`${process.env.INTERNAL_URL || origin}/wiedza/${m.slug}/druk`, `DUO® · ${m.short} · bezpłatny materiał edukacyjny`);
    })();
    cache.set(key, job);
    job.catch(() => cache.delete(key));
  }
  return cache.get(key)!;
}
