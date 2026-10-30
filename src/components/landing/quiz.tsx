"use client";

// Krótki quiz kwalifikacyjny (2 minuty) zakończony formularzem zgłoszenia.
// Nie ocenia relacji i nie stawia diagnozy – personalizuje rozmowę telefoniczną.
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { submitLead, type LeadInput } from "@/app/actions/lead";
import { Alert, Button, Field, Input } from "@/components/ui";

import { INTENTS, type Intent } from "./intents";

const CONCERNS = [
  ["fights", "Te same kłótnie wracają w kółko"],
  ["distance", "Oddaliliśmy się, brakuje bliskości"],
  ["trust", "Zaufanie zostało naruszone"],
  ["vision", "Mamy różne wizje przyszłości"],
  ["stress", "Stres, praca i obowiązki nas przytłaczają"],
  ["children", "Martwimy się o dzieci"],
  ["unclear", "Trudno mi to nazwać"],
] as const;

const LENGTHS = [
  ["lt2", "krócej niż 2 lata"],
  ["2to5", "2–5 lat"],
  ["5to10", "5–10 lat"],
  ["gt10", "ponad 10 lat"],
  ["separated", "jesteśmy już po rozstaniu lub w trakcie"],
] as const;

const WHEN = [
  ["asap", "Jak najszybciej"],
  ["month", "W ciągu miesiąca"],
  ["talk_first", "Najpierw chcę porozmawiać i dowiedzieć się więcej"],
] as const;

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  preferredContact: "phone" | "email" | "sms";
  contactConsent: boolean;
  marketingConsent: boolean;
  discreet: boolean;
  website: string;
}

const STEPS = ["Kto", "Sytuacja", "Co obciąża", "Staż", "Kiedy", "Kontakt"];

