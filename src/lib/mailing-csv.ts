// E-maile nurturingu w CSV: eksport wszystkich kroków obu ścieżek i import (dopasowanie po kodzie e-maila).
// Import najpierw sprawdza cały plik – przy jakimkolwiek błędzie nic nie zmienia.
import { parseCsv, toCsv } from "./csv";
import { parseTags, STEP_CODE_RE, type StepRow } from "./mailing";

export const CSV_COLUMNS = ["sciezka", "kod", "kolejnosc", "dzien", "aktywny", "temat", "preheader", "przycisk", "link", "tylko_z_tagami", "bez_tagow", "tresc"] as const;
type Col = (typeof CSV_COLUMNS)[number];

const tagsOut = (t: string[]) => t.map((x) => `#${x}`).join(" ");

export function stepsToCsv(steps: StepRow[]): string {
  return toCsv([
    [...CSV_COLUMNS],
    ...steps.map((s) => [s.sequence_id, s.code, s.position, s.delay_days, s.active ? "tak" : "nie", s.subject, s.preheader, s.cta_label, s.cta_url, tagsOut(s.include_tags), tagsOut(s.exclude_tags), s.body]),
  ]);
}

export type ImportRow = Omit<StepRow, "id">;

/** Parsuje i sprawdza plik. Zwraca wiersze do zapisu albo listę błędów (z numerami wierszy jak w arkuszu). */
export function parseStepsCsv(text: string): { rows: ImportRow[]; errors: string[] } {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length < 2) return { rows: [], errors: ["Plik jest pusty albo ma tylko nagłówek."] };
  const head = table[0].map((h) => h.trim().toLowerCase());
  const idx = Object.fromEntries(CSV_COLUMNS.map((c) => [c, head.indexOf(c)])) as Record<Col, number>;
  const missing = (["sciezka", "kod", "temat", "tresc"] as Col[]).filter((c) => idx[c] < 0);
  if (missing.length) return { rows: [], errors: [`Brak kolumn: ${missing.join(", ")}. Pobierz wzór przyciskiem „Pobierz CSV”.`] };
  const get = (r: string[], c: Col) => (idx[c] >= 0 ? (r[idx[c]] ?? "").trim() : "");
  const rows: ImportRow[] = [];
  const seen = new Set<string>();
  table.slice(1).forEach((r, i) => {
    const line = i + 2;
    const err = (m: string) => errors.push(`Wiersz ${line}: ${m}`);
    const seq = get(r, "sciezka").toLowerCase();
    const code = get(r, "kod").toLowerCase();
    const posRaw = get(r, "kolejnosc");
    const delayRaw = get(r, "dzien") || "0";
    const activeRaw = get(r, "aktywny").toLowerCase() || "tak";
    const subject = get(r, "temat");
    const body = idx.tresc >= 0 ? (r[idx.tresc] ?? "").replace(/\r\n/g, "\n").trim() : "";
    const ctaUrl = get(r, "link") || "/";
    if (seq !== "lead" && seq !== "customer") return err(`ścieżka „${seq}” – wpisz lead (przed zakupem) albo customer (po zakupie).`);
    if (!STEP_CODE_RE.test(code)) return err(`kod „${code}” – 1–2 litery i numer, np. n3.`);
    if (seen.has(code)) return err(`kod „${code}” powtarza się w pliku.`);
    seen.add(code);
    const delay = Number(delayRaw);
    if (!Number.isInteger(delay) || delay < 0 || delay > 365) return err("dzień – liczba od 0 do 365.");
    const position = posRaw ? Number(posRaw) : NaN;
    if (posRaw && (!Number.isInteger(position) || position < 1 || position > 999)) return err("kolejność – liczba od 1.");
    if (!["tak", "nie", "1", "0", "true", "false"].includes(activeRaw)) return err("aktywny – tak albo nie.");
    if (!subject || subject.length > 200) return err("temat – wymagany, do 200 znaków.");
    if (!body || body.length > 20000) return err("treść – wymagana, do 20 000 znaków.");
    if (!/^\/(?!\/)\S*$/.test(ctaUrl)) return err(`link „${ctaUrl}” – adres na stronie zaczynający się od „/”, np. /mapa-relacji.`);
    if (get(r, "preheader").length > 200) return err("preheader – do 200 znaków.");
    if (get(r, "przycisk").length > 80) return err("przycisk – do 80 znaków.");
    rows.push({
      sequence_id: seq, code, position: Number.isNaN(position) ? 0 : position, delay_days: delay, subject, body, cta_url: ctaUrl,
      preheader: get(r, "preheader"), cta_label: get(r, "przycisk"),
      include_tags: parseTags(get(r, "tylko_z_tagami")), exclude_tags: parseTags(get(r, "bez_tagow")),
      active: ["tak", "1", "true"].includes(activeRaw),
    });
  });
  return { rows, errors };
}
