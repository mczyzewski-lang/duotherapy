// Strona zamówienia (prywatny link). Stan płatności zawsze z danych operatora (webhook albo zapytanie API),
// nigdy z samego przekierowania. Po opłaceniu: wybór terminu i dostęp do kwestionariusza.
import { CalendarCheck, CheckCircle2, Clock, KeyRound, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandSymbol, MapaLogo } from "@/components/brand";
import { AutoRefresh, BookingForm, type SlotView } from "@/components/order/booking";
import { system } from "@/lib/db";
import { applyPaymentOutcome, fmtWarsaw, freeSlots, orderByToken, readAccess } from "@/lib/orders";
import { paymentsConfigured, retrieveSession, sessionOutcome } from "@/lib/payments";
import { readSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Twoje zamówienie – Mapa Relacji", robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let order = await system((tx) => orderByToken(tx, token));

  // potwierdzenie bezpośrednio u operatora (np. gdy powiadomienie jeszcze nie dotarło)
  if (order && ["created", "open", "pending"].includes(order.status) && order.provider_session_id && paymentsConfigured()) {
    try {
      const session = await retrieveSession(order.provider_session_id);
      const id = order.id;
      await system((tx) => applyPaymentOutcome(tx, id, sessionOutcome(session), { paymentId: session.payment_intent, email: session.customer_details?.email ?? null }));
      order = await system((tx) => orderByToken(tx, token));
    } catch (e) {
      console.error("Nie udało się sprawdzić płatności u operatora:", (e as Error).message);
    }
  }

  const s = await system((tx) => readSettings(tx));
  const slots: SlotView[] =
    order?.status === "paid" && !order.case_id
      ? (await system((tx) => freeSlots(tx, s.offer.minBookingHours))).map((x) => ({
          id: x.id,
          day: fmtWarsaw(x.starts_at, { weekday: "long", day: "numeric", month: "long" }),
          time: fmtWarsaw(x.starts_at, { hour: "2-digit", minute: "2-digit" }),
          therapist: x.therapist,
        }))
      : [];
  const access = order ? readAccess(order) : null;
  const first = order?.lead_name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="min-h-dvh bg-ivory">
      <header className="border-b border-sand/50">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="DUO – strona główna">
            <BrandSymbol id="ord" className="h-5 w-auto" />
            <span className="h-5 w-px bg-sand-dark" aria-hidden />
            <MapaLogo compact id="ord-logo" />
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 pb-20 pt-8">
        {!order ? (
          <Box icon={<XCircle className="text-alert" />} title="Nie znaleziono zamówienia">
            Link jest nieprawidłowy lub niepełny. Jeśli zapłaciłeś lub zapłaciłaś za Mapę Relacji, konsultant DUO skontaktuje się z Tobą – albo napisz do nas.
          </Box>
        ) : order.status === "paid" && access ? (
          <>
            <Box icon={<CheckCircle2 className="text-ok" />} title={`Wszystko gotowe${first ? `, ${first}` : ""}`}>
              Twoja konsultacja jest zarezerwowana. Zapisz tę stronę – możesz do niej wrócić w każdej chwili.
            </Box>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand">
                <p className="flex items-center gap-2 text-sm font-medium text-muted"><CalendarCheck size={16} aria-hidden /> Konsultacja online (60 min)</p>
                <p className="mt-2 font-display text-xl text-ink first-letter:uppercase">{fmtWarsaw(new Date(access.sessionAt))}</p>
                {access.therapist && <p className="mt-1 text-sm text-ink-soft">Prowadzi: {access.therapist}</p>}
                <p className="mt-2 text-xs text-muted">Link do spotkania przekaże psycholog przed konsultacją.</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand">
                <p className="flex items-center gap-2 text-sm font-medium text-muted"><KeyRound size={16} aria-hidden /> Kwestionariusz – wypełnij przed konsultacją</p>
                <p className="mt-2 text-sm text-ink-soft">Kod dostępu:</p>
                <p className="font-mono text-2xl tracking-[0.3em] text-ink" data-testid="access-code">{access.code}</p>
                <a href={access.url} className="mt-3 inline-flex min-h-12 items-center rounded-full bg-clay px-5 text-[15px] font-semibold text-white">Otwórz kwestionariusz</a>
                <p className="mt-2 text-xs text-muted">Ok. 15–25 minut, możesz robić przerwy. Kod jest poufny – nie przekazuj go nikomu.</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Po konsultacji psycholog przygotuje Twoją Mapę Relacji i udostępni ją pod prywatnym linkiem z kodem (także do pobrania w PDF).
            </p>
          </>
        ) : order.status === "paid" ? (
          <>
            <Box icon={<CheckCircle2 className="text-ok" />} title={`Dziękujemy za zamówienie${first ? `, ${first}` : ""}!`}>
              Płatność została potwierdzona. Teraz wybierz termin konsultacji – zaraz potem otrzymasz dostęp do kwestionariusza.
            </Box>
            <div className="mt-6 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand sm:p-7">
              {slots.length ? (
                <BookingForm token={token} slots={slots} />
              ) : (
                <p className="leading-relaxed text-ink-soft">
                  W tej chwili nie ma wolnych terminów do rezerwacji online. Konsultant DUO zadzwoni do Ciebie, ustali dogodny termin i przekaże dostęp do kwestionariusza.
                </p>
              )}
            </div>
          </>
        ) : order.status === "failed" || order.status === "expired" ? (
          <Box icon={<XCircle className="text-alert" />} title={order.status === "failed" ? "Płatność nie powiodła się" : "Płatność nie została dokończona"}>
            Nic nie zostało pobrane. Możesz spróbować ponownie albo poczekać na telefon konsultanta DUO, który pomoże w zamówieniu.
            <span className="mt-4 block"><Link href="/twoja-mapa#oferta" className="inline-flex min-h-12 items-center rounded-full bg-clay px-5 font-semibold text-white">Spróbuj ponownie</Link></span>
          </Box>
        ) : (
          <>
            <AutoRefresh />
            <Box icon={<Clock className="text-clay" />} title={order.status === "pending" ? "Płatność jest potwierdzana" : "Czekamy na potwierdzenie płatności"}>
              {order.status === "pending"
                ? "Operator płatności potwierdza Twoją wpłatę (przy niektórych metodach może to potrwać dłużej). Ta strona odświeży się sama – możesz też wrócić do niej później."
                : "To zwykle trwa kilka sekund. Strona odświeży się sama."}
              {order.status === "open" && order.checkout_url && (
                <span className="mt-4 block text-sm">Nie dokończono płatności? <a href={order.checkout_url} className="font-medium text-forest underline">Wróć do płatności</a></span>
              )}
            </Box>
          </>
        )}
        <p className="mt-10 text-center text-xs text-muted">
          <Link href="/regulamin" className="underline">Regulamin</Link> · <Link href="/prywatnosc" className="underline">Prywatność</Link> · <Link href="/pomoc" className="underline">Gdy nie czujesz się bezpiecznie</Link>
        </p>
      </main>
    </div>
  );
}

function Box({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand sm:p-8" role="status">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-linen">{icon}</span>
      <h1 className="mt-4 font-display text-[1.8rem] leading-tight text-ink">{title}</h1>
      <div className="mt-2 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
