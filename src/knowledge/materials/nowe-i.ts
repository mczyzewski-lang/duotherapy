// Materiały: paczka I (nowe lead magnety). Treść do akceptacji merytorycznej psycholożki przed publikacją.
import { check, h2, info, lead, p, safety, SAFETY_JOINT, tip, ul } from "../b";
import type { LeadMagnet } from "../types";

export const czerwoneFlagiTerapiaPar: LeadMagnet = {
  id: "lm27",
  n: 27,
  slug: "czerwone-flagi-terapia-par",
  category: "decyzje",
  icon: "flag",
  title: "5 czerwonych flag: kiedy terapia par nie jest pierwszym krokiem",
  short: "5 czerwonych flag",
  menuDesc: "Uczciwa checklista: kiedy wspólna terapia może poczekać, a co pomoże bardziej – z numerami pomocowymi.",
  format: "Checklista i plan wsparcia · online",
  minutes: "15–25 min",
  hero: {
    h1: "5 czerwonych flag: kiedy terapia par nie jest pierwszym krokiem",
    sub: "Przemoc, strach, kontrola, aktywne uzależnienie, decyzja o odejściu albo ukrywany romans. Spokojnie, bez straszenia i bez diagnoz: jak to może wyglądać, dlaczego wtedy warto zacząć inaczej i gdzie szukać pomocy.",
  },
  seo: {
    title: "5 czerwonych flag: kiedy terapia par nie jest pierwszym krokiem | DUO",
    description: "Bezpłatna checklista DUO: 5 sytuacji, w których wspólna terapia par nie jest pierwszym krokiem, co pomoże zamiast niej i gdzie szukać wsparcia – bez diagnoz.",
  },
  gets: [
    "5 czerwonych flag opisanych prostym językiem: jak mogą wyglądać na co dzień",
    "Dla każdej flagi: dlaczego wspólna terapia nie jest wtedy pierwszym krokiem i co pomoże zamiast niej",
    "Checklisty bez punktacji i bez etykiet – z refleksją „co mogę zrobić z tym, co zaznaczam”",
    "Numery pomocowe w jednym miejscu i krótki plan wsparcia dla siebie",
    "Co dalej, jeśli żadna flaga Was nie dotyczy",
  ],
  forWho: [
    "Dla Ciebie, jeśli myślisz o terapii par i chcesz sprawdzić, czy to dobry pierwszy krok.",
    "Jeśli coś w relacji budzi Twój niepokój, ale trudno Ci to nazwać.",
    "Dla par, które chcą zacząć pracę nad związkiem uczciwie i bezpiecznie dla obu stron.",
    "Jeśli czytasz to sam / sama i nie chcesz, żeby druga osoba o tym wiedziała.",
  ],
  preview: [33, 39],
  previewNote: "Pełny materiał: 5 czerwonych flag z checklistami, wyjaśnienie, co pomoże zamiast wspólnej terapii, numery pomocowe, plan wsparcia dla siebie i część „jeśli żadna flaga Was nie dotyczy”.",
  mapaText: "Jeśli żadna z flag Was nie dotyczy, a chcecie spokojnie zrozumieć, co się dzieje w relacji, Mapa Relacji to proces z psychologiem zakończony pisemnym podsumowaniem – możesz zacząć razem albo sam / sama.",
  cover: { kicker: "Checklista bezpieczeństwa", subtitle: "Kiedy wspólna terapia może poczekać, co pomoże bardziej i gdzie szukać wsparcia – spokojnie, bez diagnoz" },
  purpose: "Pomaga sprawdzić, czy terapia par jest dobrym pierwszym krokiem, czy w Waszej sytuacji najpierw potrzebne jest inne wsparcie – bezpieczne dla Ciebie.",
  howTo: "Przeczytaj opis każdej flagi i zaznacz tylko to, co rozpoznajesz z własnego życia. Nie ma tu wyniku. Na końcu zatrzymaj się przy refleksji i planie wsparcia. Jeśli druga osoba sprawdza Twój telefon lub komputer, korzystaj z trybu prywatnego przeglądarki.",
  blocks: [
    h2("Zanim zaczniesz", true),
    lead("Terapia par pomaga w wielu trudnych sytuacjach: przy kłótniach, oddaleniu, kryzysie zaufania, trudnych decyzjach. Ale są sytuacje, w których wspólne spotkania nie są najlepszym pierwszym krokiem – nie dlatego, że „nic się nie da zrobić”, tylko dlatego, że najpierw potrzebne jest coś innego: bezpieczeństwo, leczenie albo uczciwość."),
    p("Ten materiał opisuje pięć takich sytuacji. Nie po to, żeby kogoś oceniać, ale żeby pomóc Ci wybrać pomoc, która rzeczywiście zadziała. Czytaj spokojnie, we własnym tempie. Możesz w każdej chwili przerwać."),
    info("To nie jest test ani diagnoza", "Checklisty nie mają punktacji ani wyniku. Nikt nie postawi tu diagnozy Tobie ani drugiej osobie. Zaznaczenie jakiegoś punktu nie przesądza o Waszym związku – pokazuje tylko, od czego warto zacząć, żeby pomoc była bezpieczna i skuteczna."),
    safety("Jeśli teraz czujesz się zagrożony / zagrożona, nie czytaj dalej – dzwoń pod 112. Gdy potrzebujesz porozmawiać, możesz zadzwonić do Niebieskiej Linii (800 120 002) albo do Centrum Wsparcia (800 70 2222). Jeśli druga osoba sprawdza Twój telefon lub komputer, korzystaj z trybu prywatnego przeglądarki."),

    h2("Flaga 1. Przemoc – fizyczna, psychiczna, ekonomiczna"),
    p("Przemoc nie zawsze oznacza bicie. Może przybierać różne formy, a osoba, która jej doświadcza, często długo tłumaczy sobie, że „to tylko kłótnie” albo że „sama / sam prowokuje”. Odpowiedzialność za przemoc ponosi zawsze osoba, która jej używa."),
    ul(
      "fizyczna: popychanie, szarpanie, przytrzymywanie, rzucanie przedmiotami, uderzenie – także „tylko raz”",
      "psychiczna: wyzwiska, poniżanie, ośmieszanie przy innych, groźby, straszenie odejściem z dziećmi, niszczenie Twoich rzeczy",
      "ekonomiczna: odbieranie pieniędzy, zakaz pracy, wydzielanie środków na podstawowe potrzeby, zadłużanie na Twoje nazwisko",
      "seksualna: wymuszanie bliskości, której nie chcesz, presja, szantaż emocjonalny w sprawach seksu",
    ),
    info("Dlaczego wspólna terapia nie jest wtedy pierwszym krokiem", "Terapia par zakłada, że obie osoby mogą mówić swobodnie i bezpiecznie. Gdy jest przemoc, to, co powiesz w gabinecie, może mieć dla Ciebie konsekwencje po powrocie do domu. Do tego wspólna terapia łatwo sugeruje, że „oboje macie problem z komunikacją” – a przemoc nie jest problemem komunikacji, tylko zachowaniem, za które odpowiada jedna osoba."),
    tip("Co zamiast", "Najpierw Twoje bezpieczeństwo: rozmowa z Niebieską Linią (800 120 002), konsultacja w ośrodku interwencji kryzysowej, pomoc psychologa indywidualnie. W zagrożeniu – 112. Osoba, która stosuje przemoc, może szukać pomocy w programach dla osób stosujących przemoc. O ewentualnej pracy we dwoje warto decydować dopiero wtedy, gdy przemoc się zakończy, i najlepiej razem ze specjalistą."),
    check(
      "Flaga 1 – co rozpoznaję",
      "zdarzyło się, że druga osoba mnie popchnęła, szarpnęła albo uderzyła",
      "słyszę wyzwiska albo poniżające uwagi – także „żartem”",
      "druga osoba grozi mi, sobie albo dzieciom",
      "nie mam dostępu do pieniędzy albo muszę prosić o środki na podstawowe rzeczy",
      "zgadzam się na bliskość, bo boję się, co będzie, jeśli odmówię",
    ),

    h2("Flaga 2. Strach przed partnerem i kontrola"),
    p("Czasem nie ma jednego wyraźnego zdarzenia, a mimo to w domu panuje napięcie, w którym ciągle uważasz na słowa. Kontrola bywa przedstawiana jako troska („martwię się o ciebie”), ale jej efektem jest coraz mniejsza przestrzeń na Twoje własne życie."),
    check(
      "Flaga 2 – co rozpoznaję",
      "zanim coś powiem, sprawdzam, w jakim nastroju jest druga osoba – i często rezygnuję",
      "boję się reakcji drugiej osoby, gdy się z nią nie zgadzam",
      "druga osoba sprawdza mój telefon, wiadomości albo lokalizację i oczekuje haseł",
      "muszę tłumaczyć się z każdego wydatku, a o pieniądzach decyduje tylko ona / on",
      "coraz rzadziej widuję się z rodziną i znajomymi, bo „robi się o to awantura”",
    ),
    info("Dlaczego wspólna terapia nie jest wtedy pierwszym krokiem", "Jeśli boisz się drugiej osoby, trudno w jej obecności mówić prawdę o tym, co czujesz i czego potrzebujesz. Terapeuta może wtedy usłyszeć wersję „bezpieczną”, a nie prawdziwą. Strach i kontrola to sygnał, że najpierw warto zadbać o Ciebie – osobno."),
    tip("Co zamiast", "Rozmowa z psychologiem indywidualnie albo z konsultantem Niebieskiej Linii (800 120 002) – możesz zapytać po prostu: „Czy to, co się u nas dzieje, jest w porządku?”. Warto też odbudować choćby jeden kontakt poza związkiem: osobę, której możesz powiedzieć prawdę. W kryzysie emocjonalnym możesz zadzwonić do Centrum Wsparcia (800 70 2222)."),

    h2("Flaga 3. Aktywne uzależnienie"),
    p("Chodzi o sytuację, w której uzależnienie – od alkoholu, narkotyków, leków, hazardu albo innych zachowań – trwa teraz i wpływa na codzienność: na pieniądze, rozmowy, bezpieczeństwo, opiekę nad dziećmi. Nie chodzi o ocenianie kogoś ani o stawianie diagnozy na podstawie tej listy – to może zrobić tylko specjalista."),
    check(
      "Flaga 3 – co rozpoznaję",
      "najtrudniejsze sytuacje między nami dzieją się, gdy druga osoba (albo ja) pije, bierze albo gra",
      "obietnice „to już ostatni raz” powtarzają się, a nic się nie zmienia",
      "ukrywam przed innymi, co się dzieje, albo tłumaczę drugą osobę przed rodziną i pracą",
      "pieniądze znikają albo pojawiają się długi, o których nie wiedziałem / wiedziałam",
      "boję się zostawić dzieci pod opieką drugiej osoby, gdy jest pod wpływem",
    ),
    info("Dlaczego wspólna terapia nie jest wtedy pierwszym krokiem", "Dopóki uzależnienie jest aktywne, rozmowy w gabinecie łatwo przykrywa to, co dzieje się poza nim. Ustalenia z sesji nie mają szans się utrzymać, gdy głównym „partnerem” w związku staje się substancja albo zachowanie. Najpierw potrzebne jest leczenie uzależnienia – praca nad relacją może być jego ważną częścią, ale później."),
    tip("Co zamiast", "Dla osoby uzależnionej: poradnia leczenia uzależnień lub terapeuta uzależnień. Dla Ciebie: wsparcie dla bliskich osób uzależnionych – grupy wsparcia (na przykład Al-Anon), konsultacja w poradni, pomoc psychologa. Zadbanie o siebie nie jest zdradą drugiej osoby. Jeśli pod wpływem dochodzi do przemocy – wróć do flagi 1."),

    h2("Flaga 4. Jedna osoba już odchodzi, druga chce ją terapią zatrzymać"),
    p("Zdarza się, że jedna osoba w środku już podjęła decyzję o odejściu, a druga proponuje terapię jako ostatnią próbę. Czasem ta pierwsza zgadza się z poczucia winy, „żeby nie było, że nie próbowała”. To bardzo bolesna sytuacja dla obojga – i nie ma w niej winnego."),
    check(
      "Flaga 4 – co rozpoznaję",
      "jedno z nas powiedziało wprost, że chce się rozstać, i nie zmienia zdania",
      "namawiam na terapię głównie po to, żeby druga osoba została",
      "zgadzam się na terapię, ale w środku już się pożegnałem / pożegnałam",
      "mamy zupełnie inne oczekiwania: jedno chce ratować, drugie – „dobrze to zakończyć”",
    ),
    info("Dlaczego wspólna terapia nie jest wtedy pierwszym krokiem", "Klasyczna terapia par zakłada, że oboje chcecie nad związkiem pracować. Gdy jedna osoba przychodzi tylko po to, żeby „odhaczyć próbę”, a druga po to, żeby ją zatrzymać, każde spotkanie staje się negocjacją o decyzji, a nie pracą nad relacją. Łatwo wtedy o rozczarowanie i poczucie, że „terapia nie działa”."),
    tip("Co zamiast", "Najpierw uczciwa rozmowa o tym, po co miałoby być spotkanie: „Czy chcesz spróbować, czy chcesz zrozumieć, jak się rozstać?”. Pomocna bywa konsultacja, której celem jest uporządkowanie decyzji, a nie ratowanie związku za wszelką cenę, oraz wsparcie indywidualne dla każdej ze stron. Jeśli rozstanie jest przesądzone, praca z psychologiem może pomóc przejść je z szacunkiem – zwłaszcza gdy są dzieci."),

    h2("Flaga 5. Trwający romans ukrywany przed terapeutą"),
    p("Mowa o sytuacji, w której jedna osoba jest w trwającej relacji z kimś innym, nie zamierza jej kończyć i chce, żeby pozostała tajemnicą także w gabinecie. To co innego niż praca po zdradzie, która została ujawniona i zakończona – taka praca jak najbardziej bywa możliwa we dwoje."),
    check(
      "Flaga 5 – co rozpoznaję",
      "jestem w relacji z inną osobą i nie chcę jej kończyć ani o niej mówić",
      "chcę iść na terapię, żeby „uspokoić sytuację w domu”, a nie po to, żeby coś zmienić",
      "mam silne podejrzenia, że druga osoba ma kogoś, a ona / on zaprzecza mimo wyraźnych sygnałów",
    ),
    info("Dlaczego wspólna terapia nie jest wtedy pierwszym krokiem", "Praca nad relacją, w której jedna osoba jest naprawdę obecna tylko w połowie, przypomina naprawianie domu, do którego ktoś ciągle wynosi cegły. Druga osoba wkłada wysiłek w coś, czego pełnego obrazu nie zna. Terapeuta też nie może pomóc, jeśli kluczowa informacja jest przed nim ukryta."),
    tip("Co zamiast", "Jeśli to Ty masz romans: rozmowa z psychologiem indywidualnie może pomóc Ci zrozumieć, czego chcesz, i podjąć uczciwą decyzję. Jeśli to Ty podejrzewasz: zadbaj najpierw o siebie – wsparcie indywidualne pomaga przejść niepewność bez obsesyjnego szukania dowodów. Wspólną pracę warto zacząć, gdy obie strony są gotowe na szczerość."),

    h2("Co możesz zrobić z tym, co zaznaczasz"),
    p("Zaznaczenie choćby jednego punktu nie oznacza, że Wasz związek jest „skończony” ani że ktoś jest „zły”. Oznacza, że pierwszy krok może wyglądać inaczej, niż myślałeś / myślałaś: zamiast wspólnej terapii – zadbanie o bezpieczeństwo, leczenie, wsparcie indywidualne albo uczciwa rozmowa. Na wspólną pracę często przychodzi czas później."),
    { t: "exercise", title: "Refleksja po checklistach", time: "10 min", intro: "Odpowiedz krótko, tylko dla siebie. Nie musisz nikomu tego pokazywać.", prompts: ["Który zaznaczony punkt jest dla mnie teraz najważniejszy – i dlaczego?", "Czego najbardziej potrzebuję w najbliższych dniach: bezpieczeństwa, rozmowy, informacji, odpoczynku?", "Jaki jeden mały krok mogę zrobić dla siebie w tym tygodniu?"], lines: 3 },

    h2("Ważne numery – w jednym miejscu"),
    ul(
      "112 – numer alarmowy, gdy jest bezpośrednie zagrożenie dla Ciebie, dzieci albo innej osoby",
      "Niebieska Linia: 800 120 002 – wsparcie dla osób doświadczających przemocy w rodzinie i ich bliskich",
      "Centrum Wsparcia dla osób w kryzysie psychicznym: 800 70 2222",
      "Telefon zaufania dla dzieci i młodzieży: 116 111 – jeśli dzieci potrzebują porozmawiać z kimś z zewnątrz",
      "Poradnia leczenia uzależnień – dla osoby uzależnionej i dla jej bliskich",
    ),
    { t: "exercise", title: "Mój plan wsparcia – sam / sama", intro: "Ten plan jest tylko dla Ciebie. Jeśli druga osoba kontroluje Twój telefon, zapisz najważniejsze rzeczy w miejscu, do którego ona nie ma dostępu.", prompts: ["Komu mogę powiedzieć, co się dzieje? (jedna osoba: imię, sposób kontaktu)", "Gdzie mogę pójść, jeśli będę potrzebować bezpiecznego miejsca?", "Do kogo zadzwonię najpierw: Niebieska Linia, Centrum Wsparcia, psycholog, poradnia?", "Co mogę zrobić dla siebie, zanim podejmę jakąkolwiek decyzję o związku?"], lines: 2 },

    h2("Jeśli żadna flaga Was nie dotyczy"),
    p("To dobra wiadomość: terapia par albo konsultacja we dwoje może być dla Was sensownym krokiem. Zanim się umówicie, warto spokojnie nazwać, z czym chcecie przyjść – każde z Was osobno. Pomogą w tym pytania poniżej. Jeśli wypełniasz to sam / sama, odpowiedz za siebie."),
    { t: "exercise", title: "Z czym chcemy przyjść", intro: "Krótko, własnymi słowami. Jeśli robicie to razem, każde z Was odpowiada osobno, a potem porównujecie odpowiedzi bez oceniania.", prompts: ["Co jest teraz w naszej relacji najtrudniejsze?", "Co chciałbym / chciałabym, żeby się zmieniło jako pierwsze?", "Co jest między nami nadal dobre i warte ochrony?"], lines: 2 },
    safety(SAFETY_JOINT),
    p("Jeśli żadna z flag Was nie dotyczy, a chcecie zacząć od uporządkowania sytuacji, Mapa Relacji DUO to proces z psychologiem zakończony pisemnym podsumowaniem. Pomaga zobaczyć, co się dzieje w relacji i jakie kroki mają sens – możesz zacząć razem z partnerem albo sam / sama."),
  ],
  emails: [
    {
      subject: "Jedna osoba, której możesz powiedzieć prawdę",
      body: "Jeśli zaznaczyłeś / zaznaczyłaś coś w checklistach, nie musisz od razu niczego decydować. Pomyśl tylko o jednej osobie – przyjaciółce, bracie, lekarzu, psychologu – której możesz powiedzieć, jak naprawdę jest. Czasem jedno zdanie: „U nas nie jest dobrze i potrzebuję z kimś o tym pogadać” otwiera drogę do pomocy. Gdy potrzebujesz rozmowy z kimś z zewnątrz: Niebieska Linia 800 120 002, Centrum Wsparcia 800 70 2222, w zagrożeniu 112.",
    },
    {
      subject: "Najpierw bezpieczeństwo, potem rozmowa",
      body: "Praca nad związkiem ma sens wtedy, gdy obie osoby mogą mówić swobodnie i bez strachu. Jeśli w Twojej relacji tak nie jest, zadbanie o siebie – rozmowa z psychologiem indywidualnie, z konsultantem telefonu zaufania albo z kimś bliskim – nie jest rezygnacją ze związku. To pierwszy krok, który czasem otwiera drogę do kolejnych.",
    },
    {
      subject: "Gdy żadna flaga Was nie dotyczy",
      body: "Jeśli przeszedłeś / przeszłaś przez checklisty i żadna flaga nie pasuje do Waszej sytuacji, to dobry moment, żeby spokojnie przyjrzeć się relacji. Mapa Relacji DUO to proces z psychologiem zakończony pisemnym podsumowaniem. Pomaga uporządkować to, co się dzieje, i zdecydować, jaki krok ma dla Was sens – możesz ją zacząć razem z partnerem albo sam / sama.",
    },
  ],
  needsReview: true,
};
