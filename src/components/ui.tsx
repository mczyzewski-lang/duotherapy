// Podstawowe komponenty interfejsu DUO® (styl w duchu shadcn/ui, bez zależności zewnętrznych).
import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "clay";
const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-600 shadow-soft",
  clay: "bg-clay text-white hover:brightness-110 shadow-soft",
  secondary: "bg-white text-forest ring-1 ring-sand-dark hover:bg-linen",
  ghost: "text-forest hover:bg-linen",
  danger: "bg-alert text-white hover:brightness-110",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50 disabled:pointer-events-none min-h-11";
const sizes = { sm: "px-3.5 py-1.5 text-sm min-h-9", md: "px-5 py-2.5 text-[15px]", lg: "px-7 py-3.5 text-base" };

export function Button({ variant = "primary", size = "md", className, ...p }: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...p} />;
}

export function LinkButton({ variant = "primary", size = "md", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <Link className={clsx(base, variants[variant], sizes[size], className)} {...p} />;
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div className={clsx("rounded-xl2 bg-white ring-1 ring-sand/70 shadow-soft", className)} {...p} />;
}

export function Badge({ tone = "neutral", className, ...p }: ComponentProps<"span"> & { tone?: "neutral" | "forest" | "clay" | "alert" | "ok" }) {
  const t = {
    neutral: "bg-linen text-ink-soft",
    forest: "bg-sage-soft text-forest",
    clay: "bg-clay-soft text-clay",
    alert: "bg-alert-soft text-alert",
    ok: "bg-sage-soft text-ok",
  }[tone];
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", t, className)} {...p} />;
}

export function Field({ label, hint, error, children, htmlFor, required }: { label: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-clay" aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-sm text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-[15px] text-ink ring-1 ring-sand-dark placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-forest transition";

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={clsx(inputCls, className)} {...p} />;
}
export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={clsx(inputCls, "min-h-28 leading-relaxed", className)} {...p} />;
}
export function Select({ className, ...p }: ComponentProps<"select">) {
  return <select className={clsx(inputCls, "pr-8", className)} {...p} />;
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "warn" | "alert" | "ok"; title?: ReactNode; children: ReactNode; className?: string }) {
  const t = {
    info: "bg-sage-soft/60 ring-sage/40 text-forest-800",
    warn: "bg-clay-soft ring-clay/30 text-ink",
    alert: "bg-alert-soft ring-alert/30 text-ink",
    ok: "bg-sage-soft ring-ok/30 text-ink",
  }[tone];
  return (
    <div className={clsx("rounded-xl p-4 ring-1 text-sm leading-relaxed", t, className)} role={tone === "alert" ? "alert" : "status"}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}

export { Logo } from "./brand";

export function DemoBanner() {
  return (
    <div className="bg-clay px-4 py-1.5 text-center text-xs font-medium text-white no-print" role="note">
      Środowisko DEMO – wyłącznie dane syntetyczne. Nie wprowadzaj prawdziwych danych osobowych.
    </div>
  );
}

export function PageTitle({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
