// Wersja do druku (źródło PDF): ta sama treść co /demo, układ A4 z podziałem na strony.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialDoc } from "@/components/knowledge/doc";
import { env } from "@/lib/env";
import { magnetBySlug, mapaHref } from "@/knowledge/registry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special) notFound();
  return (
    <main className="print-root mx-auto max-w-[182mm] bg-white text-[10.5pt]">
      <MaterialDoc m={m} mode="print" mapaUrl={`${env.appUrl}${mapaHref(m, "pdf")}`} />
    </main>
  );
}
