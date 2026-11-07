"use client";

// Taby „Materiał | Podsumowanie” na stronie materiału – pojawiają się dopiero, gdy wymagane minimum jest uzupełnione.
import { missingRequirements, type Requirement } from "@/knowledge/fields";
import { useAnswersData } from "./answers";
import { SummaryTabs } from "./tabs";

export function LiveSummaryTabs({ materialHref, summaryHref, requirements }: { materialHref: string; summaryHref: string; requirements: Requirement[] }) {
  const data = useAnswersData();
  if (!data || missingRequirements(requirements, data).length > 0) return null;
  return <SummaryTabs materialHref={materialHref} summaryHref={summaryHref} active="material" />;
}
