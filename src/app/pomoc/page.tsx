import Link from "next/link";
import { SafetyBox } from "@/components/safety-box";
import { Logo } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gdzie szukać wsparcia" };

export default async function HelpPage() {
  const s = await getSettings();
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 font-display text-3xl text-ink sm:text-4xl">Gdzie szukać wsparcia</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Jeśli w relacji pojawia się przemoc, groźby, kontrola albo nie czujesz się bezpiecznie, wspólna terapia par czy mediacja mogą nie być właściwą formą pomocy.
        Najpierw liczy się Twoje bezpieczeństwo. Poniżej znajdziesz miejsca, które pomagają od razu, także anonimowo.
      </p>
      <SafetyBox helplines={s.helplines} className="mt-8" />
      <p className="mt-6 text-sm text-muted">
        Możesz też porozmawiać z nami – w rozmowie pomożemy ustalić, jaka forma wsparcia będzie dla Ciebie bezpieczna. <Link href="/" className="underline">Wróć na stronę główną</Link>.
      </p>
    </main>
  );
}
