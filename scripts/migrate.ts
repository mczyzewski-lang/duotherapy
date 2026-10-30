// Uruchamia migracje SQL z db/migrations jako rola właściciela schematu.
// Użycie: tsx scripts/migrate.ts [--reset]   (--reset kasuje WSZYSTKIE dane – tylko dev/test)
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { loadEnv } from "./load-env";

loadEnv();
const url = process.env.DATABASE_OWNER_URL;
if (!url) throw new Error("Ustaw DATABASE_OWNER_URL");

export async function migrate(dbUrl: string, reset = false) {
  const sql = postgres(dbUrl, { onnotice: () => {} });
  try {
    if (reset) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") throw new Error("--reset jest zablokowany w produkcji");
      await sql.unsafe("drop schema if exists public cascade; create schema public;");
    }
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

if (process.argv[1]?.endsWith("migrate.ts")) {
  migrate(url, process.argv.includes("--reset")).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
