// Strona zbiorcza „Wiedza” – 10 bezpłatnych materiałów w trzech kategoriach (filtr bez przeładowania).
import type { Metadata } from "next";
import { LazyList } from "@/components/articles/lazy-list";
import { pageMeta } from "@/lib/seo";
import { KTrack } from "@/components/knowledge/client";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/article";
import { articleImageMap, heroKey } from "@/lib/article-images";
import { KnowledgeGrid } from "@/components/knowledge/grid";
import { ARTICLES, ARTICLES_PATH } from "@/content/articles";
import { coverPhotoMap } from "@/lib/cover-photos";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getSettings } from "@/lib/settings";

// treść zależy od ustawień w bazie – renderowanie przy żądaniu (baza nie jest dostępna podczas budowania)
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Wiedza – bezpłatne poradniki o relacjach | DUO",
  description: "Bezpłatne poradniki, pytania i ćwiczenia DUO o kryzysie w związku, trudnych rozmowach, konflikcie, zdradzie i rozstaniu. Wybierz temat, który jest dla Ciebie ważny.",
  path: "/wiedza",
  ogTitle: "Wiedza, która pomaga lepiej zrozumieć relację",
  kicker: "Bezpłatne materiały i artykuły",
});

export default async function KnowledgeHub() {
  const s = await getSettings();
  const photos = await coverPhotoMap();
  const images = await articleImageMap();
  return (
    <>
      <KTrack event="knowledge_hub_view" />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Wiedza</p>
        <h1 className="mt-3 max-w-3xl font-display text-[2.1rem] leading-[1.1] text-ink sm:text-5xl">Wiedza, która pomaga lepiej zrozumieć relację</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          Bezpłatne poradniki, pytania i ćwiczenia przygotowane przez DUO. Wybierz temat, który jest teraz dla Ciebie ważny.
        </p>
        <KnowledgeGrid photos={photos} />

        {/* ARTYKUŁY – pod materiałami */}
        <section className="mt-20" aria-labelledby="art-h">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Artykuły</p>
              <h2 id="art-h" className="mt-2 font-display text-[1.9rem] leading-tight text-ink sm:text-4xl">Terapia par i terapia małżeńska – przeczytaj</h2>
              <p className="mt-2 max-w-2xl text-ink-soft">Kłótnie, ciche dni, zdrada, brak bliskości, decyzja o przyszłości związku – i to, jak może pomóc terapia par. Przewiń, żeby zobaczyć kolejne.</p>
            </div>
            <Link href={ARTICLES_PATH} className="text-sm font-semibold text-forest hover:underline">Wszystkie artykuły →</Link>
          </div>
          <LazyList className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" initial={6} step={6} moreLabel="Pokaż więcej artykułów" testId="articles-lazy">
            {ARTICLES.map((a) => <ArticleCard key={a.slug} a={a} image={images[heroKey(a.slug)]} />)}
          </LazyList>
        </section>
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
