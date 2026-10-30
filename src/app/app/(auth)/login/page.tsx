import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Field, Input } from "@/components/ui";
import { loginAction } from "../actions";

export const metadata = { title: "Logowanie" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Logowanie do panelu</h1>
      <ActionForm action={loginAction as never} className="mt-6 space-y-4">
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="username" required /></Field>
        <Field label="Hasło" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
        <SubmitButton className="w-full">Zaloguj się</SubmitButton>
      </ActionForm>
    </>
  );
}
