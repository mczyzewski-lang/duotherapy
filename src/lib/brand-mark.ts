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

