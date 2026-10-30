import { Logo } from "@/components/ui";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-linen/70 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-3xl bg-white p-8 shadow-soft ring-1 ring-sand">{children}</div>
        <p className="mt-6 text-center text-xs text-muted">Panel specjalisty – dostęp wyłącznie dla uprawnionych osób. Działania są rejestrowane.</p>
      </div>
    </main>
  );
}
