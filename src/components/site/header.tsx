// Wspólny nagłówek strony. Logo Mapy Relacji tylko na stronach Mapy Relacji (variant "mapa").
import Link from "next/link";
import { MapaLogo } from "@/components/brand";
import { QuizCta } from "@/components/mapa/cta";
import { Logo } from "@/components/ui";
import { KnowledgeMenu, MobileMenu, OfferMenu } from "./knowledge-menu";
import { hiddenMagnets } from "@/lib/magnet-visibility";

type Variant = "default" | "mapa" | "magnet" | "path";

const ctaCls = "inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-clay px-4 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 max-[359px]:px-3";

/**
 * default – strona główna i Wiedza (CTA: Mapa Relacji); mapa – landing Mapy Relacji (logo Mapy, CTA: quiz);
 * magnet – landing materiału (jedno CTA: pobranie, menu hamburgerowe); path – podstrona ścieżki (CTA: rozmowa).
 */
export async function SiteHeader({ variant = "default", cta }: { variant?: Variant; cta?: { href: string; label: string; short?: string } }) {
  const hamburgerOnly = variant === "magnet";
  const hidden = [...(await hiddenMagnets())];
  return (
    <header className={hamburgerOnly ? "relative z-40 border-b border-sand/60 bg-ivory" : "sticky top-0 z-40 border-b border-sand/60 bg-ivory/90 backdrop-blur"}>
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5" aria-label="Główna">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" aria-label="DUO – strona główna" className="min-w-0"><Logo /></Link>
          {variant === "mapa" && (
            <>
              <span className="hidden h-8 w-px bg-sand-dark xl:block" aria-hidden />
              <Link href="/mapa-relacji" aria-label="Mapa Relacji" className="hidden xl:block"><MapaLogo compact id="nav-mapa" /></Link>
            </>
          )}
        </div>
        {!hamburgerOnly && (
          <div className="hidden items-center gap-3 whitespace-nowrap text-sm text-ink-soft md:flex lg:gap-5">
            <OfferMenu />
            <KnowledgeMenu hidden={hidden} />
            <a href="/#o-mnie" className="hover:text-forest">Kto pomaga</a>
            <a href="/#faq" className="hover:text-forest">Pytania</a>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {variant === "mapa" ? (
            <QuizCta size="sm" className="whitespace-nowrap max-[359px]:hidden">Zacznij</QuizCta>
          ) : variant === "magnet" ? (
            <a href="#odbierz" className={ctaCls}>Pobierz<span className="hidden sm:inline">&nbsp;bezpłatnie</span></a>
          ) : cta ? (
            <a href={cta.href} className={ctaCls}>
              {cta.short ? (<><span className="sm:hidden">{cta.short}</span><span className="hidden sm:inline">{cta.label}</span></>) : cta.label}
            </a>
          ) : (
            <Link href="/mapa-relacji" className={ctaCls}><span className="sm:hidden">Mapa Relacji</span><span className="hidden sm:inline">Zacznij od Mapy Relacji</span></Link>
          )}
          <MobileMenu always={hamburgerOnly} initialWiedza={hamburgerOnly} hidden={hidden} />
        </div>
      </nav>
    </header>
  );
}
