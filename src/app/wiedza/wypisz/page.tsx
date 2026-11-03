// Wypisanie z wiadomości „Wiedza” – potwierdzane przyciskiem (skanery linków w poczcie nie wypisują automatycznie).
import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeContact, unsubscribeKnowledge } from "@/app/actions/knowledge";
import { Logo } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Wypisanie z wiadomości", robots: { index: false, follow: false } };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const token = sp.t ?? "";
  const contactKey = sp.k ?? "";
  async function action() {
    "use server";
    const { redirect } = await import("next/navigation");
    const r = contactKey ? await unsubscribeContact(contactKey) : await unsubscribeKnowledge(token);
    redirect(`/wiedza/wypisz?gotowe=${r.ok ? "1" : "0"}`);
  }
  return (
    <main id="main" className="mx-auto max-w-xl px-5 py-12">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 font-display text-3xl text-ink">Wypisanie z wiadomości DUO</h1>
      {sp.gotowe === "1" ? (
        <p className="mt-4 leading-relaxed text-ink-soft">Gotowe. Nie będziemy wysyłać Ci kolejnych wiadomości. Pobrane materiały pozostają dostępne.</p>
      ) : sp.gotowe === "0" ? (
        <p className="mt-4 leading-relaxed text-ink-soft">Link jest nieprawidłowy lub wygasł. Napisz do nas, a wypiszemy Cię ręcznie.</p>
      ) : (
        <form action={action} className="mt-6">
          <p className="leading-relaxed text-ink-soft">Kliknij, aby wycofać zgodę i nie otrzymywać więcej wiadomości z materiałami i informacjami DUO.</p>
          <button className="mt-5 inline-flex min-h-12 items-center rounded-full bg-forest px-6 font-semibold text-white">Wypisz mnie</button>
        </form>
      )}
      <p className="mt-10"><Link href="/wiedza" className="text-sm text-forest underline">Wróć do materiałów</Link></p>
    </main>
  );
}
