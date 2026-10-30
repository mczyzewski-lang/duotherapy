// Raport po Audycie Relacji – struktura zgodna z szablonem 04, szkic budowany lokalnie
// (bez zewnętrznych usług) wyłącznie z danych sprawy, odpowiedzi osoby, która raport otrzyma,
// oraz notatek psychologa oznaczonych jako dopuszczone do raportu.
import { answerByKey, formatAnswer, type PersonData } from "./analysis";
import type { Settings } from "./settings";

export const MISSING = "[DO UZUPEŁNIENIA]";

export type Severity = "low" | "moderate" | "high" | null;
export type PathKey = "rebuild" | "separate" | "safety" | "none" | null;

export const TENSION_AREAS = [
  ["communication", "Komunikacja i konflikt"],
  ["closeness", "Bliskość i intymność"],
  ["trust", "Zaufanie"],
  ["boundaries", "Granice"],
  ["parenting", "Obowiązki i rodzicielstwo"],
  ["stress", "Stres i praca"],
] as const;

export const MECHANISM_ROWS = [
  ["trigger", "Typowy wyzwalacz"],
  ["thought", "Myśl automatyczna"],
  ["emotion", "Emocja pod spodem"],
  ["behavior", "Zachowanie na zewnątrz"],
  ["need", "Potrzeba, która nie jest zaspokojona"],
] as const;

export const PATH_OPTIONS: Record<Exclude<PathKey, null | "none">, { label: string; options: [string, string][] }> = {
  rebuild: {
    label: "Odbudowa relacji",
    options: [
      ["couple_therapy", "terapia par"],
      ["rebuild_program", "program odbudowy relacji"],
      ["individual_change", "sesje indywidualne wspierające zmianę"],
      ["digital", "materiały cyfrowe"],
    ],
  },
  separate: {
    label: "Rozstanie z szacunkiem",
    options: [
      ["separation_comm", "wsparcie w komunikacji ku rozstaniu"],
      ["coparenting", "plan współrodzicielstwa i rozmowa z dziećmi"],
      ["mediation", "mediacja rodzinna lub rozwodowa"],
      ["legal", "konsultacja prawna"],
      ["grief", "wsparcie indywidualne w żałobie po związku"],
    ],
  },
  safety: {
    label: "Pilne wsparcie (bezpieczeństwo)",
    options: [
      ["safety_plan", "plan bezpieczeństwa"],
      ["violence_help", "pomoc specjalistyczna przy przemocy"],
      ["psychiatry", "konsultacja psychiatryczna"],
      ["addiction", "terapia uzależnień"],
    ],
  },
};

/** Opcje niedopuszczalne przy sygnałach zagrożenia (wytyczne 03, rozdz. 10, ścieżka 3). */
export const UNSAFE_WITH_RISK = ["couple_therapy", "rebuild_program", "mediation"];

export interface ReportContent {
  audience: "joint" | "participant";
  caseKind: "individual" | "couple";
  meta: { participants: { name: string; age: string }[]; sessionDate: string; minutes: 60 | 90; therapist: string };
  summary: { text: string; reason: string; decisionStage: string };
  strengths: string[];
  tensions: { area: string; label: string; text: string; severity: Severity }[];
  mechanism: {
    oneLiner: string;
    columns: string[];
    rows: { key: string; label: string; values: string[] }[];
    patterns: { criticism: boolean; contempt: boolean; defensiveness: boolean; stonewalling: boolean };
    patternsComment: string;
    repair: string;
  };
  recommendations: string[];
  path: { main: PathKey; options: string[]; rationale: string };
  nextSteps: { what: string; who: string; when: string }[];
  riskFlag: boolean;
  /** Notatki/źródła, które psycholog widzi w edytorze (nie trafiają do PDF). */
  sourcesNote: string;
}

