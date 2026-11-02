// Wspólny nagłówek strony (strona główna, Wiedza, landingi materiałów).
import Link from "next/link";
import { MapaLogo } from "@/components/brand";
import { QuizCta } from "@/components/mapa/cta";
import { Logo } from "@/components/ui";
import { KnowledgeMenu, MobileMenu } from "./knowledge-menu";
import { NAV_LINKS } from "./nav";

/**
 * variant "magnet" (landing materiału): tylko logo, jedno główne CTA (pobranie materiału) i menu hamburgerowe
 * na każdej szerokości – bez linków i przycisku quizu, które rozpraszałyby od pobrania.
 */
export function SiteHeader({ variant }: { variant?: "magnet" } = {}) {
  if (variant === "magnet")
    return (
      <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/90 backdrop-blur">
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-5" aria-label="Główna">
          <Link href="/" aria-label="DUO – strona główna" className="min-w-0"><Logo /></Link>
          <div className="flex items-center gap-2">
            <a href="#odbierz" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-clay px-4 text-sm font-semibold text-white shadow-soft max-[359px]:px-3">
              Pobierz<span className="hidden sm:inline">&nbsp;bezpłatnie</span>
            </a>
            <MobileMenu always initialWiedza />
          </div>
        </nav>
      </header>
    );
  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/90 backdrop-blur">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3" aria-label="Główna">
        <Link href="/" aria-label="DUO – Mapa Relacji – strona główna" className="flex items-center gap-4">
          <Logo />
          <span className="hidden h-8 w-px bg-sand-dark 2xl:block" aria-hidden />
          <span className="hidden 2xl:block"><MapaLogo compact id="nav-mapa" /></span>
        </Link>
        <div className="hidden items-center gap-3 whitespace-nowrap text-sm text-ink-soft md:flex lg:gap-5">
          {NAV_LINKS.map(([href, l]) => (
            <a key={href} href={href} className="hover:text-forest">{l}</a>
          ))}
          <KnowledgeMenu />
          <a href="/#faq" className="hover:text-forest">Pytania</a>
        </div>
        <div className="flex items-center gap-2">
          <QuizCta size="sm" className="whitespace-nowrap max-[359px]:hidden">Zacznij</QuizCta>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
