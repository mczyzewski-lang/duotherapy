import type { Metadata } from "next";
import { PathPage } from "@/components/site/path-page";
import { pathByKey } from "@/content/paths";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
const p = pathByKey("separate");

export const metadata: Metadata = pageMeta({ title: p.seo.title, description: p.seo.description, path: `/${p.slug}`, ogTitle: p.h1, kicker: p.short });

export default async function Page() {
  const s = await getSettings();
  return <PathPage p={p} consentText={s.legal.inquiryConsent} contactEmail={s.site.contactEmail} />;
}
