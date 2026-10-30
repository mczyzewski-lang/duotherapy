"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button } from "./ui";

export function SubmitButton({ children, variant, size, className, confirm }: { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "clay"; size?: "sm" | "md" | "lg"; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending} onClick={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      {pending ? "Proszę czekać…" : children}
    </Button>
  );
}

type State = { error?: string; ok?: string } | undefined;

/** Formularz z obsługą błędów z akcji serwera. */
export function ActionForm({ action, children, className }: { action: (s: State, fd: FormData) => Promise<State>; children: React.ReactNode; className?: string }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <Alert tone="alert" className="mt-3">{state.error}</Alert>}
      {state?.ok && <Alert tone="ok" className="mt-3">{state.ok}</Alert>}
    </form>
  );
}
