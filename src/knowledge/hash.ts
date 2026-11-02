// Skrót treści materiału (serwer) – zmienia się przy każdej zmianie treści i unieważnia wygenerowany PDF.
import { createHash } from "node:crypto";
import { SAMPLE_INTRO } from "./registry";
import type { LeadMagnet } from "./types";

export function contentHash(m: LeadMagnet): string {
  return createHash("sha256").update(JSON.stringify([m.title, m.cover, m.blocks, m.special ? SAMPLE_INTRO : null])).digest("hex").slice(0, 16);
}
