// Panel „Wiedza”: ilustracje artykułów (grafika na górze + infografiki-ilustracje) – generowanie przez OpenAI.
import { deleteArticleImageAction, generateAllArticleImagesAction, generateArticleImageAction, generateArticleMissingAction, stopAllArticleImagesAction } from "@/actions/covers";
import { AutoRefresh } from "./auto-refresh";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card } from "@/components/ui";
import { ARTICLES } from "@/content/articles";
import { allArticleImageJobs, articleImageJobs, articleImageMap, bulkStatus, invalidateArticleImages, outdatedArticleImages } from "@/lib/article-images";
import { coverGenConfigured } from "@/lib/cover-photos";

export async function ArticleImagesAdmin() {
  const bulk = bulkStatus();
  if (bulk?.running) invalidateArticleImages();
  const images = await articleImageMap();
  const ready = coverGenConfigured();
  const all = allArticleImageJobs();
  const missingAll = all.filter((j) => !images[j.key]).length;
  const outdated = await outdatedArticleImages();
  const outdatedAll = all.filter((j) => images[j.key] && outdated.has(j.key)).length;
  return (
    <Card className="mb-6 p-6" data-testid="article-images-admin">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Grafiki artykułów</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Minimalistyczne ilustracje w barwach DUO (bez tekstu w obrazie – tytuł i podpis z ideą są pod grafiką). Jedna grafika to ok. 30–60 s;
            „Wygeneruj brakujące” robi wszystkie grafiki artykułu po kolei.
          </p>
        </div>
        <Badge tone={ready ? "ok" : "clay"}>{ready ? "OPENAI_API_KEY ustawiony" : "Brak OPENAI_API_KEY – generowanie wyłączone"}</Badge>
      </div>
      <div className="mt-5 rounded-2xl bg-sage-soft/50 p-4 ring-1 ring-sage/30" data-testid="article-images-bulk">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            <strong>{all.length - missingAll}/{all.length}</strong> grafik gotowych w {ARTICLES.length} artykułach
            {missingAll > 0 && <> · brakuje {missingAll} (ok. {Math.ceil((missingAll * 45) / 2 / 60)} min przy generowaniu w tle)</>}
            {outdatedAll > 0 && <> · {outdatedAll} w starym stylu postaci</>}
          </p>
          {bulk?.running ? (
            <ActionForm action={stopAllArticleImagesAction as never}><SubmitButton size="sm" variant="ghost">Zatrzymaj</SubmitButton></ActionForm>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingAll > 0 && (
                <ActionForm action={generateAllArticleImagesAction as never}>
                  <input type="hidden" name="mode" value="missing" />
                  <SubmitButton size="sm" className={ready ? "" : "pointer-events-none opacity-50"} confirm={`Wygenerować ${missingAll} grafik w tle? Każda to jedno płatne wywołanie OpenAI.`}>Wygeneruj wszystkie brakujące ({missingAll})</SubmitButton>
                </ActionForm>
              )}
              {outdatedAll > 0 && (
                <ActionForm action={generateAllArticleImagesAction as never}>
                  <input type="hidden" name="mode" value="outdated" />
                  <SubmitButton size="sm" variant="secondary" className={ready ? "" : "pointer-events-none opacity-50"} confirm={`Wygenerować ponownie ${outdatedAll} grafik w starym stylu${missingAll ? ` i ${missingAll} brakujących` : ""}? Każda to jedno płatne wywołanie OpenAI.`}>Odśwież grafiki w starym stylu ({outdatedAll})</SubmitButton>
                </ActionForm>
              )}
            </div>
          )}
        </div>
        {bulk && (
          <div className="mt-3">
            {bulk.running && <AutoRefresh />}
            <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-sand">
              <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${bulk.total ? Math.round(((bulk.done + bulk.failed.length) / bulk.total) * 100) : 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {bulk.running ? `Trwa generowanie w tle: ${bulk.done} z ${bulk.total}${bulk.current.length ? ` · teraz: ${bulk.current.join(", ")}` : ""} – strona odświeża się sama.` : `Zakończono: ${bulk.done} z ${bulk.total} gotowych.`}
              {bulk.failed.length > 0 && ` Błędy: ${bulk.failed.length}.`}
            </p>
            {bulk.stoppedReason && <p className="mt-1 text-xs text-alert">{bulk.stoppedReason}</p>}
            {bulk.failed.length > 0 && !bulk.running && <p className="mt-1 text-xs text-muted">Ostatni błąd ({bulk.failed[bulk.failed.length - 1].key}): {bulk.failed[bulk.failed.length - 1].error}</p>}
          </div>
        )}
      </div>
      <div className="mt-5 space-y-3">
        {ARTICLES.map((a) => {
          const jobs = articleImageJobs(a.slug);
          const missing = jobs.filter((j) => !images[j.key]).length;
          return (
            <details key={a.slug} className="group rounded-2xl bg-linen/50 p-4 ring-1 ring-sand" data-testid="article-images-item">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-ink">{a.title} <span className="text-sm text-muted">· {jobs.length - missing}/{jobs.length} gotowe</span> {missing === 0 ? <Badge tone="ok">komplet</Badge> : <Badge tone="clay">brakuje {missing}</Badge>}</p>
                <span className="text-xs text-muted group-open:hidden">Pokaż grafiki ▾</span>
              </summary>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                {missing > 0 && (
                  <ActionForm action={generateArticleMissingAction as never}>
                    <input type="hidden" name="slug" value={a.slug} />
                    <SubmitButton size="sm" className={ready ? "" : "pointer-events-none opacity-50"}>Wygeneruj brakujące ({missing})</SubmitButton>
                  </ActionForm>
                )}
              </div>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {jobs.map((j) => (
                  <li key={j.key} className="rounded-xl bg-white p-2.5 ring-1 ring-sand">
                    <div className="aspect-[3/2] overflow-hidden rounded-lg bg-gradient-to-br from-linen to-sage-soft">
                      {images[j.key] && <img src={images[j.key]} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-medium text-ink">{j.label} {images[j.key] && outdated.has(j.key) && <Badge tone="clay">stary styl</Badge>}</p>
                    {/* formularze „contents” – przyciski w jednym rzędzie, komunikat (Gotowe / błąd) w pełnej szerokości pod nimi */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 [&_[role=alert]]:mt-1 [&_[role=alert]]:basis-full [&_[role=alert]]:order-last [&_[role=alert]]:p-2.5 [&_[role=alert]]:text-xs [&_[role=status]]:mt-1 [&_[role=status]]:basis-full [&_[role=status]]:order-last [&_[role=status]]:p-2.5 [&_[role=status]]:text-xs">
                      <ActionForm action={generateArticleImageAction as never} className="contents">
                        <input type="hidden" name="key" value={j.key} />
                        <SubmitButton size="sm" variant="secondary" className={ready ? "" : "pointer-events-none opacity-50"}>{images[j.key] ? "Ponownie" : "Wygeneruj"}</SubmitButton>
                      </ActionForm>
                      {images[j.key] && (
                        <ActionForm action={deleteArticleImageAction as never} className="contents">
                          <input type="hidden" name="key" value={j.key} />
                          <SubmitButton size="sm" variant="ghost" confirm="Usunąć grafikę?">Usuń</SubmitButton>
                        </ActionForm>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </Card>
  );
}
