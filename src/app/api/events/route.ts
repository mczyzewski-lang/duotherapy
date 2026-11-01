// Odbiór zdarzeń lejka (bez treści odpowiedzi, bez IP). Ograniczenie liczby zdarzeń na adres.
import { NextResponse } from "next/server";
import { z } from "zod";
import { withActor } from "@/lib/db";
import { FUNNEL_EVENTS } from "@/lib/mapa-quiz";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { readSettings } from "@/lib/settings";

const Schema = z.object({
  // lead_submitted zapisuje wyłącznie serwer (po faktycznym zapisie zgłoszenia)
  event: z.enum(FUNNEL_EVENTS).refine((e) => e !== "lead_submitted"),
  step: z.number().int().min(1).max(6).optional(),
  anonId: z.string().regex(/^[a-zA-Z0-9]{8,64}$/),
  variant: z.enum(["A", "B"]).nullable().optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  path: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse(null, { status: 403 });
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const r = Schema.safeParse(body);
  if (!r.success) return new NextResponse(null, { status: 400 });
  if (!(await hit(`ev:${await clientIp()}`, 200, 600))) return new NextResponse(null, { status: 429 });
  const e = r.data;
  await withActor({ kind: "public" }, async (tx) => {
    const s = await readSettings(tx);
    if (!s.site.funnelTracking) return;
    await tx`insert into funnel_events (event, anon_id, variant, step, utm_source, utm_medium, utm_campaign, path)
             values (${e.event}, ${e.anonId}, ${e.variant ?? null}, ${e.step ?? null}, ${e.utm_source ?? null}, ${e.utm_medium ?? null}, ${e.utm_campaign ?? null}, ${e.path ?? null})`;
  });
  return new NextResponse(null, { status: 204 });
}
