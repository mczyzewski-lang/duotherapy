import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { Alert, Logo } from "@/components/ui";
import { Questionnaire, type QData } from "@/components/questionnaire/questionnaire";
import { CodeForm } from "@/components/questionnaire/code-form";
import { loadAnswers } from "@/lib/cases";
import { withActor } from "@/lib/db";
import { env } from "@/lib/env";
import { currentParticipant, resolveInvitation } from "@/lib/participant-auth";
import { questionnaireNotice, readSettings } from "@/lib/settings";
import { loadVersion } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Twój kwestionariusz", robots: { index: false, follow: false }, referrer: "no-referrer" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-linen/60">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <span className="flex items-center gap-1.5 text-xs text-muted"><Lock size={13} aria-hidden /> Połączenie poufne</span>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 pb-20">{children}</main>
    </div>
  );
}

export default async function QuestionnairePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await resolveInvitation(token);
  if (!inv || inv.status !== "active") {
    return (
      <Shell>
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-sand">
          <h1 className="font-display text-3xl text-ink">Ten link jest nieaktywny</h1>
          <p className="mt-3 leading-relaxed text-ink-soft">
            {inv?.status === "expired"
              ? "Ważność linku minęła."
              : inv?.status === "locked"
                ? "Link został zablokowany po zbyt wielu próbach wpisania kodu."
                : "Link mógł zostać zastąpiony nowym albo jest niepoprawny."}{" "}
            Skontaktuj się z psychologiem prowadzącym – przygotuje nowy link. Twoje zapisane odpowiedzi nie przepadną.
          </p>
        </div>
      </Shell>
    );
  }

  const pid = await currentParticipant(token);
  if (!pid) {
    return (
      <Shell>
        <CodeForm token={token} firstName={inv.firstName} />
      </Shell>
    );
  }

  const data = await withActor({ kind: "participant", participantId: pid }, async (tx) => {
    const [p] = await tx`select p.*, c.kind, c.payment_status, c.session_at, c.status as case_status from participants p join cases c on c.id = p.case_id where p.id = ${pid}`;
    const v = (await loadVersion(tx, p.template_version_id))!;
    const answers = await loadAnswers(tx, pid);
    const s = await readSettings(tx);
    const slots = await tx`select id, starts_at, minutes, status, chosen_by = ${pid} as mine from session_slots where case_id = ${p.case_id} and status <> 'cancelled' order by starts_at`;
    return { p, v, answers, s, slots };
  });
  const { p, v, answers, s, slots } = data;
  const legalBlocked = !s.legal.approved && !env.demoMode;

  const q: QData = {
    token,
    firstName: String(p.display_name).split(" ")[0],
    status: p.q_status,
    kind: p.kind,
    version: {
      title: v.title,
      intro: v.intro,
      outro: v.outro,
      sections: v.sections.map((sec) => ({
        key: sec.key,
        title: sec.title,
        intro: sec.intro,
        scaleLegend: sec.scaleLegend,
        area: sec.area,
        questions: sec.questions.map((x) => ({
          id: x.id,
          key: x.key,
          type: x.type,
          prompt: x.prompt,
          hint: x.hint,
          options: x.options,
          primaryPick: x.primary_pick,
          required: x.required,
          allowNA: x.allow_na,
          showIf: x.show_if,
          group: x.group_label,
          sourceNumber: x.source_number,
          tags: x.tags,
        })),
      })),
    },
    answers: Object.fromEntries(answers.map((a) => [a.question_id, { state: a.state, value: a.value }])),
    notice: questionnaireNotice(s),
    helplines: s.helplines,
    payment: { status: p.payment_status, url: s.site.paymentUrl, required: s.flow.requirePaymentBeforeQuestionnaire },
    sessionAt: p.session_at ? new Date(p.session_at).toISOString() : null,
    slots: slots.map((x) => ({ id: x.id, startsAt: new Date(x.starts_at).toISOString(), minutes: x.minutes, status: x.status, mine: x.mine })),
  };

  return (
    <Shell>
      {legalBlocked ? (
        <Alert tone="warn" title="Kwestionariusz jest chwilowo niedostępny" className="mt-10">
          Trwa uzupełnianie informacji o ochronie danych. Skontaktuj się z psychologiem prowadzącym.
        </Alert>
      ) : (
        <Questionnaire data={q} />
      )}
    </Shell>
  );
}
