"use client";

// Wybór terminu konsultacji i wersji kwestionariusza po opłaceniu zamówienia.
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { bookConsultation } from "@/app/actions/checkout";

export interface SlotView {
  id: string;
  day: string;
  time: string;
  therapist: string;
}

export function BookingForm({ token, slots }: { token: string; slots: SlotView[] }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const days = [...new Set(slots.map((s) => s.day))];

  const submit = () => {
    setErr(null);
    start(async () => {
      const r = await bookConsultation({ token, slotId: slot ?? "", gender });
      if (r.ok) router.refresh();
      else {
        setErr(r.error);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-display text-xl text-ink">1. Wybierz termin konsultacji online (60 min)</legend>
        <div className="mt-3 space-y-4">
          {days.map((d) => (
            <div key={d}>
              <p className="text-sm font-medium text-ink-soft first-letter:uppercase">{d}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.filter((s) => s.day === d).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={slot === s.id}
                    onClick={() => setSlot(s.id)}
                    className={clsx("min-h-11 rounded-full px-4 text-[15px] ring-1 transition", slot === s.id ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-sand-dark hover:ring-forest")}
                  >
                    {s.time}
                    <span className="sr-only">, {s.therapist}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl text-ink">2. Wersja kwestionariusza</legend>
        <p className="mt-1 text-sm text-muted">Kwestionariusz ma dwie wersje językowe (formy zwracania się do Ciebie). Treść pytań jest taka sama.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[["female", "Dla kobiety"], ["male", "Dla mężczyzny"]].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={gender === v} onClick={() => setGender(v)}
              className={clsx("min-h-11 rounded-full px-5 text-[15px] ring-1 transition", gender === v ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-sand-dark hover:ring-forest")}>
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      {err && <p role="alert" className="rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">{err}</p>}
      <button type="button" onClick={submit} disabled={!slot || !gender || pending}
        className={clsx("flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[16px] font-semibold text-white shadow-soft sm:w-auto", slot && gender ? "bg-clay" : "bg-clay/50")}>
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />} Rezerwuję termin
      </button>
    </div>
  );
}

/** Odświeża stronę, dopóki operator płatności nie potwierdzi stanu (maks. ok. 3 min). */
export function AutoRefresh({ seconds = 4 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      if (++n > 45) return clearInterval(t);
      router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
