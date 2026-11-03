// Karta materiału z okładką – do sekcji linkujących do „Wiedzy” (strona główna, „Inne materiały”).
// Telefon: karuzela przewijana w poziomie na całą szerokość ekranu (MagnetRail).
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LeadMagnet } from "@/knowledge/types";
import { CoverBook } from "./cover-book";
import { Cover } from "./doc";

export function MagnetCard({ m, photo, idSuffix = "" }: { m: LeadMagnet; photo?: string | null; idSuffix?: string }) {
  return (
    <Link href={`/wiedza/${m.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40" data-testid="magnet-card">
      <div className="relative bg-linen/60 px-4 pt-5">
        {/* duża okładka-książka wychodzi z górnego pola i nachodzi na część z nazwą;
            renderowana w rozmiarze miniatury (14rem) i pomniejszona – cała treść mieści się w kadrze */}
        <div className="relative z-10 mx-auto -mb-20 h-[17rem] w-[12.6rem]">
          <div className="w-[14rem] origin-top-left scale-90"><CoverBook><Cover m={m} mode="screen" compact photo={photo} idSuffix={idSuffix} /></CoverBook></div>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-24">
        <span className="block font-display text-[1.2rem] leading-snug text-ink">{m.short}</span>
        <span className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{m.menuDesc}</span>
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-forest px-5 text-sm font-semibold text-white shadow-soft transition group-hover:bg-forest-800">
          Zobacz materiał <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Telefon: wszystkie karty w poziomej karuzeli – od krawędzi do krawędzi ekranu, z przyciąganiem do karty. */
export function MagnetRail({ items, photos, label }: { items: LeadMagnet[]; photos: Record<string, string>; label: string }) {
  return (
    <div className="-mx-5 md:hidden" data-testid="magnet-rail">
      <ul
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-6 pt-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((m) => (
          <li key={m.slug} className="w-[80%] max-w-[20rem] shrink-0 snap-start">
            <MagnetCard m={m} photo={photos[m.slug]} idSuffix="-rail" />
          </li>
        ))}
      </ul>
    </div>
  );
}
