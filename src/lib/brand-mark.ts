// Geometria i kolory znaku DUO® (bez JSX – używane też w PDF i favicon).

export const BRAND = {
  terracotta: ["#E2A07F", "#A9512F"],
  terracottaHead: ["#D6845F", "#A55536"],
  sand: ["#ECDCCB", "#B89B7F"],
  green: ["#97AC9C", "#2D4939"],
  greenHead: ["#7A9686", "#3B5A4A"],
  wordmark: "#36433A",
  wordmarkWarm: "#5B4335",
};

export const BODY_LEFT = "M0.5 11.7H3.5C12 11.7 18.6 18.6 18.6 26.4C18.6 34.6 12.3 41 4.6 41H1.6A1.1 1.1 0 0 1 0.5 39.9Z";
export const BOWL = "M20.6 26.7H49.6A14.5 14.3 0 0 1 20.6 26.7Z";

/** Surowy SVG symbolu (do favicon i PDF). */
export function symbolSvg(id = "duo"): string {
  const g = (n: string, [a, b]: string[]) =>
    `<linearGradient id="${id}-${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 42"><defs>${g("t", BRAND.terracotta)}${g("th", BRAND.terracottaHead)}${g("s", BRAND.sand)}${g("g", BRAND.green)}${g("gh", BRAND.greenHead)}</defs>
<circle cx="7" cy="4.9" r="4.8" fill="url(#${id}-th)"/><path d="${BODY_LEFT}" fill="url(#${id}-t)"/>
<path d="${BOWL}" fill="url(#${id}-s)"/>
<circle cx="64" cy="4.9" r="4.8" fill="url(#${id}-gh)"/><path d="${BODY_LEFT}" transform="matrix(-1 0 0 1 71 0)" fill="url(#${id}-g)"/></svg>`;
}


// ---------------------------------------------------------------------------
// Znak produktu „Mapa Relacji”: trzy drogi w stylu symbolu DUO
// serce (odbudowa) · klepsydra z dwóch „mis” (czas na decyzję) · strzałki w dwie strony (rozstanie)
export const MAPA = {
  heart: ["#F6B8AE", "#E07F78"],
  hourglass: ["#E2A07F", "#A9512F"],
  split: ["#97AC9C", "#2D4939"],
};
export const MAPA_HEART = "M16 29.5C6.5 22 1.5 16.2 1.5 10.2 1.5 5.6 5 2.2 9.2 2.2c2.9 0 5.3 1.6 6.8 4.1 1.5-2.5 3.9-4.1 6.8-4.1 4.2 0 7.7 3.4 7.7 8 0 6-5 11.8-14.5 19.3Z";
export const MAPA_GLASS_TOP = "M2.5 2H29.5A13.5 13.4 0 0 1 2.5 2Z";
export const MAPA_GLASS_BOTTOM = "M2.5 30H29.5A13.5 13.4 0 0 0 2.5 30Z";
export const MAPA_ARROW_LEFT = "M1.5 16 11 6.8V12.4H15V19.6H11V25.2Z";
export const MAPA_ARROW_RIGHT = "M30.5 16 21 6.8V12.4H17V19.6H21V25.2Z";

/** Surowy SVG znaku Mapy Relacji (112×32). */
export function mapaSymbolSvg(id = "mapa"): string {
  const g = (n: string, [a, b]: string[]) =>
    `<linearGradient id="${id}-${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 32"><defs>${g("h", MAPA.heart)}${g("g", MAPA.hourglass)}${g("s", MAPA.split)}</defs>
<path d="${MAPA_HEART}" fill="url(#${id}-h)"/>
<g transform="translate(40 0)"><path d="${MAPA_GLASS_TOP}" fill="url(#${id}-g)"/><path d="${MAPA_GLASS_BOTTOM}" fill="url(#${id}-g)" opacity="0.85"/></g>
<g transform="translate(80 0)" stroke-linejoin="round" stroke-width="1.6"><path d="${MAPA_ARROW_LEFT}" fill="url(#${id}-s)" stroke="url(#${id}-s)"/><path d="${MAPA_ARROW_RIGHT}" fill="url(#${id}-s)" stroke="url(#${id}-s)"/></g></svg>`;
}

export type Road = "rebuild" | "clarity" | "separate";

/** Surowy SVG pojedynczego znaku drogi (32×32) – do PDF/HTML poza Reactem. */
export function roadGlyphSvg(road: Road, id = "road", size = 12): string {
  const gid = `${id}-${road}`;
  const [a, b] = road === "rebuild" ? MAPA.heart : road === "clarity" ? MAPA.hourglass : MAPA.split;
  const body =
    road === "rebuild"
      ? `<path d="${MAPA_HEART}" fill="url(#${gid})"/>`
      : road === "clarity"
        ? `<path d="${MAPA_GLASS_TOP}" fill="url(#${gid})"/><path d="${MAPA_GLASS_BOTTOM}" fill="url(#${gid})" opacity="0.85"/>`
        : `<g stroke-linejoin="round" stroke-width="1.6"><path d="${MAPA_ARROW_LEFT}" fill="url(#${gid})" stroke="url(#${gid})"/><path d="${MAPA_ARROW_RIGHT}" fill="url(#${gid})" stroke="url(#${gid})"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" style="vertical-align:-1.5pt" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>${body}</svg>`;
}

/** Która z trzech dróg odpowiada odpowiedzi/segmentowi (null = brak odpowiednika, np. bezpieczeństwo). */
export function roadFor(key: string | null | undefined): Road | null {
  if (key === "rebuild") return "rebuild";
  if (key === "unsure" || key === "clarity") return "clarity";
  if (key === "separate") return "separate";
  return null;
}
