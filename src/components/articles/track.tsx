"use client";

// Pomiar artykułu: wejście i kliknięcia w kontenery z materiałem (numer materiału jako krok, bez tytułów).
import { useEffect } from "react";
import { captureAttribution, track } from "@/lib/track-client";

export function ArticleTrack() {
  useEffect(() => {
    captureAttribution();
    track("article_view");
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-article-cta]") as HTMLElement | null;
      if (el) track("article_cta_click", Number(el.dataset.articleCta) || undefined);
      if ((e.target as HTMLElement).closest?.("[data-mapa-cta]")) track("mapa_relacji_cta_click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
