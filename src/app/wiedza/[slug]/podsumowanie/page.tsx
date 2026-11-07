// Podsumowanie odpowiedzi z materiału (tylko dla osoby, która je wpisała) + zaproszenie do dołączenia ich do quizu Mapy Relacji™.
import { Check, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapaSymbol } from "@/components/brand";
import { MagnetIcon } from "@/components/knowledge/icons";
import { MaterialTopBar } from "@/components/knowledge/tabs";
import { contentReader, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { coverOf } from "@/knowledge/covers";
import { summarize } from "@/knowledge/fields";
import { magnetBySlug } from "@/knowledge/registry";
import { KTrack } from "@/components/knowledge/client";
import { AttachBar, OfferLink } from "@/components/knowledge/summary-actions";

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
    // lejek: osoba zrobiła podsumowanie swoich odpowiedzi
    if (a) await tx`update content_answers set summary_at = coalesce(summary_at, now()) where id = ${a.id}`;
    return { groups: summarize(m, a?.data ?? {}), updatedAt: a?.updatedAt ?? null };
  });
  const ready = !!res && res.groups.length > 0;

  return (
    <div className="min-h-dvh bg-linen/60">
      {res && <KTrack event="lead_magnet_summary_view" step={m.n} />}
      <MaterialTopBar kicker="Twój materiał DUO" title={m.short} materialHref={`/wiedza/${m.slug}/material`} summaryHref={`/wiedza/${m.slug}/podsumowanie`} active="summary" />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-36 pt-6 sm:px-5">
        <header className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
            <MagnetIcon icon={m.icon} id={`sum-${m.id}`} className="h-5 w-5" /> {m.short}
          </p>
          {/* najpierw wartość: gotowe podsumowanie, które można zachować */}
          <h1 className="mt-3 flex items-center gap-3 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">
            {ready && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={22} aria-hidden /></span>}
            {ready ? "Twoje podsumowanie jest gotowe" : `Twoje podsumowanie: ${m.short}`}
          </h1>
          {ready && <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">Zebraliśmy Twoje odpowiedzi w jednym miejscu. To Twoja perspektywa – możesz do niej wracać w każdej chwili z zakładki „Podsumowanie”.</p>}
          {res?.updatedAt && <p className="mt-2 text-sm text-muted">Ostatni zapis: {new Date(res.updatedAt).toLocaleString("pl-PL")}</p>}
          <p className="mt-3 flex gap-2 text-sm text-ink-soft"><Lock size={15} className="mt-0.5 shrink-0" aria-hidden /> Twoje odpowiedzi widzisz tylko Ty. Nikt z DUO ich nie czyta, dopóki sam / sama ich nie dołączysz.</p>
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

        {/* dopiero potem oferta: podsumowanie ≠ pełna Mapa Relacji */}
        <section className="no-print mt-10 rounded-[2rem] bg-gradient-to-br from-forest to-forest-800 p-6 text-white shadow-soft sm:p-9" aria-labelledby="att-h" data-testid="summary-upsell">
          <div className="flex items-center gap-2"><MapaSymbol id={`sum-m-${m.id}`} className="h-5 w-auto" /><span className="font-wordmark text-lg">Mapa Relacji</span></div>
          <h2 id="att-h" className="mt-3 font-display text-[1.6rem] leading-tight sm:text-3xl">Rozszerz podsumowanie o Mapę Relacji</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/85">
            Twoje podsumowanie pokazuje Twoją perspektywę. W Mapie Relacji możesz rozwinąć ją w pełny obraz sytuacji i otrzymać konkretne wskazówki, co zrobić dalej.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">To podsumowanie</p>
              <ul className="mt-2 space-y-1.5 text-[14.5px] text-white/85">
                <li>• Twoje odpowiedzi, uporządkowane</li>
                <li>• Jedna perspektywa – Twoja</li>
                <li>• Bez interpretacji i bez wskazówek</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-4 text-ink">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Pełna Mapa Relacji</p>
              <ul className="mt-2 space-y-1.5 text-[14.5px] text-ink-soft">
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />Spotkanie z psychologiem (dla Was: z każdym z Was i wspólne)</li>
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />Pełny obraz: co Was wspiera, gdzie jest najtrudniej, jak działa konflikt</li>
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />Pisemne podsumowanie z konkretnymi wskazówkami, co dalej</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/75">To podsumowanie nie jest pełną Mapą Relacji ani diagnozą.</p>
          <OfferLink href={`/start?dolacz=${m.slug}`} n={m.n} className="mt-5 inline-flex min-h-14 items-center gap-2 rounded-full bg-clay px-7 text-[16px] font-semibold text-white">
            Rozszerz podsumowanie o Mapę Relacji
          </OfferLink>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Na końcu krótkiego quizu możesz dołączyć te odpowiedzi do zgłoszenia – psycholog zobaczy je przy Twojej sprawie, także w wariancie dla Was, więc nie wypełniasz ich drugi raz. Dołączenie jest dobrowolne.
          </p>
        </section>
      </main>
      {ready && <AttachBar slug={m.slug} n={m.n} />}
    </div>
  );
}
