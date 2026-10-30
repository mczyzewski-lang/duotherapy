import { createCaseAction } from "@/actions/cases";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { NewCaseFields } from "@/components/panel/new-case-fields";
import { Card, PageTitle } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";

export const metadata = { title: "Nowa sprawa" };

export default async function NewCase() {
  const s = await requireStaff();
  const therapists = await asStaff(s, (tx) => tx`select id, display_name from therapists order by display_name`);
  return (
    <>
      <PageTitle title="Nowa sprawa" sub="Do sprawy zostanie przypięta aktualnie opublikowana wersja właściwego kwestionariusza." />
      <Card className="max-w-2xl p-6">
        <ActionForm action={createCaseAction as never} className="space-y-4">
          <NewCaseFields therapists={therapists.map((t) => ({ id: t.id, name: t.display_name }))} defaultTherapist={s.user.therapistId ?? ""} isAdmin={s.user.role === "admin"} />
          <SubmitButton>Załóż sprawę</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
