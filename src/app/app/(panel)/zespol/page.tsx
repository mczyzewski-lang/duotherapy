import Link from "next/link";
import { createMemberAction } from "@/actions/team";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Alert, Badge, Card, Field, Input, PageTitle, Select } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { system } from "@/lib/db";

export const metadata = { title: "Zespół" };
export const dynamic = "force-dynamic";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const s = await requireStaff("admin");
  const sp = await searchParams;
  const team = await asStaff(s, (tx) => tx`
    select u.id, u.email, u.name, u.role, u.mfa_enabled, u.disabled, u.locked_until, u.created_at,
           t.display_name, t.title, t.is_public,
           (select count(*)::int from cases c where c.therapist_id = t.id and c.status <> 'closed') as open_cases,
           (select count(*)::int from cases c where c.therapist_id = t.id) as all_cases
    from users u left join therapists t on t.user_id = u.id
    order by u.disabled, u.role, u.name`);
  // ostatnie logowanie – tabela sesji dostępna tylko dla roli systemowej
  const last = await system((tx) => tx<{ user_id: string; at: Date }[]>`select user_id, max(created_at) as at from auth_sessions group by user_id`);
  const lastBy = new Map(last.map((r) => [r.user_id, r.at]));
  const active = team.filter((u) => !u.disabled);
  return (
    <>
      <PageTitle title="Zespół" sub="Konta administratorów i psychologów: role, profile na stronie, hasła, MFA i dostęp." />
      {sp.deleted && <Alert tone="ok" className="mb-6">Konto zostało usunięte.</Alert>}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden p-0" data-testid="team-list">
          <div className="flex items-center justify-between border-b border-sand px-5 py-4">
            <h2 className="font-display text-xl text-ink">Osoby</h2>
            <p className="text-sm text-muted">{active.length} aktywnych · {team.length - active.length} wyłączonych</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-linen/50 text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-5 py-2.5 font-semibold">Osoba</th><th className="px-3 py-2.5 font-semibold">Rola</th><th className="px-3 py-2.5 font-semibold">Sprawy</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Ostatnie logowanie</th></tr>
              </thead>
              <tbody className="divide-y divide-sand/70">
                {team.map((u) => {
                  const locked = u.locked_until && new Date(u.locked_until) > new Date();
                  const at = lastBy.get(u.id);
                  return (
                    <tr key={u.id} className={u.disabled ? "text-muted" : ""} data-testid="team-row">
                      <td className="px-5 py-3">
                        <Link href={`/app/zespol/${u.id}`} className="font-medium text-forest hover:underline">{u.name}</Link>
                        <p className="text-xs text-muted">{u.email}{u.title ? ` · ${u.title}` : ""}</p>
                      </td>
                      <td className="px-3 py-3">{u.role === "admin" ? <Badge tone="forest">administrator</Badge> : <Badge>psycholog</Badge>}</td>
                      <td className="px-3 py-3">{u.open_cases} <span className="text-xs text-muted">/ {u.all_cases}</span></td>
                      <td className="space-x-1 px-3 py-3">
                        {u.disabled ? <Badge tone="alert">wyłączone</Badge> : <Badge tone="ok">aktywne</Badge>}
                        {locked && <Badge tone="alert">zablokowane</Badge>}
                        {u.mfa_enabled ? <Badge tone="ok">MFA</Badge> : <Badge tone="clay">bez MFA</Badge>}
                        {u.is_public && <Badge>na stronie</Badge>}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">{at ? new Date(at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" }) : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-6" data-testid="team-add">
          <h2 className="font-display text-xl text-ink">Dodaj osobę</h2>
          <p className="mt-1 text-sm text-muted">Psycholog widzi tylko swoje sprawy. Administrator ma dostęp do całego panelu.</p>
          <ActionForm action={createMemberAction as never} className="mt-4 space-y-3">
            <Field label="Imię i nazwisko" htmlFor="nm"><Input id="nm" name="name" required /></Field>
            <Field label="E-mail (login)" htmlFor="em"><Input id="em" name="email" type="email" required /></Field>
            <Field label="Tytuł zawodowy" hint="np. psycholog, psychoterapeutka – widoczny w podsumowaniach" htmlFor="tt"><Input id="tt" name="title" /></Field>
            <Field label="Rola" htmlFor="rl"><Select id="rl" name="role"><option value="therapist">psycholog</option><option value="admin">administrator</option></Select></Field>
            <Field label="Hasło tymczasowe" hint="Zostaw puste – wygenerujemy bezpieczne hasło i pokażemy je raz." htmlFor="pw"><Input id="pw" name="password" type="password" autoComplete="new-password" /></Field>
            <SubmitButton size="sm">Dodaj osobę</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
