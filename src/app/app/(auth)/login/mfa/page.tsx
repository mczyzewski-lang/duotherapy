import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Field, Input } from "@/components/ui";
import { mfaAction } from "../../actions";

export const metadata = { title: "Weryfikacja dwuetapowa" };

export default function MfaPage() {
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Weryfikacja dwuetapowa</h1>
      <p className="mt-2 text-sm text-muted">Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej.</p>
      <ActionForm action={mfaAction as never} className="mt-6 space-y-4">
        <Field label="Kod" htmlFor="code"><Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /></Field>
        <SubmitButton className="w-full">Potwierdź</SubmitButton>
      </ActionForm>
    </>
  );
}
