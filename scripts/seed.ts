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
    console.log("✓ dane demo");
    console.log(`\nKonta DEMO (hasło: ${pw}):\n  admin@demo.duo\n  psycholog@demo.duo\n  psycholog2@demo.duo`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
