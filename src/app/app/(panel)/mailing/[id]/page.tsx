// Edycja jednego e-maila sekwencji (albo nowy: /app/mailing/nowy?sciezka=lead) + podgląd HTML, test na własny adres, usunięcie.
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStepAction, saveStepAction, sendTestAction } from "@/actions/mailing";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { TagChips } from "@/components/mailing";
import { Card, Field, Input, PageTitle, Textarea } from "@/components/ui";
import { asStaff, requireStaff } from "@/lib/auth";
import { env } from "@/lib/env";
import { renderMail, resendConfigured, type StepRow } from "@/lib/mailing";

export const metadata = { title: "E-mail – mailing" };
export const dynamic = "force-dynamic";

export default async function StepPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const s = await requireStaff("admin");
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "nowy";
  if (!isNew && !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const step = isNew ? null : await asStaff(s, async (tx) => (await tx<StepRow[]>`select * from mail_steps where id = ${id}`)[0] ?? null);
  if (!isNew && !step) notFound();
  const seq = step?.sequence_id ?? (sp.sciezka === "customer" ? "customer" : "lead");
  const prefix = seq === "customer" ? "k" : "n";
  const nextCode = isNew
    ? await asStaff(s, async (tx) => {
        const rows = await tx<{ code: string }[]>`select code from mail_steps where code like ${prefix + "%"}`;
        const max = rows.map((r) => Number(r.code.slice(1)) || 0).reduce((a, b) => Math.max(a, b), 0);
        return `${prefix}${max + 1}`;
      })
    : step!.code;
  const preview = step ? renderMail(step, { code: "podglad0", name: "Anna" }) : null;
  const tags = (t?: string[]) => (t ?? []).map((x) => `#${x}`).join(" ");

  return (
    <>
      <PageTitle
        title={isNew ? "Nowy e-mail" : `E-mail ${step!.code}: ${step!.subject}`}
        sub={<><Link href="/app/mailing" className="text-forest underline">← Mailing</Link> · ścieżka „{seq === "lead" ? "przed zakupem" : "po zakupie"}”</>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <ActionForm action={saveStepAction as never} className="space-y-4">
            <input type="hidden" name="id" value={step?.id ?? ""} />
            <input type="hidden" name="sequence_id" value={seq} />
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Kod (część linku)" hint={`Link: ${env.appUrl.replace(/^https?:\/\//, "")}/${nextCode}/<kod osoby>`} htmlFor="code">
                <Input id="code" name="code" defaultValue={nextCode} required pattern="[a-z]{1,2}[0-9]{1,3}" />
              </Field>
              <Field label="Wyślij po (dniach od startu ścieżki)" htmlFor="delay"><Input id="delay" name="delay_days" type="number" min={0} max={365} defaultValue={step?.delay_days ?? 1} required /></Field>
              <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="active" defaultChecked={step?.active ?? true} className="h-4 w-4 accent-[#36493d]" /> Aktywny</label>
            </div>
            <Field label="Temat" htmlFor="subject"><Input id="subject" name="subject" defaultValue={step?.subject} required maxLength={200} /></Field>
            <Field label="Preheader (podgląd w skrzynce)" htmlFor="pre"><Input id="pre" name="preheader" defaultValue={step?.preheader} maxLength={200} /></Field>
            <Field label="Treść" hint="Akapity oddziel pustą linią. Powitanie „Cześć {imię},” dodaje się samo; {imie} wstawia imię w treści." htmlFor="body">
              <Textarea id="body" name="body" rows={12} defaultValue={step?.body} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Przycisk CTA" htmlFor="cl"><Input id="cl" name="cta_label" defaultValue={step?.cta_label ?? (seq === "lead" ? "Poznaj Mapę Relacji" : "")} maxLength={80} /></Field>
              <Field label="Dokąd prowadzi CTA" hint="Adres na stronie, np. /mapa-relacji, /start, /wiedza/…" htmlFor="cu"><Input id="cu" name="cta_url" defaultValue={step?.cta_url ?? (seq === "lead" ? "/mapa-relacji" : "/wiedza")} required /></Field>
            </div>
            <fieldset className="rounded-2xl bg-linen/60 p-4">
              <legend className="px-1 text-sm font-semibold text-ink">Warunki tagów</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Wysyłaj tylko, jeśli osoba MA tag" hint="Którykolwiek z wpisanych. Puste = wszyscy." htmlFor="inc"><Input id="inc" name="include_tags" defaultValue={tags(step?.include_tags)} placeholder="#lm-po-zdradzie #quiz" /></Field>
                <Field label="Nie wysyłaj, jeśli osoba MA tag" hint="Wystarczy jeden z wpisanych." htmlFor="exc"><Input id="exc" name="exclude_tags" defaultValue={tags(step?.exclude_tags)} placeholder="#quiz" /></Field>
              </div>
              <p className="mt-2 text-xs text-muted">Osoba bez spełnionego warunku pomija ten e-mail i przechodzi do następnego.</p>
            </fieldset>
            <SubmitButton>{isNew ? "Utwórz e-mail" : "Zapisz"}</SubmitButton>
          </ActionForm>
        </Card>

        <div className="space-y-6">
          {preview && (
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-sand/70 px-5 py-3 text-sm">
                <span className="font-medium text-ink">Podgląd (dla „Anna”)</span>
                <TagChips step={step!} />
              </div>
              <iframe title="Podgląd e-maila" srcDoc={preview.html} className="h-[640px] w-full bg-white" sandbox="" data-testid="mail-preview" />
            </Card>
          )}
          {step && (
            <Card className="p-6">
              <h2 className="font-display text-lg text-ink">Wyślij test</h2>
              <p className="mt-1 text-sm text-ink-soft">Test trafia wyłącznie na Twój adres ({s.user.email}). Link w teście nie zapisuje kliknięcia żadnej osoby.</p>
              <ActionForm action={sendTestAction as never} className="mt-3">
                <input type="hidden" name="id" value={step.id} />
                <SubmitButton variant="secondary" size="sm">{resendConfigured() ? "Wyślij test do mnie" : "Wyślij test (wymaga Resend)"}</SubmitButton>
              </ActionForm>
            </Card>
          )}
          {step && (
            <Card className="p-6">
              <h2 className="font-display text-lg text-ink">Usuń e-mail</h2>
              <ActionForm action={deleteStepAction as never} className="mt-3">
                <input type="hidden" name="id" value={step.id} />
                <SubmitButton variant="danger" size="sm" confirm="Usunąć ten e-mail ze ścieżki?">Usuń</SubmitButton>
              </ActionForm>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
