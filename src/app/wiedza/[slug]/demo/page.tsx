import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/knowledge/viewer";
import { magnetBySlug } from "@/knowledge/registry";
import { hiddenMagnets } from "@/lib/magnet-visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special || (await hiddenMagnets()).has(m.slug)) notFound();
  return <MaterialViewer m={m} variant="demo" />;
}
