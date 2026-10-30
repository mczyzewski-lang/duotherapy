// Dane startowe: 4 szablony kwestionariuszy (wersja 1) oraz – w trybie DEMO – syntetyczne konta i sprawy.
// Wszystkie dane demo są fikcyjne i oznaczone jako DEMO. Nie używaj tego skryptu z prawdziwymi danymi.
import postgres from "postgres";
import { loadEnv } from "./load-env";

loadEnv();

async function main() {
  const { sourceTemplates } = await import("../src/questionnaires");
  const { seedTemplate } = await import("../src/lib/templates");
  const { hashPassword } = await import("../src/lib/crypto");

  const url = process.env.DATABASE_OWNER_URL!;
  const sql = postgres(url, { onnotice: () => {} });
  try {
    await sql.begin(async (tx) => {
      for (const t of sourceTemplates()) await seedTemplate(tx as never, t);
    });
    console.log("✓ szablony kwestionariuszy");

    if (process.env.DEMO_MODE !== "true") {
      console.log("DEMO_MODE != true – pomijam konta i dane demonstracyjne.");
      console.log("Utwórz pierwszego administratora: npm run user:create -- admin email@domena 'Imię Nazwisko'");
      return;
    }
    const pw = process.env.DEMO_PASSWORD || "demo-duo-2026!";
    const [admin] = await sql`
      insert into users (email, name, role, password_hash) values ('admin@demo.duo', 'Administrator (DEMO)', 'admin', ${await hashPassword(pw)})
      on conflict (email) do update set name = excluded.name returning id`;
    const [ther] = await sql`
      insert into users (email, name, role, password_hash) values ('psycholog@demo.duo', 'Psycholog Demo', 'therapist', ${await hashPassword(pw)})
      on conflict (email) do update set name = excluded.name returning id`;
    const [ther2] = await sql`
      insert into users (email, name, role, password_hash) values ('psycholog2@demo.duo', 'Drugi Psycholog Demo', 'therapist', ${await hashPassword(pw)})
      on conflict (email) do update set name = excluded.name returning id`;
    for (const [u, n] of [[admin.id, "Administrator (DEMO)"], [ther.id, "Psycholog Demo"], [ther2.id, "Drugi Psycholog Demo"]]) {
      await sql`insert into therapists (user_id, display_name) values (${u}, ${n}) on conflict (user_id) do nothing`;
    }
    await sql`insert into app_settings (key, value) values ('legal', ${sql.json({
      controllerName: "[DEMO] Gabinet przykładowy – dane do uzupełnienia",
      controllerContact: "kontakt@demo.duo (adres fikcyjny)",
    })}) on conflict (key) do nothing`;

    const [{ count }] = await sql`select count(*)::int from leads`;
    if (count === 0) {
      const leads = [
        ["Anna (DEMO)", "anna@demo.duo", "+48 500 000 001", "couple", "unsure", "phone", "new"],
        ["Marek (DEMO)", "marek@demo.duo", "+48 500 000 002", "individual", "rebuild", "phone", "contacted"],
        ["Ewa (DEMO)", "ewa@demo.duo", null, "individual", "separate", "email", "call_scheduled"],
      ] as const;
      for (const l of leads) {
        const [lead] = await sql`
          insert into leads (name, email, phone, mode, intent, preferred_contact, stage, quiz)
          values (${l[0]}, ${l[1]}, ${l[2]}, ${l[3]}, ${l[4]}, ${l[5]}, ${l[6]}, ${sql.json({ demo: true })}) returning id`;
        await sql`insert into consents (lead_id, kind, granted, text_version, text_snapshot)
                  values (${lead.id}, 'lead_contact', true, 'demo', 'Zgoda na kontakt (DEMO)')`;
        await sql`insert into lead_activities (lead_id, kind, content) values (${lead.id}, 'system', 'Zgłoszenie demonstracyjne (dane syntetyczne).')`;
      }
    }
    await seedDemoCases(sql, ther.id);
    console.log("✓ dane demo");
    console.log(`\nKonta DEMO (hasło: ${pw}):\n  admin@demo.duo\n  psycholog@demo.duo\n  psycholog2@demo.duo`);
  } finally {
    await sql.end();
  }
}

