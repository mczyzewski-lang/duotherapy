// Spis artykułów o terapii par i terapii małżeńskiej (SEO: strona zbiorcza, ItemList).
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/article";
import { TagFilter } from "@/components/articles/tag-filter";
import { articleImageMap, heroKey } from "@/lib/article-images";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ARTICLES, ARTICLES_PATH, articleHref } from "@/content/articles";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Terapia par i terapia małżeńska – artykuły | DUO" },
  description: "Artykuły o terapii par i małżeńskiej: kłótnie, ciche dni, zdrada, brak bliskości, kryzys w związku, decyzja o rozstaniu i to, jak wygląda terapia.",
  alternates: { canonical: `${env.appUrl}${ARTICLES_PATH}` },
  openGraph: { title: "Terapia par i terapia małżeńska – artykuły DUO", description: "Praktyczne artykuły o terapii par, kryzysie w związku i decyzjach.", url: `${env.appUrl}${ARTICLES_PATH}`, type: "website", locale: "pl_PL" },
};

export default async function ArticlesIndex() {
  const [s, images] = await Promise.all([getSettings(), articleImageMap()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ARTICLES.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${env.appUrl}${articleHref(a.slug)}`, name: a.h1 })),
  };
  // tematy obecne w co najmniej 2 artykułach, od najczęstszych
  const counts = new Map<string, number>();
  for (const a of ARTICLES) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const tags = [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([label, count], i) => ({ id: `t${i}`, label, count }));
  const tagId = new Map(tags.map((t) => [t.label, t.id]));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pt-14">
        <nav aria-label="Ścieżka" className="text-xs text-muted"><Link href="/wiedza" className="hover:text-forest">Wiedza</Link> / Artykuły</nav>
        <h1 className="mt-4 max-w-3xl font-display text-[2.1rem] leading-[1.1] text-ink sm:text-5xl">Terapia par i terapia małżeńska – artykuły</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          Kłótnie, ciche dni, zdrada, brak bliskości, decyzja o przyszłości związku – i to, jak może pomóc terapia par. Wybierz temat albo przeglądaj wszystkie ({ARTICLES.length}).
        </p>
        <TagFilter tags={tags} listId="art-list" />
        <ul id="art-list" className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => <li key={a.slug} data-t={a.tags.map((t) => tagId.get(t)).filter(Boolean).join(" ")}><ArticleCard a={a} image={images[heroKey(a.slug)]} /></li>)}
        </ul>
        <p className="mt-10 text-[15px] text-ink-soft">Szukasz ćwiczeń i pytań do pracy? Zobacz <Link href="/wiedza" className="font-medium text-forest underline underline-offset-4">bezpłatne materiały DUO</Link>.</p>
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
