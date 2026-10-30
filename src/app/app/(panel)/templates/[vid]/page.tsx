import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuestionAction, moveQuestionAction, publishAction, saveQuestionAction } from "@/actions/admin";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Alert, Badge, Card, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { loadVersion, type QuestionRow } from "@/lib/templates";

export const metadata = { title: "Edytor kwestionariusza" };
const TYPES = ["text", "textarea", "date", "email", "phone", "country_city", "single", "multi", "scale5", "screening", "consent", "signature", "info"];
const TYPE_LABEL: Record<string, string> = { text: "krótka odpowiedź", textarea: "długa odpowiedź", date: "data", email: "e-mail", phone: "telefon", country_city: "kraj i miasto", single: "pojedynczy wybór", multi: "wielokrotny wybór", scale5: "skala 1–5", screening: "nie / tak / wolę omówić", consent: "zgoda", signature: "oświadczenie (podpis)", info: "blok informacyjny" };

function QuestionForm({ v, q, sectionKey }: { v: string; q?: QuestionRow; sectionKey?: string }) {
  return (
    <ActionForm action={saveQuestionAction as never} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="version_id" value={v} />
      {q && <input type="hidden" name="question_id" value={q.id} />}
      {!q && <input type="hidden" name="section_key" value={sectionKey} />}
      <div className="sm:col-span-2"><Field label="Treść pytania"><Textarea name="prompt" defaultValue={q?.prompt} className="min-h-16" /></Field></div>
      <Field label="Typ pola"><Select name="type" defaultValue={q?.type ?? "textarea"}>{TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</Select></Field>
      <Field label="Numer w części (opcjonalnie)"><Input name="source_number" defaultValue={q?.source_number ?? ""} /></Field>
      <Field label="Grupa / nagłówek ekranu"><Input name="group_label" defaultValue={q?.group_label ?? ""} /></Field>
      <Field label="Tagi analityczne (po przecinku)" hint="np. reversed, contempt, repair, risk-trigger"><Input name="tags" defaultValue={q?.tags.join(", ")} /></Field>
      {!q && <Field label="Klucz (opcjonalnie, unikalny)"><Input name="key" placeholder="np. s2.10" /></Field>}
      <div className="sm:col-span-2"><Field label="Opcje (jedna w linii: wartość | etykieta | pole dodatkowe)"><Textarea name="options" className="min-h-16 font-mono text-xs" defaultValue={q?.options?.map((o) => [o.value, o.label, o.detailLabel].filter(Boolean).join(" | ")).join("\n")} /></Field></div>
      <div className="sm:col-span-2"><Field label="Podpowiedź"><Input name="hint" defaultValue={q?.hint ?? ""} /></Field></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" defaultChecked={q?.required} className="accent-forest" /> wymagane</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="allow_na" defaultChecked={q?.allow_na} className="accent-forest" /> opcja „nie dotyczy”</label>
      <div className="sm:col-span-2"><SubmitButton size="sm">{q ? "Zapisz pytanie" : "Dodaj pytanie"}</SubmitButton></div>
    </ActionForm>
  );
}

export default async function TemplateVersion({ params }: { params: Promise<{ vid: string }> }) {
  const { vid } = await params;
  const s = await requireStaff("admin");
  const v = await asStaff(s, (tx) => loadVersion(tx, vid));
  if (!v) notFound();
  const draft = v.status === "draft";
  return (
    <>
      <p className="mb-2 text-sm"><Link href="/app/templates" className="text-forest">← Kwestionariusze</Link></p>
      <PageTitle title={`${v.title} – wersja ${v.version}`} sub={`${v.templateKey} · źródło: ${v.sourceFile}`} actions={<Badge tone={draft ? "clay" : "ok"}>{draft ? "szkic – edytowalny" : v.status === "published" ? "opublikowana – tylko do odczytu" : "archiwalna"}</Badge>} />
      {v.needsVerification && <Alert tone="warn" className="mb-6" title="Wymaga ręcznej weryfikacji">{v.verificationNote}</Alert>}
      {draft && (
        <Card className="mb-6 p-6">
          <h2 className="font-display text-lg text-ink">Publikacja</h2>
          <ActionForm action={publishAction as never} className="mt-3 space-y-3">
            <input type="hidden" name="version_id" value={vid} />
            <Field label="Opis zmian"><Input name="change_note" placeholder="np. poprawa brzmienia pytania 3 w Części 2" /></Field>
            {v.needsVerification && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified" className="accent-forest" /> Treść porównana ze źródłem (PDF) – usuń oznaczenie „do weryfikacji”</label>}
            <SubmitButton confirm="Opublikować? Nowe sprawy otrzymają tę wersję; istniejące zachowają swoją.">Opublikuj wersję</SubmitButton>
          </ActionForm>
        </Card>
      )}
      <Card className="mb-6 p-6">
        <h2 className="font-display text-lg text-ink">Podgląd: Zanim zaczniesz</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">{v.intro.map((p) => <li key={p}>{p}</li>)}</ul>
      </Card>
      {v.sections.map((sec) => (
        <section key={sec.key} className="mb-8">
          <h2 className="mb-2 font-display text-xl text-ink">{sec.title}</h2>
          {sec.intro && <p className="mb-2 text-sm text-muted">{sec.intro}</p>}
          <ol className="divide-y divide-sand/70 rounded-2xl bg-white shadow-soft ring-1 ring-sand">
            {sec.questions.map((q) => (
              <li key={q.id} className="p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">{q.key}{q.source_number ? ` · nr ${q.source_number}` : ""} · {TYPE_LABEL[q.type]}{q.required ? " · wymagane" : ""}{q.allow_na ? " · nie dotyczy" : ""} · źródło: {q.source.file}{q.source.page ? `, s. ${q.source.page}` : ""}</p>
                    <p className="mt-0.5 text-ink">{q.prompt}</p>
                    {q.options && <p className="mt-1 text-xs text-ink-soft">{q.options.map((o) => o.label).join(" · ")}</p>}
                    {q.source.note && <p className="mt-1 text-xs text-clay">{q.source.note}</p>}
                  </div>
                  {draft && (
                    <div className="flex gap-1">
                      {(["up", "down"] as const).map((dir) => (
                        <form key={dir} action={moveQuestionAction}><input type="hidden" name="version_id" value={vid} /><input type="hidden" name="question_id" value={q.id} /><input type="hidden" name="dir" value={dir} /><button className="rounded-lg p-1.5 text-muted hover:bg-linen" aria-label={dir === "up" ? "Przesuń wyżej" : "Przesuń niżej"}>{dir === "up" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}</button></form>
                      ))}
                    </div>
                  )}
                </div>
                {draft && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-forest">Edytuj</summary>
                    <div className="mt-3"><QuestionForm v={vid} q={q} /></div>
                    <form action={deleteQuestionAction} className="mt-2"><input type="hidden" name="version_id" value={vid} /><input type="hidden" name="question_id" value={q.id} /><SubmitButton size="sm" variant="ghost" confirm="Usunąć pytanie ze szkicu?">Usuń pytanie</SubmitButton></form>
                  </details>
                )}
              </li>
            ))}
          </ol>
          {draft && (
            <details className="mt-2 rounded-2xl bg-white p-4 ring-1 ring-sand">
              <summary className="cursor-pointer text-sm text-forest">+ Dodaj pytanie do tej sekcji</summary>
              <div className="mt-3"><QuestionForm v={vid} sectionKey={sec.key} /></div>
            </details>
          )}
        </section>
      ))}
    </>
  );
}
