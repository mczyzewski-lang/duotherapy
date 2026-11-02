// Wspólna stopka strony.
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MapaLogo } from "@/components/brand";
import { Logo } from "@/components/ui";

export function SiteFooter({ contactEmail }: { contactEmail?: string }) {
  return (
    <footer className="bg-forest-800 text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center gap-5">
            <Logo light id="foot-duo" />
            <MapaLogo light id="foot-mapa" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Mapa Relacji – zrozum, w jakim miejscu jesteście, i świadomie zdecyduj, co dalej.</p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Informacje</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link href="/wiedza" className="hover:text-white">Wiedza – bezpłatne materiały</Link></li>
            <li><Link href="/prywatnosc" className="hover:text-white">Polityka prywatności</Link></li>
            <li><Link href="/pomoc" className="inline-flex items-center gap-1.5 hover:text-white"><ShieldCheck size={14} aria-hidden /> Gdy nie czujesz się bezpiecznie</Link></li>
            {contactEmail && <li><a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a></li>}
            <li><Link href="/app" className="hover:text-white">Panel specjalisty</Link></li>
          </ul>
          <p className="mt-6 text-xs text-white/50">DUO® · Mapa Relacji. Konsultacja psychologiczna – nie terapia, nie diagnoza, nie pomoc kryzysowa.</p>
        </div>
      </div>
    </footer>
  );
}
