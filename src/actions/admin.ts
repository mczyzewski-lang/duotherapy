"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { hashPassword, newToken, passwordProblem } from "@/lib/crypto";
import { saveSettingsSection, type Settings } from "@/lib/settings";
import { createDraft, insertQuestion, publishDraft } from "@/lib/templates";

type R = { error?: string; ok?: string } | undefined;
const QUESTION_TYPES = ["text", "textarea", "date", "email", "phone", "country_city", "children", "single", "multi", "scale5", "screening", "consent", "signature", "info"] as const;

export async function createDraftAction(fd: FormData) {
  const s = await requireStaff("admin");
  const templateId = String(fd.get("template_id"));
  const id = await asStaff(s, async (tx) => {
    const v = await createDraft(tx, templateId, s.user.id);
    await audit(tx, s.actor, "template_draft_created", "template_version", v);
    return v;
  });
  redirect(`/app/templates/${id}`);
}

const OptionsSchema = z.array(z.object({ value: z.string().min(1).max(60), label: z.string().min(1).max(500), detailLabel: z.string().max(100).optional() })).max(30);

export async function saveQuestionAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const versionId = String(fd.get("version_id"));
  const qid = String(fd.get("question_id") || "");
  const type = String(fd.get("type"));
  if (!QUESTION_TYPES.includes(type as never)) return { error: "Nieznany typ pola." };
  let options: z.infer<typeof OptionsSchema> | null = null;
  const rawOpts = String(fd.get("options") ?? "").trim();
  if (rawOpts) {
    // format: wartość | etykieta | (opcjonalnie) etykieta pola dodatkowego – jedna opcja w linii
    options = rawOpts.split("\n").filter(Boolean).map((l) => {
      const [value, label, detailLabel] = l.split("|").map((x) => x.trim());
      return { value, label: label ?? value, ...(detailLabel ? { detailLabel } : {}) };
    });
    const ok = OptionsSchema.safeParse(options);
    if (!ok.success) return { error: "Niepoprawny format opcji (wartość | etykieta | pole dodatkowe)." };
  }
  if ((type === "single" || type === "multi") && !options?.length) return { error: "Pytanie wyboru wymaga opcji." };
  const prompt = String(fd.get("prompt") ?? "").trim();
  if (!prompt) return { error: "Treść pytania jest wymagana." };
  const fields = {
    prompt,
    hint: String(fd.get("hint") ?? "").trim() || null,
    type,
    required: fd.get("required") === "on",
    allow_na: fd.get("allow_na") === "on",
    group_label: String(fd.get("group_label") ?? "").trim() || null,
    source_number: String(fd.get("source_number") ?? "").trim() || null,
    tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  };
  try {
    await asStaff(s, async (tx) => {
      if (qid) {
        await tx`update questions set prompt = ${fields.prompt}, hint = ${fields.hint}, type = ${fields.type}, required = ${fields.required}, allow_na = ${fields.allow_na},
                 group_label = ${fields.group_label}, source_number = ${fields.source_number}, tags = ${fields.tags}, options = ${options ? tx.json(options) : null}
                 where id = ${qid} and version_id = ${versionId}`;
      } else {
        const section = String(fd.get("section_key"));
        const [{ max }] = await tx`select coalesce(max(ord), 0)::int as max from questions where version_id = ${versionId}`;
        const key = String(fd.get("key") ?? "").trim() || `custom.${newToken().slice(0, 8)}`;
        await insertQuestion(tx, versionId, section, max + 1, {
          key,
          type: fields.type as never,
          prompt: fields.prompt,
          hint: fields.hint,
          options,
          required: fields.required,
          allowNA: fields.allow_na,
          group: fields.group_label,
          sourceNumber: fields.source_number,
          tags: fields.tags,
          source: { file: "edytor", page: 0, note: `Dodane w edytorze przez ${s.user.name}` },
        } as never);
        // nowe pytanie na końcu swojej sekcji
        await renumber(tx, versionId);
      }
      await audit(tx, s.actor, qid ? "question_updated" : "question_added", "template_version", versionId);
    });
  } catch (e) {
    return { error: e instanceof Error && e.message.includes("niezmienne") ? "Opublikowanej wersji nie można zmieniać – utwórz szkic." : "Nie udało się zapisać pytania (sprawdź, czy klucz jest unikalny)." };
  }
  revalidatePath(`/app/templates/${versionId}`);
  return { ok: "Zapisano w szkicu." };
}

async function renumber(tx: Parameters<Parameters<typeof asStaff>[1]>[0], versionId: string) {
  const [v] = await tx`select sections from questionnaire_template_versions where id = ${versionId}`;
  const order = (v.sections as { key: string }[]).map((x) => x.key);
  const qs = await tx`select id, section_key, ord from questions where version_id = ${versionId}`;
  qs.sort((a, b) => order.indexOf(a.section_key) - order.indexOf(b.section_key) || a.ord - b.ord);
  let i = 0;
  for (const q of qs) await tx`update questions set ord = ${i++} where id = ${q.id}`;
}

