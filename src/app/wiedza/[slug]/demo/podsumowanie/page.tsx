// Mini-podsumowanie odpowiedzi z podglądu /demo (odpowiedzi tylko w tej przeglądarce) + zaproszenie do Mapy Relacji™.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoSummary } from "@/components/knowledge/demo-summary";
import { MagnetIcon } from "@/components/knowledge/icons";
import { coverOf } from "@/knowledge/covers";
import { fieldsOf, requirementsOf } from "@/knowledge/fields";
import { magnetBySlug } from "@/knowledge/registry";
import { hiddenMagnets } from "@/lib/magnet-visibility";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Twoje podsumowanie", robots: { index: false, follow: false } };

export default async function DemoSummaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special || !coverOf(m.slug)?.summary || (await hiddenMagnets()).has(m.slug)) notFound();
  const fields = fieldsOf(m);
  return <DemoSummary slug={m.slug} n={m.n} short={m.short} fields={fields} requirements={requirementsOf(fields)}
    icon={<MagnetIcon icon={m.icon} id={`dsum-${m.id}`} className="h-5 w-5" />} />;
}
