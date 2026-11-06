// Obrazek do udostępniania (Open Graph / social), 1200×630, w barwach DUO: /og?t=Tytuł&k=Nadtytuł
import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

let fonts: { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }[] | null = null;
function loadFonts() {
  if (fonts) return fonts;
  const f = (pkg: string, file: string) => readFileSync(path.join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));
  fonts = [
    { name: "Fraunces", data: f("fraunces", "fraunces-latin-500-normal.woff"), weight: 500, style: "normal" },
    { name: "Fraunces", data: f("fraunces", "fraunces-latin-ext-500-normal.woff"), weight: 500, style: "normal" },
    { name: "Inter", data: f("inter", "inter-latin-400-normal.woff"), weight: 400, style: "normal" },
    { name: "Inter", data: f("inter", "inter-latin-ext-400-normal.woff"), weight: 400, style: "normal" },
    { name: "Inter", data: f("inter", "inter-latin-600-normal.woff"), weight: 600, style: "normal" },
    { name: "Inter", data: f("inter", "inter-latin-ext-600-normal.woff"), weight: 600, style: "normal" },
  ];
  return fonts;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const title = clip(q.get("t") || "Nie wiesz, co dalej z Waszą relacją?", 110);
  const kicker = clip(q.get("k") || "Terapia małżeństw i par", 60);
  const size = title.length > 80 ? 54 : title.length > 50 ? 64 : 74;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fbf9f5", padding: "64px 72px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <div style={{ width: 22, height: 40, borderRadius: 11, background: "#a9512f" }} />
            <div style={{ width: 40, height: 20, borderRadius: "0 0 20px 20px", background: "#eadccb" }} />
            <div style={{ width: 22, height: 40, borderRadius: 11, background: "#36493d" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Fraunces", fontSize: 40, color: "#36493d", lineHeight: 1 }}>DUO®</span>
            <span style={{ fontSize: 15, letterSpacing: 5, color: "#36493d", marginTop: 6 }}>TERAPIA MAŁŻEŃSTW</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, color: "#a9512f", textTransform: "uppercase" }}>{kicker}</span>
          <span style={{ fontFamily: "Fraunces", fontSize: size, lineHeight: 1.08, color: "#1f2a23", marginTop: 18, maxWidth: 1000 }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 24, color: "#5b6b60" }}>Mapa Relacji · psycholog online · indywidualnie lub razem</span>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#e07f78" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#a9512f" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#36493d" }} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadFonts(), headers: { "cache-control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
