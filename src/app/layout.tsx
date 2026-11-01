import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Mapa Relacji – DUO® | Nie wiesz, co dalej z Waszą relacją?", template: "%s · DUO®" },
  description:
    "Nie musisz dziś wiedzieć, co dalej. Mapa Relacji DUO® pomaga zrozumieć, w jakim miejscu jesteście – z psychologiem, indywidualnie lub razem. Zacznij od 6 krótkich pytań.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Przejdź do treści
        </a>
        {process.env.DEMO_MODE === "true" && <DemoBanner />}
        {children}
      </body>
    </html>
  );
}
