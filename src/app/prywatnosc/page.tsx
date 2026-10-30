import Link from "next/link";
import { Alert, Logo } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Polityka prywatności" };

export default async function Privacy() {
  const s = await getSettings();
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 font-display text-4xl text-ink">Polityka prywatności</h1>
      {s.legal.privacyPolicy ? (
        <div className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">{s.legal.privacyPolicy}</div>
      ) : (
        <Alert tone="warn" className="mt-6" title="Treść w przygotowaniu">
          Pełna polityka prywatności zostanie opublikowana po zatwierdzeniu przez administratora danych. Do tego czasu w sprawie danych osobowych kontaktuj się z
          administratorem: {s.legal.controllerName || "dane administratora do uzupełnienia"} {s.legal.controllerContact && `(${s.legal.controllerContact})`}.
        </Alert>
      )}
      <dl className="mt-8 grid gap-3 text-sm">
        {s.legal.controllerName && (<><dt className="font-medium">Administrator danych</dt><dd className="text-ink-soft">{s.legal.controllerName}, {s.legal.controllerContact}</dd></>)}
        {s.legal.dpoContact && (<><dt className="font-medium">Inspektor ochrony danych</dt><dd className="text-ink-soft">{s.legal.dpoContact}</dd></>)}
        <dt className="font-medium">Miejsce przetwarzania</dt><dd className="text-ink-soft">{s.legal.processingLocation}</dd>
        {s.legal.retentionPolicy && (<><dt className="font-medium">Okres przechowywania</dt><dd className="text-ink-soft">{s.legal.retentionPolicy}</dd></>)}
      </dl>
    </main>
  );
}
