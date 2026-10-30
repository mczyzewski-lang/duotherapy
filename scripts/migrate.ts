// Uruchamia migracje SQL z db/migrations jako rola właściciela schematu.
// Użycie: tsx scripts/migrate.ts [--reset]   (--reset kasuje WSZYSTKIE dane – tylko dev/test)
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { loadEnv } from "./load-env";

loadEnv();
const url = process.env.DATABASE_OWNER_URL;
if (!url) throw new Error("Ustaw DATABASE_OWNER_URL");

/** Na Railway sieć prywatna bywa gotowa kilka sekund po starcie kontenera – ponawiamy połączenie. */
async function waitForDb(sql: postgres.Sql) {
  for (let i = 1; ; i++) {
    try {
      await sql`select 1`;
      return;
    } catch (e) {
      const err = e as { code?: string; message?: string };
      if (i >= 30) throw e;
      console.log(`… baza niedostępna (${err.code ?? err.message}), ponawiam za 2 s [${i}/30]`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

export async function migrate(dbUrl: string, reset = false) {
  const sql = postgres(dbUrl, { onnotice: () => {}, connect_timeout: 10 });
  try {
    await waitForDb(sql);
    if (reset) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") throw new Error("--reset jest zablokowany w produkcji");
      await sql.unsafe("drop schema if exists public cascade; create schema public;");
    }
    await ensureAppRole(sql);
    await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
    const dir = path.join(process.cwd(), "db/migrations");
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      const done = await sql`select 1 from schema_migrations where name = ${f}`;
      if (done.length) continue;
      await sql.begin(async (tx) => {
        await tx.unsafe(readFileSync(path.join(dir, f), "utf8"));
        await tx`insert into schema_migrations (name) values (${f})`;
      });
      console.log("✓", f);
    }
  } finally {
    await sql.end();
  }
}

/**
 * Hostingi typu Railway udostępniają tylko konto superużytkownika, które omija RLS.
 * Gdy migracje działają jako superużytkownik, tworzymy (lub aktualizujemy) rolę aplikacji "duo_app"
 * z hasłem z DATABASE_URL – bez uprawnień superużytkownika i bez BYPASSRLS.
 */
async function ensureAppRole(sql: postgres.Sql) {
  const appUrl = process.env.DATABASE_URL;
  const [{ rolsuper }] = await sql`select rolsuper from pg_roles where rolname = current_user`;
  if (!rolsuper || !appUrl) return;
  const u = new URL(appUrl);
  if (decodeURIComponent(u.username) !== "duo_app") throw new Error("DATABASE_URL musi używać roli duo_app (aplikacja nie może łączyć się jako superużytkownik)");
  const password = decodeURIComponent(u.password);
  if (password.length < 16) throw new Error("Hasło roli duo_app w DATABASE_URL musi mieć co najmniej 16 znaków");
  const [{ exists }] = await sql`select exists (select 1 from pg_roles where rolname = 'duo_app') as exists`;
  if (!exists) await sql.unsafe("create role duo_app");
  const [{ q }] = await sql`select format('alter role duo_app with login nosuperuser nocreatedb nocreaterole nobypassrls password %L', ${password}::text) as q`;
  await sql.unsafe(q);
  console.log(exists ? "✓ rola duo_app zaktualizowana" : "✓ utworzono rolę duo_app");
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  migrate(url, process.argv.includes("--reset")).then(() => console.log("✓ migracje")).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
