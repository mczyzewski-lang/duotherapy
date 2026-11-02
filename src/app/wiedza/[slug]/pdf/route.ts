// PDF materiału – generowany z tego samego źródła co /demo (wydruk strony /druk) i buforowany.
import { magnetBySlug } from "@/knowledge/registry";
import { materialPdf } from "@/lib/material-pdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const m = magnetBySlug((await params).slug);
  if (!m) return new Response("Nie znaleziono", { status: 404 });
  try {
    const pdf = await materialPdf(m, new URL(req.url).origin);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="DUO-${m.slug}.pdf"`,
        "cache-control": "public, max-age=3600",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  } catch (e) {
    console.error("PDF materiału:", (e as Error).message);
    return new Response("Nie udało się przygotować PDF. Spróbuj ponownie za chwilę albo otwórz materiał online.", { status: 503 });
  }
}
