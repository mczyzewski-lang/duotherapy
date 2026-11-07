// Panel „Wiedza”: widoczność materiałów na stronie – przełącznik [Widoczny | Ukryty] przy każdym materiale.
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { setMagnetVisibilityAction } from "@/actions/magnets";
import { ActionForm } from "@/components/form-bits";
import { Card } from "@/components/ui";
import { hiddenMagnets } from "@/lib/magnet-visibility";
import { MAGNETS } from "@/knowledge/registry";
import { MagnetIcon } from "./icons";

export async function MagnetVisibilityAdmin() {
  const hidden = await hiddenMagnets();
  return (
    <Card className="mb-6 p-6" data-testid="magnet-visibility">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-ink">Widoczność materiałów</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Ukryty materiał znika z menu, strony głównej, /wiedza, artykułów i mapy strony; jego strona zwraca 404. Osoby, które już go odebrały, dalej mają dostęp przez swój link.
          </p>
        </div>
        <p className="text-sm text-muted">widocznych: <strong className="text-forest">{MAGNETS.length - hidden.size}</strong> / {MAGNETS.length}</p>
      </div>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {MAGNETS.map((m) => {
          const on = !hidden.has(m.slug);
          return (
            <li key={m.slug} className={clsx("flex flex-wrap items-center gap-3 rounded-2xl p-2.5 pr-3 ring-1 [&_[role=alert]]:order-last [&_[role=alert]]:basis-full [&_[role=alert]]:p-2 [&_[role=alert]]:text-xs [&_[role=status]]:order-last [&_[role=status]]:basis-full [&_[role=status]]:p-2 [&_[role=status]]:text-xs", on ? "bg-white ring-sand" : "bg-linen/60 ring-sand/70")} data-testid="magnet-visibility-item">
              <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-soft ring-1 ring-sand", !on && "opacity-50")}><MagnetIcon icon={m.icon} id={`vis-${m.id}`} className="h-5 w-5" /></span>
              <span className={clsx("min-w-0 flex-1 text-sm font-medium", on ? "text-ink" : "text-muted line-through decoration-sand-dark")}>{m.short}</span>
              <div className="flex shrink-0 rounded-full bg-linen/70 p-0.5 ring-1 ring-sand [&_[role=status]]:hidden" role="radiogroup" aria-label={`Widoczność: ${m.short}`}>
                {[true, false].map((v) => (
                  <ActionForm key={String(v)} action={setMagnetVisibilityAction as never} className="contents">
                    <input type="hidden" name="slug" value={m.slug} />
                    <input type="hidden" name="visible" value={v ? "1" : "0"} />
                    <button type="submit" role="radio" aria-checked={on === v} disabled={on === v}
                      className={clsx("inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition",
                        on === v ? (v ? "bg-forest text-white shadow-soft" : "bg-clay text-white shadow-soft") : "text-ink-soft hover:text-forest")}>
                      {v ? <Eye size={13} aria-hidden /> : <EyeOff size={13} aria-hidden />} {v ? "Widoczny" : "Ukryty"}
                    </button>
                  </ActionForm>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
