// Powrót z bramki płatności przyciskiem „wróć” – oznaczamy płatność jako przerwaną (bez zmiany statusu zamówienia;
// sesja u operatora może być nadal ważna, a ostateczny stan ustali powiadomienie operatora).
import { NextResponse } from "next/server";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { leadFromCookie } from "@/lib/lead-session";

export async function GET(req: Request) {
  const o = new URL(req.url).searchParams.get("o") ?? "";
  if (/^[0-9a-f-]{36}$/.test(o)) {
    await system(async (tx) => {
      const lead = await leadFromCookie(tx);
      if (!lead) return;
      const r = await tx`update orders set returned_cancel_at = now(), updated_at = now() where id = ${o} and lead_id = ${lead.id} and status in ('created', 'open') returning id`;
      if (r.length) await tx`insert into lead_activities (lead_id, kind, content) values (${lead.id}, 'system', 'Klient wrócił z bramki płatności bez zapłaty (płatność przerwana).')`;
    });
  }
  return NextResponse.redirect(`${env.appUrl}/twoja-mapa?platnosc=przerwana#oferta`, 303);
}
