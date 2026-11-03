// Treść wewnętrznego materiału: webinar dla psychologów + reklamy Meta (Nowy Etap). Tekst 1:1 z briefu.
export type Block =
  | { t: "h"; text: string }
  | { t: "lead"; text: string }
  | { t: "p"; text: string }
  | { t: "strong"; text: string }
  | { t: "list"; items: string[]; tone?: "dot" | "quote" }
  | { t: "quotes"; items: string[] }
  | { t: "quote"; text: string; big?: boolean }
  | { t: "flow"; items: string[]; dir?: "down" | "right" }
  | { t: "vs"; a: string; b: string }
  | { t: "cols"; cols: { title: string; items: string[] }[] }
  | { t: "steps"; items: string[] }
  | { t: "note"; text: string }
  | { t: "highlight"; text: string }
  | { t: "pills"; items: string[] }
  | { t: "cta"; label: string };

export interface Slide {
  n: number;
  tag?: string; // np. "Sytuacja 1"
  divider?: string; // nagłówek sekcji przed slajdem
  title?: boolean; // slajd tytułowy
  blocks: Block[];
}

export const DECK = {
  kicker: "Webinar dla psychologów i psychoterapeutów",
  title: "Twój pacjent mówi: „chyba chcę się rozwieść”",
  subtitle: "Co psycholog powinien wiedzieć, zanim klient zrobi pierwszy krok?",
  tagline: "7 sytuacji na styku psychologii i prawa, które mogą zmienić przebieg rozstania",
  format: "bezpłatny webinar dla psychologów i psychoterapeutów.",
  hosts: "Kamil Jura + prawnik / założyciel kancelarii współpracującej z Nowym Etapem.",
};

