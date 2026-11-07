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
import { hiddenMagnets } from "@/lib/magnet-visibility";
import { AskDialog } from "@/components/landing/ask-dialog";

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
  const hidden = await hiddenMagnets();
  const magnets = a.magnets.map(magnetBySlug).filter((m): m is NonNullable<typeof m> => !!m && !hidden.has(m.slug));
  // boczny panel poleca materiał, którego nie ma już w kontenerach w treści (bez powtórzeń obok siebie)
  const inline = new Set(a.blocks.flatMap((b) => (b.t === "cta" && !hidden.has(b.magnet) ? [b.magnet] : [])));
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
      <main id="main">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:pt-10">
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
            <div className="soft-inset relative mt-7 aspect-[3/2] overflow-hidden rounded-[1.6rem]" data-testid="article-hero">
              {heroSrc ? (
                <img src={heroSrc} alt={a.hero.alt} width={1536} height={1024} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center" role="img" aria-label={a.hero.alt}><MapaSymbol id={`hero-${a.slug}`} className="h-10 w-auto opacity-70" /></div>
              )}
              <span className="soft-inset-overlay pointer-events-none absolute inset-0 rounded-[1.6rem]" aria-hidden />
            </div>

            {/* spis treści – telefon */}
            <details className="soft-inset group mt-6 rounded-2xl p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">W tym artykule <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden /></summary>
              <ol className="mt-3 space-y-2 text-[15px]">{toc.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="text-forest hover:underline">{i + 1}. {h.text}</a></li>)}</ol>
            </details>

            <ArticleBody a={a} photos={photos} images={images} hidden={[...hidden]} />

            {/* autorka */}
            <section className="mt-12 flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-sand" aria-label="Autorka artykułu">
              <img src={AUTHOR.avatar} alt={AUTHOR.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Autorka</p>
                <p className="mt-0.5 font-display text-lg text-ink">{AUTHOR.name}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">{AUTHOR.bio}</p>
                <div className="mt-3" data-testid="author-contact">
                  <AskDialog
                    consentText={s.legal.inquiryConsent}
                    trigger="button"
                    label="Napisz do mnie"
                    title={`Napisz do ${AUTHOR.name.split(" ")[0] === "Klaudia" ? "Klaudii" : AUTHOR.name}`}
                    topic={`Pytanie do autorki artykułu „${a.title}”`}
                    triggerClassName="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-[15px] font-semibold text-white shadow-soft transition hover:brightness-110"
                  />
                </div>
              </div>
            </section>

            {a.faq.length > 0 && (
              <section className="mt-14" aria-labelledby="faq-h">
                <h2 id="faq-h" className="font-display text-[1.7rem] text-ink sm:text-[2rem]">Najczęstsze pytania</h2>
                <div className="soft-inset mt-5 divide-y divide-sand/70 rounded-3xl">
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
              <nav aria-label="Spis treści" className="soft-inset rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">W tym artykule</p>
                <ol className="mt-3 space-y-2 text-[14.5px] leading-snug">{toc.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="text-ink-soft hover:text-forest">{i + 1}. {h.text}</a></li>)}</ol>
              </nav>
              {main && <MagnetCta slug={main.slug} hook={main.menuDesc} photo={photos[main.slug]} idSuffix="-side" side />}
            </div>
          </aside>
        </div>

      </div>

        {/* segmenty pod artykułem – tło na całą szerokość, każdy kolejny odrobinę ciemniejszy */}
        {related.length > 0 && (
          <section className="bg-[#f5f0e8] py-12 md:py-16" aria-labelledby="rel-h" data-testid="related-section">
            <div className="mx-auto max-w-6xl px-5">
              <h2 id="rel-h" className="font-display text-[1.6rem] text-ink sm:text-3xl">Przeczytaj też</h2>
              {/* telefon: przewijanie w bok; komputer: siatka */}
              <ul
                aria-label="Powiązane artykuły"
                className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
                data-testid="related-rail"
              >
                {related.map((r) => <li key={r.slug} className="w-[82%] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none"><ArticleCard a={r} image={images[heroKey(r.slug)]} /></li>)}
              </ul>
            </div>
          </section>
        )}

        <section className="bg-[#eee6da] py-12 md:py-16" aria-labelledby="mat-h" data-testid="materials-section">
          <div className="mx-auto max-w-6xl px-5">
            <h2 id="mat-h" className="font-display text-[1.6rem] text-ink sm:text-3xl">Bezpłatne materiały do tego tematu</h2>
            <div className="mt-5"><MagnetRail items={magnets} photos={photos} label="Bezpłatne materiały" /></div>
            <ul className="mt-5 hidden gap-6 md:grid md:grid-cols-3">{magnets.map((m) => <li key={m.slug}><MagnetCard m={m} photo={photos[m.slug]} /></li>)}</ul>
          </div>
        </section>
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
