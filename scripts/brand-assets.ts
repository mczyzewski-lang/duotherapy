// Generuje favicon (SVG + PNG dla iOS) ze znaku marki oraz pliki znaku Mapy Relacji: npm run brand:assets
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { mapaSymbolSvg, symbolSvg } from "../src/lib/brand-mark";

async function main() {
  // favicon: znak na kwadratowym polu, wycentrowany
  const inner = symbolSvg("fav").replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 42">', "").replace("</svg>", "");
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -16.5 75 75">${inner}</svg>`;
  writeFileSync("src/app/icon.svg", icon);
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const p = await b.newPage({ viewport: { width: 180, height: 180 } });
  await p.setContent(`<body style="margin:0;background:#fbf9f5;display:grid;place-items:center;height:180px"><div style="width:140px">${symbolSvg("a")}</div></body>`);
  writeFileSync("src/app/apple-icon.png", await p.screenshot());
  // Mapa Relacji: znak (SVG) + PNG 1200 px na przezroczystym tle (social, materiały)
  mkdirSync("public/brand", { recursive: true });
  writeFileSync("public/brand/mapa-relacji-znak.svg", mapaSymbolSvg("m"));
  writeFileSync("public/brand/duo-znak.svg", symbolSvg("d"));
  const m = await b.newPage({ viewport: { width: 1200, height: 343 } });
  await m.setContent(`<body style="margin:0;background:transparent"><div style="width:1200px">${mapaSymbolSvg("p")}</div></body>`);
  writeFileSync("public/brand/mapa-relacji-znak.png", await m.screenshot({ omitBackground: true }));
  await b.close();
}
main();