export const SLIDES: Slide[] = [
  {
    n: 1,
    title: true,
    blocks: [
      { t: "p", text: "Twój pacjent mówi:" },
      { t: "h", text: "„chyba chcę się rozwieść”" },
      { t: "lead", text: "Co psycholog powinien wiedzieć, zanim klient zrobi pierwszy krok?" },
      { t: "note", text: "7 sytuacji na styku psychologii i prawa, które mogą zmienić przebieg rozstania" },
    ],
  },
  {
    n: 2,
    blocks: [
      { t: "h", text: "To nie jest szkolenie z prawa" },
      { t: "lead", text: "Nie chcemy uczyć psychologów pisać pozwów." },
      { t: "p", text: "Chcemy pokazać sytuacje, w których klient podczas terapii zaczyna podejmować decyzje mające później konsekwencje:" },
      { t: "pills", items: ["emocjonalne", "prawne", "finansowe", "rodzinne"] },
      { t: "highlight", text: "Cel webinaru: wiedzieć, gdzie kończy się rola psychologa – i kiedy warto skierować klienta po dodatkowe wsparcie." },
    ],
  },
  {
    n: 3,
    blocks: [
      { t: "h", text: "Dlaczego ten temat pojawia się właśnie w gabinecie?" },
      { t: "p", text: "Klient bardzo często najpierw mówi o rozwodzie:" },
      { t: "list", items: ["psychologowi,", "terapeucie,", "bliskiej osobie,"] },
      { t: "p", text: "a dopiero później prawnikowi." },
      { t: "p", text: "Psycholog może więc być jedną z pierwszych osób, które słyszą:" },
      { t: "quotes", items: ["Chyba chcę odejść.", "Nie wiem, czy powinnam się rozwieść.", "Jutro składam pozew.", "On na pewno nie zgodzi się na nic."] },
    ],
  },
  {
    n: 4,
    blocks: [
      { t: "h", text: "Psycholog nie powinien stawać się prawnikiem." },
      { t: "h", text: "Prawnik nie powinien próbować prowadzić terapii." },
      { t: "highlight", text: "Najbezpieczniejszy model dla klienta pojawia się wtedy, gdy obie kompetencje potrafią się uzupełniać." },
    ],
  },
  {
    n: 5,
    divider: "7 sytuacji",
    tag: "Sytuacja 1",
    blocks: [
      { t: "h", text: "„Jutro składam pozew.”" },
      { t: "lead", text: "Klient podjął emocjonalną decyzję i chce natychmiast działać." },
      { t: "p", text: "Pytanie nie zawsze brzmi:" },
      { t: "quote", text: "Czy pozew jest poprawnie napisany?" },
      { t: "p", text: "Czasami ważniejsze jest:" },
      { t: "quote", text: "Czy to rzeczywiście powinien być następny krok?", big: true },
    ],
  },
  {
    n: 6,
    blocks: [
      { t: "h", text: "Pozew może być początkiem wymiany stanowisk" },
      { t: "p", text: "Jeżeli wcześniej nie zostały omówione kluczowe kwestie:" },
      { t: "flow", items: ["pozew", "odpowiedź drugiej strony", "różnice stanowisk", "kolejne pisma", "kolejne kwestie do rozstrzygnięcia"] },
      { t: "p", text: "Tam, gdzie sytuacja na to pozwala:" },
      { t: "highlight", text: "Najpierw plan i ustalenia. Później dokumenty." },
    ],
  },
  {
    n: 7,
    blocks: [
      { t: "h", text: "Co może zrobić psycholog?" },
      { t: "p", text: "Nie mówić klientowi:" },
      { t: "quote", text: "Nie składaj pozwu." },
      { t: "p", text: "Ale pomóc mu zatrzymać automatyczne działanie i zadać pytania:" },
      { t: "list", items: ["Co chcesz osiągnąć?", "Co jest już ustalone?", "Co jest jedynie Twoim założeniem?", "Czy decyzja wynika z planu, czy z aktualnych emocji?"] },
    ],
  },
  {
    n: 8,
    tag: "Sytuacja 2",
    blocks: [
      { t: "h", text: "„Mąż / żona na pewno nie będzie chciał/a rozmawiać.”" },
      { t: "p", text: "Bardzo często pojawia się różnica między:" },
      { t: "vs", a: "„druga strona odmówiła”", b: "„zakładam, że odmówi”" },
      { t: "highlight", text: "To nie jest to samo." },
    ],
  },
  {
    n: 9,
    blocks: [
      { t: "h", text: "Założenie może stać się strategią" },
      { t: "p", text: "Klient:" },
      { t: "flow", items: ["„Nie ma sensu z nim rozmawiać.”", "nie podejmuje próby ustaleń", "formalizuje własne stanowisko", "druga strona odpowiada własnym stanowiskiem", "konflikt się pogłębia."] },
      { t: "note", text: "Nie dotyczy to sytuacji przemocy, zagrożenia bezpieczeństwa lub innych przypadków wymagających pilnego działania." },
    ],
  },
  {
    n: 10,
    tag: "Sytuacja 3",
    blocks: [
      { t: "h", text: "„Powiedzieliśmy już dzieciom.”" },
      { t: "p", text: "Ale rodzice wcześniej nie uzgodnili:" },
      { t: "list", items: ["co dokładnie powiedzą,", "gdzie dzieci będą mieszkały,", "co wydarzy się w najbliższych tygodniach,", "jak odpowiadać na pytania,", "czego nie komunikować dziecku."] },
    ],
  },
  {
    n: 11,
    blocks: [
      { t: "h", text: "Dziecko nie powinno dostać dwóch wersji rozwodu." },
      { t: "p", text: "Nie chodzi o stworzenie jednej „idealnej formułki”." },
      { t: "p", text: "Chodzi o ograniczenie sytuacji:" },
      { t: "vs", a: "mama mówi jedno", b: "tata mówi coś innego" },
      { t: "p", text: "i dziecko próbuje zrozumieć:" },
      { t: "quote", text: "Kto mówi prawdę?", big: true },
      { t: "highlight", text: "Tu współpraca psychologiczna i prawno-mediacyjna może mieć szczególną wartość." },
    ],
  },
  {
    n: 12,
    tag: "Sytuacja 4",
    blocks: [
      { t: "h", text: "Klient zaczyna podejmować duże decyzje pod wpływem emocji" },
      { t: "p", text: "Na przykład:" },
      { t: "pills", items: ["wyprowadzka", "mieszkanie", "pieniądze", "wspólne rachunki", "kontakty z dziećmi", "dokumentowanie zachowania partnera"] },
      { t: "p", text: "Psycholog nie musi znać prawnych konsekwencji każdej z tych decyzji." },
      { t: "p", text: "Powinien natomiast rozpoznać moment:" },
      { t: "quote", text: "Tu warto, żebyś przed działaniem sprawdził również perspektywę prawną.", big: true },
    ],
  },
  {
    n: 13,
    tag: "Sytuacja 5",
    blocks: [
      { t: "h", text: "„Muszę zebrać na niego / nią dowody.”" },
      { t: "lead", text: "Klient zaczyna myśleć o relacji jak o postępowaniu dowodowym." },
      { t: "p", text: "Może pojawić się:" },
      { t: "pills", items: ["nagrywanie", "screeny", "świadkowie", "sprawdzanie telefonu", "detektyw", "prowokowanie rozmów"] },
    ],
  },
  {
    n: 14,
    blocks: [
      { t: "h", text: "Pytanie, które warto sobie zadać" },
      { t: "quote", text: "Czy klient zbiera informacje potrzebne do ochrony swoich interesów…" },
      { t: "quote", text: "…czy właśnie zaczyna eskalować konflikt?", big: true },
      { t: "p", text: "Psycholog nie ocenia przydatności dowodu prawnego. Może jednak widzieć wpływ takiego zachowania na:" },
      { t: "pills", items: ["emocje", "relację", "dzieci", "zdolność do późniejszego porozumienia"] },
    ],
  },
  {
    n: 15,
    tag: "Sytuacja 6",
    blocks: [
      { t: "h", text: "Jedna osoba chce ratować małżeństwo. Druga już przygotowuje rozwód." },
      { t: "vs", a: "Jedna strona: „Pracujemy nad związkiem.”", b: "Druga: „Ja już podjąłem decyzję.”" },
      { t: "highlight", text: "To jedna z najtrudniejszych sytuacji zarówno emocjonalnie, jak i procesowo." },
    ],
  },
  {
    n: 16,
    blocks: [
      { t: "h", text: "Ambiwalencja jest informacją" },
      { t: "p", text: "Klient może jednocześnie:" },
      { t: "list", items: ["kochać partnera,", "nie chcieć dalej tak żyć,", "bać się rozwodu,", "szukać prawnika,", "nadal mieć nadzieję."] },
      { t: "strong", text: "Nie każda osoba pytająca o rozwód jest gotowa go rozpocząć." },
      { t: "highlight", text: "Czasami pierwszym krokiem powinno być uporządkowanie sytuacji, nie formalizacja decyzji." },
    ],
  },
  {
    n: 17,
    tag: "Sytuacja 7",
    blocks: [
      { t: "h", text: "Klient zaczyna zadawać psychologowi pytania prawne" },
      { t: "quotes", items: ["Czy powinnam się wyprowadzić?", "Czy on może zabrać dzieci?", "Czy lepiej składać pozew z winą?", "Co się stanie z mieszkaniem?", "Czy muszę się zgodzić na kontakty?"] },
      { t: "highlight", text: "I tutaj pojawia się naturalna granica kompetencji." },
    ],
  },
  {
    n: 18,
    blocks: [
      { t: "h", text: "Dobra odpowiedź nie zawsze oznacza odpowiedź." },
      { t: "p", text: "Czasem profesjonalna odpowiedź brzmi:" },
      { t: "quote", text: "To pytanie wykracza poza mój obszar. Chcę, żebyś dostał odpowiedź od osoby, która zajmuje się tym zawodowo.", big: true },
      { t: "p", text: "To nie obniża wartości psychologa." },
      { t: "strong", text: "Zwiększa bezpieczeństwo klienta." },
    ],
  },
  {
    n: 19,
    divider: "Model współpracy",
    blocks: [
      { t: "h", text: "Psycholog + mediator + prawnik" },
      { t: "lead", text: "Każdy odpowiada za inny fragment problemu." },
      {
        t: "cols",
        cols: [
          { title: "Psycholog", items: ["emocje", "decyzja", "kryzys", "relacja"] },
          { title: "Mediator", items: ["dialog", "ustalenia", "punkty wspólne"] },
          { title: "Prawnik", items: ["konsekwencje prawne", "dokumenty", "postępowanie"] },
        ],
      },
      { t: "highlight", text: "Klient nie powinien być zmuszony do wybierania tylko jednej z tych perspektyw." },
    ],
  },
  {
    n: 20,
    blocks: [
      { t: "h", text: "Jak pracujemy w Nowym Etapie?" },
      { t: "lead", text: "Rozwód zaczyna się od planu, nie od pozwu." },
      { t: "p", text: "Tam, gdzie sytuacja na to pozwala:" },
      { t: "flow", dir: "right", items: ["zrozumienie sytuacji", "plan", "ustalenia", "dokumenty", "sąd"] },
      { t: "p", text: "Nie chodzi o unikanie prawa." },
      { t: "strong", text: "Chodzi o używanie go w odpowiednim momencie." },
    ],
  },
  {
    n: 21,
    blocks: [
      { t: "h", text: "Czego nie chcemy robić?" },
      { t: "p", text: "Nie chcemy, żeby psycholog kierował do nas klienta, a my automatycznie:" },
      { t: "list", items: ["pisaliśmy agresywny pozew,", "eskalowali konflikt,", "zamieniali partnerów w przeciwników procesowych."] },
      { t: "p", text: "W sytuacjach, w których istnieje przestrzeń do porozumienia:" },
      { t: "highlight", text: "najpierw chcemy ją sprawdzić." },
    ],
  },
  {
    n: 22,
    blocks: [
      { t: "h", text: "Kiedy szybkie działanie może być konieczne?" },
      { t: "lead", text: "Nie każda sprawa nadaje się do spokojnego procesu ustaleń." },
      { t: "p", text: "Szczególnej ostrożności wymagają m.in.:" },
      { t: "list", items: ["przemoc,", "zagrożenie bezpieczeństwa,", "ryzyko dla dzieci,", "pilne kwestie finansowe lub majątkowe,", "sytuacje wymagające zabezpieczenia prawnego."] },
      { t: "highlight", text: "Nie istnieje jedna kolejność właściwa dla każdej rodziny." },
    ],
  },
  {
    n: 23,
    blocks: [
      { t: "h", text: "Co psycholog może zrobić już jutro?" },
      { t: "p", text: "Kiedy pacjent zaczyna mówić o rozwodzie:" },
      {
        t: "steps",
        items: [
          "Nie przejmuj roli prawnika.",
          "Pomóż oddzielić emocję od działania.",
          "Sprawdź, co jest faktem, a co założeniem dotyczącym partnera.",
          "Zwróć uwagę na wpływ decyzji na dzieci.",
          "Jeżeli pojawiają się kwestie prawne – skieruj klienta po właściwą kompetencję.",
        ],
      },
    ],
  },
  {
    n: 24,
    blocks: [
      { t: "h", text: "Nie szukamy winnego." },
      { t: "quote", big: true, text: "Naszym celem nie jest ustalenie, kto jest lepszym małżonkiem. Chcemy pomóc klientowi przejść przez zmianę w sposób możliwie uporządkowany, przy zachowaniu ochrony jego interesów." },
    ],
  },
  {
    n: 25,
    divider: "Przejście do partnerstwa",
    blocks: [
      { t: "h", text: "Dlaczego rozmawiamy dzisiaj z psychologami?" },
      { t: "lead", text: "Bo bardzo często pracujemy z tymi samymi ludźmi – tylko w innych momentach ich problemu." },
      {
        t: "cols",
        cols: [
          { title: "Psycholog", items: ["może potrzebować zaufanej osoby do kwestii prawnych."] },
          { title: "Nowy Etap", items: ["może potrzebować zaufanego psychologa dla klienta przechodzącego kryzys."] },
        ],
      },
    ],
  },
  {
    n: 26,
    blocks: [
      { t: "h", text: "Chcemy budować sieć specjalistów" },
      { t: "p", text: "Nie chodzi nam o przypadkową wymianę kontaktów." },
      { t: "p", text: "Szukamy psychologów i psychoterapeutów, którzy podobnie patrzą na:" },
      { t: "list", items: ["ograniczanie niepotrzebnej eskalacji,", "dobro dzieci,", "odpowiedzialną komunikację,", "granice własnych kompetencji,", "współpracę interdyscyplinarną."] },
    ],
  },
  {
    n: 27,
    blocks: [
      { t: "h", text: "Jak może wyglądać współpraca?" },
      { t: "lead", text: "Ty pozostajesz psychologiem swojego klienta." },
      {
        t: "cols",
        cols: [
          { title: "Jeżeli pojawia się obszar prawny lub mediacyjny", items: ["→ klient może porozmawiać z Nowym Etapem."] },
          { title: "Jeżeli po naszej stronie klient potrzebuje pracy psychologicznej", items: ["→ możemy kierować go do odpowiedniego specjalisty."] },
        ],
      },
      { t: "highlight", text: "Nie zabieramy Ci klienta. Uzupełniamy kompetencje tam, gdzie są potrzebne." },
    ],
  },
  {
    n: 28,
    tag: "CTA",
    blocks: [
      { t: "h", text: "Pracujesz z osobami w kryzysie małżeńskim?" },
      { t: "p", text: "Jeżeli chcesz sprawdzić, czy mamy podobny sposób pracy z klientami:" },
      { t: "lead", text: "Umów krótką rozmowę z Kamilem." },
      { t: "cta", label: "Chcę porozmawiać o współpracy" },
      { t: "note", text: "Nie zobowiązuje to do wejścia we współpracę. Najpierw sprawdźmy, czy rzeczywiście mamy podobny sposób pracy z klientem." },
    ],
  },
];

