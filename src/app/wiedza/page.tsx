// Strona zbiorcza „Wiedza” – 10 bezpłatnych materiałów w trzech kategoriach (filtr bez przeładowania).
import type { Metadata } from "next";
import { KTrack } from "@/components/knowledge/client";
import { KnowledgeGrid } from "@/components/knowledge/grid";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { absolute: "Wiedza – bezpłatne poradniki o relacjach | DUO" },
  description: "Bezpłatne poradniki, pytania i ćwiczenia DUO o kryzysie w związku, trudnych rozmowach, konflikcie, zdradzie i rozstaniu. Wybierz temat, który jest dla Ciebie ważny.",
  alternates: { canonical: `${env.appUrl}/wiedza` },
  openGraph: { title: "Wiedza, która pomaga lepiej zrozumieć relację | DUO", description: "Bezpłatne poradniki, pytania i ćwiczenia przygotowane przez DUO.", url: `${env.appUrl}/wiedza`, type: "website", locale: "pl_PL" },
};

export default async function KnowledgeHub() {
  const s = await getSettings();
  return (
    <>
      <KTrack event="knowledge_hub_view" />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Wiedza</p>
        <h1 className="mt-3 max-w-3xl font-display text-[2.1rem] leading-[1.1] text-ink sm:text-5xl">Wiedza, która pomaga lepiej zrozumieć relację</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          Bezpłatne poradniki, pytania i ćwiczenia przygotowane przez DUO. Wybierz temat, który jest teraz dla Ciebie ważny.
        </p>
        <KnowledgeGrid />
      </main>
      <SiteFooter contactEmail={s.site.contactEmail} />
    </>
  );
}
