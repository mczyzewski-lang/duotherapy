// Zasada redakcyjna: w treściach używamy półpauzy „–”, nigdy pauzy (U+2014).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const EM = String.fromCharCode(0x2014);
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|md|sql|mjs)$/.test(f) ? [p] : [];
  });

describe("typografia", () => {
  it("brak pauzy w kodzie, treściach, e-mailach i dokumentacji", () => {
    const bad = ["src", "docs", "db", "scripts", "tests"].flatMap(walk).filter((f) => readFileSync(f, "utf8").includes(EM));
    expect(bad).toEqual([]);
  });
});
