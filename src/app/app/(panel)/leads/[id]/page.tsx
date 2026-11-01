import { LeadRoad } from "@/components/brand";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leadDetailsAction, leadNoteAction, leadStageAction } from "@/actions/leads";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { NewCaseFields } from "@/components/panel/new-case-fields";
import { createCaseAction } from "@/actions/cases";
import { Alert, Badge, Card, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { CONCERN_LABEL, INTENT_LABEL, LEAD_STAGES, PREFERRED_TIME_LABEL } from "@/lib/leads";
import { decrypt } from "@/lib/crypto";
import { optionLabel, QUIZ } from "@/lib/mapa-quiz";
import { readSettings } from "@/lib/settings";

export const metadata = { title: "Zgłoszenie" };

const LEN: Record<string, string> = { lt2: "< 2 lata", "2to5": "2–5 lat", "5to10": "5–10 lat", gt10: "> 10 lat", separated: "po rozstaniu / w trakcie" };
const WHEN: Record<string, string> = { asap: "jak najszybciej", month: "w ciągu miesiąca", talk_first: "najpierw rozmowa" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireStaff();
  const d = await asStaff(s, async (tx) => {
    const [lead] = await tx`select * from leads where id = ${id}`;
    if (!lead) return null;
    return {
      lead,
      acts: await tx`select a.*, u.name as author from lead_activities a left join users u on u.id = a.user_id where lead_id = ${id} order by created_at desc`,
      consents: await tx`select kind, granted, text_version, created_at from consents where lead_id = ${id} order by created_at`,
      therapists: await tx`select id, display_name from therapists order by display_name`,
      settings: await readSettings(tx),
    };
  });
  if (!d) notFound();
  const { lead, acts, consents, therapists, settings } = d;
  const quiz = lead.quiz_enc ? decrypt<Record<string, string>>(lead.quiz_enc) : null;
  const stageLabel = LEAD_STAGES.find(([k]) => k === lead.stage)?.[1];
  const fmtDT = (x: Date | null) => (x ? new Date(new Date(x).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  return (
    <>
      <p className="mb-2 text-sm"><Link href="/app/leads" className="text-forest">← Zgłoszenia</Link></p>
      <PageTitle title={lead.name} sub={`Zgłoszenie z ${new Date(lead.created_at).toLocaleString("pl-PL")} · etap: ${stageLabel}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Kontakt</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Telefon</dt><dd>{lead.phone ? <a href={`tel:${lead.phone}`} className="text-base font-medium text-forest">{lead.phone}</a> : "—"}</dd></div>
              <div><dt className="text-muted">E-mail</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`} className="text-forest">{lead.email}</a> : "—"}</dd></div>
              <div><dt className="text-muted">Kiedy dzwonić</dt><dd>{PREFERRED_TIME_LABEL[lead.preferred_time] ?? "dowolna pora"}{lead.quiz?.discreet && <Badge tone="clay" className="ml-2">dyskretnie</Badge>}</dd></div>
              <div><dt className="text-muted">Pierwszy krok</dt><dd>{lead.mode === "couple" ? "razem z partnerem/partnerką" : lead.mode === "individual" ? "samodzielnie" : "nie ustalono"}</dd></div>
              <div><dt className="text-muted">Zgody</dt><dd>{consents.map((c) => <span key={c.kind} className="block">{c.kind === "lead_contact" ? "kontakt" : "marketing"}: {c.granted ? "tak" : "nie"} <span className="text-xs text-muted">(wersja {c.text_version})</span></span>)}</dd></div>
              <div>
                <dt className="text-muted">Źródło</dt>
                <dd>
                  {[lead.attribution?.utm_source, lead.attribution?.utm_medium, lead.attribution?.utm_campaign].filter(Boolean).join(" / ") || lead.attribution?.referrer || "bezpośrednio"}
                  {lead.ab_variant && <Badge className="ml-2">nagłówek {lead.ab_variant}</Badge>}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Odpowiedzi z quizu</h2>
            {quiz ? (
              <>
                <p className="mt-1 text-xs text-muted">Wstępne odpowiedzi osoby – nie diagnoza. Widoczne tylko dla zespołu (szyfrowane).</p>
                <dl className="mt-4 space-y-3 text-sm">
                  {QUIZ.map((q) => (
                    <div key={q.id}>
                      <dt className="text-muted">{q.title}</dt>
                      <dd className="font-medium text-ink">{optionLabel(q.id, quiz[q.id])}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted">Intencja</dt><dd className="flex items-center gap-1.5"><LeadRoad lead={{ intent: lead.intent }} />{INTENT_LABEL[lead.intent] ?? "—"}</dd></div>
                <div><dt className="text-muted">Co obciąża</dt><dd>{(lead.quiz?.concerns ?? []).map((c: string) => CONCERN_LABEL[c]).join(", ") || "—"}</dd></div>
                <div><dt className="text-muted">Staż</dt><dd>{LEN[lead.quiz?.length] ?? "—"}</dd></div>
                <div><dt className="text-muted">Kiedy</dt><dd>{WHEN[lead.quiz?.when] ?? "—"}</dd></div>
              </dl>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Rozmowa telefoniczna – ściągawka</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
              <li>Przedstaw się, sprawdź, czy to dobry i bezpieczny moment na rozmowę{lead.quiz?.discreet ? " (osoba prosi o dyskrecję)" : ""}.</li>
              <li>Zapytaj krótko, co skłoniło do zgłoszenia i czego osoba oczekuje.</li>
              <li>Wyjaśnij Mapę Relacji: poufne kwestionariusze (ok. 15–25 min), konsultacja z psychologiem ({lead.mode === "couple" ? "90 minut wspólnie, każda osoba wypełnia własny kwestionariusz" : "60 minut indywidualnie lub 90 minut wspólnie"}), pisemne podsumowanie z możliwymi kierunkami. Podaj cenę i warianty.</li>
              <li>Podkreśl: to nie terapia ani diagnoza; rekomendacja jest propozycją, decyzja należy do klienta.</li>
              <li>Zapytaj o bezpieczeństwo. Przy sygnałach przemocy: bez wspólnej sesji – ścieżka bezpieczeństwa i numery pomocy.</li>
              <li>Ustal formę płatności{settings.site.paymentUrl ? " (link do płatności w ustawieniach)" : ""} i kolejne kroki: link do kwestionariusza z kodem przekazanym telefonicznie.</li>
            </ol>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Historia kontaktu</h2>
            <ActionForm action={leadNoteAction as never} className="mt-4 space-y-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <div className="flex gap-2">
                <Select name="kind" className="max-w-40" aria-label="Typ wpisu"><option value="call">Rozmowa</option><option value="note">Notatka</option><option value="email">E-mail</option></Select>
                <Input name="content" placeholder="np. Nie odebrała, ponowię jutro o 18:00" aria-label="Treść" />
                <SubmitButton size="sm">Dodaj</SubmitButton>
              </div>
              <p className="text-xs text-muted">Nie zapisuj tu szczegółów zdrowotnych ani dotyczących przemocy – te informacje należą do karty sprawy.</p>
            </ActionForm>
            <ul className="mt-5 space-y-3">
              {acts.map((a) => (
                <li key={a.id} className="border-l-2 border-sand pl-3 text-sm">
                  <p className="text-ink">{a.content}</p>
                  <p className="text-xs text-muted">{new Date(a.created_at).toLocaleString("pl-PL")} · {a.author ?? "system"} · {a.kind}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Etap i termin rozmowy</h2>
            <form action={leadStageAction} className="mt-4 flex gap-2">
              <input type="hidden" name="lead_id" value={lead.id} />
              <Select name="stage" defaultValue={lead.stage} aria-label="Etap" disabled={lead.stage === "converted"}>
                {LEAD_STAGES.filter(([k]) => k !== "converted" || lead.stage === "converted").map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </Select>
              <SubmitButton size="sm" variant="secondary">Zmień</SubmitButton>
            </form>
            <ActionForm action={leadDetailsAction as never} className="mt-4 space-y-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <Field label="Termin rozmowy telefonicznej" htmlFor="call_at"><Input id="call_at" type="datetime-local" name="call_at" defaultValue={fmtDT(lead.call_at)} /></Field>
              <Field label="Osoba prowadząca" htmlFor="th"><Select id="th" name="assigned_therapist_id" defaultValue={lead.assigned_therapist_id ?? ""}><option value="">—</option>{therapists.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</Select></Field>
              <SubmitButton size="sm">Zapisz</SubmitButton>
            </ActionForm>
            {settings.site.paymentUrl && <p className="mt-4 break-all text-xs text-muted">Link do płatności: <span className="text-ink">{settings.site.paymentUrl}</span></p>}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">Załóż sprawę</h2>
            {lead.case_id ? (
              <Alert tone="ok" className="mt-3">Sprawa założona. <Link className="font-medium underline" href={`/app/cases/${lead.case_id}`}>Otwórz kartę sprawy</Link></Alert>
            ) : (
              <ActionForm action={createCaseAction as never} className="mt-4 space-y-4">
                <input type="hidden" name="lead_id" value={lead.id} />
                <input type="hidden" name="intent" value={lead.intent} />
                <NewCaseFields defaultKind={lead.mode} defaultName={lead.name} defaultEmail={lead.email ?? ""} defaultPhone={lead.phone ?? ""} therapists={therapists.map((t) => ({ id: t.id, name: t.display_name }))} defaultTherapist={lead.assigned_therapist_id ?? s.user.therapistId ?? ""} isAdmin={s.user.role === "admin"} />
                <SubmitButton className="w-full">Załóż sprawę</SubmitButton>
              </ActionForm>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
