// Trzy ścieżki po Mapie Relacji – jedno źródło treści dla podstron, kart na stronie głównej i menu.
// Szczegóły programów (liczba i długość spotkań, przegląd w połowie, ceny) wymagają potwierdzenia przez DUO –
// lista w docs/sciezki.md. Strona nie podaje cen ani gwarancji efektu.

export type PathKey = "rebuild" | "clarity" | "separate";

export interface PathContent {
  key: PathKey;
  slug: string;
  short: string;
  menuDesc: string;
  /** Temat zapytania w formularzu kontaktu (widoczny w panelu Wiadomości). */
  topic: string;
  seo: { title: string; description: string };
  eyebrow: string;
  h1: string;
  sub: string;
  cta: string;
  ctaNote: string;
  /** Wynik, do którego dążymy – językiem klienta, bez obietnic. */
  outcome: { title: string; items: string[] };
  /** Co sprawia, że to działa (wiarygodność procesu). */
  why: { title: string; text: string }[];
  /** Przebieg: tygodnie / etapy. */
  plan: { label: string; title: string; text: string; homework?: string }[];
  planTitle: string;
  planNote?: string;
  /** Co dostajesz (wartość). */
  stack: string[];
  forWho: string[];
  notFor: string[];
  faq: [string, string][];
  safety?: string;
}

