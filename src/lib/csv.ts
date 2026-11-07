// CSV (RFC 4180) – zapis i odczyt. Domyślnie średnik i BOM: polski Excel otwiera taki plik poprawnie (kolumny, polskie znaki).
export function toCsv(rows: (string | number | boolean | null | undefined)[][], delim = ";"): string {
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /["\r\n]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(delim)).join("\r\n") + "\r\n";
}

/** Odczyt CSV: separator „;”, „,” albo tabulator wykrywany z pierwszego wiersza; cudzysłowy, nowe linie w polach, BOM. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const count = (ch: string) => firstLine.split(ch).length - 1;
  const delim = [";", ",", "\t"].sort((a, b) => count(b) - count(a))[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let f = "";
  let q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') {
        if (src[i + 1] === '"') { f += '"'; i++; } else q = false;
      } else f += c;
    } else if (c === '"' && f === "") q = true;
    else if (c === delim) { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(f); f = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else f += c;
  }
  if (f !== "" || row.length) { row.push(f); if (row.some((x) => x !== "")) rows.push(row); }
  return rows;
}
