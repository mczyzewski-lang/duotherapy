import { describe, expect, it } from "vitest";
import { deliveryMail, nurtureMail, seriesDayMail } from "@/knowledge/emails";
import { contentHash } from "@/knowledge/hash";
import { CATEGORIES, MAGNETS, magnetBySlug } from "@/knowledge/registry";
import type { Block } from "@/knowledge/types";

const SLUGS = [
  "mapa-trzech-drog", "21-pytan-o-relacji", "kryzys-czy-koniec-milosci", "7-dni-lepszych-rozmow", "trudna-rozmowa",
  "partner-nie-chce-ratowac-zwiazku", "petla-konfliktu", "po-zdradzie", "swiadome-rozstanie", "przykladowa-mapa-relacji",
];
const of = <T extends Block["t"]>(slug: string, t: T) => magnetBySlug(slug)!.blocks.filter((b): b is Extract<Block, { t: T }> => b.t === t);
const allText = (slug: string) => JSON.stringify(magnetBySlug(slug));

describe("rejestr materiałów „Wiedza”", () => {
  it("10 materiałów z wymaganymi adresami, unikalne id, 3 kategorie po 4/4/2", () => {
    expect(MAGNETS).toHaveLength(10);
    expect(MAGNETS.map((m) => m.slug).sort()).toEqual([...SLUGS].sort());
    expect(new Set(MAGNETS.map((m) => m.id)).size).toBe(10);
    expect(new Set(MAGNETS.map((m) => m.n)).size).toBe(10);
    expect(CATEGORIES.map((c) => c.items.length)).toEqual([4, 4, 2]);
  });

  it("każdy materiał: 3–5 elementów „co otrzymasz”, ≤ 4 punkty „dla kogo”, 3 wiadomości, poprawny podgląd", () => {
    for (const m of MAGNETS) {
      expect(m.gets.length, m.slug).toBeGreaterThanOrEqual(3);
      expect(m.gets.length, m.slug).toBeLessThanOrEqual(5);
      expect(m.forWho.length, m.slug).toBeLessThanOrEqual(4);
      expect(m.emails, m.slug).toHaveLength(3);
      for (const i of m.preview) expect(m.blocks[i], `${m.slug} podgląd ${i}`).toBeDefined();
      if (!m.special) {
        expect(m.preview.length, m.slug).toBeGreaterThan(0);
        expect(m.blocks.length, m.slug).toBeGreaterThan(14);
      }
    }
  });

  it("bez tekstu zastępczego, wyników punktowych i obietnic ratowania związku", () => {
    for (const m of MAGNETS) {
      const t = allText(m.slug).toLowerCase();
      expect(t, m.slug).not.toMatch(/lorem|ipsum|todo|\[do uzupełnienia|tbd|xxx/);
      expect(t, m.slug).not.toMatch(/\d+\s?% szans|uratuje(my)? (wasz|twój) związek|gwarantujemy/);
    }
  });
});

describe("treść zgodna ze specyfikacją", () => {
  it("21 pytań: dokładnie 21, pięć obszarów, każde z wyjaśnieniem i pytaniem pogłębiającym", () => {
    const q = of("21-pytan-o-relacji", "question");
    expect(q).toHaveLength(21);
    expect(new Set(q.map((x) => x.area))).toEqual(new Set(["Komunikacja", "Bliskość", "Zaufanie", "Potrzeby i granice", "Wspólna przyszłość"]));
    for (const x of q) expect(x.why && x.deeper, `pytanie ${x.n}`).toBeTruthy();
  });

  it("Kryzys czy koniec miłości: 10 pytań i dwa ćwiczenia (kolumny)", () => {
    expect(of("kryzys-czy-koniec-milosci", "question")).toHaveLength(10);
    expect(of("kryzys-czy-koniec-milosci", "columns").length).toBeGreaterThanOrEqual(2);
  });

  it("7 dni: siedem dni, każdy z wprowadzeniem, ćwiczeniem, przykładem, czasem i wariantem indywidualnym", () => {
    const days = of("7-dni-lepszych-rozmow", "day");
    expect(days.map((d) => d.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(days.map((d) => d.title)).toEqual(["Słuchanie", "Potrzeby", "Docenianie", "Trudna emocja", "Granice", "Wspólna przyszłość", "Refleksja"]);
    for (const d of days) expect(d.intro && d.task.length && d.example && d.minutes && d.solo, `dzień ${d.n}`).toBeTruthy();
  });

  it("Trudna rozmowa: trzy pierwsze zdania, dwa dialogi (eskalacja i porozumienie), karta 20 minut", () => {
    expect(of("trudna-rozmowa", "dialog").map((d) => d.tone).sort()).toEqual(["escalate", "support"]);
    const cards = of("trudna-rozmowa", "cards");
    expect(cards.some((c) => c.title === "Trzy przykłady dobrego rozpoczęcia" && c.items.length === 3)).toBe(true);
    expect(allText("trudna-rozmowa")).toContain("Nasza rozmowa – 20 minut");
  });

  it("Pętla konfliktu: schemat, dwa przykłady (obowiązki, czas razem) i pusty arkusz", () => {
    expect(of("petla-konfliktu", "loop")).toHaveLength(1);
    expect(of("petla-konfliktu", "loopExample")).toHaveLength(2);
    expect(of("petla-konfliktu", "loopBlank")).toHaveLength(1);
  });

  it("Partner nie chce: arkusz dwóch kolumn „mam wpływ / nie mogę kontrolować”", () => {
    expect(of("partner-nie-chce-ratowac-zwiazku", "columns").some((c) => c.cols[0].startsWith("Mam wpływ") && c.cols[1].startsWith("Nie mogę kontrolować"))).toBe(true);
  });

  it("materiały o konflikcie, zdradzie i rozstaniu zawierają ramkę bezpieczeństwa", () => {
    for (const s of ["trudna-rozmowa", "petla-konfliktu", "po-zdradzie", "swiadome-rozstanie", "7-dni-lepszych-rozmow", "21-pytan-o-relacji"])
      expect(magnetBySlug(s)!.blocks.some((b) => b.t === "callout" && b.tone === "safety"), s).toBe(true);
  });

  it("Świadome rozstanie: charakter informacyjny (nie porada prawna), bez wzmianki o Nowym Etapie bez ujawnienia", () => {
    const t = allText("swiadome-rozstanie").toLowerCase();
    expect(t).toContain("nie jest indywidualną poradą prawną");
    expect(t).not.toMatch(/nowy etap/);
  });

  it("Mapa 3 dróg: grafika trzech dróg i dwa ćwiczenia; przykładowa Mapa – prawdziwy generator", () => {
    expect(of("mapa-trzech-drog", "roads")).toHaveLength(1);
    expect(of("mapa-trzech-drog", "exercise").length).toBeGreaterThanOrEqual(2);
    expect(magnetBySlug("przykladowa-mapa-relacji")!.special).toBe("sample-report");
  });
});

describe("wiadomości", () => {
  const c = { email: "kontakt@duo.test" };
  it("dostarczenie: krótki link do materiału online, bez PDF i bez wypisu (to nie marketing)", () => {
    const m = magnetBySlug("po-zdradzie")!;
    const mail = deliveryMail(m, "Ola", "https://duo.test", c);
    expect(mail.subject).toBe(`Twój bezpłatny materiał DUO: ${m.short}`);
    expect(mail.text).toContain("https://duo.test/wiedza/po-zdradzie/material");
    expect(mail.text).not.toContain("/pdf");
    expect(deliveryMail(m, "Ola", "https://duo.test", c, "https://duo.test/plan/k7m2xq9").text).toContain("https://duo.test/plan/k7m2xq9");
  });
  it("sekwencja: link wypisu w każdej wiadomości, trzecia prowadzi do Mapy Relacji z nieopisowym id", () => {
    const m = magnetBySlug("petla-konfliktu")!;
    for (const step of [1, 2, 3] as const) expect(nurtureMail(m, step, "https://duo.test", c, "https://duo.test/wiedza/wypisz?t=x").text).toContain("wypisz?t=x");
    expect(nurtureMail(m, 3, "https://duo.test", c, "u").text).toContain(`utm_campaign=${m.id}`);
    const day = of("7-dni-lepszych-rozmow", "day")[2];
    expect(seriesDayMail(day, "https://duo.test", "7-dni-lepszych-rozmow", c, "u").subject).toContain("Dzień 3");
  });
  it("skrót treści zmienia się po zmianie treści (unieważnia PDF)", () => {
    const m = magnetBySlug("trudna-rozmowa")!;
    expect(contentHash({ ...m, blocks: [...m.blocks, { t: "p", text: "zmiana" }] })).not.toBe(contentHash(m));
  });
});

describe("materiały do uzupełniania online", () => {
  it("każdy materiał (poza przykładowym raportem) ma pola do uzupełnienia i nazwę podsumowania", async () => {
    const { fieldsOf } = await import("@/knowledge/fields");
    const { coverOf } = await import("@/knowledge/covers");
    for (const m of MAGNETS) {
      if (m.special) continue;
      expect(fieldsOf(m).length, m.slug).toBeGreaterThan(3);
      expect(coverOf(m.slug)?.summary, m.slug).toBeTruthy();
      expect(new Set(fieldsOf(m).map((f) => f.id)).size, m.slug).toBe(fieldsOf(m).length);
    }
  });
  it("zapis przyjmuje tylko istniejące pola i właściwe typy; podsumowanie grupuje odpowiedzi", async () => {
    const { fieldsOf, sanitizeAnswers, summarize, filledCount } = await import("@/knowledge/fields");
    const m = magnetBySlug("21-pytan-o-relacji")!;
    const [q1] = fieldsOf(m);
    const clean = sanitizeAnswers(m, { [q1.id]: "Pieniądze", nieistnieje: "x", [`${q1.id}x`]: true });
    expect(clean).toEqual({ [q1.id]: "Pieniądze" });
    expect(filledCount(clean)).toBe(1);
    expect(summarize(m, clean)[0].items[0]).toEqual({ label: q1.label, value: "Pieniądze" });
  });
  it("minimum do podsumowania: min. 1 odpowiedź w każdej z pierwszych 3 części", async () => {
    const { fieldsOf, requirementsOf, missingRequirements, MAX_REQUIRED_SECTIONS } = await import("@/knowledge/fields");
    for (const slug of ["21-pytan-o-relacji", "petla-konfliktu", "swiadome-rozstanie"]) {
      const m = magnetBySlug(slug)!;
      const reqs = requirementsOf(fieldsOf(m));
      expect(reqs.length, slug).toBeGreaterThan(0);
      expect(reqs.length, slug).toBeLessThanOrEqual(MAX_REQUIRED_SECTIONS);
      expect(missingRequirements(reqs, {}).length, slug).toBe(reqs.length);
      const all = Object.fromEntries(reqs.map((r) => [r.ids[r.ids.length - 1], fieldsOf(m).find((f) => f.id === r.ids[r.ids.length - 1])!.kind === "check" ? true : "tak"]));
      expect(missingRequirements(reqs, all), slug).toEqual([]);
      expect(missingRequirements(reqs, { [reqs[0].ids[0]]: "   " }).length, slug).toBe(reqs.length);
    }
  });
  it("przykładowe odręczne odpowiedzi trafiają w pola z podglądu landingu", async () => {
    const { fieldsOf } = await import("@/knowledge/fields");
    const { SAMPLE_ANSWERS } = await import("@/knowledge/samples");
    for (const [slug, answers] of Object.entries(SAMPLE_ANSWERS)) {
      const m = magnetBySlug(slug)!;
      const preview = fieldsOf(m).filter((f) => m.preview.includes(Number(f.id.match(/^[a-z](\d+)/)![1])));
      for (const [id, v] of Object.entries(answers)) {
        const f = preview.find((x) => x.id === id);
        expect(f, `${slug}:${id}`).toBeTruthy();
        expect(f!.kind, `${slug}:${id}`).toBe(v === true ? "check" : "text");
        if (typeof v === "string") expect(v.length, `${slug}:${id}`).toBeLessThanOrEqual(70);
      }
    }
  });
});

