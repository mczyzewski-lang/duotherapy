import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/knowledge/viewer";
import { magnetBySlug } from "@/knowledge/registry";
import { contentReader, ensureUnlockedMagnet, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { maskPhone } from "@/lib/sms";
import { visibleMagnets } from "@/lib/magnet-visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special) notFound();
  // odpowiedzi tylko dla osoby zapisanej na ten materiał (ciasteczko z formularza lub z linku w e-mailu)
  const d = await system(async (tx) => {
    const reader = await contentReader(tx);
    // potwierdzony numer = dostęp do wszystkich materiałów: zapis na ten materiał powstaje przy pierwszym otwarciu
    const who = reader && (await ensureUnlockedMagnet(tx, reader, m));
    if (!who || !who.magnets.includes(m.id)) return null;
    const [p] = await tx<{ phone: string }[]>`select phone from content_leads where lower(email) = ${who.email} and phone_verified_at is not null and phone is not null limit 1`;
    return { answers: (await loadAnswers(tx, who.email, m.id))?.data ?? {}, phone: p?.phone ?? null };
  });
  const unlockList = (await visibleMagnets()).filter((x) => !x.special).map((x) => x.short);
  return <MaterialViewer m={m} variant="material" answers={d?.answers ?? null} phoneMasked={d?.phone ? maskPhone(d.phone) : null} unlockList={unlockList} />;
}
