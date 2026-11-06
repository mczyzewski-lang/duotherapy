import type { Article } from "./types";

export const article: Article = {
  slug: "terapia-par-online",
  h1: "Terapia par online – jak wygląda i dla kogo jest?",
  title: "Terapia par online",
  seoTitle: "Terapia par online – jak wygląda i dla kogo jest?",
  description: "Jak wygląda terapia par online, kiedy sprawdza się dobrze, a kiedy lepiej wybrać spotkanie stacjonarne? Praktyczne wskazówki, jak przygotować się do sesji.",
  excerpt: "Terapia par przez internet może być równie spokojna jak w gabinecie – jeśli zadbacie o kilka rzeczy. Zobacz, dla kogo się sprawdza.",
  keywords: ["terapia par online", "terapia małżeńska online", "psycholog dla par online", "terapia par przez internet", "czy terapia online działa"],
  tags: ["terapia par", "online", "pierwsza wizyta"],
  published: "2026-11-06",
  updated: "2026-11-06",
  minutes: 6,
  lead:
    "Terapia par online to spotkania z psychologiem przez wideo – z domu, z dwóch miejsc albo nawet z dwóch miast. Dla wielu par to jedyny realny sposób, żeby w ogóle zacząć. Zobacz, kiedy sprawdza się dobrze i jak się do niej przygotować.",
  blocks: [
    { t: "h2", id: "jak-wyglada", text: "Jak wygląda terapia par online?" },
    {
      t: "p",
      text: "Spotkanie wygląda podobnie jak w gabinecie: rozmowa z terapeutą, który pomaga Wam zrozumieć, co się dzieje w relacji. Różnica polega na tym, że łączycie się przez wideo – zwykle siedząc obok siebie przed jednym ekranem.",
    },
    {
      t: "p",
      text: "Przebieg pierwszego spotkania opisaliśmy w artykule [Jak wygląda pierwsza wizyta na terapii małżeńskiej](/wiedza/artykuly/jak-wyglada-pierwsza-wizyta-terapia-malzenska).",
    },
    { t: "h2", id: "dla-kogo", text: "Kiedy online się sprawdza, a kiedy lepiej stacjonarnie" },
    { t: "figure", graphic: "online-fit", title: "Terapia par online czy stacjonarnie?", caption: "Ogólne wskazówki. Ostateczną formę warto omówić z terapeutą." },
    { t: "cta", magnet: "7-dni-lepszych-rozmow", hook: "Zanim zaczniecie terapię: 7 krótkich ćwiczeń, które możecie zrobić w domu – po jednym dziennie." },
    { t: "h2", id: "jak-sie-przygotowac", text: "Jak przygotować się do sesji online" },
    {
      t: "list",
      ordered: true,
      items: [
        "**Spokojne miejsce** – pokój, w którym nikt Wam nie przeszkodzi i nie usłyszy rozmowy.",
        "**Słuchawki**, jeśli w domu są inne osoby, szczególnie dzieci.",
        "**Sprawdzone połączenie** – kilka minut przed spotkaniem.",
        "**Chwila po sesji** – nie wracajcie od razu do obowiązków. Dajcie sobie 10–15 minut na oddech.",
      ],
    },
    {
      t: "callout",
      tone: "safety",
      title: "Gdy w domu nie jest bezpiecznie",
      text: "Jeśli boisz się mówić szczerze przy partnerze albo w związku pojawia się przemoc, sesja online we dwoje nie jest dobrym rozwiązaniem. Najpierw zadbaj o swoje bezpieczeństwo – możesz zadzwonić na Niebieską Linię: 800 120 002.",
    },
    { t: "h2", id: "w-duo", text: "Terapia online w DUO" },
    {
      t: "p",
      text: "Konsultacja w ramach [Mapy Relacji](/mapa-relacji) odbywa się online. Psycholog zna wcześniej Wasze odpowiedzi z kwestionariusza, więc od razu rozmawiacie o tym, co najważniejsze.",
    },
    { t: "mapa" },
  ],
  faq: [
    { q: "Czy terapia par online jest tak samo skuteczna jak stacjonarna?", a: "Dla wielu par forma online sprawdza się dobrze, zwłaszcza gdy zadbacie o spokojne warunki. Jeśli któreś z Was źle czuje się przed kamerą, warto to omówić z terapeutą." },
    { q: "Czy możemy łączyć się z dwóch różnych miejsc?", a: "Tak, ale zwykle lepiej działa wspólne miejsce. Łączenie z dwóch lokalizacji warto ustalić z terapeutą." },
    { q: "Co jeśli połączenie się zerwie?", a: "Terapeuta zwykle ustala na początku, co robicie w takiej sytuacji – np. ponowne połączenie albo kontakt telefoniczny." },
  ],
  related: ["jak-wyglada-pierwsza-wizyta-terapia-malzenska", "kiedy-isc-na-terapie-par", "terapia-malzenska-czy-rozwod"],
  magnets: ["7-dni-lepszych-rozmow", "21-pytan-o-relacji", "przykladowa-mapa-relacji"],
};
