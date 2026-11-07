import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/knowledge/viewer";
import { UnlockIntro } from "@/components/knowledge/unlock-intro";
import { magnetBySlug } from "@/knowledge/registry";
import { contentReader, ensureUnlockedMagnet, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { maskPhone } from "@/lib/sms";
import { visibleMagnets } from "@/lib/magnet-visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MaterialPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ witaj?: string; mail?: string }> }) {
  const m = magnetBySlug((await params).slug);
  const sp = await searchParams;
  if (!m || m.special) notFound();
  // odpowiedzi tylko dla osoby zapisanej na ten materiał (ciasteczko z formularza lub z linku w e-mailu)
  const d = await system(async (tx) => {
    const reader = await contentReader(tx);
    // potwierdzony numer = dostęp do wszystkich materiałów: zapis na ten materiał powstaje przy pierwszym otwarciu
    const who = reader && (await ensureUnlockedMagnet(tx, reader, m));
    if (!who || !who.magnets.includes(m.id)) return null;
    const [p] = await tx<{ phone: string }[]>`select phone from content_leads where lower(email) = ${who.email} and phone_verified_at is not null and phone is not null limit 1`;
    // imię do powitania po odebraniu materiału (tylko z zapisu tej osoby)
    const [n] = sp.witaj ? await tx<{ name: string | null }[]>`select name from content_leads where lower(email) = ${who.email} and name is not null order by created_at desc limit 1` : [];
    return { answers: (await loadAnswers(tx, who.email, m.id))?.data ?? {}, phone: p?.phone ?? null, name: n?.name ?? null };
  });
  const unlockList = (await visibleMagnets()).filter((x) => !x.special).map((x) => x.short);
  return (
    <>
      {sp.witaj && d && <UnlockIntro name={d.name?.split(/\s+/)[0] ?? null} title={m.short} mailSent={sp.mail === "1"} />}
      <MaterialViewer m={m} variant="material" answers={d?.answers ?? null} phoneMasked={d?.phone ? maskPhone(d.phone) : null} unlockList={unlockList} />
    </>
  );
}
