// SEO: wspólne metadane stron publicznych (kanoniczny adres, Open Graph, Twitter) i dane strukturalne (JSON-LD).
import type { Metadata } from "next";
import { env } from "./env";

export const SITE_NAME = "DUO® – terapia małżeństw i par";
export const BRAND = "DUO";

export const absUrl = (p: string) => (p.startsWith("http") ? p : `${env.appUrl}${p.startsWith("/") ? p : `/${p}`}`);
export const ogImage = (title: string, kicker?: string) => `/og?t=${encodeURIComponent(title)}${kicker ? `&k=${encodeURIComponent(kicker)}` : ""}`;

/** Komplet metadanych strony publicznej. `title` trafia do <title> bez dopisku z szablonu. */
export function pageMeta(o: { title: string; description: string; path: string; ogTitle?: string; kicker?: string; image?: string; type?: "website" | "article"; noindex?: boolean }): Metadata {
  const url = absUrl(o.path);
  const image = o.image ?? ogImage(o.ogTitle ?? o.title, o.kicker);
  return {
    title: { absolute: o.title },
    description: o.description,
    alternates: { canonical: url },
    openGraph: { title: o.ogTitle ?? o.title, description: o.description, url, type: o.type ?? "website", locale: "pl_PL", siteName: SITE_NAME, images: [{ url: image, width: 1200, height: 630, alt: o.ogTitle ?? o.title }] },
    twitter: { card: "summary_large_image", title: o.ogTitle ?? o.title, description: o.description, images: [image] },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const orgId = () => `${env.appUrl}/#organizacja`;

/** Organizacja + witryna – na stronie głównej. */
export function orgJsonLd(o: { email?: string; phone?: string }) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": orgId(),
      name: "DUO® – terapia małżeństw i par",
      alternateName: "DUO",
      url: `${env.appUrl}/`,
      logo: absUrl("/brand/duo-znak.svg"),
      image: absUrl(ogImage("Terapia małżeństw i par")),
      description: "Pomoc psychologiczna dla par i osób w kryzysie związku: Mapa Relacji z psychologiem online, odbudowa relacji, wsparcie w decyzji i świadome rozstanie.",
      areaServed: { "@type": "Country", name: "Polska" },
      availableLanguage: "pl",
      ...(o.email ? { email: o.email } : {}),
      ...(o.phone ? { telephone: o.phone } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${env.appUrl}/#witryna`,
      name: SITE_NAME,
      url: `${env.appUrl}/`,
      inLanguage: "pl-PL",
      publisher: { "@id": orgId() },
    },
  ];
}

export function breadcrumbJsonLd(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: absUrl(p) })),
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}
