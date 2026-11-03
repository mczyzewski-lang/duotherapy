// Elementy panelu „Mailing”.
import { Badge } from "@/components/ui";
import type { StepRow } from "@/lib/mailing";

export function TagChips({ step }: { step: Pick<StepRow, "include_tags" | "exclude_tags"> }) {
  if (!step.include_tags.length && !step.exclude_tags.length) return <span className="text-xs text-muted">wszyscy</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {step.include_tags.length > 0 && <Badge tone="forest" title="Wysyłaj tylko osobom z którymkolwiek z tagów">tylko {step.include_tags.map((t) => `#${t}`).join(" / ")}</Badge>}
      {step.exclude_tags.map((t) => <Badge key={t} tone="clay" title="Nie wysyłaj osobom z tym tagiem">bez #{t}</Badge>)}
    </span>
  );
}

