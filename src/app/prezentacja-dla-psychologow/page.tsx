// Wewnętrzny materiał: prezentacja webinaru dla psychologów + reklamy Meta (Nowy Etap). Nieindeksowany.
import type { Metadata } from "next";
import { Creatives, Hooks, MainAds, Presentation, Strategy } from "@/components/prezentacja/deck";
import { DeckTabs } from "@/components/prezentacja/tabs";

export const metadata: Metadata = {
  title: { absolute: "Prezentacja dla psychologów – webinar i reklamy · Nowy Etap" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="np-page min-h-dvh bg-[#faf7f1] text-[#16291f]">
      <DeckTabs deck={<Presentation />} ads={<MainAds />} hooks={<Hooks />} creatives={<Creatives />} strategy={<Strategy />} />
    </div>
  );
}
