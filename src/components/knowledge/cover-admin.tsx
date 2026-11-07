// Panel „Wiedza”: okładki materiałów w dwóch wariantach (zdjęcie / grafika 2D w stylu maskotek DUO) i globalny wybór,
// który wariant pokazuje strona. Generowanie przez OpenAI – pojedynczo albo wszystkie brakujące w tle.
import clsx from "clsx";
import { deleteCoverAction, generateCoverAction, generateMissingCoversAction, setCoverStyleAction, stopCoversAction } from "@/actions/covers";
import { AutoRefresh } from "@/components/articles/auto-refresh";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Badge, Card } from "@/components/ui";
import { bulkStatus } from "@/lib/bulk";
import { COVER_VARIANT_LABEL, COVER_VARIANTS, coverGenConfigured, coverState, type CoverVariant } from "@/lib/cover-photos";
import { COVERS } from "@/knowledge/covers";
import { MAGNETS } from "@/knowledge/registry";
import { Cover } from "./doc";

export async function CoverAdmin() {
  const { style, all } = await coverState();
  const ready = coverGenConfigured();
  const bulk = bulkStatus("covers");
  const missing = (v: CoverVariant) => MAGNETS.filter((m) => COVERS[m.slug] && !all[v][m.slug]).length;
  return (
    <Card className="mb-6 p-6" data-testid="cover-admin">
      {bulk?.running && <AutoRefresh />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Okładki materiałów</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Każdy materiał może mieć dwie okładki: <strong>zdjęcie</strong> i <strong>grafikę 2D</strong> w stylu maskotek DUO (jak w artykułach).
            Na stronie (główna, /wiedza, landing materiału, artykuły) widać wariant wybrany obok. Brak okładki w wybranym wariancie = okładka bez obrazu.
          </p>
        </div>
        <Badge tone={ready ? "ok" : "clay"}>{ready ? "OPENAI_API_KEY ustawiony" : "Brak OPENAI_API_KEY – generowanie wyłączone"}</Badge>
      </div>

      {/* Globalny wybór wariantu */}
      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-sage-soft/50 p-4 ring-1 ring-sage/30" data-testid="cover-style">
        <p className="text-sm font-medium text-ink">Na stronie pokazuj:</p>
        <div className="flex rounded-full bg-white p-1 ring-1 ring-sand" role="radiogroup" aria-label="Wariant okładek na stronie">
          {COVER_VARIANTS.map((v) => (
            <ActionForm key={v} action={setCoverStyleAction as never} className="contents">
              <input type="hidden" name="variant" value={v} />
              <button
                type="submit"
                role="radio"
                aria-checked={style === v}
                className={clsx("min-h-10 rounded-full px-5 text-sm font-semibold transition", style === v ? "bg-forest text-white shadow-soft" : "text-ink-soft hover:text-forest")}
              >
                {COVER_VARIANT_LABEL[v]} <span className={clsx("ml-1 text-xs font-normal", style === v ? "text-white/70" : "text-muted")}>{MAGNETS.length - missing(v)}/{MAGNETS.length}</span>
              </button>
            </ActionForm>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {bulk?.running ? (
            <ActionForm action={stopCoversAction as never}><SubmitButton size="sm" variant="ghost">Zatrzymaj</SubmitButton></ActionForm>
          ) : (
            COVER_VARIANTS.map((v) =>
              missing(v) > 0 ? (
                <ActionForm key={v} action={generateMissingCoversAction as never}>
                  <input type="hidden" name="variant" value={v} />
                  <SubmitButton size="sm" variant={v === "illustration" ? "primary" : "secondary"} className={ready ? "" : "pointer-events-none opacity-50"} confirm={`Wygenerować ${missing(v)} okładek (${v === "illustration" ? "grafiki 2D" : "zdjęcia"}) w tle? Każda to jedno płatne wywołanie OpenAI.`}>
                    {v === "illustration" ? "Wygeneruj brakujące grafiki 2D" : "Wygeneruj brakujące zdjęcia"} ({missing(v)})
                  </SubmitButton>
                </ActionForm>
              ) : null,
            )
          )}
        </div>
        {bulk && (
          <p className="basis-full text-xs text-muted">
            {bulk.running ? `Trwa generowanie okładek w tle: ${bulk.done} z ${bulk.total}${bulk.current.length ? ` · teraz: ${bulk.current.join(", ")}` : ""} – strona odświeża się sama.` : `Ostatnie generowanie: ${bulk.done} z ${bulk.total} gotowych.`}
            {bulk.failed.length > 0 && ` Błędy: ${bulk.failed.length} (ostatni: ${bulk.failed[bulk.failed.length - 1].error}).`}
            {bulk.stoppedReason && ` ${bulk.stoppedReason}`}
          </p>
        )}
      </div>

      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MAGNETS.map((m) => (
          <li key={m.slug} className="rounded-2xl bg-linen/50 p-3 ring-1 ring-sand" data-testid="cover-item">
            <p className="text-sm font-medium text-ink">{m.short}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {COVER_VARIANTS.map((v) => {
                const src = all[v][m.slug];
                return (
                  <div key={v} className={clsx("flex flex-col rounded-xl bg-white p-2 ring-1", style === v ? "ring-2 ring-forest/50" : "ring-sand")} data-testid={`cover-${v}`}>
                    <div className="mx-auto h-[10.4rem] w-[7.8rem] overflow-hidden"><div className="w-[13rem] origin-top-left scale-[0.6]"><Cover m={m} mode="screen" compact photo={src ?? null} idSuffix={`-adm-${v}`} /></div></div>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-ink-soft">
                      {COVER_VARIANT_LABEL[v]} {src ? <Badge tone="ok">jest</Badge> : <Badge>brak</Badge>} {style === v && <Badge tone="forest">na stronie</Badge>}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 [&_[role=alert]]:order-last [&_[role=alert]]:mt-1 [&_[role=alert]]:basis-full [&_[role=alert]]:p-2 [&_[role=alert]]:text-xs [&_[role=status]]:order-last [&_[role=status]]:mt-1 [&_[role=status]]:basis-full [&_[role=status]]:p-2 [&_[role=status]]:text-xs">
                      <ActionForm action={generateCoverAction as never} className="contents">
                        <input type="hidden" name="slug" value={m.slug} />
                        <input type="hidden" name="variant" value={v} />
                        <SubmitButton size="sm" variant={src ? "secondary" : "primary"} className={ready ? "" : "pointer-events-none opacity-50"}>{src ? "Ponownie" : "Wygeneruj"}</SubmitButton>
                      </ActionForm>
                      {src && (
                        <ActionForm action={deleteCoverAction as never} className="contents">
                          <input type="hidden" name="slug" value={m.slug} />
                          <input type="hidden" name="variant" value={v} />
                          <SubmitButton size="sm" variant="ghost" confirm="Usunąć tę okładkę?">Usuń</SubmitButton>
                        </ActionForm>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <details className="mt-2 text-xs text-muted">
              <summary className="cursor-pointer">Projekty okładek</summary>
              <p className="mt-1 leading-relaxed"><strong>Zdjęcie:</strong> {COVERS[m.slug]?.photoBrief}</p>
              <p className="mt-1 leading-relaxed"><strong>Grafika 2D:</strong> {COVERS[m.slug]?.artBrief}</p>
            </details>
          </li>
        ))}
      </ul>
    </Card>
  );
}
