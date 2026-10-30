import Link from "next/link";
import { notFound } from "next/navigation";
import { revokeShareAction } from "@/actions/reports";
import { SubmitButton } from "@/components/form-bits";
import { ReportEditor } from "@/components/panel/report-editor";
import { Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { decrypt } from "@/lib/crypto";
import type { ReportContent } from "@/lib/report";
import { readSettings } from "@/lib/settings";

export const metadata = { title: "Raport" };

export default async function ReportPage({ params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = await params;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const [r] = await tx`select r.*, c.ref, c.kind from reports r join cases c on c.id = r.case_id where r.id = ${rid} and r.case_id = ${id}`;
    if (!r) return null;
    const [v] = await tx`select * from report_versions where report_id = ${rid} order by version desc limit 1`;
    const [ap] = await tx`select version from report_versions where report_id = ${rid} and approved_at is not null order by version desc limit 1`;
    const parts = await tx`select id, display_name from participants where case_id = ${id} and anonymized_at is null order by position`;
    const shares = await tx`select s.*, p.display_name, v.version from report_shares s join participants p on p.id = s.participant_id join report_versions v on v.id = s.report_version_id where s.report_id = ${rid} order by s.created_at desc`;
    const settings = await readSettings(tx);
    await audit(tx, s.actor, "report_opened", "report", rid, id);
    return { r, v, ap, parts, shares, settings };
  });
  if (!d) notFound();
  const content = decrypt<ReportContent>(d.v.content_enc)!;
  const recipients = d.r.audience === "participant" ? d.parts.filter((p) => p.id === d.r.participant_id) : d.parts;
  return (
    <>
      <p className="mb-2 text-sm"><Link href={`/app/cases/${id}`} className="text-forest">← {d.r.ref}</Link></p>
      <PageTitle
        title={d.r.audience === "joint" ? "Raport wspólny" : `Raport osobny: ${recipients[0]?.display_name ?? ""}`}
        sub="Raport po Audycie Relacji – struktura zgodna z szablonem. Każdy zapis tworzy nową wersję; udostępnić można tylko wersję zatwierdzoną."
      />
      <ReportEditor
        reportId={rid}
        initial={content}
        version={d.v.version}
        approvedVersion={d.ap?.version ?? null}
        helplines={d.settings.helplines}
        recipients={recipients.map((p) => ({ id: p.id, name: p.display_name }))}
        audience={d.r.audience}
      />
      {d.shares.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg text-ink">Udostępnienia</h2>
          <ul className="mt-3 divide-y divide-sand/70 text-sm">
            {d.shares.map((sh) => (
              <li key={sh.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{sh.display_name} · wersja {sh.version} · {new Date(sh.created_at).toLocaleString("pl-PL")}{sh.viewed_at ? ` · otwarty ${new Date(sh.viewed_at).toLocaleString("pl-PL")}` : " · nieotwarty"}{sh.revoked_at ? " · cofnięty" : ""}</span>
                {!sh.revoked_at && <form action={revokeShareAction}><input type="hidden" name="share_id" value={sh.id} /><SubmitButton size="sm" variant="ghost">Cofnij dostęp</SubmitButton></form>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
