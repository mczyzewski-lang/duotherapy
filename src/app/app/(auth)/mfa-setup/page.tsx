import { redirect } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Field, Input } from "@/components/ui";
import { getStaffSessionRaw } from "@/lib/auth";
import { confirmMfaSetup, startMfaSetup } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konfiguracja MFA" };

export default async function MfaSetup() {
  const s = await getStaffSessionRaw();
  if (!s) redirect("/app/login");
  if (s.user.mfaEnabled) redirect("/app");
  const setup = await startMfaSetup();
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Włącz weryfikację dwuetapową</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Panel zawiera dane szczególnie wrażliwe. Dodaj konto w aplikacji uwierzytelniającej (np. Aegis, Google Authenticator, 1Password), wpisując poniższy klucz, a następnie podaj kod.
      </p>
      <p className="mt-4 break-all rounded-xl bg-linen p-3 font-mono text-sm tracking-wider text-ink">{setup?.secret}</p>
      <details className="mt-2 text-xs text-muted"><summary>Adres otpauth (dla menedżerów haseł)</summary><p className="mt-1 break-all">{setup?.uri}</p></details>
      <ActionForm action={confirmMfaSetup as never} className="mt-6 space-y-4">
        <Field label="Kod z aplikacji" htmlFor="code"><Input id="code" name="code" inputMode="numeric" maxLength={6} required /></Field>
        <SubmitButton className="w-full">Włącz MFA</SubmitButton>
      </ActionForm>
    </>
  );
}