export interface DraftInput {
  audience: "joint" | "participant";
  caseKind: "individual" | "couple";
  sessionDate: Date | null;
  therapist: string;
  /** Wszyscy uczestnicy (do metadanych). */
  participants: { name: string; birth?: string | null }[];
  /** Osoby, których odpowiedzi można użyć w treści – tylko odbiorca raportu osobnego. */
  ownData: PersonData | null;
  /** Notatki dopuszczone do raportu (dla raportu wspólnego: tylko z flagą joint_ok). */
  notes: { area: string | null; body: string; participantName: string | null }[];
  reason: string | null;
  riskFlag: boolean;
}

function age(birth?: string | null): string {
  if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return MISSING;
  const b = new Date(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return String(a);
}

function fromAnswer(p: PersonData | null, key: string, prefix = "Deklaracja klienta: "): string {
  if (!p) return MISSING;
  const { q, a } = answerByKey(p, key);
  if (!q || !a || a.state !== "answered") return MISSING;
  const txt = formatAnswer(q, a);
  return txt && txt !== "—" ? `${prefix}${txt}` : MISSING;
}

const AREA_SECTIONS: Record<string, string[]> = {
  communication: ["communication", "cycle"],
  closeness: ["closeness"],
  trust: ["trust"],
  boundaries: ["boundaries"],
  parenting: ["parenting"],
  stress: ["stress"],
};

export function buildDraft(input: DraftInput): ReportContent {
  const own = input.ownData;
  const notesFor = (area: string) => input.notes.filter((n) => n.area && AREA_SECTIONS[area]?.includes(n.area)).map((n) => `Obserwacja psychologa: ${n.body}`);
  const general = input.notes.filter((n) => !n.area || !Object.values(AREA_SECTIONS).flat().includes(n.area));
  const isIndividual = input.caseKind === "individual";

  const columns =
    input.audience === "participant" && own
      ? isIndividual
        ? [own.name, "Partner/partnerka – w perspektywie uczestnika"]
        : [own.name]
      : input.participants.map((p) => p.name);

  const rows = MECHANISM_ROWS.map(([key, label]) => {
    const values = columns.map((_, i) => {
      if (input.audience !== "participant" || !own) return MISSING;
      if (i === 0) {
        const map: Record<string, string> = { trigger: "s3.trigger", thought: "s3.thought", emotion: "s3.feeling", behavior: "s3.action" };
        return map[key] ? fromAnswer(own, map[key], "Deklaracja: ") : MISSING;
      }
      // osoba nieobecna: tylko to, co opisał uczestnik, oznaczone jako jego perspektywa
      if (key === "behavior") return fromAnswer(own, "s3.partner", "W opisie uczestnika: ");
      return MISSING;
    });
    return { key, label, values };
  });

  const goal = own ? fromAnswer(own, "sit.goal", "") : MISSING;
  const who = own ? fromAnswer(own, "sit.who_considers", "Kto rozważa rozstanie (deklaracja): ") : MISSING;

  return {
    audience: input.audience,
    caseKind: input.caseKind,
    meta: {
      participants: input.participants.map((p) => ({ name: p.name, age: age(p.birth) })),
      sessionDate: input.sessionDate ? input.sessionDate.toISOString().slice(0, 10) : MISSING,
      minutes: isIndividual ? 60 : 90,
      therapist: input.therapist || MISSING,
    },
    summary: {
      text: [MISSING + " 3-5 zdań: z czym przyszliście, co jest teraz najważniejsze. Język opisowy, bez ocen i diagnoz.", ...general.map((n) => `Obserwacja psychologa: ${n.body}`)].join("\n"),
      reason: input.reason ? `Deklaracja: ${input.reason}` : goal !== MISSING ? `Cel audytu wskazany w kwestionariuszu: ${goal}` : MISSING,
      decisionStage: who,
    },
    strengths: [MISSING],
    tensions: TENSION_AREAS.map(([area, label]) => {
      const n = notesFor(area);
      return { area, label, text: n.length ? n.join("\n") : MISSING, severity: null };
    }),
    mechanism: {
      oneLiner: MISSING,
      columns,
      rows,
      patterns: { criticism: false, contempt: false, defensiveness: false, stonewalling: false },
      patternsComment: MISSING,
      repair: MISSING,
    },
    recommendations: [MISSING],
    path: { main: null, options: [], rationale: MISSING },
    nextSteps: [{ what: MISSING, who: "", when: "" }],
    riskFlag: input.riskFlag,
    sourcesNote:
      input.audience === "joint"
        ? "Raport wspólny: szkic nie zawiera odpowiedzi z indywidualnych kwestionariuszy. Użyto wyłącznie notatek oznaczonych „do raportu” i „może trafić do raportu wspólnego”."
        : "Raport osobny: szkic może zawierać deklaracje wyłącznie osoby, która otrzyma raport, oraz notatki oznaczone „do raportu”.",
  };
}

/** Pozostałe znaczniki do uzupełnienia – zatwierdzenie raportu jest zablokowane, dopóki istnieją. */
export function missingMarkers(c: ReportContent): string[] {
  const out: string[] = [];
  const chk = (label: string, s: string) => s.includes(MISSING) && out.push(label);
  c.meta.participants.forEach((p, i) => chk(`Metadane: wiek osoby ${i + 1}`, p.age));
  chk("Metadane: data sesji", c.meta.sessionDate);
  chk("Metadane: psycholog", c.meta.therapist);
  chk("Podsumowanie", c.summary.text);
  chk("Powód zgłoszenia", c.summary.reason);
  chk("Etap decyzji", c.summary.decisionStage);
  c.strengths.forEach((s, i) => chk(`Mocne strony (${i + 1})`, s));
  c.tensions.forEach((t) => {
    chk(`Obszar napięcia: ${t.label}`, t.text);
    if (!t.severity) out.push(`Nasilenie: ${t.label}`);
  });
  chk("Cykl w jednym zdaniu", c.mechanism.oneLiner);
  c.mechanism.rows.forEach((r) => r.values.forEach((v, i) => chk(`Mechanizm: ${r.label} (${c.mechanism.columns[i]})`, v)));
  chk("Komentarz do wzorców", c.mechanism.patternsComment);
  chk("Próby naprawy", c.mechanism.repair);
  c.recommendations.forEach((s, i) => chk(`Rekomendacja ${i + 1}`, s));
  if (!c.path.main) out.push("Rekomendowana ścieżka");
  chk("Uzasadnienie ścieżki", c.path.rationale);
  c.nextSteps.forEach((s, i) => chk(`Następny krok ${i + 1}`, `${s.what}${s.who}${s.when}`));
  return out;
}

/** Walidacja bezpieczeństwa rekomendacji. */
export function pathProblems(c: ReportContent): string[] {
  const p: string[] = [];
  if (c.riskFlag && c.path.options.some((o) => UNSAFE_WITH_RISK.includes(o)))
    p.push("Przy sygnałach zagrożenia nie rekomenduje się terapii par, programu dla par ani mediacji, dopóki przemoc trwa lub istnieje zagrożenie.");
  if (c.path.main && c.path.main !== "none") {
    const allowed = PATH_OPTIONS[c.path.main].options.map(([k]) => k);
    if (c.path.options.some((o) => !allowed.includes(o))) p.push("Wybrane formy pomocy nie pasują do ścieżki.");
  }
  return p;
}

// ---------------------------------------------------------------------------
// Render HTML (podgląd i PDF)
// ---------------------------------------------------------------------------
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const para = (s: string) => esc(s).replace(/\n/g, "<br>");
const radio = (on: boolean, label: string) => `<span class="opt ${on ? "on" : ""}">${on ? "●" : "○"} ${esc(label)}</span>`;

export function renderReportHtml(c: ReportContent, s: Settings, opts: { fontCss?: string; draft?: boolean } = {}): string {
  const sev = (v: Severity) => (["low", "moderate", "high"] as const).map((k) => radio(v === k, { low: "niskie", moderate: "umiarkowane", high: "wysokie" }[k])).join(" ");
  const helplines = s.helplines.items.map((h) => `${esc(h.number)} (${esc(h.when.split(",")[0])})`).join(", ");
  const pathBlock = (Object.keys(PATH_OPTIONS) as (keyof typeof PATH_OPTIONS)[])
    .map((k) => {
      const def = PATH_OPTIONS[k];
      const opts2 = def.options.map(([o, l]) => radio(c.path.main === k && c.path.options.includes(o), l)).join(" ");
      const note = k === "safety" ? `<div class="small">Przy przemocy nie rekomenduje się terapii par ani mediacji.</div>` : "";
      return `<div class="path ${c.path.main === k ? "chosen" : ""}">${radio(c.path.main === k, def.label)}<div class="sub">${opts2}</div>${note}</div>`;
    })
    .join("");
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Raport po Audycie Relacji</title>
<style>
${opts.fontCss ?? ""}
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
body { font-family: "Inter Variable", Inter, system-ui, sans-serif; color: #1f2a2a; font-size: 10.5pt; line-height: 1.55; margin: 0; background: #fff; }
h1, h2 { font-family: "Fraunces Variable", Fraunces, Georgia, serif; font-weight: 500; color: #1d4640; }
h1 { font-size: 26pt; margin: 0 0 2pt; letter-spacing: -0.01em; }
h2 { font-size: 14pt; margin: 22pt 0 8pt; padding-bottom: 4pt; border-bottom: 1px solid #e6dccd; break-after: avoid; }
.brand { font-size: 9pt; letter-spacing: .16em; text-transform: uppercase; color: #a5583b; font-weight: 600; }
.lead { color: #5a6563; font-size: 9.5pt; margin-top: 6pt; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0; break-inside: avoid; }
th, td { text-align: left; vertical-align: top; padding: 6pt 8pt; border-bottom: 1px solid #efe7db; }
th { font-weight: 600; color: #3b4847; background: #f8f3ec; font-size: 9pt; }
td.k { width: 32%; color: #4b5856; font-weight: 500; }
.opt { white-space: nowrap; margin-right: 8pt; color: #6b7573; }
.opt.on { color: #1d4640; font-weight: 600; }
ul, ol { padding-left: 16pt; margin: 4pt 0; }
li { margin: 3pt 0; }
.path { padding: 6pt 8pt; border-radius: 6pt; margin: 4pt 0; }
.path.chosen { background: #eef3f0; }
.path .sub { margin: 3pt 0 0 14pt; font-size: 9.5pt; }
.small { font-size: 8.5pt; color: #6b7573; }
.box { background: #faf6f0; border: 1px solid #e6dccd; border-radius: 8pt; padding: 10pt 12pt; margin-top: 18pt; break-inside: avoid; }
.missing { background: #fff3cd; }
.draft { position: fixed; top: 40%; left: 0; right: 0; text-align: center; font-size: 60pt; color: rgba(165,88,59,.08); transform: rotate(-20deg); font-weight: 700; }
.foot { margin-top: 14pt; font-size: 8.5pt; color: #6b7573; }
</style></head><body>
${opts.draft ? '<div class="draft">SZKIC – NIEZATWIERDZONY</div>' : ""}
<div class="brand">DUO™ · Audyt Relacji</div>
<h1>Raport po audycie</h1>
<div class="lead">Raport jest poufny i przeznaczony wyłącznie dla ${c.audience === "joint" ? "osób uczestniczących" : "osoby uczestniczącej"} w audycie.${c.audience === "participant" && c.caseKind === "couple" ? " To raport osobny – zawiera wyłącznie treści przeznaczone dla jego odbiorcy." : ""}</div>
<table>
<tr><td class="k">Imię i nazwisko, wiek</td><td>${c.meta.participants.map((p) => `${esc(p.name)}, ${esc(p.age)}`).join("<br>")}</td></tr>
<tr><td class="k">Data sesji</td><td>${esc(c.meta.sessionDate)}</td></tr>
<tr><td class="k">Rodzaj audytu</td><td>${radio(c.caseKind === "couple", "audyt dla pary")} ${radio(c.caseKind === "individual", "audyt indywidualny")}</td></tr>
<tr><td class="k">Forma</td><td>sesja online, ${radio(c.meta.minutes === 60, "60 minut (audyt indywidualny)")} ${radio(c.meta.minutes === 90, "90 minut (audyt dla pary)")}</td></tr>
<tr><td class="k">Psycholog prowadzący</td><td>${esc(c.meta.therapist)}</td></tr>
</table>

<h2>1. Podsumowanie</h2>
<p>${para(c.summary.text)}</p>
<p><strong>Powód zgłoszenia:</strong> ${para(c.summary.reason)}</p>
<p><strong>Etap decyzji:</strong> ${para(c.summary.decisionStage)}</p>

<h2>2. Mocne strony relacji</h2>
<ul>${c.strengths.map((x) => `<li>${para(x)}</li>`).join("")}</ul>

<h2>3. Obszary napięcia</h2>
<table><tr><th>Obszar</th><th>Co zauważam</th><th>Nasilenie</th></tr>
${c.tensions.map((t) => `<tr><td class="k">${esc(t.label)}</td><td>${para(t.text)}</td><td>${sev(t.severity)}</td></tr>`).join("")}
</table>

<h2>4. Mechanizm konfliktu</h2>
<p><strong>${c.caseKind === "couple" ? "Wasz cykl" : "Cykl"} w jednym zdaniu:</strong> ${para(c.mechanism.oneLiner)}</p>
<table><tr><th>Element cyklu</th>${c.mechanism.columns.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>
${c.mechanism.rows.map((r) => `<tr><td class="k">${esc(r.label)}</td>${r.values.map((v) => `<td>${para(v)}</td>`).join("")}</tr>`).join("")}
</table>
<p><strong>Zaobserwowane wzorce komunikacyjne:</strong> ${radio(c.mechanism.patterns.criticism, "krytyka")} ${radio(c.mechanism.patterns.contempt, "pogarda")} ${radio(c.mechanism.patterns.defensiveness, "defensywność")} ${radio(c.mechanism.patterns.stonewalling, "wycofanie (stonewalling)")}</p>
<p><strong>Komentarz:</strong> ${para(c.mechanism.patternsComment)}</p>
<p><strong>Próby naprawy:</strong> ${para(c.mechanism.repair)}</p>

<h2>5. Rekomendacje</h2>
<ol>${c.recommendations.map((x) => `<li>${para(x)}</li>`).join("")}</ol>
<p><strong>Rekomendowana ścieżka:</strong></p>
${pathBlock}
<div class="path ${c.path.main === "none" ? "chosen" : ""}">${radio(c.path.main === "none", "na razie bez dalszej pracy")}</div>
<p><strong>Uzasadnienie wyboru ścieżki:</strong> ${para(c.path.rationale)}</p>
<p class="small">Rekomendacja jest propozycją. Decyzja o dalszej drodze zawsze należy do ${c.audience === "joint" ? "Was" : "Ciebie"}.</p>

<h2>6. Następne kroki</h2>
<table><tr><th>Krok</th><th>Kto</th><th>Kiedy</th></tr>
${c.nextSteps.map((n) => `<tr><td>${para(n.what)}</td><td>${para(n.who)}</td><td>${para(n.when)}</td></tr>`).join("")}
</table>

<div class="box"><strong>Ważne</strong>
<p>Raport opisuje sytuację z perspektywy osoby lub osób uczestniczących w audycie w dniu sesji. Nie jest diagnozą psychiatryczną ani opinią do celów sądowych. Jeśli Twoja sytuacja się pogorszy lub pojawi się zagrożenie bezpieczeństwa, skorzystaj z pomocy od razu:</p>
${c.caseKind === "individual" ? "<p>Przy audycie indywidualnym: raport opiera się wyłącznie na perspektywie jednej osoby. Opisy zachowań, intencji i potrzeb partnera lub partnerki są interpretacją osoby uczestniczącej w audycie, a nie oceną ani diagnozą osoby nieobecnej.</p>" : ""}
<p>${helplines}. Poza Polską: lokalny numer alarmowy kraju pobytu.</p>
</div>
<div class="foot">Audyt Relacji · Raport po audycie · ${esc(c.meta.sessionDate)}</div>
</body></html>`;
}
