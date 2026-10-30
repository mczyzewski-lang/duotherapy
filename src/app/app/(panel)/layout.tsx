import { ClipboardList, FileCog, Inbox, LayoutDashboard, LogOut, ScrollText, Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { logoutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Panel", template: "%s · Panel DUO®" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireStaff();
  const nav = [
    { href: "/app", label: "Pulpit", icon: LayoutDashboard },
    { href: "/app/leads", label: "Zgłoszenia", icon: Inbox },
    { href: "/app/cases", label: "Sprawy", icon: ClipboardList },
    ...(s.user.role === "admin"
      ? [
          { href: "/app/templates", label: "Kwestionariusze", icon: FileCog },
          { href: "/app/audit", label: "Dziennik", icon: ScrollText },
        ]
      : []),
    { href: "/app/settings", label: "Ustawienia", icon: Settings },
  ];
  return (
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="no-print border-b border-sand bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/app" aria-label="Pulpit"><Logo /></Link>
          <p className="hidden text-xs text-muted lg:mt-1 lg:block">Panel specjalisty</p>
          <form action={logoutAction} className="lg:hidden">
            <button className="flex items-center gap-1.5 text-sm text-clay"><LogOut size={14} aria-hidden /> Wyloguj</button>
          </form>
        </div>
        <nav aria-label="Panel" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-linen hover:text-forest">
              <Icon size={17} aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 py-4 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate text-sm font-medium text-ink">{s.user.name}</p>
          <p className="text-xs text-muted">{s.user.role === "admin" ? "Administrator" : "Psycholog"}{s.user.mfaEnabled ? " · MFA" : ""}</p>
          <form action={logoutAction} className="mt-2">
            <button className="flex items-center gap-1.5 text-sm text-clay hover:underline"><LogOut size={14} aria-hidden /> Wyloguj</button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
