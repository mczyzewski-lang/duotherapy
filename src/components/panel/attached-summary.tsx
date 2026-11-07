// Podsumowanie z bezpłatnego materiału dołączone przez klienta w quizie – w zgłoszeniu i w sprawie (klient nie wypełnia tego drugi raz).
import { Card } from "@/components/ui";
import { decrypt } from "@/lib/crypto";
import type { Tx } from "@/lib/db";
import { summarize } from "@/knowledge/fields";
import { magnetById } from "@/knowledge/registry";
import type { LeadMagnet } from "@/knowledge/types";

export async function loadAttached(tx: Tx, lead: { attached_answers_id: string | null; attached_magnet_id: string | null } | undefined) {
  if (!lead?.attached_answers_id || !lead.attached_magnet_id) return null;
  const m = magnetById(lead.attached_magnet_id);
  const [a] = await tx<{ data_enc: string }[]>`select data_enc from content_answers where id = ${lead.attached_answers_id}`;
  if (!m) return null;
  return { m, groups: a ? summarize(m, decrypt<Record<string, string | boolean>>(a.data_enc) ?? {}) : [] };
}

export function AttachedSummary({ m, groups, inCase }: { m: LeadMagnet; groups: ReturnType<typeof summarize>; inCase?: boolean }) {
  return (
    <Card className="p-6" data-testid="attached-summary">
      <h2 className="font-display text-lg text-ink">Dołączone podsumowanie: {m.short}</h2>
      <p className="mt-1 text-xs text-muted">
        Klient dołączył je świadomie w quizie (zgoda w rejestrze zgód). Treść poufna – tylko do przygotowania rozmowy.
        {inCase && " Nie prosimy o te same odpowiedzi drugi raz – w rozmowie możesz do nich nawiązać."}
      </p>
      {groups.length === 0 ? <p className="mt-3 text-sm text-muted">Brak uzupełnionych odpowiedzi.</p> : (
        <div className="mt-4 space-y-4">
          {groups.map((g) => (
            <div key={g.section}>
              <p className="text-sm font-semibold text-forest">{g.section}</p>
              <dl className="mt-1.5 space-y-2 text-sm">
                {g.items.map((it) => <div key={it.label}><dt className="text-muted">{it.label}</dt><dd className="whitespace-pre-line text-ink">{it.value}</dd></div>)}
              </dl>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
