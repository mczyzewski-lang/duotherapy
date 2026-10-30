// Diagnostyka wdrożenia: konfiguracja, połączenie z bazą (rola aplikacji), migracje, szablony.
// Nie zwraca żadnych sekretów ani danych osobowych – tylko statusy i kody błędów.
import { NextResponse } from "next/server";
import postgres from "postgres";
import { system } from "@/lib/db";

export const dynamic = "force-dynamic";

function safe(e: unknown): string {
  const err = e as { code?: string; message?: string };
  return `${err.code ? `[${err.code}] ` : ""}${(err.message ?? String(e)).replace(/postgres(ql)?:\/\/\S+/g, "<url>")}`.slice(0, 300);
}

export async function GET() {
  const checks: Record<string, string> = {};
  const has = (k: string) => Boolean(process.env[k]);
  checks.env = ["DATABASE_URL", "DATA_ENCRYPTION_KEY", "TOKEN_SECRET"].map((k) => `${k}:${has(k) ? "ok" : "BRAK"}`).join(" ");
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    checks.db_target = `user=${decodeURIComponent(u.username)} host=${u.hostname} port=${u.port} db=${u.pathname.slice(1)}`;
  } catch {
    checks.db_target = "DATABASE_URL niepoprawny lub pusty";
  }
  try {
    const sql = postgres(process.env.DATABASE_URL ?? "", { max: 1, connect_timeout: 8 });
    const [r] = await sql`select current_user as u, (select rolsuper from pg_roles where rolname = current_user) as su`;
    checks.db_connect = `ok (rola ${r.u}${r.su ? " – UWAGA: superużytkownik omija RLS!" : ""})`;
    const m = await sql`select name from schema_migrations order by name`.catch((e) => [{ name: `błąd: ${safe(e)}` }]);
    checks.migrations = m.map((x) => x.name).join(", ") || "brak – nie uruchomiono db:deploy";
    await sql.end();
  } catch (e) {
    checks.db_connect = `BŁĄD: ${safe(e)}`;
  }
  try {
    const [t] = await system((tx) => tx`select count(*)::int as n from questionnaire_templates`);
    checks.templates = `${t.n} szablonów`;
  } catch (e) {
    checks.templates = `BŁĄD: ${safe(e)}`;
  }
  const ok = !Object.values(checks).some((v) => /BŁĄD|BRAK|brak|błąd|niepoprawny|UWAGA/.test(v));
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } });
}
