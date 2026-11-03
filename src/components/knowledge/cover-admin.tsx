// Panel „Wiedza”: okładki zdjęciowe – podgląd, projekt zdjęcia, generowanie (OpenAI) i usunięcie.
import { deleteCoverAction, generateCoverAction } from "@/actions/covers";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card } from "@/components/ui";
import { coverGenConfigured, coverPhotoMap } from "@/lib/cover-photos";
import { COVERS } from "@/knowledge/covers";
import { MAGNETS } from "@/knowledge/registry";
import { Cover } from "./doc";

export async function CoverAdmin() {
  const photos = await coverPhotoMap();
  const ready = coverGenConfigured();
  return (
    <Card className="mb-6 p-6" data-testid="cover-admin">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Okładki zdjęciowe</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Zdjęcie generuje OpenAI na podstawie projektu poniżej (bez tekstu, bez rozpoznawalnych twarzy). Jedna okładka to ok. 30–60 s.
            Wynik od razu zastępuje okładkę bez zdjęcia na stronie głównej, w /wiedza i na stronie materiału.
          </p>
        </div>
        <Badge tone={ready ? "ok" : "clay"}>{ready ? "OPENAI_API_KEY ustawiony" : "Brak OPENAI_API_KEY – generowanie wyłączone"}</Badge>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {MAGNETS.map((m) => {
          const has = !!photos[m.slug];
          return (
            <li key={m.slug} className="flex flex-col rounded-2xl bg-linen/50 p-3 ring-1 ring-sand" data-testid="cover-item">
              <div className="mx-auto h-[13rem] w-[9.75rem]"><div className="w-[13rem] origin-top-left scale-75"><Cover m={m} mode="screen" compact photo={photos[m.slug]} /></div></div>
              <p className="mt-2 text-sm font-medium text-ink">{m.short} {has ? <Badge tone="ok">zdjęcie</Badge> : <Badge>bez zdjęcia</Badge>}</p>
              <details className="mt-1 text-xs text-muted"><summary className="cursor-pointer">Projekt zdjęcia</summary><p className="mt-1 leading-relaxed">{COVERS[m.slug]?.photoBrief}</p></details>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <ActionForm action={generateCoverAction as never}>
                  <input type="hidden" name="slug" value={m.slug} />
                  <SubmitButton size="sm" variant={has ? "secondary" : "primary"} className={ready ? "" : "pointer-events-none opacity-50"}>{has ? "Wygeneruj ponownie" : "Wygeneruj"}</SubmitButton>
                </ActionForm>
                {has && (
                  <ActionForm action={deleteCoverAction as never}>
                    <input type="hidden" name="slug" value={m.slug} />
                    <SubmitButton size="sm" variant="ghost" confirm="Usunąć zdjęcie z okładki?">Usuń</SubmitButton>
                  </ActionForm>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
