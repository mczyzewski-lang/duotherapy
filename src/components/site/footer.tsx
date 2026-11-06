// Wspólna stopka strony (marka DUO; Mapa Relacji jako jedna z usług – bez jej logo).
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { PATHS } from "@/content/paths";
import { ARTICLES_PATH, articleBySlug, articleHref } from "@/content/articles";

// Popularne tematy w stopce – linkowanie wewnętrzne do najważniejszych artykułów (pomijamy nieistniejące).
const FOOTER_TOPICS = ["kiedy-isc-na-terapie-par", "ciagle-klotnie-w-zwiazku", "jak-odbudowac-zaufanie-po-zdradzie", "kryzys-w-zwiazku-jak-przetrwac", "terapia-malzenska-czy-rozwod", "terapia-par-online"];

export function SiteFooter({ contactEmail }: { contactEmail?: string }) {
  return (
    <footer className="bg-forest-800 text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light id="foot-duo" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Pomagamy parom i osobom w kryzysie związku zrozumieć, co dalej – i przejść wybraną drogę z psychologiem.</p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Jak pomagamy</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link href="/mapa-relacji" className="hover:text-white">Mapa Relacji – zacznij tutaj</Link></li>
            {PATHS.map((p) => (
              <li key={p.slug} className="pl-3"><Link href={`/${p.slug}`} className="hover:text-white">↳ {p.short}</Link></li>
            ))}
            <li className="pt-2"><Link href="/wiedza" className="hover:text-white">Wiedza – bezpłatne materiały</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Popularne tematy</p>
          <ul className="mt-3 space-y-1.5">
            {FOOTER_TOPICS.map(articleBySlug).filter((a) => !!a).map((a) => (
              <li key={a!.slug}><Link href={articleHref(a!.slug)} className="hover:text-white">{a!.title}</Link></li>
            ))}
            <li className="pt-2"><Link href={ARTICLES_PATH} className="hover:text-white">Wszystkie artykuły →</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Informacje</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link href="/prywatnosc" className="hover:text-white">Polityka prywatności</Link></li>
            <li><Link href="/regulamin" className="hover:text-white">Regulamin Mapy Relacji</Link></li>
            <li><Link href="/pomoc" className="inline-flex items-center gap-1.5 hover:text-white"><ShieldCheck size={14} aria-hidden /> Gdy nie czujesz się bezpiecznie</Link></li>
            {contactEmail && <li><a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a></li>}
            <li><Link href="/app" className="hover:text-white">Panel specjalisty</Link></li>
          </ul>
          <p className="mt-6 text-xs text-white/50">DUO® · Terapia małżeństw. Treści na stronie nie zastępują pomocy kryzysowej ani diagnozy.</p>
        </div>
      </div>
    </footer>
  );
}
