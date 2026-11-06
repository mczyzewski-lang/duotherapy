// Infografiki artykułów – HTML/CSS (ostre na każdym ekranie, lekkie, tekst czytelny dla wyszukiwarek i czytników ekranu),
// w barwach DUO, z logo w narożniku. Każda w ramce <figure> z tytułem i podpisem.
import clsx from "clsx";
import { ArrowDown, ArrowRight, Check, ClipboardList, Compass, Heart, Home, MessagesSquare, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { BrandSymbol, MapaSymbol, RoadGlyph } from "@/components/brand";
import type { GraphicKey } from "@/content/articles/types";

function Frame({ id, title, caption, children }: { id: string; title: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className="relative my-8 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-white via-ivory to-linen p-5 shadow-soft ring-1 ring-sand sm:p-7" aria-labelledby={`${id}-t`} data-testid="infographic">
      {/* logo w narożniku */}
      <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-sand" aria-hidden>
        <BrandSymbol id={`ig-${id}`} className="h-3.5 w-auto" />
        <span className="font-wordmark text-[12px] font-medium text-forest">DUO®</span>
      </span>
      <p id={`${id}-t`} className="max-w-[80%] font-display text-[1.25rem] leading-snug text-ink sm:text-[1.45rem]">{title}</p>
      <div className="mt-5">{children}</div>
      <figcaption className="mt-5 border-t border-sand pt-3 text-[13px] leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

function Signals() {
  const groups = [
    { icon: MessagesSquare, name: "Rozmowy", tone: "bg-clay-soft text-clay", items: ["Te same kłótnie", "Unikanie tematów", "Atak i obrona"] },
    { icon: Heart, name: "Bliskość", tone: "bg-[#f8e1dc] text-[#b5524b]", items: ["Mijanie się", "Brak czułości", "Naruszone zaufanie"] },
    { icon: Home, name: "Codzienność", tone: "bg-sage-soft text-forest", items: ["Duża zmiana", "Pieniądze i obowiązki", "Myśli o rozstaniu"] },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {groups.map(({ icon: Icon, name, tone, items }, gi) => (
        <div key={name} className="rounded-2xl bg-white p-4 ring-1 ring-sand">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <span className={clsx("grid h-8 w-8 place-items-center rounded-xl", tone)}><Icon size={17} aria-hidden /></span>{name}
          </p>
          <ol className="mt-3 space-y-2" start={gi * 3 + 1}>
            {items.map((x, i) => (
              <li key={x} className="flex items-center gap-2.5 text-[14.5px] text-ink-soft">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest font-display text-[12px] text-white">{gi * 3 + i + 1}</span>{x}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function FirstVisit() {
  const steps = [
    { icon: ClipboardList, t: "Kontakt", d: "Termin, forma spotkania, czasem krótki kwestionariusz" },
    { icon: Users, t: "Wasza historia", d: "Co Was sprowadza i od kiedy – każde mówi po swojemu" },
    { icon: Compass, t: "Cele i zasady", d: "Czego chcecie, jak często, co jest poufne" },
    { icon: Sparkles, t: "Plan pracy", d: "Jak może wyglądać dalsza terapia" },
  ];
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {steps.map(({ icon: Icon, t, d }, i) => (
        <li key={t} className="relative rounded-2xl bg-white p-4 ring-1 ring-sand">
          <span className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-white"><Icon size={18} aria-hidden /></span>
            <span className="font-display text-2xl text-sand-dark">{i + 1}</span>
          </span>
          <p className="mt-3 font-semibold text-ink">{t}</p>
          <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{d}</p>
          {i < steps.length - 1 && <ArrowRight size={16} className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-ivory text-clay sm:block" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Influence() {
  const inner = ["Sposób, w jaki zaczynam rozmowę", "Moje reakcje w kłótni", "Moje granice", "Dbanie o siebie", "Konsultacja dla mnie"];
  const outer = ["Decyzja partnera", "Jego / jej tempo", "Gotowość do terapii", "Uczucia drugiej osoby"];
  return (
    <div className="mx-auto grid max-w-2xl place-items-center">
      <div className="w-full rounded-[2rem] border-2 border-dashed border-sand-dark bg-white/60 p-4 sm:rounded-full sm:p-8">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Nie masz wpływu</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-1.5">
          {outer.map((x) => <li key={x} className="flex items-center gap-1 rounded-full bg-linen px-3 py-1 text-[13px] text-muted"><X size={12} aria-hidden />{x}</li>)}
        </ul>
        <div className="mx-auto mt-4 rounded-[1.6rem] bg-gradient-to-br from-forest to-forest-800 p-4 text-white sm:max-w-md sm:rounded-full sm:px-8 sm:py-7">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">Masz wpływ</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-1.5">
            {inner.map((x) => <li key={x} className="flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[13px] ring-1 ring-white/20"><Check size={12} aria-hidden />{x}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DecisionRoads() {
  const roads = [
    { road: "rebuild" as const, t: "Odbudowa relacji", d: "Oboje chcecie spróbować" },
    { road: "clarity" as const, t: "Czas na decyzję", d: "Potrzebujesz spokojnie sprawdzić, czego chcesz" },
    { road: "separate" as const, t: "Świadome rozstanie", d: "Z szacunkiem, z myślą o dzieciach" },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="rounded-full bg-clay-soft px-4 py-1.5 text-sm font-semibold text-clay">Kryzys</span>
      <ArrowDown size={18} className="text-sand-dark" aria-hidden />
      <span className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">
        <MapaSymbol id="ig-dr" className="h-3 w-auto" /> Zrozumienie sytuacji
      </span>
      <ArrowDown size={18} className="text-sand-dark" aria-hidden />
      <div className="grid w-full gap-2 sm:grid-cols-3">
        {roads.map((r, i) => (
          <div key={r.road} className="relative rounded-2xl bg-white p-4 text-center ring-1 ring-sand">
            {i > 0 && <span className="absolute -left-4 top-1/2 hidden -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:block">lub</span>}
            <RoadGlyph road={r.road} id={`ig-dr-${r.road}`} className="mx-auto h-7 w-7" />
            <p className="mt-2 font-semibold text-ink">{r.t}</p>
            <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{r.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnlineFit() {
  const good = ["Mieszkacie daleko od gabinetu", "Trudno zgrać grafiki i opiekę nad dziećmi", "Łatwiej Wam mówić w znanym miejscu", "Macie spokojny, prywatny pokój"];
  const office = ["W domu nie ma prywatności", "Któreś z Was źle czuje się przed kamerą", "Rozmowy w domu szybko eskalują"];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-sage/60">
        <p className="flex items-center gap-2 font-semibold text-forest"><span className="grid h-8 w-8 place-items-center rounded-xl bg-sage-soft"><Check size={17} aria-hidden /></span>Online sprawdza się, gdy…</p>
        <ul className="mt-3 space-y-2">{good.map((x) => <li key={x} className="flex gap-2 text-[14.5px] text-ink-soft"><Check size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />{x}</li>)}</ul>
      </div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-sand">
        <p className="flex items-center gap-2 font-semibold text-clay"><span className="grid h-8 w-8 place-items-center rounded-xl bg-clay-soft"><Home size={17} aria-hidden /></span>Lepiej stacjonarnie, gdy…</p>
        <ul className="mt-3 space-y-2">{office.map((x) => <li key={x} className="flex gap-2 text-[14.5px] text-ink-soft"><ArrowRight size={16} className="mt-0.5 shrink-0 text-clay" aria-hidden />{x}</li>)}</ul>
      </div>
      <p className="flex items-start gap-2 rounded-2xl bg-forest/[0.06] p-3 text-[13.5px] text-ink-soft sm:col-span-2">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-forest" aria-hidden />
        Gdy w związku pojawia się przemoc lub lęk przed szczerą rozmową – najpierw bezpieczeństwo, nie sesja we dwoje.
      </p>
    </div>
  );
}

const GRAPHICS: Record<GraphicKey, () => React.ReactElement> = {
  signals: Signals,
  "first-visit": FirstVisit,
  influence: Influence,
  "decision-roads": DecisionRoads,
  "online-fit": OnlineFit,
};

export function Infographic({ graphic, title, caption, id }: { graphic: GraphicKey; title: string; caption: string; id: string }) {
  const G = GRAPHICS[graphic];
  return <Frame id={id} title={title} caption={caption}><G /></Frame>;
}
