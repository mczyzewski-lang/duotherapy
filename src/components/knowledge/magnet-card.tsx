// Karta materiału z okładką – do sekcji linkujących do „Wiedzy” (strona główna, „Inne materiały”).
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LeadMagnet } from "@/knowledge/types";
import { Cover } from "./doc";

export function MagnetCard({ m }: { m: LeadMagnet }) {
  return (
    <Link href={`/wiedza/${m.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40" data-testid="magnet-card">
      <div className="bg-linen/60 px-4 pt-4">
        {/* okładka „wystaje” z kontenera jak leżący materiał */}
        {/* okładka renderowana w pełnym rozmiarze miniatury (13rem) i pomniejszona – cała treść mieści się w kadrze */}
        <div className="mx-auto -mb-6 h-[13rem] w-[9.75rem] rotate-[-1.5deg] transition group-hover:rotate-0">
          <div className="w-[13rem] origin-top-left scale-75"><Cover m={m} mode="screen" compact /></div>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-9">
        <span className="block font-medium text-ink">{m.short}</span>
        <span className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{m.menuDesc}</span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">Zobacz materiał <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
      </div>
    </Link>
  );
}
