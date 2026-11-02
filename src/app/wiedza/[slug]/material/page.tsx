import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialViewer } from "@/components/knowledge/viewer";
import { magnetBySlug } from "@/knowledge/registry";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m || m.special) notFound();
  return <MaterialViewer m={m} variant="material" />;
}
