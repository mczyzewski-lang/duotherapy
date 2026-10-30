// Ustawienia edytowalne w panelu administratora. Brak wartości = sekcja ukryta / komunikat
// "do uzupełnienia" – nigdy fikcyjne dane.
import { withActor, type Actor, type Tx } from "./db";

export interface Helpline {
  number: string;
  when: string;
  availability: string;
}

export interface Settings {
  legal: {
    controllerName: string; // administrator danych
    controllerContact: string;
    dpoContact: string;
    processingLocation: string;
    retentionPolicy: string;
    privacyPolicy: string;
    /** Klauzula informacyjna w kwestionariuszu. {administrator} zostanie zastąpione danymi administratora. */
    questionnaireNotice: string;
    leadContactConsent: string;
    leadMarketingConsent: string;
    /** Zgoda w formularzu „Masz pytania?”. */
    inquiryConsent: string;
    /** Wersja tekstów (zapisywana w rejestrze zgód). Zmień przy każdej zmianie treści. */
    version: string;
    /** Teksty zatwierdzone przez prawnika / IOD. Bez tego (poza trybem DEMO) kwestionariusz jest zablokowany. */
    approved: boolean;
  };
  site: {
    priceIndividual: string;
    priceCouple: string;
    contactPhone: string;
    contactEmail: string;
    /** Adres osadzanego wideo (YouTube nocookie / Vimeo) wyjaśniającego usługę. Puste = sekcja ukryta. */
    vslUrl: string;
    /** Link do płatności (np. wygenerowany w systemie płatności). Puste = informacja, że link prześlemy. */
    paymentUrl: string;
    faq: { q: string; a: string }[];
  };
  flow: {
    invitationDays: number;
    reportShareDays: number;
    requirePaymentBeforeQuestionnaire: boolean;
  };
  helplines: {
    items: Helpline[];
    abroad: string;
    verifiedNote: string;
    disclaimer: string;
  };
}

