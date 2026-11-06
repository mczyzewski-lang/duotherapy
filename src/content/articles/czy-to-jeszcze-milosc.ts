import type { Article } from "./types";

export const article: Article = {
  slug: "czy-to-jeszcze-milosc",
  h1: "Czy to jeszcze miłość, czy już tylko przyzwyczajenie? 10 pytań, które warto sobie szczerze zadać",
  title: "Czy to jeszcze miłość?",
  seoTitle: "Czy to jeszcze miłość? 10 pytań, które wiele wyjaśnią",
  description: "Czy to jeszcze miłość, czy już tylko przyzwyczajenie? 10 szczerych pytań pomoże Ci uporządkować uczucia i zdecydować spokojnie, bez pośpiechu i presji.",
  excerpt: "Czujesz bardziej przywiązanie niż miłość i nie wiesz, co z tym zrobić? Te pytania pomogą Ci zrozumieć, co naprawdę czujesz.",
  keywords: ["czy to jeszcze miłość", "miłość czy przyzwyczajenie", "jak sprawdzić czy kocham partnera", "nie wiem czy kocham męża", "przyzwyczajenie w związku", "czy mój związek ma sens"],
  tags: ["kryzys w związku", "decyzja", "bliskość"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 9,
  lead:
    "Patrzysz na partnera przy śniadaniu i łapiesz się na myśli: „Czy ja go jeszcze kocham, czy po prostu się przyzwyczaiłam?”. To pytanie potrafi przestraszyć, bo wydaje się, że odpowiedź może wszystko zmienić. Tymczasem jest ono naturalne – pojawia się w wielu długich związkach. Zamiast szukać natychmiastowego wyroku, warto przyjrzeć się temu, co naprawdę czujesz. Pomoże w tym 10 pytań, które znajdziesz poniżej.",
  hero: {
    prompt: "A person sitting by a window holding a small glowing heart-shaped lantern, looking at it thoughtfully; in the background a second person is reading on a sofa, soft evening light filling the room.",
    alt: "Ilustracja: osoba przy oknie przygląda się świecącemu lampionowi w kształcie serca, w tle partner na kanapie – pytanie, czy to jeszcze miłość",
  },
  blocks: [
    { t: "h2", id: "milosc-sie-zmienia", text: "Miłość w długim związku się zmienia – i to normalne" },
    {
      t: "p",
      text: "Zakochanie, z motylami w brzuchu i myśleniem o drugiej osobie przez cały dzień, z czasem mija. To nie znak, że coś poszło źle, tylko naturalny etap. W długim związku na jego miejsce zwykle przychodzi coś spokojniejszego: zaufanie, czułość, wspólna historia, poczucie, że jesteście drużyną.",
    },
    {
      t: "p",
      text: "Problem pojawia się wtedy, gdy zamiast tej spokojnej bliskości zostaje głównie **przyzwyczajenie** – wspólny adres, kredyt, rytm dnia – a niewiele więcej. Granica między dojrzałą miłością a przyzwyczajeniem nie jest ostra. Dlatego zamiast pytać „czy kocham?”, łatwiej zadać sobie kilka bardziej konkretnych pytań.",
    },
    {
      t: "art",
      key: "plomien-i-zar",
      title: "Płomień zakochania, żar dojrzałej miłości",
      prompt: "Split composition: on the left a tall bright flickering flame, on the right a calm bed of glowing warm embers giving steady heat; two people warm their hands by the embers.",
      alt: "Ilustracja: wysoki płomień obok spokojnego żaru, przy którym para grzeje dłonie – zakochanie a dojrzała miłość",
      caption: "W skrócie: zakochanie przypomina płomień, dojrzała miłość – żar. Mniej widowiskowy, ale wciąż daje ciepło.",
    },
    { t: "h2", id: "10-pytan", text: "10 pytań, które pomogą Ci zrozumieć, co czujesz" },
    {
      t: "p",
      text: "Odpowiadaj szczerze i najlepiej na piśmie. Nie licz punktów – zwróć uwagę na to, które pytania budzą w Tobie najwięcej emocji.",
    },
    {
      t: "list",
      ordered: true,
      items: [
        "**Czy cieszysz się, kiedy partner wraca do domu?** Albo chociaż czujesz się spokojniej, gdy jest obok?",
        "**Czy ciekawi Cię, co u niego słychać?** Czy zadajesz pytania, na które nie znasz odpowiedzi?",
        "**Czy zależy Ci na jego szczęściu** – także wtedy, gdy nie ma ono nic wspólnego z Tobą?",
        "**Czy wyobrażasz sobie Was za pięć lat?** I czy ten obraz budzi raczej nadzieję, czy ciężar?",
        "**Czy w trudnej chwili to do niego chcesz zadzwonić** jako do jednej z pierwszych osób?",
        "**Czy brakuje Ci go, gdy go nie ma** – choćby przez kilka dni?",
        "**Czy szanujesz go** – jego zdanie, wybory, sposób bycia – nawet gdy się nie zgadzacie?",
        "**Czy dotyk i czułość są dla Ciebie przyjemne**, czy raczej obojętne lub nieprzyjemne?",
        "**Czy myśl o rozstaniu przynosi ulgę, czy smutek?** A może jedno i drugie?",
        "**Czy chcesz jeszcze coś razem zbudować**, czy raczej trzyma Cię strach przed zmianą, opinią innych albo samotnością?",
      ],
    },
    {
      t: "p",
      text: "Jeśli przy wielu pytaniach odpowiadasz „tak, choć ostatnio rzadziej to czuję”, możliwe, że pod zmęczeniem i rutyną wciąż jest uczucie, które potrzebuje uwagi. Jeśli dominuje obojętność, ulga na myśl o rozstaniu albo brak szacunku, warto potraktować to poważnie i przyjrzeć się temu spokojnie – najlepiej z kimś z zewnątrz.",
    },
    { t: "cta", magnet: "kryzys-czy-koniec-milosci", hook: "Chcesz pójść krok dalej? Ten materiał prowadzi przez 10 pytań, które pomagają odróżnić kryzys od końca miłości." },
    { t: "h2", id: "co-zaciera-uczucia", text: "Co może zacierać prawdziwe uczucia" },
    {
      t: "p",
      text: "Zanim wyciągniesz wnioski, zastanów się, czy na to, co czujesz, nie wpływa coś, co z samą miłością ma niewiele wspólnego:",
    },
    {
      t: "list",
      items: [
        "**Przemęczenie i przeciążenie** – małe dzieci, praca, opieka nad bliskimi. Gdy brakuje sił, uczucia przygasają. Więcej o tym w artykule o [wypaleniu w związku](/wiedza/artykuly/wypalenie-w-zwiazku).",
        "**Niewypowiedziane urazy** – trudno czuć ciepło do kogoś, do kogo od miesięcy masz żal, o którym nie rozmawialiście.",
        "**Brak czasu tylko dla Was** – miłość potrzebuje okazji, żeby się wyrazić. Bez nich łatwo uznać, że jej nie ma.",
        "**Gorszy okres w Twoim życiu** – smutek, stres czy poczucie zagubienia wpływają na to, jak widzisz wszystko, także związek.",
        "**Porównywanie z początkiem związku** – albo z cudzymi relacjami z mediów społecznościowych.",
      ],
    },
    {
      t: "p",
      text: "Jeśli rozpoznajesz u siebie któryś z tych czynników, nie znaczy to, że Twoje wątpliwości są nieważne. Znaczy raczej, że warto najpierw zadbać o to, co je zaciera – odpocząć, porozmawiać o urazach, odzyskać trochę czasu dla siebie – a dopiero potem wracać do pytania o uczucia. Decyzja podjęta w środku największego zmęczenia często wygląda inaczej niż ta sama decyzja podjęta kilka tygodni później.",
    },
    { t: "h2", id: "przyzwyczajenie-nie-wrog", text: "Przyzwyczajenie to nie zawsze wróg" },
    {
      t: "p",
      text: "W słowie „przyzwyczajenie” słychać coś negatywnego, ale bycie dobrze znanym i znanie kogoś dobrze to także wartość. Wspólne rytuały, przewidywalność i poczucie bezpieczeństwa są fundamentem wielu dobrych, długich związków. Kłopot zaczyna się wtedy, gdy zostaje sama struktura, a znika z niej życie: rozmowa, ciekawość, radość z bycia razem.",
    },
    {
      t: "quote",
      text: "Pytanie nie brzmi tylko „czy to jeszcze miłość?”, ale też „czy chcę i czy chcemy dbać o to, co między nami jest?”.",
    },
    { t: "h2", id: "jak-sprawdzic", text: "Jak sprawdzić, co zostało pod zmęczeniem" },
    {
      t: "p",
      text: "Same pytania to dobry początek, ale uczucia często łatwiej zobaczyć w działaniu niż w myślach. Zamiast rozważać w nieskończoność, możesz dać sobie i Wam kilka tygodni na mały eksperyment:",
    },
    {
      t: "list",
      ordered: true,
      items: [
        "**Zaplanujcie raz w tygodniu czas tylko dla Was** – bez dzieci, telefonów i rozmów o obowiązkach. Zwróć uwagę, jak się wtedy czujesz: swobodnie, nudno, ciepło, nieswojo?",
        "**Zrób coś miłego bez oczekiwań** – ulubiona kawa, krótka wiadomość w ciągu dnia. Obserwuj, czy sprawia Ci to radość, czy jest obowiązkiem.",
        "**Porozmawiajcie o czymś innym niż codzienność** – o marzeniach, wspomnieniach, planach na najbliższy rok. Sprawdź, czy ciekawi Cię, co partner mówi.",
        "**Zapisuj swoje odczucia** – kilka zdań wieczorem wystarczy. Po kilku tygodniach łatwiej zobaczyć, czy coś się zmienia, czy nie.",
      ],
    },
    {
      t: "p",
      text: "Taki eksperyment nie da Ci gotowej odpowiedzi, ale pozwoli oprzeć decyzję na doświadczeniu, a nie tylko na zmęczeniu z ostatnich miesięcy. Jeśli brakuje Wam pomysłów na wspólne rozmowy, pomocne może być [7 dni lepszych rozmów](/wiedza/7-dni-lepszych-rozmow).",
    },
    { t: "h2", id: "jak-porozmawiac", text: "Jak porozmawiać o tym z partnerem" },
    {
      t: "p",
      text: "Wiele osób latami nosi to pytanie w sobie, bo boi się zranić drugą osobę. Rozmowa nie musi jednak zaczynać się od „nie wiem, czy Cię kocham”. Możesz zacząć od tego, czego Ci brakuje:",
    },
    {
      t: "list",
      items: [
        "„Ostatnio czuję, że się od siebie oddaliliśmy. Chciałabym, żebyśmy o tym porozmawiali.”",
        "„Tęsknię za tym, jak kiedyś rozmawialiśmy. Myślisz, że możemy do tego wrócić?”",
        "„Mam w sobie dużo pytań o nas i nie chcę ich dłużej zostawiać bez odpowiedzi.”",
      ],
    },
    {
      t: "p",
      text: "Jeśli boisz się, że rozmowa skończy się kłótnią, skorzystaj z planu [trudnej rozmowy](/wiedza/trudna-rozmowa) lub zasad z artykułu [Jak rozmawiać z partnerem bez kłótni?](/wiedza/artykuly/jak-rozmawiac-z-partnerem-bez-klotni)",
    },
    {
      t: "callout",
      tone: "safety",
      title: "Gdy to nie brak uczuć, tylko strach",
      text: "Jeśli w relacji pojawiają się groźby, przemoc, kontrola albo boisz się reakcji partnera, pytanie o miłość schodzi na dalszy plan – najważniejsze jest Twoje bezpieczeństwo. Terapia par nie jest wtedy pierwszym krokiem. Możesz zadzwonić na Niebieską Linię: 800 120 002, a w sytuacji bezpośredniego zagrożenia na 112.",
    },
    { t: "h2", id: "trzy-drogi", text: "Co dalej? Trzy możliwe drogi" },
    {
      t: "p",
      text: "Kiedy już lepiej rozumiesz, co czujesz, zwykle otwierają się trzy kierunki. Pierwszy to [odbudowa](/odbudowa) – gdy pod zmęczeniem jest jeszcze uczucie i oboje chcecie nad nim pracować. Drugi to [czas na decyzję](/czas-na-decyzje) – gdy jeszcze nie wiesz i potrzebujesz przestrzeni, żeby to sprawdzić. Trzeci to [świadome rozstanie](/swiadome-rozstanie) – gdy wiesz, że to koniec, i chcesz przejść przez niego z szacunkiem.",
    },
    { t: "figure", graphic: "decision-roads", title: "Trzy drogi po kryzysie", caption: "Odbudowa, czas na decyzję albo świadome rozstanie – każda z tych dróg może być dobra, jeśli jest wybrana świadomie." },
    {
      t: "art",
      key: "kompas-uczuc",
      title: "Uczucia jako kompas, nie wyrok",
      prompt: "A person standing on a quiet hill holding a small glowing compass, the needle gently pointing toward a soft horizon; the landscape is calm and open.",
      alt: "Ilustracja: osoba na wzgórzu trzyma świecący kompas – uczucia jako wskazówka kierunku, a nie ostateczny wyrok",
      caption: "W skrócie: to, co czujesz, nie jest wyrokiem, tylko kompasem – pomaga zobaczyć kierunek, w którym chcesz iść.",
    },
    {
      t: "p",
      text: "Jeśli rozważacie różne scenariusze, przeczytaj też artykuł [Terapia małżeńska czy rozwód?](/wiedza/artykuly/terapia-malzenska-czy-rozwod) oraz materiał [Mapa 3 dróg](/wiedza/mapa-trzech-drog).",
    },
    { t: "h2", id: "jak-pomaga-duo", text: "Jak DUO może pomóc" },
    {
      t: "p",
      text: "Na pytanie „czy to jeszcze miłość?” nikt nie odpowie za Ciebie, ale łatwiej je sobie zadać w spokojnej rozmowie. [Mapa Relacji](/mapa-relacji) to poufny kwestionariusz, spotkanie lub spotkania online z psychologiem i pisemne podsumowanie – dostępne online pod prywatnym linkiem i jako PDF. Mapa Relacji dla Ciebie to jedno spotkanie, a Mapa Relacji dla Was – trzy: z Tobą, z partnerem i wspólne. Możesz też zacząć od [bezpłatnego quizu](/start) – 6 pytań, około 2 minut.",
    },
    { t: "mapa" },
  ],
  faq: [
    { q: "Czy to normalne, że po latach nie czuję motyli w brzuchu?", a: "Tak. Zakochanie z czasem mija, a jego miejsce w długim związku zwykle zajmuje spokojniejsza bliskość, zaufanie i czułość." },
    { q: "Jak odróżnić miłość od przyzwyczajenia?", a: "Warto sprawdzić, czy jest w Tobie jeszcze ciekawość partnera, troska o jego szczęście, szacunek i chęć budowania czegoś razem – a nie tylko wspólna codzienność." },
    { q: "Czy uczucie może wrócić?", a: "Bywa, że wraca, gdy para zadba o czas dla siebie, rozmowę i rozwiąże niewypowiedziane urazy. Nie da się tego jednak zagwarantować – wiele zależy od zaangażowania obojga." },
    { q: "Czy powiedzieć partnerowi, że mam wątpliwości?", a: "Warto o nich rozmawiać, zaczynając od tego, czego Ci brakuje, a nie od wyroku. Pomaga spokojny moment i mówienie o sobie zamiast o winie partnera." },
  ],
  related: ["wypalenie-w-zwiazku", "kryzys-w-zwiazku-jak-przetrwac", "terapia-malzenska-czy-rozwod"],
  magnets: ["kryzys-czy-koniec-milosci", "mapa-trzech-drog", "21-pytan-o-relacji"],
};
