// Renderer artykułu: tekst z **pogrubieniem** i [linkami](/adres), bloki, kontenery z materiałem, karty artykułów.
import clsx from "clsx";
import { ArrowRight, Clock, Info, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { CoverBook } from "@/components/knowledge/cover-book";
import { Cover } from "@/components/knowledge/doc";
import { MagnetIcon } from "@/components/knowledge/icons";
import { BrandSymbol, MapaSymbol } from "@/components/brand";
import { articleHref } from "@/content/articles";
import type { Article, ArticleBlock } from "@/content/articles/types";
import { magnetBySlug } from "@/knowledge/registry";
import { Infographic } from "./infographics";
import { layoutBlocks } from "@/content/articles/layout";

/** **pogrubienie** i [tekst](/adres) – linki wewnętrzne przez next/link. */
export function Rich({ text, hidden = [] }: { text: string; hidden?: string[] }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const b = p.match(/^\*\*([^*]+)\*\*$/);
        if (b) return <strong key={i} className="font-semibold text-ink">{b[1]}</strong>;
        const l = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (l) {
          const inner = l[1].split(/(\*\*[^*]+\*\*)/g).map((x, j) => (x.startsWith("**") ? <strong key={j}>{x.slice(2, -2)}</strong> : <Fragment key={j}>{x}</Fragment>));
          // link do materiału ukrytego w panelu → zwykły tekst (bez prowadzenia do 404)
          const target = l[2].match(/^\/wiedza\/([a-z0-9-]+)(?:[#?].*)?$/)?.[1];
          if (target && hidden.includes(target)) return <Fragment key={i}>{inner}</Fragment>;
          return l[2].startsWith("/") ? (
            <Link key={i} href={l[2]} className="font-medium text-forest underline decoration-sand-dark underline-offset-[3px] hover:decoration-forest">{inner}</Link>
          ) : (
            <a key={i} href={l[2]} rel="noopener" className="font-medium text-forest underline underline-offset-[3px]">{inner}</a>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** Kontener z bezpłatnym materiałem dopasowanym do miejsca w artykule. */
export function MagnetCta({ slug, hook, photo, idSuffix, side }: { slug: string; hook: string; photo?: string; idSuffix: string; side?: boolean }) {
  const m = magnetBySlug(slug);
  if (!m) return null;
  return (
    <aside className={clsx("relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-forest to-forest-800 text-white shadow-[0_24px_50px_-28px_rgba(31,42,35,0.7)]", side ? "text-center" : "my-8")} aria-label={`Bezpłatny materiał: ${m.short}`} data-testid="article-cta">
      <div className={clsx("grid items-center gap-4 p-5", !side && "sm:grid-cols-[8.5rem_1fr] sm:gap-6 sm:p-6")}>
        <div className="mx-auto h-[11rem] w-[8.4rem]">
          <div className="w-[14rem] origin-top-left scale-[0.6]"><CoverBook><Cover m={m} mode="screen" compact photo={photo} idSuffix={idSuffix} /></CoverBook></div>
        </div>
        <div>
          <p className={clsx("flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f3c9b2]", side && "justify-center")}>
            <MagnetIcon icon={m.icon} id={`acta-${m.id}${idSuffix}`} className="h-4 w-4" /> Bezpłatnie: {m.format.split(" · ")[0]}
          </p>
          <p className="mt-2 font-display text-[1.35rem] leading-snug text-white">{m.short}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-white/80">{hook}</p>
          <Link href={`/wiedza/${m.slug}#odbierz`} data-article-cta={m.n}
            className={clsx("btn-convex mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold text-white", side && "w-full")}>
            Pobierz bezpłatnie <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}

/** Ilustracja-infografika z OpenAI (albo spokojny zastępnik, dopóki nie zostanie wygenerowana) + podpis z ideą. */
export function ArtFigure({ id, title, alt, caption, src }: { id: string; title: string; alt: string; caption: string; src?: string }) {
  return (
    <figure className="soft-inset relative my-10 overflow-hidden rounded-[1.6rem]" aria-labelledby={`${id}-t`} data-testid="art-figure">
      <div className="relative aspect-[3/2]">
        {src ? (
          <img src={src} alt={alt} loading="lazy" decoding="async" width={1536} height={1024} className="h-full w-full object-cover mask-fade-bottom" />
        ) : (
          <div className="grid h-full place-items-center p-8 text-center" role="img" aria-label={alt}>
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-clay ring-1 ring-sand"><Sparkles size={24} aria-hidden /></span>
          </div>
        )}
        {/* logo w narożniku */}
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1" aria-hidden>
          <BrandSymbol id={`af-${id}`} className="h-3.5 w-auto" />
          <span className="font-wordmark text-[12px] font-medium text-forest">DUO®</span>
        </span>
      </div>
      <figcaption className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
        <p id={`${id}-t`} className="font-display text-[1.2rem] leading-snug text-ink">{title}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{caption}</p>
      </figcaption>
      {/* jeden wewnętrzny cień na całą figurę (grafika + podpis) – bez szwu, bez obramowania */}
      <span className="soft-inset-overlay pointer-events-none absolute inset-0 z-10 rounded-[1.6rem]" aria-hidden />
    </figure>
  );
}

/** Dyskretny odnośnik do Mapy Relacji na końcu artykułu. */
export function MapaSlim() {
  return (
    <aside className="mt-12 flex flex-col gap-3 rounded-2xl bg-sage-soft/50 p-4 ring-1 ring-sage/40 sm:flex-row sm:items-center sm:p-5" aria-label="Mapa Relacji" data-testid="mapa-slim">
      <span className="flex items-center gap-2"><MapaSymbol id="ms-art" className="h-4 w-auto" /><span className="font-wordmark text-[15px] text-forest">Mapa Relacji</span></span>
      <p className="flex-1 text-[14.5px] leading-snug text-ink-soft">Chcesz spojrzeć na całą sytuację z psychologiem? Kwestionariusz, spotkanie i pisemne podsumowanie.</p>
      <Link href="/mapa-relacji" data-mapa-cta className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-forest underline underline-offset-4">Poznaj Mapę Relacji <ArrowRight size={15} aria-hidden /></Link>
    </aside>
  );
}

export function ArticleBody({ a, photos, images = {}, hidden = [] }: { a: Article; photos: Record<string, string>; images?: Record<string, string>; hidden?: string[] }) {
  // kontener z materiałem ukrytym w panelu → zastępujemy innym widocznym materiałem artykułu (bez powtórzeń), a gdy brak – pomijamy
  const inlineUsed = new Set(a.blocks.flatMap((b) => (b.t === "cta" && !hidden.includes(b.magnet) ? [b.magnet] : [])));
  const spare = a.magnets.filter((x) => !hidden.includes(x) && !inlineUsed.has(x));
  let cta = 0;
  return (
    <div className="article-body">
      {layoutBlocks(a.blocks).map((b: ArticleBlock, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} id={b.id} className="mt-12 scroll-mt-24 font-display text-[1.7rem] leading-tight text-ink sm:text-[2rem]">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="mt-7 font-display text-[1.3rem] text-forest">{b.text}</h3>;
          case "p":
            return <p key={i} className="mt-4 text-[17px] leading-[1.75] text-ink-soft"><Rich text={b.text} hidden={hidden} /></p>;
          case "list": {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={clsx("mt-4 space-y-2.5 text-[17px] leading-[1.7] text-ink-soft", b.ordered ? "list-decimal pl-6 marker:font-semibold marker:text-clay" : "pl-0")}>
                {b.items.map((x, j) => (
                  <li key={j} className={b.ordered ? "pl-1" : "flex gap-3"}>
                    {!b.ordered && <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden />}
                    <span><Rich text={x} hidden={hidden} /></span>
                  </li>
                ))}
              </L>
            );
          }
          case "quote":
            return <blockquote key={i} className="mt-6 border-l-2 border-clay pl-5 font-display text-[1.35rem] italic leading-snug text-ink"><Rich text={b.text} hidden={hidden} /></blockquote>;
          case "callout": {
            const safety = b.tone === "safety";
            const Icon = safety ? ShieldAlert : Info;
            return (
              <div key={i} className={clsx("mt-6 flex gap-3 rounded-2xl p-4 sm:p-5", safety ? "bg-alert-soft/60 ring-1 ring-alert/20" : "bg-sage-soft/60 ring-1 ring-sage/40")}>
                <Icon size={20} className={clsx("mt-0.5 shrink-0", safety ? "text-alert" : "text-forest")} aria-hidden />
                <div>
                  <p className="font-semibold text-ink">{b.title}</p>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-ink-soft"><Rich text={b.text} hidden={hidden} /></p>
                </div>
              </div>
            );
          }
          case "figure":
            return <Infographic key={i} id={`${a.slug}-${i}`} graphic={b.graphic} title={b.title} caption={b.caption} />;
          case "cta": {
            if (hidden.includes(b.magnet)) {
              const sub = spare.shift();
              const sm = sub ? magnetBySlug(sub) : null;
              return sm ? <MagnetCta key={i} slug={sm.slug} hook={sm.menuDesc} photo={photos[sm.slug]} idSuffix={`-a${cta++}`} /> : null;
            }
            return <MagnetCta key={i} slug={b.magnet} hook={b.hook} photo={photos[b.magnet]} idSuffix={`-a${cta++}`} />;
          }
          case "art":
            return <ArtFigure key={i} id={`${a.slug}-${b.key}`} title={b.title} alt={b.alt} caption={b.caption} src={images[`${a.slug}--${b.key}`]} />;
          case "mapa":
            return <MapaSlim key={i} />;
        }
      })}
    </div>
  );
}

/** Karta artykułu – na listach i w „Powiązanych artykułach”. */
export function ArticleCard({ a, className, image }: { a: Article; className?: string; image?: string }) {
  return (
    <Link href={articleHref(a.slug)} className={clsx("group flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40", className)} data-testid="article-card">
      <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-linen via-ivory to-clay-soft/60">
        {image && <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
      <p className="flex flex-wrap gap-1.5">
        {a.tags.slice(0, 2).map((t) => <span key={t} className="rounded-full bg-linen px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">{t}</span>)}
      </p>
      <p className="mt-3 font-display text-[1.3rem] leading-snug text-ink group-hover:text-forest">{a.h1}</p>
      <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{a.excerpt}</p>
      <p className="mt-4 flex items-center justify-between text-[13px] text-muted">
        <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden /> {a.minutes} min czytania</span>
        <span className="inline-flex items-center gap-1 font-semibold text-forest">Czytaj <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
      </p>
      </div>
    </Link>
  );
}
