import Link from "next/link";
import { createDraftAction } from "@/actions/admin";
import { SubmitButton } from "@/components/form-bits";
import { Badge, Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { TEMPLATE_LABELS } from "@/questionnaires";

export const metadata = { title: "Kwestionariusze" };

export default async function Templates() {
  const s = await requireStaff("admin");
  const rows = await asStaff(s, (tx) => tx`
    select t.id, t.key, v.id as vid, v.version, v.status, v.needs_verification, v.published_at, v.change_note,
      (select count(*)::int from questions q where q.version_id = v.id) as n,
      (select count(*)::int from participants p where p.template_version_id = v.id) as used
    from questionnaire_templates t join questionnaire_template_versions v on v.template_id = t.id order by t.key, v.version desc`);
  const keys = [...new Set(rows.map((r) => r.key))];
  return (
    <>
      <PageTitle title="Kwestionariusze" sub="Wersjonowane szablony. Sprawa zachowuje wersję przypiętą przy jej zakładaniu – publikacja nowej wersji nie zmienia starych odpowiedzi ani podsumowanieów." />
      <div className="grid gap-5 lg:grid-cols-2">
        {keys.map((k) => {
          const vs = rows.filter((r) => r.key === k);
          const hasDraft = vs.some((v) => v.status === "draft");
          return (
            <Card key={k} className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">{TEMPLATE_LABELS[k as keyof typeof TEMPLATE_LABELS]}</h2>
                <form action={createDraftAction}><input type="hidden" name="template_id" value={vs[0].id} /><SubmitButton size="sm" variant="secondary">{hasDraft ? "Otwórz szkic" : "Nowa wersja (szkic)"}</SubmitButton></form>
              </div>
              <ul className="mt-4 divide-y divide-sand/70 text-sm">
                {vs.map((v) => (
                  <li key={v.vid} className="flex items-center justify-between gap-2 py-2">
                    <Link href={`/app/templates/${v.vid}`} className="text-forest">Wersja {v.version}</Link>
                    <span className="flex flex-wrap items-center gap-1">
                      <Badge tone={v.status === "published" ? "ok" : v.status === "draft" ? "clay" : "neutral"}>{{ published: "opublikowana", draft: "szkic", archived: "archiwalna" }[v.status as string]}</Badge>
                      {v.needs_verification && <Badge tone="alert">do weryfikacji</Badge>}
                      <span className="text-xs text-muted">{v.n} poz. · w {v.used} sprawach</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
