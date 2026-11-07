"use server";

// Autozapis odpowiedzi w materiale (wersja online). Tylko dla osoby zapisanej na ten materiał (ciasteczko).
import { contentReader, storeAnswers } from "@/lib/content-access";
import { system } from "@/lib/db";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { filledCount, sanitizeAnswers } from "@/knowledge/fields";
import { magnetBySlug } from "@/knowledge/registry";

export async function saveAnswers(slug: string, data: Record<string, string | boolean>): Promise<{ ok: boolean; error?: string; retry?: boolean }> {
  try {
    return await saveAnswersInner(slug, data);
  } catch (e) {
    console.error("[wiedza] zapis odpowiedzi nie powiódł się:", e);
    return { ok: false, error: "Nie udało się zapisać – ponawiam…", retry: true };
  }
}

async function saveAnswersInner(slug: string, data: Record<string, string | boolean>): Promise<{ ok: boolean; error?: string; retry?: boolean }> {
  const m = magnetBySlug(slug);
  if (!m || m.special) return { ok: false, error: "Nie znaleziono materiału." };
  if (JSON.stringify(data ?? {}).length > 120_000) return { ok: false, error: "Za dużo tekstu do zapisania naraz." };
  if (!(await hit(`ans:${await clientIp()}`, 240, 10 * 60))) return { ok: false, error: "Zbyt wiele zapisów. Odczekaj chwilę." };
  return system(async (tx) => {
    const who = await contentReader(tx);
    if (!who || !who.magnets.includes(m.id)) return { ok: false, error: "Zapis jest dostępny po odebraniu materiału na Twój e-mail." };
    const clean = sanitizeAnswers(m, data);
    await storeAnswers(tx, who.email, m.id, clean, filledCount(clean));
    return { ok: true };
  });
}
