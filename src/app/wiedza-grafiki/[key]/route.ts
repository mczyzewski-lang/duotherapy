// Ilustracja artykułu z bazy (publiczna grafika, bez danych osobowych).
import { system } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[a-z0-9-]{3,160}$/.test(key)) return new Response("Nie znaleziono", { status: 404 });
  const [r] = await system((tx) => tx<{ mime: string; data: Buffer }[]>`select mime, data from article_images where key = ${key}`);
  if (!r) return new Response("Nie znaleziono", { status: 404 });
  return new Response(new Uint8Array(r.data), { headers: { "Content-Type": r.mime, "Cache-Control": "public, max-age=31536000, immutable" } });
}