export interface Ad {
  n: number;
  name: string;
  creative?: { kicker?: string; big: string; small?: string; badge?: string };
  headline?: string;
  primary: string[];
  cta: string;
}

export const ADS: Ad[] = [
  {
    n: 1,
    name: "Główna",
    creative: { kicker: "Twój pacjent mówi:", big: "„chyba chcę się rozwieść”", small: "Co możesz mu powiedzieć – a kiedy warto skierować go do innego specjalisty?", badge: "Bezpłatny webinar dla psychologów" },
    primary: [
      "Psycholog często jest jedną z pierwszych osób, którym klient mówi:",
      "„Chyba chcę się rozwieść.”",
      "Chwilę później pojawiają się pytania:",
      "– Czy powinienem już składać pozew?\n– Co powiedzieć dzieciom?\n– Czy mam się wyprowadzić?\n– Co jeśli druga strona nie chce rozmawiać?\n– Czy powinienem zbierać dowody?",
      "Nie są to już wyłącznie pytania psychologiczne.",
      "Dlatego przygotowaliśmy bezpłatny webinar:",
      "„Twój pacjent mówi: ‘chyba chcę się rozwieść’. Co psycholog powinien wiedzieć, zanim klient zrobi pierwszy krok?”",
      "Pokażemy 7 sytuacji na styku psychologii i prawa, które regularnie pojawiają się w pracy z osobami przed rozwodem.",
      "Nie będziemy uczyć Cię pisać pozwów.",
      "Pokażemy, gdzie kończy się rola psychologa, gdzie zaczyna obszar prawny i jak obie kompetencje mogą się uzupełniać z korzyścią dla klienta.",
      "Bezpłatnie.",
    ],
    cta: "Zapisz się na webinar",
  },
  {
    n: 2,
    name: "Granice kompetencji",
    headline: "Gdzie kończy się rola psychologa, kiedy pacjent zaczyna mówić o rozwodzie?",
    primary: [
      "„Czy mam się wyprowadzić?”\n„Czy może zabrać mi dzieci?”\n„Składać pozew z winą czy bez?”\n„Czy powinnam zgodzić się na mediację?”",
      "Jeżeli pracujesz z osobami w kryzysie małżeńskim, prawdopodobnie słyszysz również pytania, które wykraczają poza samą psychologię.",
      "Na bezpłatnym webinarze pokażemy 7 najczęstszych sytuacji na styku psychologii i prawa oraz podpowiemy, kiedy klient może potrzebować dodatkowej kompetencji.",
      "Dla psychologów i psychoterapeutów.",
    ],
    cta: "Bezpłatny webinar",
  },
  {
    n: 3,
    name: "Pierwszy krok",
    headline: "Pozew nie zawsze powinien być pierwszym krokiem klienta.",
    primary: [
      "Pacjent przychodzi do gabinetu po kolejnej kłótni i mówi:",
      "„Mam dość. Jutro składam pozew.”",
      "Co dzieje się później?",
      "Czasami formalne działanie porządkuje sytuację.",
      "A czasami rozpoczyna wymianę stanowisk, na którą emocjonalnie nie była przygotowana żadna ze stron.",
      "Podczas bezpłatnego webinaru porozmawiamy o tym, co psycholog powinien wiedzieć o okresie poprzedzającym rozwód – bez wchodzenia w rolę prawnika.",
    ],
    cta: "Zapisz się",
  },
  {
    n: 4,
    name: "Dzieci",
    headline: "Pacjent chce powiedzieć dzieciom o rozwodzie. Co warto wiedzieć wcześniej?",
    primary: [
      "Rozmowa z dzieckiem o rozstaniu rodziców nie odbywa się w próżni.",
      "Za chwilę pojawiają się również pytania o:",
      "• miejsce zamieszkania,\n• kontakty,\n• codzienność,\n• komunikację pomiędzy rodzicami,\n• kolejne kroki formalne.",
      "Na webinarze pokażemy psychologom 7 momentów przed rozwodem, w których obszar emocjonalny zaczyna stykać się z prawnym.",
      "Bezpłatny webinar dla psychologów i psychoterapeutów.",
    ],
    cta: "Zapisz się bezpłatnie",
  },
  {
    n: 5,
    name: "Nie uczymy prawa",
    creative: { big: "Nie uczymy psychologów pisać pozwów.", small: "Pokazujemy, co warto wiedzieć, kiedy pacjent zaczyna mówić o rozwodzie." },
    primary: [
      "Nie musisz znać procedury rozwodowej.",
      "Ale jeśli pracujesz z osobami w kryzysie, warto wiedzieć:",
      "które decyzje klienta mogą mieć skutki wykraczające poza gabinet.",
      "Dlatego podczas bezpłatnego webinaru pokażemy 7 praktycznych sytuacji na styku:",
      "psychologii × mediacji × prawa.",
      "Bez wykładu z kodeksów.",
      "Na konkretnych sytuacjach z życia klientów.",
    ],
    cta: "Dołącz do webinaru",
  },
  {
    n: 6,
    name: "Curiosity",
    headline: "5 zdań pacjenta, po których psycholog powinien zapalić lampkę ostrzegawczą",
    primary: [
      "„Jutro wysyłam pozew.”\n„On na pewno nie będzie chciał rozmawiać.”\n„Muszę zebrać na nią dowody.”\n„Powiedzieliśmy już dzieciom.”\n„Czy mogę się po prostu wyprowadzić?”",
      "Każde z tych zdań może pojawić się podczas zwykłej sesji.",
      "A każde może otwierać temat, który ma jednocześnie wymiar emocjonalny i prawny.",
      "Porozmawiamy o nich podczas bezpłatnego webinaru dla psychologów i psychoterapeutów.",
    ],
    cta: "Zapisz się",
  },
];

export const HOOKS = [
  "Pacjent mówi: „chyba chcę się rozwieść”. Co robisz dalej?",
  "Co psycholog powinien wiedzieć o rozwodzie – nie będąc prawnikiem?",
  "Gdzie kończy się psychologia, a zaczyna prawo?",
  "7 momentów przed rozwodem, w których klient potrzebuje więcej niż jednej kompetencji.",
  "Czy psycholog powinien rozmawiać z klientem o pozwie?",
  "Pacjent pyta: „czy mam się wyprowadzić?”. Jak odpowiedzieć, nie wchodząc w rolę prawnika?",
  "Twój pacjent chce się rozwieść. Czy wie, co powinien zrobić najpierw?",
  "Psycholog, mediator i prawnik – gdzie kończy się rola każdego z nich?",
];

export const FUNNEL = [
  "Reklama",
  "Zapis na webinar",
  "Webinar daje realną wiedzę",
  "Psycholog poznaje sposób pracy Nowego Etapu",
  "CTA do krótkiej rozmowy z Kamilem",
  "Rozmowa 1:1",
  "Ocena zgodności sposobu pracy",
  "Aktywacja partnerstwa",
  "Pierwszy referral",
];
