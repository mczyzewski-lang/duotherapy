import Link from "next/link";
import { Alert, Logo } from "@/components/ui";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { TERMS_DRAFT } from "@/lib/terms-draft";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Regulamin usługi Mapa Relacji | DUO®", description: "Regulamin usługi Mapa Relacji DUO: zakres usługi, zamówienie i płatność, terminy spotkań online, odstąpienie od umowy, reklamacje i ochrona danych.", path: "/regulamin", ogTitle: "Regulamin usługi Mapa Relacji", kicker: "Informacje" });

export default async function Terms() {
  const s = await getSettings();
  const text = s.offer.termsText || (env.demoMode ? TERMS_DRAFT(s.offer.pricePln, s.offer.sellerInfo) : "");
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 font-display text-4xl text-ink">Regulamin usługi „Mapa Relacji”</h1>
      <p className="mt-2 text-sm text-muted">Wersja: {s.offer.termsVersion}</p>
      {!s.offer.termsApproved && (
        <Alert tone="warn" className="mt-6" title="Treść niezatwierdzona">
          Regulamin nie został jeszcze zatwierdzony. Poza trybem demonstracyjnym sprzedaż online jest wyłączona do czasu jego zatwierdzenia.
        </Alert>
      )}
      {text ? (
        <div className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">{text}</div>
      ) : (
        <p className="mt-6 text-ink-soft">Regulamin zostanie opublikowany przed uruchomieniem sprzedaży online.</p>
      )}
    </main>
  );
}
