"use server";

// Panel „Mailing” (tylko administrator): edycja sekwencji i e-maili, warunki tagów, tagi kontaktów, test i ręczne uruchomienie.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { parseTags, renderMail, resendConfigured, runMailing, sendViaResend, STEP_CODE_RE, type StepRow } from "@/lib/mailing";
import { parseStepsCsv } from "@/lib/mailing-csv";

type R = { error?: string; ok?: string } | undefined;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function saveStepAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  const sequence = str(fd, "sequence_id");
  const code = str(fd, "code").toLowerCase();
  const delay = Number(str(fd, "delay_days"));
  const subject = str(fd, "subject");
  const body = str(fd, "body");
  const ctaUrl = str(fd, "cta_url") || "/";
  if (!["lead", "customer"].includes(sequence)) return { error: "Nieznana ścieżka." };
  if (!STEP_CODE_RE.test(code)) return { error: "Kod e-maila: 1–2 litery i numer, np. n9 albo k5 (to część linku /n9/…)." };
  if (!Number.isInteger(delay) || delay < 0 || delay > 365) return { error: "Opóźnienie: liczba dni od 0 do 365." };
  if (!subject || subject.length > 200) return { error: "Podaj temat (do 200 znaków)." };
  if (!body) return { error: "Podaj treść wiadomości." };
  if (!/^\/(?!\/)/.test(ctaUrl) || /\s/.test(ctaUrl)) return { error: "Link CTA musi być adresem na stronie, zaczynającym się od „/”, np. /mapa-relacji." };
  const v = {
    code, delay, subject, body, ctaUrl,
    preheader: str(fd, "preheader").slice(0, 200),
    ctaLabel: str(fd, "cta_label").slice(0, 80),
    include: parseTags(str(fd, "include_tags")),
    exclude: parseTags(str(fd, "exclude_tags")),
    active: fd.get("active") === "on",
  };
  let newId: string | null = null;
  try {
    await asStaff(s, async (tx) => {
      if (id) {
        await tx`update mail_steps set code = ${v.code}, delay_days = ${v.delay}, subject = ${v.subject}, preheader = ${v.preheader}, body = ${v.body},
                   cta_label = ${v.ctaLabel}, cta_url = ${v.ctaUrl}, include_tags = ${v.include}, exclude_tags = ${v.exclude}, active = ${v.active}, updated_at = now()
                 where id = ${id}`;
        await audit(tx, s.actor, "mail_step_updated", "mail_step", id, null, { code: v.code });
      } else {
        const [{ pos }] = await tx`select coalesce(max(position), 0) + 1 as pos from mail_steps where sequence_id = ${sequence}`;
        const [r] = await tx`insert into mail_steps (sequence_id, code, position, delay_days, subject, preheader, body, cta_label, cta_url, include_tags, exclude_tags, active)
                             values (${sequence}, ${v.code}, ${pos}, ${v.delay}, ${v.subject}, ${v.preheader}, ${v.body}, ${v.ctaLabel}, ${v.ctaUrl}, ${v.include}, ${v.exclude}, ${v.active}) returning id`;
        newId = r.id;
        await audit(tx, s.actor, "mail_step_created", "mail_step", r.id, null, { code: v.code });
      }
    });
  } catch (e) {
    if (String((e as Error).message).includes("mail_steps_code_key")) return { error: `Kod „${v.code}” jest już używany przez inny e-mail.` };
    throw e;
  }
  revalidatePath("/app/mailing");
  if (newId) redirect(`/app/mailing/${newId}`);
  return { ok: "Zapisano." };
}

export async function deleteStepAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  const blocked = await asStaff(s, async (tx) => {
    const [{ n }] = await tx`select count(*)::int as n from mail_sends where step_id = ${id} and status = 'sent'`;
    if (n > 0) return n;
    await tx`delete from mail_steps where id = ${id}`;
    await audit(tx, s.actor, "mail_step_deleted", "mail_step", id);
    return 0;
  });
  if (blocked) return { error: `Ten e-mail został już wysłany ${blocked} razy – zamiast usuwać, odznacz „Aktywny”, żeby zachować historię kliknięć.` };
  revalidatePath("/app/mailing");
  redirect("/app/mailing");
}

export async function saveSequenceAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  if (!["lead", "customer"].includes(id)) return { error: "Nieznana ścieżka." };
  const active = fd.get("active") === "on";
  const consent = fd.get("requires_consent") === "on";
  await asStaff(s, async (tx) => {
    await tx`update mail_sequences set active = ${active}, requires_consent = ${consent}, updated_at = now() where id = ${id}`;
    await audit(tx, s.actor, "mail_sequence_updated", "mail_sequence", null, null, { id, active, consent });
  });
  revalidatePath("/app/mailing");
  return { ok: active ? (resendConfigured() ? "Ścieżka włączona – wiadomości wyjdą przy najbliższym uruchomieniu harmonogramu." : "Ścieżka włączona, ale Resend nie jest jeszcze skonfigurowany – nic nie zostanie wysłane.") : "Ścieżka wyłączona." };
}

