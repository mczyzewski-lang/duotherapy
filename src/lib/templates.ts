// Wersjonowane szablony kwestionariuszy w bazie.
import type { AreaKey, Option, QuestionType, ShowIf, TemplateDef } from "@/questionnaires/types";
import type { Tx } from "./db";

export interface QuestionRow {
  id: string;
  key: string;
  section_key: string;
  ord: number;
  source_number: string | null;
  type: QuestionType;
  prompt: string;
  hint: string | null;
  options: Option[] | null;
  primary_pick: string | null;
  required: boolean;
  allow_na: boolean;
  show_if: ShowIf | null;
  group_label: string | null;
  tags: string[];
  source: { file: string; page: number; note?: string };
}

export interface SectionMeta {
  key: string;
  title: string;
  intro?: string;
  scaleLegend?: string;
  area?: AreaKey;
}

export interface LoadedSection extends SectionMeta {
  questions: QuestionRow[];
}

export interface LoadedVersion {
  id: string;
  templateKey: TemplateDef["key"];
  audience: "couple" | "individual";
  gender: "male" | "female";
  version: number;
  status: "draft" | "published" | "archived";
  title: string;
  intro: string[];
  outro: string | null;
  sourceFile: string;
  needsVerification: boolean;
  verificationNote: string | null;
  sections: LoadedSection[];
}

export async function seedTemplate(tx: Tx, def: TemplateDef) {
  const [t] = await tx<{ id: string }[]>`
    insert into questionnaire_templates (key, audience, gender, name)
    values (${def.key}, ${def.audience}, ${def.gender}, ${def.title})
    on conflict (key) do update set name = excluded.name returning id`;
  const existing = await tx`select 1 from questionnaire_template_versions where template_id = ${t.id}`;
  if (existing.length) return;
  const sections: SectionMeta[] = def.sections.map(({ questions: _q, ...meta }) => meta);
  const [v] = await tx<{ id: string }[]>`
    insert into questionnaire_template_versions
      (template_id, version, status, title, intro, outro, sections, source_file, needs_verification, verification_note, change_note)
    values (${t.id}, 1, 'draft', ${def.title}, ${tx.json(def.intro)}, ${def.outro ?? null}, ${tx.json(sections as never)},
            ${def.sourceFile}, ${def.needsVerification}, ${def.verificationNote ?? null}, 'Wersja 1 – import z materiałów źródłowych')
    returning id`;
  let ord = 0;
  for (const s of def.sections) {
    for (const q of s.questions) {
      await insertQuestion(tx, v.id, s.key, ord++, q);
    }
  }
  await tx`update questionnaire_template_versions set status = 'published', published_at = now() where id = ${v.id}`;
}

async function insertQuestion(tx: Tx, versionId: string, sectionKey: string, ord: number, q: object) {
  const d = q as unknown as Record<string, unknown>;
  await tx`
    insert into questions (version_id, key, section_key, ord, source_number, type, prompt, hint, options, primary_pick, required, allow_na, show_if, group_label, tags, source)
    values (${versionId}, ${d.key as string}, ${sectionKey}, ${ord}, ${(d.sourceNumber ?? d.source_number ?? null) as string | null}, ${d.type as string},
            ${d.prompt as string}, ${(d.hint ?? null) as string | null}, ${d.options ? tx.json(d.options as never) : null},
            ${(d.primaryPick ?? d.primary_pick ?? null) as string | null}, ${Boolean(d.required)}, ${Boolean(d.allowNA ?? d.allow_na)},
            ${(d.showIf ?? d.show_if) ? tx.json((d.showIf ?? d.show_if) as never) : null}, ${(d.group ?? d.group_label ?? null) as string | null},
            ${(d.tags ?? []) as string[]}, ${tx.json(d.source as never)})`;
}

export async function loadVersion(tx: Tx, versionId: string): Promise<LoadedVersion | null> {
  const [v] = await tx`
    select v.*, t.key as template_key, t.audience, t.gender
    from questionnaire_template_versions v join questionnaire_templates t on t.id = v.template_id
    where v.id = ${versionId}`;
  if (!v) return null;
  const qs = await tx<QuestionRow[]>`select * from questions where version_id = ${versionId} order by ord`;
  const metas = v.sections as SectionMeta[];
  return {
    id: v.id,
    templateKey: v.template_key,
    audience: v.audience,
    gender: v.gender,
    version: v.version,
    status: v.status,
    title: v.title,
    intro: v.intro,
    outro: v.outro,
    sourceFile: v.source_file,
    needsVerification: v.needs_verification,
    verificationNote: v.verification_note,
    sections: metas.map((m) => ({ ...m, questions: qs.filter((q) => q.section_key === m.key) })),
  };
}

export async function publishedVersionId(tx: Tx, key: TemplateDef["key"]): Promise<string> {
  const [r] = await tx<{ id: string }[]>`
    select v.id from questionnaire_template_versions v join questionnaire_templates t on t.id = v.template_id
    where t.key = ${key} and v.status = 'published'`;
  if (!r) throw new Error(`Brak opublikowanej wersji szablonu ${key}`);
  return r.id;
}

/** Tworzy szkic nowej wersji jako kopię wersji opublikowanej (albo zwraca istniejący szkic). */
export async function createDraft(tx: Tx, templateId: string, userId: string): Promise<string> {
  const [draft] = await tx<{ id: string }[]>`select id from questionnaire_template_versions where template_id = ${templateId} and status = 'draft'`;
  if (draft) return draft.id;
  const [src] = await tx`select * from questionnaire_template_versions where template_id = ${templateId} and status = 'published'`;
  const [{ max }] = await tx<{ max: number }[]>`select max(version)::int as max from questionnaire_template_versions where template_id = ${templateId}`;
  const [v] = await tx<{ id: string }[]>`
    insert into questionnaire_template_versions
      (template_id, version, status, title, intro, outro, sections, source_file, needs_verification, verification_note, created_by)
    values (${templateId}, ${max + 1}, 'draft', ${src.title}, ${tx.json(src.intro)}, ${src.outro}, ${tx.json(src.sections)},
            ${src.source_file}, ${src.needs_verification}, ${src.verification_note}, ${userId})
    returning id`;
  await tx`
    insert into questions (version_id, key, section_key, ord, source_number, type, prompt, hint, options, primary_pick, required, allow_na, show_if, group_label, tags, source)
    select ${v.id}, key, section_key, ord, source_number, type, prompt, hint, options, primary_pick, required, allow_na, show_if, group_label, tags, source
    from questions where version_id = ${src.id}`;
  return v.id;
}

export async function publishDraft(tx: Tx, versionId: string, changeNote: string, markVerified: boolean) {
  const [v] = await tx`select template_id, status from questionnaire_template_versions where id = ${versionId}`;
  if (!v || v.status !== "draft") throw new Error("Można opublikować tylko szkic");
  await tx`update questionnaire_template_versions set status = 'archived' where template_id = ${v.template_id} and status = 'published'`;
  await tx`update questionnaire_template_versions
           set status = 'published', published_at = now(), change_note = ${changeNote},
               needs_verification = case when ${markVerified} then false else needs_verification end,
               verification_note = case when ${markVerified} then null else verification_note end
           where id = ${versionId}`;
}

export { insertQuestion };
