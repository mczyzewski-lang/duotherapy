import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// liczone przy żądaniu – adres mapy strony z APP_URL na produkcji
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/q/", "/r/", "/zamowienie/", "/twoja-mapa", "/api/", "/wiedza/wypisz"] }],
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
