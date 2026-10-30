// Generowanie PDF podsumowania lokalnie (Chromium przez playwright-core) – bez zewnętrznych usług.
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { env } from "./env";

let fontCss: string | null = null;

/** Czcionki osadzane w PDF (polskie znaki: zakres latin + latin-ext). */
export function embeddedFontCss(): string {
  if (fontCss) return fontCss;
  const f = (pkg: string, file: string) =>
    readFileSync(path.join(process.cwd(), "node_modules/@fontsource-variable", pkg, "files", file)).toString("base64");
  const face = (family: string, data: string, range: string) =>
    `@font-face{font-family:"${family}";font-weight:100 900;font-style:normal;src:url(data:font/woff2;base64,${data}) format("woff2");unicode-range:${range};}`;
  const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+25CB,U+25CF";
  const EXT = "U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
  fontCss = [
    face("Inter Variable", f("inter", "inter-latin-wght-normal.woff2"), LATIN),
    face("Inter Variable", f("inter", "inter-latin-ext-wght-normal.woff2"), EXT),
    face("Fraunces Variable", f("fraunces", "fraunces-latin-wght-normal.woff2"), LATIN),
    face("Fraunces Variable", f("fraunces", "fraunces-latin-ext-wght-normal.woff2"), EXT),
  ].join("\n");
  return fontCss;
}

function executablePath(): string | undefined {
  if (env.chromiumPath) return env.chromiumPath;
  try {
    // środowisko developerskie: Chromium zainstalowany przez Playwright
    return chromium.executablePath();
  } catch {
    return undefined;
  }
}

export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await chromium.launch({ executablePath: executablePath(), args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    // brak dostępu do sieci podczas renderowania – wszystko jest osadzone w HTML
    await page.route("**/*", (r) => (r.request().url().startsWith("data:") ? r.continue() : r.abort()));
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#8a9290;text-align:right;padding:0 16mm;font-family:sans-serif"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
      margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