export const PATHS: PathContent[] = [
  {
    key: "rebuild",
    slug: "odbudowa",
    short: "Odbudowa relacji",
    menuDesc: "6 tygodni pracy z terapeutą nad komunikacją, zaufaniem i bliskością.",
    topic: "Odbudowa relacji – 6 tygodni",
    seo: {
      title: "Odbudowa relacji – 6 tygodni pracy z terapeutą par | DUO",
      description: "Program DUO dla par, które chcą spróbować jeszcze raz: 6 tygodni pracy z terapeutą, plan tydzień po tygodniu, ćwiczenia między spotkaniami.",
    },
    eyebrow: "Droga 1 · Odbudowa relacji",
    h1: "6 tygodni, żeby przestać kłócić się w kółko i znów zacząć ze sobą rozmawiać",
    sub: "Konkretny program pracy z terapeutą par: plan tydzień po tygodniu, krótkie ćwiczenia między spotkaniami i jeden cel – żebyście wiedzieli, jak rozmawiać, naprawiać i być bliżej.",
    cta: "Porozmawiajmy o programie",
    ctaNote: "Bezpłatna rozmowa o tym, czy program jest dla Was. Zakres i cenę poznacie przed decyzją.",
    outcome: {
      title: "Do czego razem dążymy",
      items: [
        "Rozumiecie, jak działa Wasz konflikt – i umiecie go zatrzymać, zanim się rozpędzi.",
        "Potraficie powiedzieć, czego potrzebujecie, bez oskarżeń – i usłyszeć drugą stronę.",
        "Wiecie, jak naprawiać po kłótni, zamiast tygodniami chodzić obok siebie.",
        "Macie plan na codzienność: małe rytuały bliskości, które da się utrzymać.",
      ],
    },
    why: [
      { title: "Zaczynamy od Mapy Relacji", text: "Nie zgadujemy. Program opiera się na Waszej Mapie Relacji – wiemy, co Was wspiera i gdzie jest najtrudniej, zanim zaczniemy pracę." },
      { title: "Jeden temat na tydzień", text: "Zamiast „przegadywać wszystko”, co tydzień pracujemy nad jednym obszarem. Małe kroki łatwiej utrzymać." },
      { title: "Ćwiczenia, nie tylko rozmowy", text: "Między spotkaniami dostajecie krótkie zadania (ok. 15 minut dziennie). Zmiana dzieje się w domu, nie tylko w gabinecie." },
      { title: "Terapeuta par prowadzi proces", text: "Pracujecie z psychologiem, który zna Waszą sytuację od pierwszego dnia i dba o to, żeby rozmowa była bezpieczna dla obojga." },
    ],
    planTitle: "Program tydzień po tygodniu",
    plan: [
      { label: "Tydzień 1", title: "Start i wspólne cele", text: "Omawiamy Waszą Mapę Relacji, ustalamy, co chcecie zmienić, i wprowadzamy zasady bezpiecznej rozmowy.", homework: "Codzienne 10 minut rozmowy o dniu – bez trudnych tematów." },
      { label: "Tydzień 2", title: "Wasza pętla konfliktu", text: "Rozpoznajemy, jak powtarza się Wasza kłótnia: wyzwalacz, myśli, emocje, reakcje – i gdzie można ją przerwać.", homework: "Arkusz pętli po jednej sytuacji i umówione słowo-stop." },
      { label: "Tydzień 3", title: "Potrzeby zamiast pretensji", text: "Uczycie się mówić o sobie i swoich potrzebach oraz słuchać tak, żeby druga osoba poczuła się zrozumiana.", homework: "Ćwiczenie „Kiedy… czuję… bo potrzebuję…” raz dziennie." },
      { label: "Tydzień 4", title: "Zaufanie i naprawa", text: "Jak przepraszać, jak przyjmować przeprosiny, jak dotrzymywać małych obietnic – fundament odbudowy zaufania.", homework: "Jedna mała obietnica dziennie – i jej dotrzymanie." },
      { label: "Tydzień 5", title: "Bliskość w codzienności", text: "Czas tylko dla Was, czułość, docenianie. Szukamy rytuałów, które pasują do Waszego życia, a nie do poradnika.", homework: "Wspólny rytuał 2–3 razy w tygodniu i jedno docenienie dziennie." },
      { label: "Tydzień 6", title: "Plan na dalej", text: "Podsumowujemy, co działa, co jeszcze jest trudne, i układamy plan utrzymania zmian. Decydujecie, czy i jak chcecie pracować dalej.", homework: "Wasz plan na kolejne 3 miesiące." },
    ],
    planNote: "Po 3. tygodniu robimy wspólny przegląd: co już działa i czy kierunek pracy jest dla Was dobry.",
    stack: [
      "Mapa Relacji na start – szczegółowe kwestionariusze, konsultacja i pisemne podsumowanie",
      "6 cotygodniowych sesji z terapeutą par – online",
      "Plan pracy dopasowany do Waszej Mapy Relacji",
      "Ćwiczenia na każdy tydzień (ok. 15 minut dziennie) i karty do rozmów",
      "Przegląd w połowie programu",
      "Plan utrzymania zmian na kolejne miesiące",
    ],
    forWho: [
      "Oboje chcecie spróbować – nawet jeśli jedno z Was ma więcej wątpliwości.",
      "Kłócicie się o to samo i nie umiecie wyjść z tego schematu.",
      "Oddaliliście się od siebie i chcecie odzyskać bliskość.",
      "Wolicie konkretny plan na 6 tygodni niż terapię „bez końca”.",
    ],
    notFor: [
      "Gdy w relacji jest przemoc, zastraszanie lub kontrola – wtedy najpierw bezpieczeństwo.",
      "Gdy jedna osoba nie chce uczestniczyć – wtedy lepszym startem jest praca indywidualna.",
      "Gdy szukacie gwarancji, że związek przetrwa – takiej nikt uczciwie nie da.",
    ],
    faq: [
      ["Czy musimy zacząć od Mapy Relacji?", "Tak – to pierwszy krok programu. Dzięki niej terapeuta wie, od czego zacząć, a Wy nie tracicie pierwszych spotkań na opowiadanie wszystkiego od początku. Jeśli macie już Mapę Relacji, program zaczyna się od pierwszego tygodnia."],
      ["Czy po 6 tygodniach wszystko będzie dobrze?", "Nie obiecujemy tego. Sześć tygodni to czas, żeby nauczyć się nowych sposobów rozmawiania i naprawiania – i sprawdzić, jak działają u Was. Na koniec decydujecie, czy kontynuować pracę."],
      ["Ile czasu to zajmuje w tygodniu?", "Jedna sesja z terapeutą i krótkie ćwiczenia – około 15 minut dziennie. Program jest zaprojektowany tak, żeby dało się go połączyć z pracą i dziećmi."],
      ["Ile kosztuje program?", "Cenę i dokładny zakres poznacie w rozmowie, zanim podejmiecie decyzję. Rozmowa jest bezpłatna i do niczego nie zobowiązuje."],
    ],
    safety: "Program nie jest odpowiedni, gdy w relacji jest przemoc. W zagrożeniu dzwoń pod 112, wsparcie: Niebieska Linia 800 120 002.",
  },
  {
    key: "clarity",
    slug: "czas-na-decyzje",
    short: "Czas na zrozumienie i decyzję",
    menuDesc: "Wsparcie psychologa w spokojnym podjęciu decyzji, co dalej.",
    topic: "Czas na decyzję – wsparcie w decyzji",
    seo: {
      title: "Czas na decyzję – wsparcie psychologa, gdy nie wiesz, co dalej ze związkiem | DUO",
      description: "Konsultacje decyzyjne DUO: uporządkowanie emocji, potrzeb i możliwości, żeby świadomie zdecydować o przyszłości związku – bez presji i bez narzucania kierunku.",
    },
    eyebrow: "Droga 2 · Czas na zrozumienie i decyzję",
    h1: "Nie wiesz, czy zostać, czy odejść? Pomożemy Ci podjąć decyzję, której nie będziesz żałować",
    sub: "Spotkania z psychologiem, które porządkują to, co czujesz, czego potrzebujesz i jakie masz możliwości – żebyś zdecydował lub zdecydowała świadomie, a nie pod wpływem emocji.",
    cta: "Porozmawiajmy o wsparciu w decyzji",
    ctaNote: "Bezpłatna rozmowa o tym, jak może wyglądać wsparcie w Twojej sytuacji.",
    outcome: {
      title: "Do czego razem dążymy",
      items: [
        "Rozumiesz, co naprawdę czujesz – i co jest zmęczeniem, a co sygnałem.",
        "Wiesz, czego potrzebujesz, żeby było Ci dobrze – w tym związku albo poza nim.",
        "Widzisz realne możliwości i ich konsekwencje: dla siebie, partnera, dzieci.",
        "Podejmujesz decyzję w zgodzie ze sobą – i masz plan pierwszych kroków.",
      ],
    },
    why: [
      { title: "Bez presji i bez kibicowania", text: "Psycholog nie jest ani po stronie ratowania związku, ani po stronie rozstania. Jego zadaniem jest pomóc Ci zobaczyć całość." },
      { title: "Indywidualnie albo we dwoje", text: "Możesz pracować sam lub sama, jeśli partner nie jest gotowy. Jeśli oboje chcecie – spotkania mogą być wspólne." },
      { title: "Od chaosu do konkretu", text: "Porządkujemy emocje, potrzeby i możliwości krok po kroku – tak, żeby decyzja przestała być jednym wielkim „nie wiem”." },
    ],
    planTitle: "Jak przebiega wsparcie",
    plan: [
      { label: "Krok 1", title: "Zrozumienie sytuacji", text: "Zaczynamy od Mapy Relacji albo rozmowy wstępnej: co się wydarzyło, co jest dziś najtrudniejsze, co Was jeszcze łączy." },
      { label: "Krok 2", title: "Emocje i potrzeby", text: "Oddzielamy to, co jest zmęczeniem i złością, od tego, co jest ważnym sygnałem. Nazywamy potrzeby, które nie są zaspokajane." },
      { label: "Krok 3", title: "Możliwości i ich koszty", text: "Przyglądamy się każdej drodze: odbudowie, czasowi na próbę, rozstaniu – i temu, co każda oznacza dla Ciebie i bliskich." },
      { label: "Krok 4", title: "Decyzja i pierwsze kroki", text: "Pomagamy Ci podjąć decyzję – albo umówić się ze sobą na konkretny czas próby – i zaplanować, co zrobić najpierw." },
    ],
    planNote: "Liczbę spotkań ustalamy razem – zwykle wystarcza kilka. Nie zobowiązujesz się do długiej terapii.",
    stack: [
      "Mapa Relacji albo rozmowa wstępna – punkt wyjścia",
      "Spotkania z psychologiem – indywidualnie lub we dwoje, online",
      "Ćwiczenia porządkujące emocje i potrzeby między spotkaniami",
      "Plan pierwszych kroków po decyzji – niezależnie od kierunku",
    ],
    forWho: [
      "Od miesięcy zastanawiasz się, czy zostać, czy odejść – i nie możesz zdecydować.",
      "Jednego dnia chcesz walczyć, a drugiego odejść.",
      "Boisz się, że podejmiesz decyzję pod wpływem emocji i będziesz jej żałować.",
      "Partner nie chce rozmawiać, a Ty potrzebujesz uporządkować sytuację dla siebie.",
    ],
    notFor: [
      "Gdy oczekujesz, że psycholog zdecyduje za Ciebie – decyzja zawsze należy do Ciebie.",
      "Gdy przeżywasz ostry kryzys psychiczny – wtedy najpierw pomoc kryzysowa.",
      "Gdy potrzebujesz porady prawnej – wtedy warto skonsultować się z prawnikiem.",
    ],
    faq: [
      ["Czy psycholog powie mi, co zrobić?", "Nie. Pomoże Ci zobaczyć sytuację w całości, zrozumieć swoje emocje i potrzeby oraz konsekwencje możliwych wyborów. Decyzja zawsze należy do Ciebie."],
      ["Czy mogę przyjść sam / sama?", "Tak. Wiele osób zaczyna samodzielnie. Jeśli partner zechce dołączyć, możliwe są też wspólne spotkania."],
      ["Ile spotkań będzie potrzebnych?", "To zależy od sytuacji – zwykle kilka. Ustalamy to razem i nie zobowiązujesz się do długiej terapii."],
      ["Ile to kosztuje?", "Koszt zależy od liczby i formy spotkań. Poznasz go w rozmowie, zanim zdecydujesz."],
    ],
  },
  {
    key: "separate",
    slug: "swiadome-rozstanie",
    short: "Świadome rozstanie",
    menuDesc: "Najlepsza droga rozstania, wsparcie dla Ciebie, pary i dzieci.",
    topic: "Świadome rozstanie – wsparcie",
    seo: {
      title: "Świadome rozstanie – wsparcie psychologa dla Ciebie, pary i dzieci | DUO",
      description: "DUO pomaga wskazać najlepszą drogę rozstania lub rozwodu i przejść przez nią spokojniej: wsparcie indywidualne, rozmowy pary i wsparcie dzieci z psychologiem dziecięcym.",
    },
    eyebrow: "Droga 3 · Świadome rozstanie",
    h1: "Rozstanie bez wojny. Z szacunkiem dla siebie i spokojem dla dzieci",
    sub: "Pomagamy wskazać najlepszą dla Was drogę rozstania lub rozwodu i przejść przez nią spokojniej – z psychologiem dla Ciebie, dla Was jako pary rodzicielskiej i z psychologiem dziecięcym dla dzieci.",
    cta: "Porozmawiajmy o wsparciu w rozstaniu",
    ctaNote: "Bezpłatna, dyskretna rozmowa o tym, jakie wsparcie będzie dla Was najlepsze.",
    outcome: {
      title: "Do czego razem dążymy",
      items: [
        "Wiecie, jaka droga rozstania jest dla Was najlepsza – i dlaczego.",
        "Umiecie rozmawiać o sprawach praktycznych bez eskalacji konfliktu.",
        "Dzieci wiedzą, co się dzieje, czują się bezpiecznie i mają wsparcie.",
        "Masz miejsce na własne emocje i plan na nowy etap życia.",
      ],
    },
    why: [
      { title: "Najlepsza droga, nie jedna droga", text: "Porozumienie, mediacja czy postępowanie sądowe – pomagamy zobaczyć, co w Waszej sytuacji będzie najmniej raniące i najbardziej realne." },
      { title: "Wsparcie na trzech poziomach", text: "Dla Ciebie indywidualnie, dla Was jako rodziców i dla dzieci – z psychologiem dziecięcym. Każdy potrzebuje czegoś innego." },
      { title: "Dzieci na pierwszym miejscu", text: "Pomagamy przygotować rozmowę z dziećmi, ustalić plan opieki i zadbać o to, żeby nie musiały wybierać między rodzicami." },
    ],
    planTitle: "Jakie wsparcie możecie otrzymać",
    plan: [
      { label: "1", title: "Wskazanie najlepszej drogi rozstania", text: "Porządkujemy sytuację i możliwości: porozumienie, mediacja, rozstanie z pomocą prawną. Pokazujemy, co każda droga oznacza dla Was i dzieci." },
      { label: "2", title: "Wsparcie indywidualne", text: "Spotkania z psychologiem dla Ciebie: przeżycie straty, złość, lęk o przyszłość, odbudowa poczucia stabilności." },
      { label: "3", title: "Wsparcie pary jako rodziców", text: "Wspólne spotkania o sprawach, które dalej Was łączą: komunikacja, plan opieki nad dziećmi, zasady kontaktu – bez wracania do starych kłótni." },
      { label: "4", title: "Wsparcie dzieci z psychologiem dziecięcym", text: "Dostosowane do wieku spotkania dla dzieci i konsultacje dla rodziców: jak rozmawiać, na co zwracać uwagę, jak wspierać dziecko w zmianie." },
    ],
    planNote: "Formę i zakres wsparcia dobieramy do Waszej sytuacji – możecie skorzystać z jednego elementu albo ze wszystkich.",
    stack: [
      "Konsultacja porządkująca: najlepsza droga rozstania w Waszej sytuacji",
      "Spotkania indywidualne z psychologiem",
      "Spotkania dla pary jako rodziców – plan rodzicielski i komunikacja",
      "Wsparcie dzieci z psychologiem dziecięcym",
      "Informacja, kiedy warto sięgnąć po mediację i pomoc prawną",
    ],
    forWho: [
      "Decyzja o rozstaniu zapadła albo dojrzewa – i chcecie przejść przez to spokojnie.",
      "Macie dzieci i zależy Wam, żeby jak najmniej odczuły konflikt.",
      "Potrzebujesz wsparcia dla siebie w czasie rozstania.",
      "Nie wiecie, od czego zacząć: rozmowa, mediacja, prawnik?",
    ],
    notFor: [
      "Gdy w relacji jest przemoc lub zastraszanie – wtedy najpierw bezpieczeństwo i specjalistyczna pomoc; wspólne spotkania mogą nie być odpowiednie.",
      "Gdy potrzebujesz porady prawnej – psycholog nie zastępuje adwokata ani radcy prawnego.",
    ],
    faq: [
      ["Czy pomożecie nam się rozwieść?", "Pomagamy w psychologicznej stronie rozstania: wybór najlepszej drogi, rozmowy, wsparcie dla Was i dzieci. W sprawach prawnych warto skonsultować się z adwokatem lub radcą prawnym – podpowiemy, kiedy to zrobić."],
      ["Czy partner musi uczestniczyć?", "Nie. Możesz korzystać ze wsparcia indywidualnego. Wspólne spotkania mają sens, gdy oboje są na nie gotowi i są bezpieczne."],
      ["Jak wygląda wsparcie dla dzieci?", "Psycholog dziecięcy dobiera formę do wieku dziecka i sytuacji rodziny. Ważną częścią są też konsultacje dla rodziców – jak rozmawiać i jak wspierać dziecko."],
      ["Ile to kosztuje?", "Zakres wsparcia dobieramy do Waszej sytuacji, więc koszt poznacie w rozmowie, zanim podejmiecie decyzję."],
    ],
    safety: "Jeśli rozstanie wiąże się z przemocą lub groźbami, zaplanuj je z myślą o bezpieczeństwie: w zagrożeniu 112, Niebieska Linia 800 120 002.",
  },
];

export const pathByKey = (k: PathKey) => PATHS.find((p) => p.key === k)!;
export const pathHref = (k: PathKey) => `/${pathByKey(k).slug}`;