/** Test wyłącznie na adres zalogowanego administratora – nigdy do klientów. */
export async function sendTestAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  if (!resendConfigured()) return { error: "Resend nie jest skonfigurowany (RESEND_API_KEY, MAIL_FROM)." };
  const step = await asStaff(s, async (tx) => (await tx<StepRow[]>`select * from mail_steps where id = ${id}`)[0]);
  if (!step) return { error: "Nie znaleziono e-maila." };
  const mail = renderMail(step, { code: "podglad0", name: s.user.name });
  const r = await sendViaResend(s.user.email, { ...mail, subject: `[TEST] ${mail.subject}` });
  return r.ok ? { ok: `Wysłano test na ${s.user.email}.` } : { error: `Resend: ${r.error}` };
}

export async function runNowAction(_: R): Promise<R> {
  await requireStaff("admin");
  const r = await runMailing(50);
  revalidatePath("/app/mailing");
  if (r.reason && !r.sent) return { error: r.reason };
  return { ok: `Wysłano: ${r.sent}, pominięto (warunki tagów): ${r.skipped}${r.failed ? `, błędy: ${r.failed}` : ""}.${r.reason ? ` ${r.reason}` : ""}` };
}

export async function contactTagsAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  const tags = parseTags(str(fd, "tags"));
  await asStaff(s, async (tx) => {
    await tx`update mail_contacts set tags = ${tags}, updated_at = now() where id = ${id}`;
    await audit(tx, s.actor, "mail_contact_tags", "mail_contact", id, null, { tags: tags.join(",") });
  });
  revalidatePath(`/app/mailing/kontakty/${id}`);
  return { ok: "Tagi zapisane." };
}

export async function contactUnsubscribeAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const id = str(fd, "id");
  await asStaff(s, async (tx) => {
    await tx`update mail_contacts set unsubscribed_at = coalesce(unsubscribed_at, now()), marketing_consent = false, updated_at = now() where id = ${id}`;
    await audit(tx, s.actor, "mail_contact_unsubscribed", "mail_contact", id);
  });
  revalidatePath(`/app/mailing/kontakty/${id}`);
  return { ok: "Kontakt wypisany – nie dostanie więcej wiadomości z sekwencji." };
}

/** Import e-maili z CSV: dopasowanie po kodzie – istniejące aktualizuje, nowe dodaje; niczego nie usuwa. Błąd w pliku = brak zmian. */
export async function importStepsCsvAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Wybierz plik CSV." };
  if (file.size > 2_000_000) return { error: "Plik jest za duży (maks. 2 MB)." };
  const { rows, errors } = parseStepsCsv(await file.text());
  if (errors.length) return { error: `Nic nie zmieniono. ${errors.slice(0, 8).join(" · ")}${errors.length > 8 ? ` · …i ${errors.length - 8} więcej` : ""}` };
  if (!rows.length) return { error: "Brak wierszy do zaimportowania." };
  const res = await asStaff(s, async (tx) => {
    let updated = 0;
    let added = 0;
    for (const r of rows) {
      const [ex] = await tx<{ id: string }[]>`select id from mail_steps where code = ${r.code}`;
      if (ex) {
        await tx`update mail_steps set sequence_id = ${r.sequence_id}, position = case when ${r.position} > 0 then ${r.position} else position end,
                   delay_days = ${r.delay_days}, subject = ${r.subject}, preheader = ${r.preheader}, body = ${r.body}, cta_label = ${r.cta_label},
                   cta_url = ${r.cta_url}, include_tags = ${r.include_tags}, exclude_tags = ${r.exclude_tags}, active = ${r.active}, updated_at = now()
                 where id = ${ex.id}`;
        updated++;
      } else {
        const [{ pos }] = await tx<{ pos: number }[]>`select coalesce(max(position), 0) + 1 as pos from mail_steps where sequence_id = ${r.sequence_id}`;
        await tx`insert into mail_steps (sequence_id, code, position, delay_days, subject, preheader, body, cta_label, cta_url, include_tags, exclude_tags, active)
                 values (${r.sequence_id}, ${r.code}, ${r.position > 0 ? r.position : pos}, ${r.delay_days}, ${r.subject}, ${r.preheader}, ${r.body}, ${r.cta_label}, ${r.cta_url}, ${r.include_tags}, ${r.exclude_tags}, ${r.active})`;
        added++;
      }
    }
    await audit(tx, s.actor, "mail_steps_imported", "mail_step", null, null, { updated, added });
    return { updated, added };
  });
  revalidatePath("/app/mailing");
  return { ok: `Zaimportowano: zaktualizowane ${res.updated}, nowe ${res.added}. E-maili spoza pliku nie zmieniono.` };
}
