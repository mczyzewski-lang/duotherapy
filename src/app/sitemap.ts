import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { MAGNETS } from "@/knowledge/registry";

// Tylko strony publiczne do indeksowania. Bez /demo, wersji online, druku, PDF, podziękowań i adresów z tokenami.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = env.appUrl;
  return [
    { url: `${u}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${u}/wiedza`, changeFrequency: "weekly", priority: 0.8 },
    ...MAGNETS.map((m) => ({ url: `${u}/wiedza/${m.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${u}/prywatnosc`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
