import { CalendarPlus, Download, FileText, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addSlotAction,
  anonymizeParticipantAction,
  recordDisclosureAction,
  reopenQuestionnaireAction,
  revokeInviteAction,
  riskReviewAction,
  slotAction,
  updateCaseAction,
} from "@/actions/cases";
import { createReportAction } from "@/actions/reports";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { CaseHeader } from "@/components/panel/case-header";
import { InviteButton } from "@/components/panel/invite-button";
import { Alert, Badge, Card, Field, Input, LinkButton, Select, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { loadCase } from "@/lib/case-data";
import { CASE_STATUSES, Q_STATUS_LABEL } from "@/lib/cases";
import { decrypt } from "@/lib/crypto";
import { audit } from "@/lib/audit";

export const metadata = { title: "Karta sprawy" };

const RISK_LABEL: Record<string, string> = { needs_review: "wymaga przeglądu", contacted: "kontakt podjęty", reviewed: "przejrzane", safety_path: "ścieżka bezpieczeństwa" };
const fmt = (d: Date | string | null) => (d ? new Date(d).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const data = await loadCase(tx, id);
    if (!data) return null;
    await audit(tx, s.actor, "case_viewed", "case", id, id);
    return {
      ...data,
      progress: await tx`select participant_id, count(*)::int as n from answers where participant_id in ${tx(data.participants.map((p) => p.id))} group by 1`,
      totals: await tx`select p.id, count(q.*)::int as n from participants p join questions q on q.version_id = p.template_version_id and q.type <> 'info' where p.case_id = ${id} group by 1`,
      verif: await tx`select distinct v.needs_verification, v.verification_note, v.version, t.key from participants p join questionnaire_template_versions v on v.id = p.template_version_id join questionnaire_templates t on t.id = v.template_id where p.case_id = ${id}`,
      slots: await tx`select s.*, p.display_name as chosen_name from session_slots s left join participants p on p.id = s.chosen_by where s.case_id = ${id} and s.status <> 'cancelled' order by starts_at`,
      consents: await tx`select c.*, p.display_name from consents c join participants p on p.id = c.participant_id where p.case_id = ${id} order by c.created_at desc`,
      reports: await tx`select r.*, p.display_name as for_name, (select max(version) from report_versions where report_id = r.id) as v from reports r left join participants p on p.id = r.participant_id where r.case_id = ${id} order by r.created_at desc`,
      timeline: await tx`select a.created_at, a.action, a.actor_kind, u.name from audit_logs a left join users u on u.id = a.actor_id where a.case_id = ${id} and a.action <> 'case_viewed' order by a.created_at desc limit 40`,
      therapists: await tx`select id, display_name from therapists order by display_name`,
    };
  });
  if (!d) notFound();
  const { c, participants } = d;
  const lastReportOk = d.reports.length > 0;

  return (
    <>
      <CaseHeader c={c} participants={participants} active="overview" />
      {d.verif.some((v) => v.needs_verification) && (
        <Alert tone="warn" className="mb-6" title="Kwestionariusz w wersji roboczej – wymaga weryfikacji">
          {d.verif.filter((v) => v.needs_verification).map((v) => `${v.key} v${v.version}`).join(", ")}: {d.verif.find((v) => v.needs_verification)?.verification_note}
        </Alert>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {participants.map((p) => {
            const answered = d.progress.find((x) => x.participant_id === p.id)?.n ?? 0;
            const total = d.totals.find((x) => x.id === p.id)?.n ?? 0;
            const inv = p.invitation;
            const invActive = inv && !inv.revoked_at && new Date(inv.expires_at) > new Date();
            return (
              <Card key={p.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-ink">{p.display_name}{p.anonymized_at && <Badge className="ml-2">dane usunięte</Badge>}</h2>
                    <p className="text-sm text-muted">{c.kind === "couple" ? `Osoba ${p.position} · ` : ""}kwestionariusz {c.kind === "couple" ? "dla pary" : "indywidualny"} {p.gender === "male" ? "dla niego" : "dla niej"}</p>
                    <p className="mt-1 text-sm text-ink-soft">{[p.email, p.phone].filter(Boolean).join(" · ") || "brak danych kontaktowych"}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={p.q_status === "submitted" ? "ok" : p.q_status === "not_started" ? "neutral" : "clay"}>{Q_STATUS_LABEL[p.q_status]}</Badge>
                    <p className="mt-1 text-xs text-muted">odpowiedzi: {answered}/{total}{p.q_submitted_at && ` · przekazano ${fmt(p.q_submitted_at)}`}</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linen" aria-hidden><div className="h-full bg-forest" style={{ width: `${total ? (answered / total) * 100 : 0}%` }} /></div>

                {p.risk && (
                  <div className="mt-5 rounded-xl bg-alert-soft/60 p-4 ring-1 ring-alert/20">
                    <p className="text-sm font-medium text-alert">Przegląd bezpieczeństwa: {RISK_LABEL[p.risk.status]} · pytania: {p.risk.trigger_keys.map((k: string) => k.replace("s1.", "Cz. 1, pyt. ")).join(", ")}</p>
                    <ActionForm action={riskReviewAction as never} className="mt-3 grid gap-2 sm:grid-cols-[200px_1fr_auto]">
                      <input type="hidden" name="participant_id" value={p.id} />
                      <Select name="status" defaultValue={p.risk.status} aria-label="Status przeglądu">{Object.entries(RISK_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
                      <Input name="note" defaultValue={decrypt<string>(p.risk.note_enc) ?? ""} placeholder="Notatka prywatna (np. kontakt telefoniczny, ustalenia)" aria-label="Notatka" />
                      <SubmitButton size="sm">Zapisz</SubmitButton>
                    </ActionForm>
                  </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-ink">Link do kwestionariusza</h3>
                    <p className="mb-3 mt-1 text-xs text-muted">
                      {inv ? (invActive ? `Aktywny do ${fmt(inv.expires_at)}${inv.last_used_at ? ` · ostatnio otwarty ${fmt(inv.last_used_at)}` : " · jeszcze nie otwarty"}` : inv.revoked_at ? "Cofnięty" : "Wygasł") : "Nie wygenerowano"}
                      {inv?.failed_attempts > 0 && ` · nieudane próby kodu: ${inv.failed_attempts}`}
                    </p>
                    {!p.anonymized_at && <InviteButton participantId={p.id} hasActive={Boolean(invActive)} />}
                    {invActive && (
                      <form action={revokeInviteAction} className="mt-2">
                        <input type="hidden" name="participant_id" value={p.id} />
                        <SubmitButton size="sm" variant="ghost" confirm="Cofnąć link? Klient straci dostęp do czasu wygenerowania nowego.">Cofnij link</SubmitButton>
                      </form>
                    )}
                  </div>
                  <div className="space-y-3">
                    {p.q_status === "submitted" && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-forest">Otwórz ponownie do poprawy (za zgodą)</summary>
                        <ActionForm action={reopenQuestionnaireAction as never} className="mt-2 space-y-2">
                          <input type="hidden" name="participant_id" value={p.id} />
                          <Input name="reason" placeholder="Powód, np. prośba klienta z 12.11" aria-label="Powód" />
                          <SubmitButton size="sm" variant="secondary">Otwórz</SubmitButton>
                        </ActionForm>
                      </details>
                    )}
                    {c.kind === "couple" && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-forest">Odnotuj zgodę na ujawnienie drugiej osobie</summary>
                        <ActionForm action={recordDisclosureAction as never} className="mt-2 space-y-2">
                          <input type="hidden" name="participant_id" value={p.id} />
                          <Textarea name="scope" className="min-h-16" placeholder="Zakres: co i w jakiej formie może zostać przekazane drugiej osobie" aria-label="Zakres zgody" />
                          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="granted" defaultChecked className="accent-forest" /> zgoda udzielona (odznacz, aby odnotować odmowę/wycofanie)</label>
                          <SubmitButton size="sm" variant="secondary">Zapisz w rejestrze zgód</SubmitButton>
                        </ActionForm>
                      </details>
                    )}
                    <p className="flex gap-3 text-sm">
                      <a href={`/api/participants/${p.id}/export`} className="inline-flex items-center gap-1 text-forest"><Download size={14} aria-hidden /> Eksport danych (JSON)</a>
                    </p>
                    {s.user.role === "admin" && !p.anonymized_at && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-alert">Żądanie usunięcia danych</summary>
                        <ActionForm action={anonymizeParticipantAction as never} className="mt-2 space-y-2">
                          <input type="hidden" name="participant_id" value={p.id} />
                          <p className="text-xs text-muted">Usuwa odpowiedzi, historię, notatki i dane kontaktowe. Sprawdź wcześniej obowiązki przechowywania dokumentacji wynikające z polityki retencji.</p>
                          <Input name="confirm" placeholder="Wpisz USUŃ" aria-label="Potwierdzenie" />
                          <SubmitButton size="sm" variant="danger">Usuń dane uczestnika</SubmitButton>
                        </ActionForm>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-ink">Raporty</h2>
              <LinkButton href={`/app/cases/${c.id}/session`} variant="secondary" size="sm"><Play size={15} aria-hidden /> Rozpocznij sesję</LinkButton>
            </div>
            {d.reports.length > 0 && (
              <ul className="mt-4 divide-y divide-sand/70">
                {d.reports.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <Link href={`/app/cases/${c.id}/reports/${r.id}`} className="flex items-center gap-2 font-medium text-forest"><FileText size={16} aria-hidden /> {r.audience === "joint" ? "Raport wspólny" : `Raport dla: ${r.for_name}`}</Link>
                    <span className="text-xs text-muted">wersja {r.v} · <Badge tone={r.status === "draft" ? "clay" : "ok"}>{{ draft: "szkic", approved: "zatwierdzony", shared: "udostępniony" }[r.status as string]}</Badge></span>
                  </li>
                ))}
              </ul>
            )}
            <form action={createReportAction} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="case_id" value={c.id} />
              <label className="text-sm text-ink">
                <span className="mb-1 block">Odbiorca raportu</span>
                <Select name="audience_target" defaultValue={c.kind === "couple" ? "joint" : participants[0].id} className="min-w-64" id="audience" aria-label="Odbiorca">
                  {c.kind === "couple" && <option value="joint">Raport wspólny (tylko treści zatwierdzone do wspólnego przekazania)</option>}
                  {participants.map((p) => <option key={p.id} value={p.id}>Raport osobny: {p.display_name}</option>)}
                </Select>
              </label>
              <SubmitButton>Przygotuj raport Audytu Relacji</SubmitButton>
            </form>
            {!lastReportOk && !c.session_ended_at && <p className="mt-2 text-xs text-muted">Zwykle raport przygotowuje się po zakończeniu sesji.</p>}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Status i ustalenia</h2>
            <ActionForm action={updateCaseAction as never} className="mt-4 space-y-3">
              <input type="hidden" name="case_id" value={c.id} />
              <Field label="Status sprawy" htmlFor="status"><Select id="status" name="status" defaultValue={c.status}>{CASE_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
              <Field label="Płatność" htmlFor="pay"><Select id="pay" name="payment_status" defaultValue={c.payment_status}><option value="unpaid">nieopłacone</option><option value="paid">opłacone</option><option value="waived">bez opłaty</option></Select></Field>
              <Field label="Notatka o płatności" htmlFor="pn"><Input id="pn" name="payment_note" defaultValue={c.payment_note ?? ""} /></Field>
              <Field label="Cel audytu" htmlFor="goal"><Textarea id="goal" name="goal" defaultValue={c.goal ?? ""} className="min-h-20" /></Field>
              {c.kind === "couple" && (
                <Field label="Zasada sekretów (ustalona na początku)" htmlFor="sr"><Select id="sr" name="secrets_rule" defaultValue={c.secrets_rule ?? ""}><option value="">nie ustalono</option><option value="no_secrets">bez sekretów</option><option value="secrets_allowed">sekrety dozwolone</option></Select></Field>
              )}
              {s.user.role === "admin" && <Field label="Psycholog prowadzący" htmlFor="th"><Select id="th" name="therapist_id" defaultValue={c.therapist_id}>{d.therapists.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</Select></Field>}
              <SubmitButton size="sm">Zapisz</SubmitButton>
            </ActionForm>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Termin sesji</h2>
            <p className="mt-1 text-sm text-ink">{c.session_at ? <>Potwierdzony: <strong>{fmt(c.session_at)}</strong></> : "Nie potwierdzono."}</p>
            <ul className="mt-3 space-y-2">
              {d.slots.map((sl) => (
                <li key={sl.id} className="flex items-center justify-between gap-2 rounded-xl bg-ivory px-3 py-2 text-sm ring-1 ring-sand">
                  <span>{fmt(sl.starts_at)} <span className="block text-xs text-muted">{{ offered: "zaproponowany", chosen: `wybrany przez: ${sl.chosen_name}`, confirmed: "potwierdzony" }[sl.status as string]}</span></span>
                  {sl.status !== "confirmed" && (
                    <span className="flex gap-1">
                      <form action={slotAction}><input type="hidden" name="slot_id" value={sl.id} /><input type="hidden" name="op" value="confirm" /><SubmitButton size="sm" variant="secondary">Potwierdź</SubmitButton></form>
                      <form action={slotAction}><input type="hidden" name="slot_id" value={sl.id} /><input type="hidden" name="op" value="cancel" /><SubmitButton size="sm" variant="ghost">Usuń</SubmitButton></form>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <ActionForm action={addSlotAction as never} className="mt-3 flex gap-2">
              <input type="hidden" name="case_id" value={c.id} />
              <Input type="datetime-local" name="starts_at" aria-label="Proponowany termin" />
              <SubmitButton size="sm" variant="secondary"><CalendarPlus size={15} aria-hidden /> Dodaj</SubmitButton>
            </ActionForm>
            <p className="mt-2 text-xs text-muted">Brak integracji z kalendarzem – terminy proponujesz tutaj, klient wybiera pod swoim linkiem, a Ty potwierdzasz.</p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Zgody</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {d.consents.length === 0 && <li className="text-muted">Brak zapisanych zgód.</li>}
              {d.consents.map((x) => (
                <li key={x.id} className="text-ink-soft">
                  <span className="text-ink">{x.display_name}</span>: {{ data_processing: "przetwarzanie danych", declaration: "oświadczenie", disclosure_to_partner: "ujawnienie drugiej osobie" }[x.kind as string] ?? x.kind} – {x.granted ? "tak" : "nie"}
                  <span className="block text-xs text-muted">{fmt(x.created_at)} · wersja {x.text_version}{x.scope ? ` · zakres: ${x.scope}` : ""}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Oś czasu</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {d.timeline.map((t, i) => (
                <li key={i} className="border-l-2 border-sand pl-3">
                  <span className="text-ink">{t.action.replaceAll("_", " ")}</span>
                  <span className="block text-xs text-muted">{fmt(t.created_at)} · {t.name ?? (t.actor_kind === "participant" ? "uczestnik" : t.actor_kind)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
