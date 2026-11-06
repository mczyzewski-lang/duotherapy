import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";
import { ogImage, SITE_NAME } from "@/lib/seo";

const DEFAULT_TITLE = "Mapa Relacji – DUO® | Nie wiesz, co dalej z Waszą relacją?";
const DEFAULT_DESC =
  "Nie musisz dziś wiedzieć, co dalej. Mapa Relacji DUO® pomaga zrozumieć, w jakim miejscu jesteście – z psychologiem, indywidualnie lub razem. Zacznij od 6 krótkich pytań.";

// Metadane liczone przy żądaniu: adres bazowy z APP_URL (kanoniczne adresy, obrazki OG), domyślny obrazek do udostępniania.
export async function generateMetadata(): Promise<Metadata> {
  const image = ogImage("Nie wiesz, co dalej z Waszą relacją?", "Mapa Relacji z psychologiem");
  return {
    metadataBase: new URL(env.appUrl),
    title: { default: DEFAULT_TITLE, template: "%s · DUO®" },
    description: DEFAULT_DESC,
    applicationName: "DUO®",
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: { siteName: SITE_NAME, locale: "pl_PL", type: "website", title: DEFAULT_TITLE, description: DEFAULT_DESC, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
    formatDetection: { telephone: false, email: false, address: false },
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Przejdź do treści
        </a>
        {children}
      </body>
    </html>
  );
}