// Syntetyczne sprawy demonstracyjne z odpowiedziami (fikcyjne osoby, treści ogólne).
async function seedDemoCases(sql: postgres.Sql, therapistUserId: string) {
  const { encrypt } = await import("../src/lib/crypto");
  const [{ n }] = await sql`select count(*)::int as n from cases where is_demo`;
  if (n > 0) return;
  const [t] = await sql`select id from therapists where user_id = ${therapistUserId}`;
  const version = async (key: string) => (await sql`select v.id from questionnaire_template_versions v join questionnaire_templates t on t.id = v.template_id where t.key = ${key} and v.status = 'published'`)[0].id;
  const texts: Record<string, string> = {
    "m.name": "", "m.job": "praca biurowa (DEMO)", "m.length": "8 lat", "m.children": "1 dziecko, 6 lat",
    "s2.o1": "Kłótnia o organizację weekendu – podniesione głosy, zakończona ciszą (DEMO).",
    "s2.o2": "Powiedziałaby, że czuła się pominięta w decyzji (DEMO).",
    "s3.trigger": "brak odpowiedzi na wiadomość", "s3.thought": "nie jestem ważna/ważny", "s3.feeling": "lęk, złość", "s3.action": "naciskam na rozmowę",
    "s3.partner": "wycofuje się, milknie", "s3.end": "cisza na kilka dni", "s9.o1": "bliskość, szacunek, przewidywalność",
    "s10.o2": "Jasność, co mogę zrobić inaczej (DEMO).",
  };
  const fill = async (pid: string, versionId: string, name: string, shift: number, screeningYes: boolean) => {
    const qs = await sql`select id, key, type, options from questions where version_id = ${versionId} order by ord`;
    let i = 0;
    for (const q of qs) {
      let v: unknown = undefined;
      if (q.type === "scale5") v = ((i++ * 7 + shift) % 5) + 1;
      else if (q.type === "screening") v = screeningYes && q.key === "s1.1" ? "yes" : "no";
      else if (q.type === "single") v = { choice: q.options[Math.min(1, q.options.length - 1)].value };
      else if (q.type === "multi") v = { choices: [q.options[0].value, q.options[1].value], primary: q.options[1].value };
      else if (q.type === "consent") v = { granted: true };
      else if (q.type === "signature") v = { name, date: new Date().toISOString().slice(0, 10) };
      else if (q.type === "country_city") v = { country: "Polska", city: "Kraków" };
      else if (q.key === "m.name") v = name;
      else if (texts[q.key]) v = texts[q.key];
      if (v === undefined) continue;
      await sql`insert into answers (participant_id, question_id, state, value_enc) values (${pid}, ${q.id}, 'answered', ${encrypt(v)})`;
    }
    await sql`insert into consents (participant_id, kind, granted, text_version, text_snapshot) values (${pid}, 'data_processing', true, 'demo', 'Zgoda (DEMO)')`;
  };
  const year = new Date().getFullYear();
  const [c1] = await sql`insert into cases (ref, kind, status, therapist_id, goal, intent, session_minutes, is_demo, payment_status, created_by)
    values (${`DUO-${year}-9001-DEMO`}, 'couple', 'ready_for_session', ${t.id}, 'Niepewność, czy kontynuować związek (DEMO)', 'unsure', 90, true, 'paid', ${therapistUserId}) returning id`;
  const vF = await version("couple_female");
  const vM = await version("couple_male");
  const [a] = await sql`insert into participants (case_id, position, display_name, gender, template_version_id, q_status, q_started_at, q_submitted_at) values (${c1.id}, 1, 'Anna (DEMO)', 'female', ${vF}, 'submitted', now(), now()) returning id`;
  const [b] = await sql`insert into participants (case_id, position, display_name, gender, template_version_id, q_status, q_started_at, q_submitted_at) values (${c1.id}, 2, 'Piotr (DEMO)', 'male', ${vM}, 'submitted', now(), now()) returning id`;
  await fill(a.id, vF, "Anna (DEMO)", 0, true);
  await fill(b.id, vM, "Piotr (DEMO)", 3, false);
  await sql`insert into risk_review_statuses (case_id, participant_id, trigger_keys) values (${c1.id}, ${a.id}, ${["s1.1"]})`;
  const [c2] = await sql`insert into cases (ref, kind, status, therapist_id, goal, intent, session_minutes, is_demo, created_by)
    values (${`DUO-${year}-9002-DEMO`}, 'individual', 'questionnaire_partial', ${t.id}, 'Partner nie chce uczestniczyć (DEMO)', 'rebuild', 60, true, ${therapistUserId}) returning id`;
  const vI = await version("individual_male");
  const [m] = await sql`insert into participants (case_id, position, display_name, gender, template_version_id, q_status, q_started_at) values (${c2.id}, 1, 'Marek (DEMO)', 'male', ${vI}, 'in_progress', now()) returning id`;
  await fill(m.id, vI, "Marek (DEMO)", 1, false);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
