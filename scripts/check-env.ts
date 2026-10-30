// Kontrola konfiguracji przed wdrożeniem – czytelne komunikaty w logach zamiast błędu aplikacji.
import { loadEnv } from "./load-env";

loadEnv();
const problems: string[] = [];
const need = (name: string, ok: (v: string) => boolean, hint: string) => {
  const v = process.env[name] ?? "";
  if (!v) problems.push(`Brak zmiennej ${name} – ${hint}`);
  else if (!ok(v)) problems.push(`Niepoprawna wartość ${name} – ${hint}`);
};
need("DATABASE_OWNER_URL", (v) => /^postgres(ql)?:\/\//.test(v), "adres bazy (na Railway: ${{Postgres.DATABASE_URL}})");
need("DATABASE_URL", (v) => /^postgres(ql)?:\/\/duo_app:[^@]{16,}@/.test(v), "adres z rolą duo_app i hasłem min. 16 znaków (sprawdź DUO_APP_DB_PASSWORD)");
need("DATA_ENCRYPTION_KEY", (v) => Buffer.from(v, "base64").length === 32, "32 bajty w base64, np. wynik: openssl rand -base64 32");
need("TOKEN_SECRET", (v) => v.length >= 32, "min. 32 znaki, np. wynik: openssl rand -base64 32");
if (problems.length) {
  console.error("\n✗ Konfiguracja niekompletna:\n  - " + problems.join("\n  - ") + "\n\nInstrukcja: docs/deploy-railway.md\n");
  process.exit(1);
}
console.log("✓ konfiguracja środowiska");
