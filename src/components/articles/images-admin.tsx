// Panel „Wiedza”: ilustracje artykułów (grafika na górze + infografiki-ilustracje) – generowanie przez OpenAI.
import { deleteArticleImageAction, generateArticleImageAction, generateArticleMissingAction } from "@/actions/covers";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card } from "@/components/ui";
import { ARTICLES } from "@/content/articles";
import { articleImageJobs, articleImageMap } from "@/lib/article-images";
import { coverGenConfigured } from "@/lib/cover-photos";

export async function ArticleImagesAdmin() {
  const images = await articleImageMap();
  const ready = coverGenConfigured();
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
      <div className="mt-5 space-y-5">
        {ARTICLES.map((a) => {
          const jobs = articleImageJobs(a.slug);
          const missing = jobs.filter((j) => !images[j.key]).length;
          return (
            <div key={a.slug} className="rounded-2xl bg-linen/50 p-4 ring-1 ring-sand" data-testid="article-images-item">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-ink">{a.title} <span className="text-sm text-muted">· {jobs.length - missing}/{jobs.length} gotowe</span></p>
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
                      {images[j.key] && <img src={images[j.key]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-medium text-ink">{j.label}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <ActionForm action={generateArticleImageAction as never}>
                        <input type="hidden" name="key" value={j.key} />
                        <SubmitButton size="sm" variant="secondary" className={ready ? "" : "pointer-events-none opacity-50"}>{images[j.key] ? "Ponownie" : "Wygeneruj"}</SubmitButton>
                      </ActionForm>
                      {images[j.key] && (
                        <ActionForm action={deleteArticleImageAction as never}>
                          <input type="hidden" name="key" value={j.key} />
                          <SubmitButton size="sm" variant="ghost" confirm="Usunąć grafikę?">Usuń</SubmitButton>
                        </ActionForm>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
