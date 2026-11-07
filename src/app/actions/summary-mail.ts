"use server";

// Wysłanie podsumowania z materiału na e-mail osoby (na jej prośbę): sam link (domyślnie, bezpieczniej) albo z treścią.
// Kontakt dostaje tag #podsumowanie – do dalszych wiadomości dobranych do materiału i zaproszenia do Mapy Relacji.
import { contentReader, loadAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { env } from "@/lib/env";
import { customerMailConfigured, notifyCustomer } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { summarize } from "@/knowledge/fields";
import { magnetBySlug } from "@/knowledge/registry";

export async function emailSummary(slug: string, withContent: boolean): Promise<{ ok: true; to: string } | { ok: false; error: string }> {
  const m = magnetBySlug(slug);
  if (!m) return { ok: false, error: "Nie znaleziono materiału." };
  if (!customerMailConfigured()) return { ok: false, error: "Wysyłka e-maili nie jest jeszcze skonfigurowana. Możesz wydrukować podsumowanie albo zapisać je jako PDF." };
  if (!(await hit(`summ:${await clientIp()}`, 4, 30 * 60))) return { ok: false, error: "Podsumowanie zostało już wysłane kilka razy. Spróbuj później." };
  const d = await system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return null;
    const a = await loadAnswers(tx, who.email, m.id);
    const [l] = await tx<{ short_code: string | null; name: string | null }[]>`select short_code, name from content_leads where lower(email) = ${who.email} and magnet_id = ${m.id} order by created_at desc limit 1`;
    return { email: who.email, groups: summarize(m, a?.data ?? {}), id: a?.id ?? null, code: l?.short_code ?? null, name: l?.name ?? null };
  });
  if (!d) return { ok: false, error: "Wysyłka jest dostępna po odebraniu materiału na Twój e-mail." };
  if (!d.groups.length) return { ok: false, error: "Podsumowanie jest jeszcze puste – uzupełnij choć jedną odpowiedź." };
  const link = d.code ? `${env.appUrl}/plan/${d.code}?d=podsumowanie` : `${env.appUrl}/wiedza/${m.slug}/podsumowanie`;
  const body = withContent
    ? d.groups.map((g) => [`– ${g.section} –`, ...g.items.map((it) => `${it.label}\n${it.value}`)].join("\n\n")).join("\n\n")
    : "";
  const text = [
    `${d.name ? `${d.name}, oto` : "Oto"} Twoje podsumowanie: ${m.short}.`,
    "",
    "Pokazuje Twoją perspektywę – to, co sam / sama zauważasz. To nie jest jeszcze pełna Mapa Relacji ani diagnoza.",
    "",
    `Otwórz podsumowanie: ${link}`,
    ...(body ? ["", body] : []),
    "",
    `Gdy zechcesz rozwinąć je w pełny obraz sytuacji z psychologiem i konkretne wskazówki, co dalej: ${env.appUrl}/mapa-relacji?utm_source=duo_wiedza&utm_medium=email&utm_campaign=${m.id}`,
    "",
    "Zespół DUO",
  ].join("\n");
  const sent = await notifyCustomer(d.email, `Twoje podsumowanie: ${m.short}`, text);
  if (!sent) return { ok: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę." };
  await system(async (tx) => {
    if (d.id) await tx`update content_answers set summary_emailed_at = now() where id = ${d.id}`;
    await tx`update mail_contacts set tags = (select array(select distinct unnest(tags || array['podsumowanie']::text[]))), updated_at = now() where email_lc = ${d.email}`;
  });
  return { ok: true, to: d.email };
}