export function Quiz({ initialIntent, consentText, marketingText }: { initialIntent?: Intent; consentText: string; marketingText: string }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"couple" | "individual" | null>(null);
  const [intent, setIntent] = useState<Intent | null>(initialIntent ?? null);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [length, setLength] = useState<string>("");
  const [children, setChildren] = useState<string>("");
  const [when, setWhen] = useState<string>("");
  const [done, setDone] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const form = useForm<ContactForm>({ defaultValues: { preferredContact: "phone", contactConsent: false, marketingConsent: false, discreet: false, website: "" } });

  const canNext = [mode, intent, concerns.length > 0, length && children, when, true][step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = form.handleSubmit((v) => {
    setServerError(null);
    const payload: LeadInput = {
      name: v.name,
      email: v.email,
      phone: v.phone,
      mode: mode!,
      intent: intent!,
      preferredContact: v.preferredContact,
      contactConsent: v.contactConsent as true,
      marketingConsent: v.marketingConsent,
      quiz: { concerns: concerns as never, length: length as never, children: children as never, when: when as never, discreet: v.discreet },
      website: v.website,
    };
    start(async () => {
      const r = await submitLead(payload);
      if (r.ok) setDone(v.name.split(" ")[0]);
      else {
        setServerError(r.error);
        if (r.field && r.field in v) form.setError(r.field as keyof ContactForm, { message: r.error });
      }
    });
  });

  if (done) {
    return (
      <div className="animate-rise rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-sand sm:p-12" role="status" aria-live="polite">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-forest">
          <Check aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-3xl text-ink">Dziękujemy, {done}. Zgłoszenie zostało przyjęte.</h3>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-soft">
          Odezwiemy się w wybrany przez Ciebie sposób, żeby krótko porozmawiać o Twojej sytuacji, wyjaśnić, jak wygląda audyt, i wspólnie ustalić termin. To nie jest
          jeszcze rezerwacja – termin sesji ustalimy razem.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">Jeśli w międzyczasie poczujesz, że jesteś w niebezpieczeństwie, nie czekaj – zadzwoń pod 112.</p>
      </div>
    );
  }

  const tile = (active: boolean) =>
    clsx(
      "w-full rounded-2xl px-5 py-4 text-left ring-1 transition min-h-14",
      active ? "bg-forest text-white ring-forest shadow-soft" : "bg-white text-ink ring-sand-dark hover:ring-forest hover:bg-ivory",
    );

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand sm:p-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-clay">
          Krok {step + 1} z {STEPS.length} · {STEPS[step]}
        </p>
        <p className="text-xs text-muted">ok. 2 minuty</p>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-linen" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Postęp quizu">
        <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div key={step} className="animate-rise">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-2xl text-ink sm:text-3xl">Kto weźmie udział w audycie?</legend>
            <p className="mt-2 text-sm text-muted">Możesz to jeszcze zmienić podczas rozmowy.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["couple", "Przyjdziemy we dwoje", "90 minut, każde z Was wypełnia własny, poufny kwestionariusz"],
                  ["individual", "Przyjdę sam lub sama", "60 minut, relacja z Twojej perspektywy"],
                ] as const
              ).map(([v, t, s]) => (
                <button type="button" key={v} aria-pressed={mode === v} className={tile(mode === v)} onClick={() => { setMode(v); next(); }}>
                  <span className="block font-medium">{t}</span>
                  <span className={clsx("mt-1 block text-sm", mode === v ? "text-white/80" : "text-muted")}>{s}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-2xl text-ink sm:text-3xl">Co jest teraz najbliższe Twojej sytuacji?</legend>
            <p className="mt-2 text-sm text-muted">Wybór nie przesądza o rekomendacji – pomaga nam przygotować rozmowę.</p>
            <div className="mt-6 grid gap-3">
              {INTENTS.map((i) => (
                <button type="button" key={i.value} aria-pressed={intent === i.value} className={tile(intent === i.value)} onClick={() => { setIntent(i.value); next(); }}>
                  <span className="block font-medium">{i.title}</span>
                  <span className={clsx("mt-1 block text-sm", intent === i.value ? "text-white/80" : "text-muted")}>{i.sub}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="font-display text-2xl text-ink sm:text-3xl">Co najbardziej Was teraz obciąża?</legend>
            <p className="mt-2 text-sm text-muted">Zaznacz wszystko, co pasuje.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {CONCERNS.map(([v, l]) => {
                const on = concerns.includes(v);
                return (
                  <button type="button" key={v} aria-pressed={on} className={tile(on)} onClick={() => setConcerns((c) => (on ? c.filter((x) => x !== v) : [...c, v]))}>
                    <span className="flex items-center gap-3">
                      <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1", on ? "bg-white text-forest ring-white" : "ring-sand-dark")}>{on && <Check size={14} aria-hidden />}</span>
                      {l}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="font-display text-2xl text-ink sm:text-3xl">Jak długo jesteście razem?</legend>
              <div className="mt-5 flex flex-wrap gap-2">
                {LENGTHS.map(([v, l]) => (
                  <button type="button" key={v} aria-pressed={length === v} className={clsx(tile(length === v), "w-auto py-2.5")} onClick={() => setLength(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-display text-xl text-ink">Czy macie dzieci?</legend>
              <div className="mt-4 flex gap-2">
                {(
                  [
                    ["yes", "Tak"],
                    ["no", "Nie"],
                  ] as const
                ).map(([v, l]) => (
                  <button type="button" key={v} aria-pressed={children === v} className={clsx(tile(children === v), "w-auto px-8 py-2.5")} onClick={() => setChildren(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="font-display text-2xl text-ink sm:text-3xl">Kiedy chcesz zacząć?</legend>
            <div className="mt-6 grid gap-3">
              {WHEN.map(([v, l]) => (
                <button type="button" key={v} aria-pressed={when === v} className={tile(when === v)} onClick={() => { setWhen(v); next(); }}>
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <h3 className="font-display text-2xl text-ink sm:text-3xl">Gdzie możemy się odezwać?</h3>
              <p className="mt-2 text-sm text-muted">Oddzwonimy, żeby wyjaśnić, jak wygląda audyt, odpowiedzieć na pytania i ustalić termin. Bez zobowiązań.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Imię" htmlFor="l-name" required error={form.formState.errors.name?.message}>
                <Input id="l-name" autoComplete="given-name" {...form.register("name", { required: "Podaj imię.", minLength: { value: 2, message: "Podaj imię." } })} />
              </Field>
              <Field label="E-mail" htmlFor="l-email" required error={form.formState.errors.email?.message}>
                <Input id="l-email" type="email" autoComplete="email" {...form.register("email", { required: "Podaj adres e-mail." })} />
              </Field>
              <Field label="Telefon" htmlFor="l-phone" hint="Wymagany przy kontakcie telefonicznym lub SMS." error={form.formState.errors.phone?.message}>
                <Input id="l-phone" type="tel" autoComplete="tel" placeholder="+48 600 000 000" {...form.register("phone")} />
              </Field>
              <Field label="Preferowany kontakt" htmlFor="l-pref">
                <select id="l-pref" className="w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-sand-dark focus:outline-none focus:ring-2 focus:ring-forest" {...form.register("preferredContact")}>
                  <option value="phone">Telefon</option>
                  <option value="sms">SMS</option>
                  <option value="email">E-mail</option>
                </select>
              </Field>
            </div>
            <label className="flex items-start gap-3 text-sm text-ink-soft">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-forest" {...form.register("discreet")} />
              Proszę o dyskretny kontakt (np. bez zostawiania wiadomości głosowych).
            </label>
            {/* honeypot – ukryte dla ludzi */}
            <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
            <div className="space-y-3 rounded-2xl bg-ivory p-4 ring-1 ring-sand">
              <label className="flex items-start gap-3 text-sm text-ink">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-forest" {...form.register("contactConsent", { required: "Zgoda na kontakt jest potrzebna, abyśmy mogli odpowiedzieć." })} />
                <span>
                  {consentText} <span className="text-clay">*</span>
                </span>
              </label>
              {form.formState.errors.contactConsent && <p className="text-sm text-alert" role="alert">{form.formState.errors.contactConsent.message}</p>}
              <hr className="border-sand" />
              <label className="flex items-start gap-3 text-sm text-ink-soft">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-forest" {...form.register("marketingConsent")} />
                <span>{marketingText}</span>
              </label>
            </div>
            <p className="text-xs text-muted">
              W formularzu nie podawaj szczegółów dotyczących zdrowia ani przemocy – o tym porozmawiamy bezpiecznie i poufnie. Szczegóły:{" "}
              <a href="/prywatnosc" className="underline underline-offset-2">polityka prywatności</a>.
            </p>
            {serverError && <Alert tone="alert">{serverError}</Alert>}
            <Button type="submit" variant="clay" size="lg" className="w-full sm:w-auto" disabled={pending}>
              {pending ? "Wysyłanie…" : "Wyślij zgłoszenie"} <ArrowRight size={18} aria-hidden />
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 0} aria-label="Wstecz">
          <ArrowLeft size={18} aria-hidden /> Wstecz
        </Button>
        {step < STEPS.length - 1 && (
          <Button type="button" onClick={next} disabled={!canNext}>
            Dalej <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
