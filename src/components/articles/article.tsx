// Renderer artykułu: tekst z **pogrubieniem** i [linkami](/adres), bloki, kontenery z materiałem, karty artykułów.
import clsx from "clsx";
import { ArrowRight, Clock, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { CoverBook } from "@/components/knowledge/cover-book";
import { Cover } from "@/components/knowledge/doc";
import { MagnetIcon } from "@/components/knowledge/icons";
import { MapaExplainer } from "@/components/knowledge/mapa-explainer";
import { articleHref } from "@/content/articles";
import type { Article, ArticleBlock } from "@/content/articles/types";
import { magnetBySlug } from "@/knowledge/registry";
import { Infographic } from "./infographics";

/** **pogrubienie** i [tekst](/adres) – linki wewnętrzne przez next/link. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const b = p.match(/^\*\*([^*]+)\*\*$/);
        if (b) return <strong key={i} className="font-semibold text-ink">{b[1]}</strong>;
        const l = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (l) {
          const inner = l[1].split(/(\*\*[^*]+\*\*)/g).map((x, j) => (x.startsWith("**") ? <strong key={j}>{x.slice(2, -2)}</strong> : <Fragment key={j}>{x}</Fragment>));
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
    <aside className={clsx("overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-clay-soft/80 via-ivory to-white shadow-soft ring-1 ring-clay/20", side ? "text-center" : "my-8")} aria-label={`Bezpłatny materiał: ${m.short}`} data-testid="article-cta">
      <div className={clsx("grid items-center gap-4 p-5", !side && "sm:grid-cols-[8.5rem_1fr] sm:gap-6 sm:p-6")}>
        <div className="mx-auto h-[11rem] w-[8.4rem]">
          <div className="w-[14rem] origin-top-left scale-[0.6]"><CoverBook><Cover m={m} mode="screen" compact photo={photo} idSuffix={idSuffix} /></CoverBook></div>
        </div>
        <div>
          <p className={clsx("flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay", side && "justify-center")}>
            <MagnetIcon icon={m.icon} id={`acta-${m.id}${idSuffix}`} className="h-4 w-4" /> Bezpłatny materiał · {m.format.split(" · ")[0]}
          </p>
          <p className="mt-2 font-display text-[1.35rem] leading-snug text-ink">{m.short}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{hook}</p>
          <Link href={`/wiedza/${m.slug}#odbierz`} data-article-cta={m.n}
            className={clsx("btn-convex mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold text-white", side && "w-full")}>
            Pobierz bezpłatnie <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function ArticleBody({ a, photos }: { a: Article; photos: Record<string, string> }) {
  let cta = 0;
  return (
    <div className="article-body">
      {a.blocks.map((b: ArticleBlock, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} id={b.id} className="mt-12 scroll-mt-24 font-display text-[1.7rem] leading-tight text-ink sm:text-[2rem]">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="mt-7 font-display text-[1.3rem] text-forest">{b.text}</h3>;
          case "p":
            return <p key={i} className="mt-4 text-[17px] leading-[1.75] text-ink-soft"><Rich text={b.text} /></p>;
          case "list": {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={clsx("mt-4 space-y-2.5 text-[17px] leading-[1.7] text-ink-soft", b.ordered ? "list-decimal pl-6 marker:font-semibold marker:text-clay" : "pl-0")}>
                {b.items.map((x, j) => (
                  <li key={j} className={b.ordered ? "pl-1" : "flex gap-3"}>
                    {!b.ordered && <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden />}
                    <span><Rich text={x} /></span>
                  </li>
                ))}
              </L>
            );
          }
          case "quote":
            return <blockquote key={i} className="mt-6 border-l-2 border-clay pl-5 font-display text-[1.35rem] italic leading-snug text-ink"><Rich text={b.text} /></blockquote>;
          case "callout": {
            const safety = b.tone === "safety";
            const Icon = safety ? ShieldAlert : Info;
            return (
              <div key={i} className={clsx("mt-6 flex gap-3 rounded-2xl p-4 sm:p-5", safety ? "bg-alert-soft/60 ring-1 ring-alert/20" : "bg-sage-soft/60 ring-1 ring-sage/40")}>
                <Icon size={20} className={clsx("mt-0.5 shrink-0", safety ? "text-alert" : "text-forest")} aria-hidden />
                <div>
                  <p className="font-semibold text-ink">{b.title}</p>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-ink-soft"><Rich text={b.text} /></p>
                </div>
              </div>
            );
          }
          case "figure":
            return <Infographic key={i} id={`${a.slug}-${i}`} graphic={b.graphic} title={b.title} caption={b.caption} />;
          case "cta":
            return <MagnetCta key={i} slug={b.magnet} hook={b.hook} photo={photos[b.magnet]} idSuffix={`-a${cta++}`} />;
          case "mapa":
            return (
              <div key={i} className="mt-12">
                <MapaExplainer id={`art-${a.slug}`} lead="Artykuł pomaga zrozumieć jeden temat." href="/mapa-relacji" compact />
              </div>
            );
        }
      })}
    </div>
  );
}

/** Karta artykułu – na listach i w „Powiązanych artykułach”. */
export function ArticleCard({ a, className }: { a: Article; className?: string }) {
  return (
    <Link href={articleHref(a.slug)} className={clsx("group flex h-full flex-col rounded-[1.4rem] bg-white p-5 shadow-soft ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-forest/40 sm:p-6", className)} data-testid="article-card">
      <p className="flex flex-wrap gap-1.5">
        {a.tags.slice(0, 2).map((t) => <span key={t} className="rounded-full bg-linen px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">{t}</span>)}
      </p>
      <p className="mt-3 font-display text-[1.3rem] leading-snug text-ink group-hover:text-forest">{a.h1}</p>
      <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{a.excerpt}</p>
      <p className="mt-4 flex items-center justify-between text-[13px] text-muted">
        <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden /> {a.minutes} min czytania</span>
        <span className="inline-flex items-center gap-1 font-semibold text-forest">Czytaj <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
      </p>
    </Link>
  );
}
