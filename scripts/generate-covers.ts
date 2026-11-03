// Generuje zdjęciowe okładki materiałów „Wiedza” przez OpenAI Images na podstawie photoBrief z src/knowledge/covers.ts.
// Zapisuje public/img/wiedza/<slug>.jpg i ustawia photo: true dla tego materiału.
//
//   OPENAI_API_KEY=… npx tsx scripts/generate-covers.ts             # brakujące okładki
//   OPENAI_API_KEY=… npx tsx scripts/generate-covers.ts --force     # wszystkie od nowa
//   OPENAI_API_KEY=… npx tsx scripts/generate-covers.ts --only 21-pytan-o-relacji
//
// Za proxy (np. środowisko w chmurze) uruchom z NODE_USE_ENV_PROXY=1.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COVERS } from "../src/knowledge/covers";

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const STYLE = [
  "Editorial documentary photograph, natural light, warm muted palette (ivory, sand, terracotta, deep green), subtle film grain, shallow depth of field.",
  "Emotional, quiet, intimate, honest – not a stock photo, no posed smiling couples.",
  "No text, no letters, no logos, no watermarks. If people appear, faces are not clearly visible (profile, back, hands, silhouette).",
  "Vertical composition with calm empty space in the upper third for a title overlay.",
].join(" ");

const OUT = join(process.cwd(), "public/img/wiedza");
const COVERS_FILE = join(process.cwd(), "src/knowledge/covers.ts");

async function generate(slug: string, brief: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt: `${brief}\n\n${STYLE}`, size: "1024x1536", quality: "high", output_format: "jpeg", n: 1 }),
  });
  const json = (await res.json()) as { data?: { b64_json?: string }[]; error?: { message: string } };
  if (!res.ok || !json.data?.[0]?.b64_json) throw new Error(`${slug}: ${json.error?.message ?? res.status}`);
  return Buffer.from(json.data[0].b64_json, "base64");
}

function enablePhoto(slug: string) {
  const src = readFileSync(COVERS_FILE, "utf8");
  const start = src.indexOf(`"${slug}": {`);
  if (start < 0) return;
  const end = src.indexOf("\n  },", start);
  const block = src.slice(start, end).replace("photo: false,", "photo: true,");
  writeFileSync(COVERS_FILE, src.slice(0, start) + block + src.slice(end));
}

async function main() {
  if (!KEY) throw new Error("Brak OPENAI_API_KEY w środowisku.");
  mkdirSync(OUT, { recursive: true });
  const todo = Object.entries(COVERS).filter(([slug, c]) => c.photoBrief && (!only || slug === only) && (force || !existsSync(join(OUT, `${slug}.jpg`))));
  if (!todo.length) return console.log("Nic do wygenerowania (użyj --force, aby nadpisać).");
  for (const [slug, c] of todo) {
    process.stdout.write(`→ ${slug}… `);
    try {
      writeFileSync(join(OUT, `${slug}.jpg`), await generate(slug, c.photoBrief));
      enablePhoto(slug);
      console.log("ok");
    } catch (e) {
      console.log(`błąd: ${(e as Error).message}`);
      process.exitCode = 1;
    }
  }
}

main();
