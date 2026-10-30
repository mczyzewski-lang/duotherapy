import { Download } from "lucide-react";
import { Logo } from "@/components/ui";
import { decrypt } from "@/lib/crypto";
import { renderReportHtml, type ReportContent } from "@/lib/report";
import { shareStatus, sharedReport } from "@/lib/report-share";
import { getSettings } from "@/lib/settings";
import { ReportCode } from "./code";

export const dynamic = "force-dynamic";
export const metadata = { title: "Podsumowanie sesji", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function SharedReport({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const st = await shareStatus(token);
  const rep = st?.active ? await sharedReport(token) : null;
  const settings = await getSettings();
  return (
    <main id="main" className="mx-auto max-w-4xl px-5 py-10">
      <Logo />
      {!st?.active ? (
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-sand"><h1 className="font-display text-3xl">Link jest nieaktywny</h1><p className="mt-3 text-ink-soft">Skontaktuj się z psychologiem prowadzącym.</p></div>
      ) : !rep ? (
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-sand">
          <h1 className="font-display text-3xl text-ink">Twoje podsumowanie sesji</h1>
          <p className="mt-3 text-ink-soft">Podsumowanie jest poufne. Wpisz kod dostępu przekazany przez psychologa.</p>
          <ReportCode token={token} />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-3xl text-ink">Podsumowanie sesji</h1>
            <a href={`/r/${token}/pdf`} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white"><Download size={16} aria-hidden /> Pobierz PDF</a>
          </div>
          <iframe title="Podsumowanie" sandbox="" srcDoc={renderReportHtml(decrypt<ReportContent>(rep.content_enc)!, settings)} className="mt-6 h-[1400px] w-full rounded-2xl bg-white shadow-soft ring-1 ring-sand" />
        </>
      )}
    </main>
  );
}
