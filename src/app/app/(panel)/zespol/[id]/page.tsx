import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMemberAction, memberProfileAction, reassignWorkAction, resetMfaAction, resetPasswordAction, setDisabledAction, unlockAction, updateMemberAction } from "@/actions/team";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";

export const metadata = { title: "Osoba w zespole" };
export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireStaff("admin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asStaff(s, async (tx) => {
    const [u] = await tx`select u.*, t.id as tid, t.display_name, t.title, t.bio, t.is_public from users u left join therapists t on t.user_id = u.id where u.id = ${id}`;
    if (!u) return null;
    return {
      u,
      others: await tx`select t.id, t.display_name from therapists t join users x on x.id = t.user_id where t.user_id <> ${id} and not x.disabled order by t.display_name`,
      cases: u.tid ? await tx`select id, ref, status, kind from cases where therapist_id = ${u.tid} and status <> 'closed' order by created_at desc limit 20` : [],
      log: await tx`select action, created_at from audit_logs where entity_id = ${id} or actor_id = ${id} order by created_at desc limit 12`,
    };
  });
  if (!d) notFound();
  const { u } = d;
  const self = u.id === s.user.id;
  const locked = u.locked_until && new Date(u.locked_until) > new Date();
  return (
    <>
      <p className="mb-2 text-sm"><Link href="/app/zespol" className="text-forest hover:underline">← Zespół</Link></p>
      <PageTitle
        title={<>{u.name} {u.disabled && <Badge tone="alert">wyłączone</Badge>}</>}
        sub={<>{u.email} · {u.role === "admin" ? "administrator" : "psycholog"}{self ? " · to Ty" : ""}</>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6" data-testid="member-account">
          <h2 className="font-display text-xl text-ink">Konto</h2>
          <ActionForm action={updateMemberAction as never} className="mt-4 space-y-3">
            <input type="hidden" name="user_id" value={u.id} />
            <Field label="Imię i nazwisko" htmlFor="nm"><Input id="nm" name="name" defaultValue={u.name} required /></Field>
            <Field label="E-mail (login)" htmlFor="em"><Input id="em" name="email" type="email" defaultValue={u.email} required /></Field>
            <Field label="Rola" htmlFor="rl"><Select id="rl" name="role" defaultValue={u.role}><option value="therapist">psycholog</option><option value="admin">administrator</option></Select></Field>
            <SubmitButton size="sm">Zapisz konto</SubmitButton>
          </ActionForm>
        </Card>

        <Card className="p-6" data-testid="member-profile">
          <h2 className="font-display text-xl text-ink">Profil psychologa</h2>
          <p className="mt-1 text-sm text-muted">Dane w podsumowaniach Mapy Relacji i – po zaznaczeniu – na stronie.</p>
          <ActionForm action={memberProfileAction as never} className="mt-4 space-y-3">
            <input type="hidden" name="user_id" value={u.id} />
            <Field label="Imię i nazwisko (w podsumowaniach)" htmlFor="dn"><Input id="dn" name="display_name" defaultValue={u.display_name ?? u.name} /></Field>
            <Field label="Tytuł zawodowy" htmlFor="ti"><Input id="ti" name="title" defaultValue={u.title ?? ""} /></Field>
            <Field label="Krótki opis" htmlFor="bi"><Textarea id="bi" name="bio" defaultValue={u.bio ?? ""} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_public" defaultChecked={!!u.is_public} className="accent-forest" /> pokaż na stronie</label>
            <SubmitButton size="sm">Zapisz profil</SubmitButton>
          </ActionForm>
        </Card>

        <Card className="p-6" data-testid="member-security">
          <h2 className="font-display text-xl text-ink">Logowanie i bezpieczeństwo</h2>
          <p className="mt-1 flex flex-wrap gap-1.5 text-sm">
            {u.mfa_enabled ? <Badge tone="ok">MFA włączone</Badge> : <Badge tone="clay">bez MFA</Badge>}
            {locked && <Badge tone="alert">zablokowane po nieudanych próbach</Badge>}
            {u.failed_logins > 0 && <Badge>{u.failed_logins} nieudanych prób</Badge>}
          </p>
          <ActionForm action={resetPasswordAction as never} className="mt-4 space-y-3">
            <input type="hidden" name="user_id" value={u.id} />
            <Field label="Nowe hasło" hint="Zostaw puste – wygenerujemy hasło tymczasowe i pokażemy je raz." htmlFor="np"><Input id="np" name="password" type="password" autoComplete="new-password" /></Field>
            <SubmitButton size="sm" variant="secondary" confirm="Ustawić nowe hasło? Aktywne sesje tej osoby zostaną zakończone.">Ustaw nowe hasło</SubmitButton>
          </ActionForm>
          {((u.mfa_enabled && !self) || locked) && <div className="mt-4 flex flex-wrap gap-2 border-t border-sand pt-4">
            {u.mfa_enabled && !self && (
              <ActionForm action={resetMfaAction as never}><input type="hidden" name="user_id" value={u.id} /><SubmitButton size="sm" variant="ghost" confirm="Zresetować MFA? Osoba skonfiguruje je od nowa przy logowaniu.">Resetuj MFA</SubmitButton></ActionForm>
            )}
            {locked && (
              <ActionForm action={unlockAction as never}><input type="hidden" name="user_id" value={u.id} /><SubmitButton size="sm" variant="ghost">Odblokuj logowanie</SubmitButton></ActionForm>
            )}
          </div>}
        </Card>

        <Card className="p-6" data-testid="member-access">
          <h2 className="font-display text-xl text-ink">Dostęp i sprawy</h2>
          <p className="mt-1 text-sm text-muted">Otwarte sprawy: {d.cases.length}{d.cases.length ? " – " : ""}{d.cases.slice(0, 6).map((c, i) => <span key={c.id}>{i ? ", " : ""}<Link href={`/app/cases/${c.id}`} className="text-forest hover:underline">{c.ref}</Link></span>)}{d.cases.length > 6 ? "…" : ""}</p>
          {d.others.length > 0 && (
            <ActionForm action={reassignWorkAction as never} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="user_id" value={u.id} />
              <Field label="Przekaż otwarte sprawy i zgłoszenia do" htmlFor="to"><Select id="to" name="to_therapist" defaultValue="">{[<option key="" value="">– wybierz –</option>, ...d.others.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)]}</Select></Field>
              <SubmitButton size="sm" variant="secondary" confirm="Przekazać wszystkie otwarte sprawy i zgłoszenia tej osoby?">Przekaż</SubmitButton>
            </ActionForm>
          )}
          {!self && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-sand pt-4">
              <ActionForm action={setDisabledAction as never}>
                <input type="hidden" name="user_id" value={u.id} />
                <input type="hidden" name="disable" value={u.disabled ? "0" : "1"} />
                {u.disabled
                  ? <SubmitButton size="sm" variant="secondary">Włącz konto</SubmitButton>
                  : <SubmitButton size="sm" variant="clay" confirm="Wyłączyć konto? Osoba straci dostęp do panelu, sprawy i historia zostaną.">Wyłącz konto</SubmitButton>}
              </ActionForm>
              <ActionForm action={deleteMemberAction as never}>
                <input type="hidden" name="user_id" value={u.id} />
                <SubmitButton size="sm" variant="danger" confirm="Usunąć konto na stałe? Możliwe tylko, gdy osoba nie ma historii w systemie.">Usuń konto</SubmitButton>
              </ActionForm>
            </div>
          )}
        </Card>

        <Card className="p-6 xl:col-span-2">
          <h2 className="font-display text-xl text-ink">Ostatnie zdarzenia</h2>
          {d.log.length ? (
            <ul className="mt-3 divide-y divide-sand/70 text-sm">
              {d.log.map((l, i) => <li key={i} className="flex justify-between gap-3 py-1.5"><span className="font-mono text-xs text-ink-soft">{l.action}</span><span className="text-xs text-muted">{new Date(l.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</span></li>)}
            </ul>
          ) : <p className="mt-2 text-sm text-muted">Brak zdarzeń.</p>}
        </Card>
      </div>
    </>
  );
}
