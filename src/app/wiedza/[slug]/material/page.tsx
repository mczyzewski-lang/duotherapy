import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/knowledge/viewer";
import { magnetBySlug } from "@/knowledge/registry";
import { contentReader, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special) notFound();
  // odpowiedzi tylko dla osoby zapisanej na ten materiał (ciasteczko z formularza lub z linku w e-mailu)
  const answers = await system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return null;
    return (await loadAnswers(tx, who.email, m.id))?.data ?? {};
  });
  return <MaterialViewer m={m} variant="material" answers={answers} />;
}
