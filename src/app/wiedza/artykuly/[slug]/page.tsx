// Artykuł „Wiedzy” – SEO (długi ogon): metadane, dane strukturalne (Article, BreadcrumbList, FAQPage), spis treści,
// infografiki, kontenery z materiałami, FAQ, powiązane artykuły i materiały.
import { CalendarDays, Clock, ChevronDown } from "lucide-react";
import { MapaSymbol } from "@/components/brand";
import type { Metadata } from "next";
import { absUrl, ogImage, SITE_NAME } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody, ArticleCard, MagnetCta } from "@/components/articles/article";
import { ArticleTrack } from "@/components/articles/track";
import { MagnetCard, MagnetRail } from "@/components/knowledge/magnet-card";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ARTICLES_PATH, AUTHOR, articleBySlug, articleHref, relatedArticles } from "@/content/articles";
import { articleImageMap, heroKey } from "@/lib/article-images";
import { coverPhotoMap } from "@/lib/cover-photos";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { magnetBySlug } from "@/knowledge/registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  const url = `${env.appUrl}${articleHref(a.slug)}`;
  const hero = (await articleImageMap())[heroKey(a.slug)];
  const images = hero ? [{ url: `${env.appUrl}${hero}`, width: 1536, height: 1024, alt: a.hero.alt }] : [{ url: absUrl(ogImage(a.title, "Artykuł · terapia par")), width: 1200, height: 630, alt: a.h1 }];
  return {
    title: { absolute: `${a.seoTitle} | DUO` },
    description: a.description,
    keywords: a.keywords,
    alternates: { canonical: url },
    openGraph: { title: a.h1, description: a.description, url, type: "article", locale: "pl_PL", siteName: SITE_NAME, publishedTime: a.published, modifiedTime: a.updated, tags: a.tags, authors: [AUTHOR.name], images },
    twitter: { card: "summary_large_image", title: a.h1, description: a.description, images: images.map((i) => i.url) },
    authors: [{ name: AUTHOR.name }],
  };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const [s, photos, images] = await Promise.all([getSettings(), coverPhotoMap(), articleImageMap()]);
  const heroSrc = images[heroKey(a.slug)];
  const toc = a.blocks.filter((b) => b.t === "h2") as { id: string; text: string }[];
  const related = relatedArticles(a);
  const magnets = a.magnets.map(magnetBySlug).filter((m) => !!m);
  // boczny panel poleca materiał, którego nie ma już w kontenerach w treści (bez powtórzeń obok siebie)
  const inline = new Set(a.blocks.flatMap((b) => (b.t === "cta" ? [b.magnet] : [])));
  const main = magnets.find((m) => !inline.has(m.slug)) ?? magnets[0];
  const url = `${env.appUrl}${articleHref(a.slug)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.h1,
      description: a.description,
      datePublished: a.published,
      dateModified: a.updated,
      inLanguage: "pl-PL",
      keywords: a.keywords.join(", "),
      mainEntityOfPage: url,
      author: { "@type": "Person", name: AUTHOR.name, jobTitle: AUTHOR.role, worksFor: { "@type": "Organization", name: "DUO" } },
      ...(heroSrc ? { image: `${env.appUrl}${heroSrc}` } : {}),
      publisher: { "@type": "Organization", name: "DUO", url: env.appUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Wiedza", item: `${env.appUrl}/wiedza` },
        { "@type": "ListItem", position: 2, name: "Artykuły", item: `${env.appUrl}${ARTICLES_PATH}` },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <ArticleTrack />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:pt-10">
        <nav aria-label="Ścieżka" className="text-xs text-muted">
          <Link href="/wiedza" className="hover:text-forest">Wiedza</Link> / <Link href={ARTICLES_PATH} className="hover:text-forest">Artykuły</Link> / <span>{a.title}</span>
        </nav>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <article>
            <header>
              <p className="flex flex-wrap gap-1.5">
                {a.tags.map((t) => <span key={t} className="rounded-full bg-clay-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">{t}</span>)}
              </p>
              <h1 className="mt-4 text-balance font-display text-[2.1rem] leading-[1.1] text-ink sm:text-[2.9rem]">{a.h1}</h1>
              <p className="mt-5 text-[19px] leading-relaxed text-ink-soft">{a.lead}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-sand py-3 text-[13.5px] text-muted">
                <span className="flex items-center gap-2.5" data-testid="article-author">
                  <img src={AUTHOR.avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
                  <span className="leading-tight"><span className="block font-semibold text-ink">{AUTHOR.name}</span><span className="text-[12.5px]">{AUTHOR.role}</span></span>
                </span>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden /> {a.minutes} min czytania</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden /> Aktualizacja: <time dateTime={a.updated}>{fmt(a.updated)}</time></span>
              </div>
            </header>

            {/* grafika na górze artykułu (generowana w panelu; do tego czasu spokojne tło w barwach marki) */}
            <div className="relative mt-7 aspect-[3/2] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-clay-soft/70 via-ivory to-sage-soft shadow-soft ring-1 ring-sand" data-testid="article-hero">
              {heroSrc ? (
                <img src={heroSrc} alt={a.hero.alt} width={1536} height={1024} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center" role="img" aria-label={a.hero.alt}><MapaSymbol id={`hero-${a.slug}`} className="h-10 w-auto opacity-70" /></div>
              )}
            </div>

            {/* spis treści – telefon */}
            <details className="group mt-6 rounded-2xl bg-white p-4 ring-1 ring-sand lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">W tym artykule <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden /></summary>
              <ol className="mt-3 space-y-2 text-[15px]">{toc.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="text-forest hover:underline">{i + 1}. {h.text}</a></li>)}</ol>
            </details>

            <ArticleBody a={a} photos={photos} images={images} />

            {/* autorka */}
            <section className="mt-12 flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-sand" aria-label="Autorka artykułu">
              <img src={AUTHOR.avatar} alt={AUTHOR.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Autorka</p>
                <p className="mt-0.5 font-display text-lg text-ink">{AUTHOR.name}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">{AUTHOR.bio}</p>
              </div>
            </section>

            {a.faq.length > 0 && (
              <section className="mt-14" aria-labelledby="faq-h">
                <h2 id="faq-h" className="font-display text-[1.7rem] text-ink sm:text-[2rem]">Najczęstsze pytania</h2>
                <div className="mt-5 divide-y divide-sand rounded-3xl bg-white shadow-soft ring-1 ring-sand">
                  {a.faq.map((f) => (
                    <details key={f.q} className="group px-5 py-4 sm:px-6">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">{f.q}<span className="text-xl text-clay transition group-open:rotate-45" aria-hidden>+</span></summary>
                      <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* boczny panel: spis treści + materiał (przyklejone przy przewijaniu) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <nav aria-label="Spis treści" className="rounded-2xl bg-white p-5 ring-1 ring-sand">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">W tym artykule</p>
                <ol className="mt-3 space-y-2 text-[14.5px] leading-snug">{toc.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="text-ink-soft hover:text-forest">{i + 1}. {h.text}</a></li>)}</ol>
              </nav>
              {main && <MagnetCta slug={main.slug} hook={main.menuDesc} photo={photos[main.slug]} idSuffix="-side" side />}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="rel-h">
            <h2 id="rel-h" className="font-display text-[1.6rem] text-ink sm:text-3xl">Przeczytaj też</h2>
            <ul className="mt-5 grid gap-5 md:grid-cols-3">{related.map((r) => <li key={r.slug}><ArticleCard a={r} image={images[heroKey(r.slug)]} /></li>)}</ul>
          </section>
        )}

        <section className="mt-16" aria-labelledby="mat-h">
          <h2 id="mat-h" className="font-display text-[1.6rem] text-ink sm:text-3xl">Bezpłatne materiały do tego tematu</h2>
          <div className="mt-5"><MagnetRail items={magnets} photos={photos} label="Bezpłatne materiały" /></div>
          <ul className="mt-5 hidden gap-6 md:grid md:grid-cols-3">{magnets.map((m) => <li key={m.slug}><MagnetCard m={m} photo={photos[m.slug]} /></li>)}</ul>
        </section>
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