export async function moveQuestionAction(fd: FormData) {
  const s = await requireStaff("admin");
  const versionId = String(fd.get("version_id"));
  const qid = String(fd.get("question_id"));
  const dir = fd.get("dir") === "up" ? -1 : 1;
  await asStaff(s, async (tx) => {
    const qs = await tx`select id, section_key, ord from questions where version_id = ${versionId} order by ord`;
    const i = qs.findIndex((q) => q.id === qid);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= qs.length || qs[j].section_key !== qs[i].section_key) return;
    await tx`update questions set ord = ${qs[j].ord} where id = ${qs[i].id}`;
    await tx`update questions set ord = ${qs[i].ord} where id = ${qs[j].id}`;
    await audit(tx, s.actor, "question_moved", "template_version", versionId);
  });
  revalidatePath(`/app/templates/${versionId}`);
}

export async function deleteQuestionAction(fd: FormData) {
  const s = await requireStaff("admin");
  const versionId = String(fd.get("version_id"));
  await asStaff(s, async (tx) => {
    await tx`delete from questions where id = ${String(fd.get("question_id"))} and version_id = ${versionId}`;
    await audit(tx, s.actor, "question_deleted", "template_version", versionId);
  });
  revalidatePath(`/app/templates/${versionId}`);
}

export async function publishAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const versionId = String(fd.get("version_id"));
  const note = String(fd.get("change_note") ?? "").trim();
  if (note.length < 5) return { error: "Opisz zmianę (min. 5 znaków)." };
  await asStaff(s, async (tx) => {
    await publishDraft(tx, versionId, note, fd.get("verified") === "on");
    await audit(tx, s.actor, "template_published", "template_version", versionId);
  });
  redirect(`/app/templates/${versionId}`);
}

// ---------------------------------------------------------------------------
export async function saveSettingsAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const section = String(fd.get("section")) as keyof Settings;
  let value: unknown;
  try {
    value = JSON.parse(String(fd.get("json")));
  } catch {
    return { error: "Niepoprawne dane." };
  }
  const schemas: Record<keyof Settings, z.ZodType> = {
    legal: z.object({
      controllerName: z.string(), controllerContact: z.string(), dpoContact: z.string(), processingLocation: z.string(), retentionPolicy: z.string(),
      privacyPolicy: z.string(), questionnaireNotice: z.string().min(20), leadContactConsent: z.string().min(10), leadMarketingConsent: z.string().min(10),
      version: z.string().min(1), approved: z.boolean(),
    }),
    site: z.object({
      priceIndividual: z.string(), priceCouple: z.string(), contactPhone: z.string(), contactEmail: z.string(),
      vslUrl: z.string().refine((v) => !v || /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(v), "Wideo: dozwolone adresy youtube-nocookie.com lub player.vimeo.com"),
      paymentUrl: z.string().refine((v) => !v || v.startsWith("https://"), "Link do płatności musi zaczynać się od https://"),
      faq: z.array(z.object({ q: z.string().min(3), a: z.string().min(3) })),
    }),
    flow: z.object({ invitationDays: z.number().int().min(1).max(90), reportShareDays: z.number().int().min(1).max(365), requirePaymentBeforeQuestionnaire: z.boolean() }),
    helplines: z.object({ items: z.array(z.object({ number: z.string().min(2), when: z.string(), availability: z.string() })).min(1), abroad: z.string(), verifiedNote: z.string(), disclaimer: z.string() }),
  };
  const parsed = schemas[section]?.safeParse(value);
  if (!parsed?.success) return { error: parsed?.error.issues[0]?.message ?? "Niepoprawna sekcja." };
  await asStaff(s, async (tx) => {
    await saveSettingsSection(tx, section, parsed.data as never, s.user.id);
    await audit(tx, s.actor, "settings_updated", "app_settings", null, null, { section });
  });
  revalidatePath("/", "layout");
  return { ok: "Zapisano ustawienia." };
}

export async function createUserAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff("admin");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const role = fd.get("role") === "admin" ? "admin" : "therapist";
  const pw = String(fd.get("password") ?? "");
  const prob = passwordProblem(pw);
  if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 3) return { error: "Podaj e-mail i imię i nazwisko." };
  if (prob) return { error: prob };
  try {
    await asStaff(s, async (tx) => {
      const [u] = await tx<{ id: string }[]>`insert into users (email, name, role, password_hash) values (${email}, ${name}, ${role}, ${await hashPassword(pw)}) returning id`;
      await tx`insert into therapists (user_id, display_name) values (${u.id}, ${name})`;
      await audit(tx, s.actor, "user_created", "user", u.id, null, { role });
    });
  } catch {
    return { error: "Konto o tym adresie już istnieje." };
  }
  revalidatePath("/app/settings");
  return { ok: "Utworzono konto. Przekaż hasło tymczasowe bezpiecznym kanałem – przy pierwszym logowaniu wymagane będzie MFA (w produkcji)." };
}

export async function therapistProfileAction(_: R, fd: FormData): Promise<R> {
  const s = await requireStaff();
  const id = String(fd.get("therapist_id"));
  if (s.user.role !== "admin" && id !== s.user.therapistId) return { error: "Brak uprawnień." };
  await asStaff(s, async (tx) => {
    await tx`update therapists set display_name = ${String(fd.get("display_name") ?? "").trim()}, title = ${String(fd.get("title") ?? "").trim() || null},
             bio = ${String(fd.get("bio") ?? "").trim() || null}, is_public = case when ${s.user.role === "admin"} then ${fd.get("is_public") === "on"} else is_public end where id = ${id}`;
    await audit(tx, s.actor, "therapist_profile_updated", "therapist", id);
  });
  revalidatePath("/app/settings");
  return { ok: "Zapisano profil." };
}
