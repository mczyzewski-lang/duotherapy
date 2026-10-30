"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { answerByKey, screeningFlags } from "@/lib/analysis";
import { asStaff, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { loadCase, loadNotes, loadPeople } from "@/lib/case-data";
import { advanceStatus } from "@/lib/cases";
import { decrypt, encrypt, hashToken, newCode, newToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { buildDraft, missingMarkers, pathProblems, type ReportContent } from "@/lib/report";
import { readSettings } from "@/lib/settings";

export async function createReportAction(fd: FormData) {
  const s = await requireStaff();
  const caseId = String(fd.get("case_id"));
  const target = String(fd.get("audience_target") ?? "joint");
  const audience = target === "joint" ? "joint" : "participant";
  const forPid = audience === "participant" ? target : null;
  const id = await asStaff(s, async (tx) => {
    const data = await loadCase(tx, caseId);
    if (!data) throw new Error("Brak dostępu");
    const { c, participants } = data;
    if (c.kind === "individual" && audience === "joint") throw new Error("Audyt indywidualny ma raport osobny");
    const people = await loadPeople(tx, participants as never);
    const own = forPid ? people.find((p) => p.participantId === forPid) ?? null : null;
    if (forPid && !own) throw new Error("Uczestnik nie należy do sprawy");
    const notes = (await loadNotes(tx, caseId)).filter(
      // para: raport osobny tylko z notatek o adresacie lub dopuszczonych do wspólnego przekazania
      (n) => n.kind === "report" && (audience === "joint" ? n.joint_ok : c.kind === "individual" || n.participant_id === forPid || n.joint_ok),
    );
    const riskFlag = participants.some((p) => p.risk) || people.some((p) => screeningFlags(p).some((f) => f.trigger && f.value === "yes"));
    const areaOf = (qid: string | null) => {
      if (!qid) return null;
      for (const p of people) for (const sct of p.version.sections) if (sct.questions.some((q) => q.id === qid)) return sct.area ?? null;
      return null;
    };
    const content = buildDraft({
      audience,
      caseKind: c.kind,
      sessionDate: c.session_at ? new Date(c.session_at) : null,
      therapist: c.therapist_name,
      participants: (own ? [own] : people).map((p) => ({ name: answerByKey(p, "m.name").a?.value as string || p.name, birth: answerByKey(p, "m.birth").a?.value as string | null })),
      ownData: own,
      notes: notes.map((n) => ({ area: areaOf(n.question_id), body: n.body, participantName: null })),
      reason: c.goal,
      riskFlag,
    });
    const [r] = await tx<{ id: string }[]>`
      insert into reports (case_id, audience, participant_id, created_by) values (${caseId}, ${audience}, ${forPid}, ${s.user.id}) returning id`;
    await tx`insert into report_versions (report_id, version, content_enc, created_by) values (${r.id}, 1, ${encrypt(content)}, ${s.user.id})`;
    await advanceStatus(tx, caseId, "report_in_progress");
    await audit(tx, s.actor, "report_created", "report", r.id, caseId, { audience });
    return r.id;
  });
  redirect(`/app/cases/${caseId}/reports/${id}`);
}

export async function saveReportAction(reportId: string, content: ReportContent): Promise<{ ok: true; version: number } | { error: string }> {
  const s = await requireStaff();
  return asStaff(s, async (tx) => {
    const [r] = await tx`select r.case_id, r.status, (select max(version) from report_versions where report_id = r.id)::int as v,
                         (select content_enc from report_versions where report_id = r.id order by version desc limit 1) as last
                         from reports r where r.id = ${reportId}`;
    if (!r) return { error: "Brak dostępu." };
    const prev = decrypt<ReportContent>(r.last)!;
    // pola chronione: odbiorca, rodzaj i flaga zagrożenia nie są edytowalne z formularza
    const safe: ReportContent = { ...content, audience: prev.audience, caseKind: prev.caseKind, riskFlag: prev.riskFlag };
    const probs = pathProblems(safe);
    if (probs.length) return { error: probs.join(" ") };
    await tx`insert into report_versions (report_id, version, content_enc, created_by) values (${reportId}, ${r.v + 1}, ${encrypt(safe)}, ${s.user.id})`;
    await tx`update reports set status = 'draft', updated_at = now() where id = ${reportId}`;
    await audit(tx, s.actor, "report_version_saved", "report", reportId, r.case_id, { version: r.v + 1 });
    return { ok: true as const, version: r.v + 1 };
  });
}

export async function approveReportAction(reportId: string): Promise<{ ok: true } | { error: string }> {
  const s = await requireStaff();
  return asStaff(s, async (tx) => {
    const [v] = await tx`select rv.id, rv.content_enc, r.case_id from report_versions rv join reports r on r.id = rv.report_id
                         where rv.report_id = ${reportId} order by rv.version desc limit 1`;
    if (!v) return { error: "Brak dostępu." };
    const content = decrypt<ReportContent>(v.content_enc)!;
    const missing = missingMarkers(content);
    if (missing.length) return { error: `Uzupełnij przed zatwierdzeniem: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ` i ${missing.length - 8} innych` : ""}.` };
    const probs = pathProblems(content);
    if (probs.length) return { error: probs.join(" ") };
    await tx`update report_versions set approved_by = ${s.user.id}, approved_at = now() where id = ${v.id}`;
    await tx`update reports set status = 'approved', updated_at = now() where id = ${reportId}`;
    await advanceStatus(tx, v.case_id, "report_approved");
    await audit(tx, s.actor, "report_approved", "report", reportId, v.case_id);
    revalidatePath(`/app/cases/${v.case_id}/reports/${reportId}`);
    return { ok: true as const };
  });
}

/**
 * Udostępnienie zatwierdzonej wersji JEDNEJ osobie. Raport osobny – tylko jego adresatowi.
 * Raport wspólny – wymaga potwierdzenia, że zawiera wyłącznie treści zatwierdzone do wspólnego przekazania.
 */
export async function shareReportAction(reportId: string, participantId: string, confirmDisclosure: boolean): Promise<{ url: string; code: string } | { error: string }> {
  const s = await requireStaff();
  return asStaff(s, async (tx) => {
    const [r] = await tx`select r.*, (select id from report_versions where report_id = r.id and approved_at is not null order by version desc limit 1) as approved_version,
                         (select max(version) from report_versions where report_id = r.id) as last_version,
                         (select version from report_versions where report_id = r.id and approved_at is not null order by version desc limit 1) as approved_no
                         from reports r where r.id = ${reportId}`;
    if (!r) return { error: "Brak dostępu." };
    if (!r.approved_version) return { error: "Najpierw zatwierdź raport." };
    if (r.approved_no !== r.last_version) return { error: "Po zatwierdzeniu zapisano nowszą wersję. Zatwierdź ją ponownie przed udostępnieniem." };
    const [p] = await tx`select id from participants where id = ${participantId} and case_id = ${r.case_id} and anonymized_at is null`;
    if (!p) return { error: "Uczestnik nie należy do tej sprawy." };
    if (r.audience === "participant" && r.participant_id !== participantId) return { error: "Raport osobny może otrzymać wyłącznie jego adresat." };
    if (r.audience === "joint" && !confirmDisclosure) return { error: "Potwierdź, że raport wspólny zawiera wyłącznie treści zatwierdzone do wspólnego przekazania." };
    const st = await readSettings(tx);
    const token = newToken();
    const code = newCode();
    const [share] = await tx<{ id: string }[]>`
      insert into report_shares (report_id, report_version_id, participant_id, token_hash, code_hash, expires_at, disclosure_confirmed, created_by)
      values (${reportId}, ${r.approved_version}, ${participantId}, ${hashToken(token)}, ${hashToken("code:" + code)},
              ${new Date(Date.now() + st.flow.reportShareDays * 86400_000)}, ${confirmDisclosure}, ${s.user.id}) returning id`;
    await tx`update reports set status = 'shared', updated_at = now() where id = ${reportId}`;
    await advanceStatus(tx, r.case_id, "report_shared");
    await audit(tx, s.actor, "report_shared", "report_share", share.id, r.case_id, { audience: r.audience, disclosure_confirmed: confirmDisclosure });
    revalidatePath(`/app/cases/${r.case_id}/reports/${reportId}`);
    return { url: `${env.appUrl}/r/${token}`, code };
  });
}

export async function revokeShareAction(fd: FormData) {
  const s = await requireStaff();
  const id = String(fd.get("share_id"));
  await asStaff(s, async (tx) => {
    const [sh] = await tx`update report_shares set revoked_at = now() where id = ${id} returning report_id, (select case_id from reports where id = report_id) as case_id`;
    if (sh) {
      await audit(tx, s.actor, "report_share_revoked", "report_share", id, sh.case_id);
      revalidatePath(`/app/cases/${sh.case_id}/reports/${sh.report_id}`);
    }
  });
}
