import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "@/lib/csv";

describe("csv", () => {
  it("zapis i odczyt: średnik, cudzysłowy, nowe linie, polskie znaki", () => {
    const rows = [["kod", "treść"], ["n1", "Cześć {imie},\n\nZdanie z „cytatem” i \"cudzysłowem\"; średnik"], ["n2", ""]];
    const csv = toCsv(rows);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(parseCsv(csv)).toEqual(rows.map((r) => r.map(String)).map((r, i) => (i === 2 ? ["n2", ""] : r)));
  });
  it("wykrywa przecinek i tabulator", () => {
    expect(parseCsv("a,b\n1,\"x,y\"\n")).toEqual([["a", "b"], ["1", "x,y"]]);
    expect(parseCsv("a\tb\r\n1\t2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});
