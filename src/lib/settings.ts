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
    /** Obietnica czasu oddzwonienia, np. „w ciągu 1 dnia roboczego”. Puste = nie podajemy czasu. */
    callbackPromise: string;
    /** Pierwszopartyjne zdarzenia lejka (bez treści odpowiedzi). */
    funnelTracking: boolean;
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
      "Administratorem Twoich danych osobowych jest: {administrator}. Dane z kwestionariusza, w tym informacje o zdrowiu, przetwarzam wyłącznie w celu przygotowania Mapy Relacji i podsumowania sesji, na podstawie Twojej wyraźnej zgody (art. 6 ust. 1 lit. a oraz art. 9 ust. 2 lit. a RODO). Obowiązuje mnie tajemnica zawodowa psychologa. Nie udostępniam danych osobom trzecim, w tym drugiej osobie w związku, bez Twojej zgody, z wyjątkiem sytuacji przewidzianych prawem (np. bezpośrednie zagrożenie życia). Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wycofania zgody w dowolnym momencie, bez wpływu na zgodność z prawem wcześniejszego przetwarzania. Przysługuje Ci skarga do Prezesa Urzędu Ochrony Danych Osobowych.",
    leadContactConsent: "Proszę o kontakt telefoniczny w sprawie Mapy Relacji. Wiem, że moje dane zostaną użyte wyłącznie w tym celu.",
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
    callbackPromise: "",
    funnelTracking: true,
    faq: [
      {
        q: "Czy mogę zacząć bez udziału partnera?",
        a: "Tak. Quiz, rozmowę z konsultantem i całą Mapę Relacji możesz przejść sam lub sama – nie potrzebujesz zgody drugiej osoby. Jeśli później partner lub partnerka zechce dołączyć, wypełni własny, poufny kwestionariusz. Wspólna konsultacja wymaga udziału i zgody obu osób. Nie kontaktujemy się z drugą osobą bez Twojej wiedzy.",
      },
      {
        q: "Czym Mapa Relacji różni się od zwykłej terapii?",
        a: "Terapia to zwykle wiele spotkań i praca nad zmianą. Mapa Relacji to jednorazowy, zamknięty proces: kwestionariusz, konsultacja z psychologiem i pisemne podsumowanie. Pomaga najpierw zrozumieć, co się między Wami dzieje, i zobaczyć możliwe kierunki. Terapia może być jednym z nich – ale nie musi.",
      },
      {
        q: "Co konkretnie otrzymam po zakończeniu?",
        a: "Pisemne podsumowanie przygotowane przez psychologa – do przeczytania online pod prywatnym linkiem z kodem dostępu i do pobrania jako PDF. Składa się z sześciu części: najważniejsze w skrócie, co Was wspiera, gdzie jest najtrudniej (sześć obszarów relacji), jak działa Wasz konflikt, propozycje psychologa z możliwą dalszą drogą oraz plan kolejnych kroków. Para może otrzymać podsumowanie wspólne, a w razie potrzeby także osobne.",
      },
      {
        q: "Jak wygląda konsultacja?",
        a: "To rozmowa online z psychologiem: 60 minut przy konsultacji indywidualnej i 90 minut przy konsultacji dla pary. Psycholog zna wcześniej odpowiedzi z kwestionariusza, więc nie zaczynacie od opowiadania wszystkiego od początku – od razu rozmawiacie o tym, co dla Was najważniejsze.",
      },
      {
        q: "Czy psycholog zdecyduje za mnie, czy powinienem się rozwieść?",
        a: "Nie. Psycholog pokaże, co dzieje się między Wami, co Was wspiera i jakie widzi możliwe kierunki. Decyzja zawsze należy do Was – nie jesteśmy ani po stronie ratowania związku za wszelką cenę, ani po stronie rozstania.",
      },
      {
        q: "Jak długo trwa proces?",
        a: "Quiz zajmuje około 2 minut, kwestionariusz około 15–25 minut, a konsultacja 60 minut indywidualnie lub 90 minut dla pary. Termin konsultacji i przekazania podsumowania ustalamy wspólnie podczas rozmowy telefonicznej – tak, by pasował do Twojego kalendarza.",
      },
      {
        q: "Ile kosztuje pełna Mapa Relacji?",
        a: "Quiz na stronie jest bezpłatny. Mapa Relacji to płatna usługa, a jej cena zależy od wariantu – indywidualnie czy we dwoje. Konsultant przedstawi cenę i zakres w rozmowie, zanim podejmiesz jakąkolwiek decyzję. Rozmowa do niczego nie zobowiązuje.",
      },
      {
        q: "Czy moje odpowiedzi i informacje są poufne?",
        a: "Tak. Każda osoba wypełnia kwestionariusz na własnym linku z kodem dostępu. Odpowiedzi są szyfrowane, widzi je tylko psycholog prowadzący i nie przekazujemy ich drugiej osobie bez zgody. Odpowiedzi z quizu nie trafiają do narzędzi reklamowych ani analitycznych.",
      },
      {
        q: "Czy mogę zobaczyć przykładową Mapę Relacji?",
        a: "Tak – w sekcji „Co otrzymasz” na tej stronie możesz przejrzeć wszystkie sześć części przykładowej Mapy i otworzyć ją w całości. To prawdziwy szablon podsumowania wypełniony fikcyjnymi danymi.",
      },
      {
        q: "Co mogę zrobić po otrzymaniu podsumowania?",
        a: "Możesz do niego wracać w swoim tempie – razem albo osobno. Znajdziesz w nim propozycje na najbliższy czas i możliwe dalsze drogi, np. terapię par, konsultacje pomagające podjąć decyzję albo wsparcie w spokojnym rozstaniu. To propozycje, nie zobowiązanie: nie musisz kontynuować współpracy.",
      },
      {
        q: "Co, jeśli zdecydujemy się rozstać?",
        a: "Pomożemy wskazać najlepszą dla Was drogę rozstania lub rozwodu i przejść przez ten etap spokojniej: przygotować się do rozmowy, zadbać o dzieci, jeśli je macie, i nie eskalować konfliktu.",
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
    disclaimer: "Mapa Relacji nie jest formą pomocy kryzysowej ani interwencji i nie zastępuje leczenia psychiatrycznego.",
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
