// Układ bloków artykułu: między dwoma kontenerami (infografika, ilustracja, blok z materiałem, ramka) zawsze min. 3 zdania tekstu.
// Kontener, który wypadłby za blisko poprzedniego, przesuwamy niżej – za kolejny akapit (albo kilka), aż uzbiera się tekst.
// Ramek (callout) nie przesuwamy – często to treść o bezpieczeństwie, która musi zostać przy swoim fragmencie.
import type { ArticleBlock } from "./types";

export const MIN_SENTENCES_BETWEEN = 3;
const CONTAINER = new Set<ArticleBlock["t"]>(["figure", "art", "cta", "callout"]);
const MOVABLE = new Set<ArticleBlock["t"]>(["figure", "art", "cta"]);

export const isContainer = (b: ArticleBlock) => CONTAINER.has(b.t);

/** Liczba zdań w bloku tekstowym (punkt listy liczy się co najmniej jako jedno zdanie). */
export function sentencesIn(b: ArticleBlock): number {
  const count = (t: string) => Math.max(1, (t.replace(/\]\([^)]*\)/g, "").match(/[.!?…]+(?=\s|$|[”"»)])/g) ?? []).length);
  if (b.t === "p" || b.t === "quote") return count(b.text);
  if (b.t === "list") return b.items.reduce((n, x) => n + count(x), 0);
  return 0;
}

const lastContainerIndex = (bs: ArticleBlock[]) => {
  for (let i = bs.length - 1; i >= 0; i--) if (isContainer(bs[i])) return i;
  return -1;
};

/** Kontener, który nie zmieścił się przed końcem: najpóźniejsze miejsce z min. 3 zdaniami przed i po (do sąsiednich kontenerów). */
function placeLate(out: ArticleBlock[], b: ArticleBlock) {
  const textBetween = (from: number, to: number) => out.slice(from, to).reduce((n, x) => n + sentencesIn(x), 0);
  for (let i = out.length; i >= 0; i--) {
    if (i > 0 && isContainer(out[i - 1])) continue;
    let prev = -1;
    for (let k = i - 1; k >= 0; k--) if (isContainer(out[k])) { prev = k; break; }
    let next = -1;
    for (let k = i; k < out.length; k++) if (isContainer(out[k])) { next = k; break; }
    const before = prev < 0 ? Number.POSITIVE_INFINITY : textBetween(prev + 1, i);
    const after = next < 0 ? Number.POSITIVE_INFINITY : textBetween(i, next);
    // nie wstawiamy między nagłówek sekcji a jej pierwszy akapit
    if (before >= MIN_SENTENCES_BETWEEN && after >= MIN_SENTENCES_BETWEEN && !(i > 0 && (out[i - 1].t === "h2" || out[i - 1].t === "h3"))) {
      out.splice(i, 0, b);
      return;
    }
  }
  out.push(b);
}

export function layoutBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  const pending: ArticleBlock[] = [];
  let since = Number.POSITIVE_INFINITY; // przed pierwszym kontenerem nie ma ograniczenia
  const emitContainer = (b: ArticleBlock) => { out.push(b); since = 0; };
  for (const b of blocks) {
    if (isContainer(b)) {
      if (!pending.length && since >= MIN_SENTENCES_BETWEEN) emitContainer(b);
      else if (MOVABLE.has(b.t)) pending.push(b);
      else {
        // ramka zostaje na miejscu – jeśli tuż przed nią stoi przesuwalny kontener, to on idzie dalej (za ramkę i tekst)
        while (since < MIN_SENTENCES_BETWEEN) {
          const at = lastContainerIndex(out);
          if (at < 0 || !MOVABLE.has(out[at].t)) break;
          pending.unshift(out.splice(at, 1)[0]);
          const prev = lastContainerIndex(out);
          since = prev < 0 ? Number.POSITIVE_INFINITY : out.slice(prev + 1).reduce((n, x) => n + sentencesIn(x), 0);
        }
        emitContainer(b);
      }
      continue;
    }
    if (b.t === "mapa") { while (pending.length) placeLate(out, pending.shift()!); out.push(b); since = 0; continue; }
    out.push(b);
    since += sentencesIn(b);
    while (pending.length && since >= MIN_SENTENCES_BETWEEN) emitContainer(pending.shift()!);
  }
  while (pending.length) placeLate(out, pending.shift()!);
  return out;
}
