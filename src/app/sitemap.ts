import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { PATHS } from "@/content/paths";
import { MAGNETS } from "@/knowledge/registry";
import { ARTICLES, ARTICLES_PATH, articleHref } from "@/content/articles";

// Tylko strony publiczne do indeksowania. Bez /demo, wersji online, druku, PDF, podziękowań i adresów z tokenami.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = env.appUrl;
  return [
    { url: `${u}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${u}/mapa-relacji`, changeFrequency: "weekly", priority: 0.9 },
    ...PATHS.map((p) => ({ url: `${u}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${u}/wiedza`, changeFrequency: "weekly", priority: 0.8 },
    ...MAGNETS.map((m) => ({ url: `${u}/wiedza/${m.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${u}${ARTICLES_PATH}`, changeFrequency: "weekly", priority: 0.7 },
    ...ARTICLES.map((a) => ({ url: `${u}${articleHref(a.slug)}`, lastModified: new Date(a.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${u}/prywatnosc`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
