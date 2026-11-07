import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { PATHS } from "@/content/paths";
import { MAGNETS } from "@/knowledge/registry";
import { ARTICLES, ARTICLES_PATH, articleHref } from "@/content/articles";
import { articleImageJobs, articleImageMap } from "@/lib/article-images";
import { coverPhotoMap } from "@/lib/cover-photos";
import { ogImage } from "@/lib/seo";
import { hiddenMagnets } from "@/lib/magnet-visibility";

// Tylko strony publiczne do indeksowania. Bez /demo, wersji online, druku, PDF, podziękowań i adresów z tokenami.
// Z grafikami (Google Grafika): ilustracje artykułów i okładki materiałów – gdy są wygenerowane.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = env.appUrl;
  const abs = (p: string) => `${u}${p}`;
  const hidden = await hiddenMagnets();
  const [images, covers] = await Promise.all([articleImageMap().catch(() => ({}) as Record<string, string>), coverPhotoMap().catch(() => ({}) as Record<string, string>)]);
  const newest = ARTICLES.reduce((d, a) => (a.updated > d ? a.updated : d), "2026-01-01");
  return [
    { url: `${u}/`, changeFrequency: "weekly", priority: 1, images: [abs(ogImage("Pomagamy zrozumieć, co dalej z Waszym związkiem", "Terapia małżeństw i par"))] },
    { url: `${u}/mapa-relacji`, changeFrequency: "weekly", priority: 0.9 },
    ...PATHS.map((p) => ({ url: `${u}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${u}/wiedza`, lastModified: new Date(newest), changeFrequency: "weekly", priority: 0.8 },
    ...MAGNETS.filter((m) => !hidden.has(m.slug)).map((m) => ({ url: `${u}/wiedza/${m.slug}`, changeFrequency: "monthly" as const, priority: 0.7, ...(covers[m.slug] ? { images: [abs(covers[m.slug])] } : {}) })),
    { url: `${u}${ARTICLES_PATH}`, lastModified: new Date(newest), changeFrequency: "weekly", priority: 0.8 },
    ...ARTICLES.map((a) => {
      const imgs = articleImageJobs(a.slug).map((j) => images[j.key]).filter(Boolean).map(abs);
      return { url: `${u}${articleHref(a.slug)}`, lastModified: new Date(a.updated), changeFrequency: "monthly" as const, priority: 0.7, ...(imgs.length ? { images: imgs } : {}) };
    }),
    { url: `${u}/pomoc`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${u}/prywatnosc`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${u}/regulamin`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
