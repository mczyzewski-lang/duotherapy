// Zdjęcie okładki materiału z bazy (publiczne – to grafika okładki, bez danych osobowych).
import { system } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return new Response("Nie znaleziono", { status: 404 });
  const variant = new URL(req.url).searchParams.get("s") === "illustration" ? "illustration" : "photo";
  const [r] = await system((tx) => tx<{ mime: string; data: Buffer }[]>`select mime, data from cover_images where slug = ${slug} and variant = ${variant}`);
  if (!r) return new Response("Nie znaleziono", { status: 404 });
  return new Response(new Uint8Array(r.data), {
    headers: { "Content-Type": r.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Robots-Tag": "noindex" },
  });
}
