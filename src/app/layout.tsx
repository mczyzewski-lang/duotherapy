import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "DUO™ – Audyt Relacji", template: "%s · DUO™" },
  description:
    "Zrozum, co naprawdę dzieje się w Twojej relacji – i świadomie zdecyduj, co dalej. Audyt Relacji DUO™: poufny kwestionariusz i uporządkowana rozmowa z psychologiem online.",
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
