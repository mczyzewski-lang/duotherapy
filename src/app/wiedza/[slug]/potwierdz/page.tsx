// Powrót do zapisanych odpowiedzi z linku w e-mailu: potwierdzenie numeru telefonu (ostatnie 3 cyfry) i kod SMS.
import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneAccess } from "@/components/knowledge/phone";
import { Logo } from "@/components/ui";
import { pendingToken } from "@/lib/content-phone";
import { hashToken } from "@/lib/crypto";
import { system } from "@/lib/db";
import { maskPhone } from "@/lib/sms";
import { magnetBySlug } from "@/knowledge/registry";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Potwierdź numer telefonu", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ConfirmPhonePage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m) notFound();
  const t = await pendingToken();
  const [lead] = t ? await system((tx) => tx<{ phone: string | null }[]>`select phone from content_leads where access_token_hash = ${hashToken(t)} and phone_verified_at is not null`) : [];
  return (
    <div className="min-h-dvh bg-linen/60">
      <header className="border-b border-sand/70 bg-ivory"><div className="mx-auto max-w-xl px-5 py-4"><Link href="/" aria-label="DUO – strona główna"><Logo /></Link></div></header>
      <main id="main" className="mx-auto max-w-xl px-5 py-10">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8" data-testid="phone-confirm">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay"><Lock size={14} aria-hidden /> Twoje zapisane odpowiedzi</p>
          <h1 className="mt-3 font-display text-[1.8rem] leading-tight text-ink">{m.short}</h1>
          {lead?.phone ? (
            <PhoneAccess slug={m.slug} masked={maskPhone(lead.phone)} />
          ) : (
            <p className="mt-4 leading-relaxed text-ink-soft">
              Link wygasł albo został już użyty na innym urządzeniu. Otwórz go ponownie z wiadomości e-mail od DUO.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
