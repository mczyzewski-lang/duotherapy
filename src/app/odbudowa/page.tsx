import type { Metadata } from "next";
import { PathPage } from "@/components/site/path-page";
import { pathByKey } from "@/content/paths";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
const p = pathByKey("rebuild");

export const metadata: Metadata = {
  title: { absolute: p.seo.title },
  description: p.seo.description,
  alternates: { canonical: `${env.appUrl}/${p.slug}` },
  openGraph: { title: p.seo.title, description: p.seo.description, url: `${env.appUrl}/${p.slug}`, type: "website", locale: "pl_PL" },
};

export default async function Page() {
  const s = await getSettings();
  return <PathPage p={p} consentText={s.legal.inquiryConsent} contactEmail={s.site.contactEmail} />;
}
