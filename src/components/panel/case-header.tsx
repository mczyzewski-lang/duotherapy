import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, Badge } from "@/components/ui";
import { statusLabel } from "@/lib/cases";

export function CaseHeader({ c, participants, active }: { c: Record<string, any>; participants: Record<string, any>[]; active: "overview" | "answers" | "compare" | "session" | "reports" }) {
  const tabs = [
    ["overview", "Karta sprawy", `/app/cases/${c.id}`],
    ["answers", "Odpowiedzi i notatki", `/app/cases/${c.id}/answers`],
    ...(c.kind === "couple" ? [["compare", "Porównanie", `/app/cases/${c.id}/compare`]] : []),
    ["session", "Tryb sesji", `/app/cases/${c.id}/session`],
  ] as const;
  const risk = participants.filter((p) => p.risk && ["needs_review", "contacted"].includes(p.risk.status));
  return (
    <header className="mb-6">
      <p className="mb-2 text-sm"><Link href="/app/cases" className="text-forest">← Sprawy</Link></p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{participants.map((p) => p.display_name).join(" & ")}</h1>
        <Badge tone="forest">{statusLabel(c.status)}</Badge>
        {c.is_demo && <Badge tone="clay">DEMO</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted">{c.ref} · {c.kind === "couple" ? "audyt dla pary · 90 min" : "audyt indywidualny · 60 min"} · prowadzi: {c.therapist_name}</p>
      {risk.length > 0 && (
        <Alert tone="alert" className="mt-4" title={<span className="flex items-center gap-2"><AlertTriangle size={16} aria-hidden /> Wymaga pilnego przeglądu przed sesją</span>}>
          {risk.map((p) => p.display_name).join(", ")} – odpowiedź „tak” w pytaniach przesiewowych (Cz. 1, pyt. 1-4 lub 7). Wytyczne: kontakt przed sesją lub krótka rozmowa przesiewowa na jej początku. Przy podejrzeniu przemocy nie prowadź wspólnej sesji. To nie jest automatyczna ocena ryzyka.
        </Alert>
      )}
      <nav aria-label="Sekcje sprawy" className="mt-5 flex gap-1 overflow-x-auto border-b border-sand">
        {tabs.map(([k, l, href]) => (
          <Link key={k} href={href} aria-current={active === k ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-2 text-sm ${active === k ? "border-clay font-medium text-ink" : "border-transparent text-muted hover:text-forest"}`}>{l}</Link>
        ))}
      </nav>
    </header>
  );
}
