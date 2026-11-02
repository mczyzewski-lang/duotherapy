// Podsumowanie odpowiedzi z materiału (tylko dla osoby, która je wpisała) + zaproszenie do dołączenia ich do quizu Mapy Relacji™.
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapaSymbol } from "@/components/brand";
import { MagnetIcon } from "@/components/knowledge/icons";
import { PrintButton } from "@/components/knowledge/print-button";
import { contentReader, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { coverOf } from "@/knowledge/covers";
import { summarize } from "@/knowledge/fields";
import { magnetBySlug } from "@/knowledge/registry";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Twoje podsumowanie", robots: { index: false, follow: false } };

export default async function SummaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  const c = m && coverOf(m.slug);
  if (!m || !c?.summary) notFound();
  const res = await system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return null;
    const a = await loadAnswers(tx, who.email, m.id);
    return { groups: summarize(m, a?.data ?? {}), updatedAt: a?.updatedAt ?? null };
  });
  const title = `Twoje podsumowanie: ${m.short}`;

  return (
    <div className="min-h-dvh bg-linen/60">
      <main id="main" className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-5">
        <Link href={`/wiedza/${m.slug}/material`} className="no-print mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-forest">
          <ArrowLeft size={16} aria-hidden /> Wróć do uzupełniania
        </Link>
        <header className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
            <MagnetIcon icon={m.icon} id={`sum-${m.id}`} className="h-5 w-5" /> {m.short}
          </p>
          <h1 className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">{title}</h1>
          {res?.updatedAt && <p className="mt-2 text-sm text-muted">Ostatni zapis: {new Date(res.updatedAt).toLocaleString("pl-PL")}</p>}
          <p className="mt-3 flex gap-2 text-sm text-ink-soft"><Lock size={15} className="mt-0.5 shrink-0" aria-hidden /> Twoje odpowiedzi widzisz tylko Ty. Nikt z DUO ich nie czyta, dopóki sam / sama ich nie dołączysz.</p>
          <div className="mt-5"><PrintButton /></div>
        </header>

        {!res ? (
          <p className="mt-6 rounded-3xl bg-white p-6 leading-relaxed text-ink-soft ring-1 ring-sand">
            Podsumowanie jest dostępne na urządzeniu, na którym uzupełniasz materiał. Otwórz go z linku w e-mailu albo <Link href={`/wiedza/${m.slug}#odbierz`} className="font-medium text-forest underline">odbierz materiał ponownie</Link>.
          </p>
        ) : res.groups.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-white p-6 leading-relaxed text-ink-soft ring-1 ring-sand">
            Nie ma jeszcze żadnych odpowiedzi. <Link href={`/wiedza/${m.slug}/material`} className="font-medium text-forest underline">Wróć do materiału</Link> i uzupełnij pola – zapiszą się automatycznie.
          </p>
        ) : (
          <div className="mt-6 space-y-5" data-testid="summary">
            {res.groups.map((g) => (
              <section key={g.section} className="break-inside-avoid rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand sm:p-6">
                <h2 className="font-display text-xl text-forest">{g.section}</h2>
                <dl className="mt-3 space-y-3">
                  {g.items.map((it) => (
                    <div key={it.label} className="border-t border-sand pt-3 first:border-0 first:pt-0">
                      <dt className="text-sm font-medium text-ink">{it.label}</dt>
                      <dd className="mt-1 whitespace-pre-line leading-relaxed text-ink-soft">{it.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}

        <section className="no-print mt-8 rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 p-6 text-white shadow-soft sm:p-9" aria-labelledby="att-h">
          <div className="flex items-center gap-2"><MapaSymbol id={`sum-m-${m.id}`} className="h-5 w-auto" /><span className="font-wordmark text-lg">Mapa Relacji™</span></div>
          <h2 id="att-h" className="mt-3 font-display text-[1.6rem] leading-tight sm:text-3xl">Dołącz to podsumowanie do quizu i otrzymaj Mapę Relacji™</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/85">
            Twoje odpowiedzi mogą być punktem wyjścia do rozmowy z psychologiem. W krótkim quizie zaznaczysz, że chcesz je dołączyć – psycholog zobaczy je przy Twoim zgłoszeniu i nie zaczniesz od zera.
          </p>
          <Link href={`/start?dolacz=${m.slug}`} className="mt-5 inline-flex min-h-14 items-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white">
            Przejdź do quizu i dołącz podsumowanie <ArrowRight size={18} aria-hidden />
          </Link>
          <p className="mt-3 text-sm text-white/70">Dołączenie jest dobrowolne – zdecydujesz o nim na końcu quizu.</p>
        </section>
      </main>
    </div>
  );
}
