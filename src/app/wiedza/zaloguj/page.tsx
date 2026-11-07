// Logowanie numerem telefonu: osoba, która potwierdziła numer kodem SMS, ma dostęp do wszystkich bezpłatnych materiałów
// (i swoich zapisanych odpowiedzi) na każdym urządzeniu – po kolejnym kodzie SMS.
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PhoneLogin } from "@/components/knowledge/phone";
import { SiteHeader } from "@/components/site/header";
import { contentReader } from "@/lib/content-access";
import { system } from "@/lib/db";
import { visibleMagnets } from "@/lib/magnet-visibility";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Zaloguj się kodem SMS", robots: { index: false, follow: false } };

export default async function LoginPage() {
  const count = (await visibleMagnets()).filter((m) => !m.special).length;
  const who = await system((tx) => contentReader(tx));
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-md px-5 pb-20 pt-10">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay"><ShieldCheck size={14} aria-hidden /> Bezpłatne materiały DUO</p>
          <h1 className="mt-2 font-display text-[1.9rem] leading-tight text-ink">Zaloguj się kodem SMS</h1>
          {who?.unlocked ? (
            <div className="mt-4 space-y-4" data-testid="login-done">
              <p className="leading-relaxed text-ink-soft">Jesteś zalogowany / zalogowana – masz dostęp do wszystkich {count} bezpłatnych materiałów.</p>
              <Link href="/wiedza" className="flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-[15px] font-semibold text-white">Przejdź do materiałów</Link>
            </div>
          ) : (
            <>
              <p className="mb-5 mt-3 leading-relaxed text-ink-soft">
                Podaj numer telefonu zapisany w materiale DUO. Wyślemy kod – po jego wpisaniu odblokujesz wszystkie {count} bezpłatnych materiałów i swoje zapisane odpowiedzi.
              </p>
              <PhoneLogin count={count} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