// Numery i treść ramki bezpieczeństwa – zgodnie z materiałami źródłowymi (kwestionariusze 05/06, wytyczne 03).
export const DEFAULT_SETTINGS: Settings = {
  legal: {
    controllerName: "",
    controllerContact: "",
    dpoContact: "",
    processingLocation: "Unia Europejska / Europejski Obszar Gospodarczy",
    retentionPolicy: "",
    privacyPolicy: "",
    questionnaireNotice:
      "Administratorem Twoich danych osobowych jest: {administrator}. Dane z kwestionariusza, w tym informacje o zdrowiu, przetwarzam wyłącznie w celu przeprowadzenia Audytu Relacji i przygotowania podsumowania, na podstawie Twojej wyraźnej zgody (art. 6 ust. 1 lit. a oraz art. 9 ust. 2 lit. a RODO). Obowiązuje mnie tajemnica zawodowa psychologa. Nie udostępniam danych osobom trzecim, w tym drugiej osobie w związku, bez Twojej zgody, z wyjątkiem sytuacji przewidzianych prawem (np. bezpośrednie zagrożenie życia). Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wycofania zgody w dowolnym momencie, bez wpływu na zgodność z prawem wcześniejszego przetwarzania. Przysługuje Ci skarga do Prezesa Urzędu Ochrony Danych Osobowych.",
    leadContactConsent:
      "Wyrażam zgodę na kontakt telefoniczny lub e-mailowy w sprawie mojego zgłoszenia na Audyt Relacji DUO®.",
    leadMarketingConsent:
      "Chcę otrzymywać od DUO® okazjonalne informacje o materiałach i usługach (opcjonalnie, mogę zrezygnować w każdej chwili).",
    inquiryConsent: "Wyrażam zgodę na kontakt e-mailowy lub telefoniczny w odpowiedzi na moje pytanie.",
    version: "2026-10-draft",
    approved: false,
  },
  site: {
    priceIndividual: "",
    priceCouple: "",
    contactPhone: "",
    contactEmail: "",
    vslUrl: "",
    paymentUrl: "",
    faq: [
      {
        q: "Czy Audyt Relacji to terapia par?",
        a: "Nie. To jednorazowa, ustrukturyzowana konsultacja: 60 minut przy audycie indywidualnym lub 90 minut dla pary. Jej celem jest mapa sytuacji i świadomy wybór dalszej drogi. Jeśli zdecydujecie się na dalszą pracę, może nią być terapia par – ale nie musi.",
      },
      {
        q: "Partner lub partnerka nie chce przyjść. Czy mogę przyjść sam lub sama?",
        a: "Tak. Audyt indywidualny pomaga uporządkować relację z Twojej perspektywy i zobaczyć, co w niej zależy od Ciebie. Nie oceniamy osoby, której nie ma na sesji.",
      },
      {
        q: "Czy druga osoba zobaczy moje odpowiedzi?",
        a: "Nie. Każda osoba wypełnia kwestionariusz na własnym, prywatnym linku. Psycholog nie ujawnia treści jednej osoby drugiej bez zgody.",
      },
      {
        q: "Czy psycholog powie nam, czy mamy się rozstać?",
        a: "Nie. Psycholog pokazuje mechanizmy, zasoby i możliwe drogi, a rekomendacja jest propozycją. Decyzja zawsze należy do Was.",
      },
      {
        q: "Czy dostanę wynik albo ocenę związku?",
        a: "Nie ma tu punktacji ani prognoz. Otrzymasz opisowe podsumowanie: mocne strony, obszary napięcia, mechanizm konfliktu, rekomendacje i konkretne następne kroki.",
      },
      {
        q: "Co, jeśli w związku jest przemoc albo jestem w kryzysie?",
        a: "Bezpieczeństwo jest na pierwszym miejscu. Audyt nie jest pomocą kryzysową. W nagłej sytuacji dzwoń pod 112. Przy przemocy nie prowadzimy wspólnej sesji ani mediacji – pomożemy znaleźć właściwe wsparcie.",
      },
    ],
  },
  flow: {
    invitationDays: 14,
    reportShareDays: 30,
    requirePaymentBeforeQuestionnaire: false,
  },
  helplines: {
    items: [
      { number: "112", when: "zagrożenie życia lub zdrowia, przemoc w toku", availability: "całodobowo" },
      { number: "116 123", when: "Kryzysowy Telefon Zaufania, wsparcie emocjonalne w kryzysie (także 116sos.pl)", availability: "całodobowo, bezpłatnie" },
      {
        number: "800 70 2222",
        when: "Centrum Wsparcia dla osób dorosłych w kryzysie psychicznym (także czat i e-mail na centrumwsparcia.pl)",
        availability: "całodobowo, bezpłatnie",
      },
      {
        number: "800 120 002",
        when: "Niebieska Linia, dla osób doznających przemocy domowej i świadków (także niebieskalinia.info)",
        availability: "całodobowo, bezpłatnie",
      },
    ],
    abroad:
      "Jeśli mieszkasz poza Polską: polskie infolinie mogą być niedostępne lub płatne z zagranicy. W nagłej sytuacji dzwoń na lokalny numer alarmowy kraju, w którym jesteś (w Unii Europejskiej to 112), lub zgłoś się na najbliższy szpitalny oddział ratunkowy. Warto zawczasu sprawdzić i zapisać lokalne numery pomocy.",
    verifiedNote: "Numery zweryfikowane na stronach gov.pl i niebieskalinia.info w październiku 2026 r.",
    disclaimer: "Audyt Relacji nie jest formą pomocy kryzysowej ani interwencji i nie zastępuje leczenia psychiatrycznego.",
  },
};

type Section = keyof Settings;

export async function readSettings(tx: Tx): Promise<Settings> {
  const rows = await tx<{ key: string; value: unknown }[]>`select key, value from app_settings`;
  const out = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, Record<string, unknown>>;
  for (const r of rows) {
    if (r.key in out && r.value && typeof r.value === "object") out[r.key] = { ...out[r.key], ...(r.value as object) };
  }
  return out as unknown as Settings;
}

export async function getSettings(actor: Actor = { kind: "public" }): Promise<Settings> {
  return withActor(actor, readSettings);
}

export async function saveSettingsSection<K extends Section>(tx: Tx, key: K, value: Settings[K], userId: string) {
  await tx`insert into app_settings (key, value, updated_by, updated_at) values (${key}, ${tx.json(value as never)}, ${userId}, now())
           on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`;
}

export function questionnaireNotice(s: Settings): string {
  const admin = [s.legal.controllerName, s.legal.controllerContact].filter(Boolean).join(", ");
  return s.legal.questionnaireNotice.replace("{administrator}", admin || "[administrator danych – do uzupełnienia w ustawieniach]");
}
