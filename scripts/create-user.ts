// Tworzy konto w panelu (np. pierwszego administratora w produkcji).
// Użycie: npm run user:create -- <admin|therapist> <email> "<Imię Nazwisko>"
// Hasło tymczasowe jest generowane i wypisywane jednorazowo. Przy pierwszym logowaniu wymagane jest MFA (REQUIRE_MFA).
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { loadEnv } from "./load-env";

loadEnv();

async function main() {
  const [role, email, name] = process.argv.slice(2);
  if (!["admin", "therapist"].includes(role) || !email || !name) throw new Error('Użycie: npm run user:create -- <admin|therapist> <email> "<Imię Nazwisko>"');
  const { hashPassword } = await import("../src/lib/crypto");
  const pw = randomBytes(12).toString("base64url");
  const sql = postgres(process.env.DATABASE_OWNER_URL!);
  try {
    const [u] = await sql`insert into users (email, name, role, password_hash) values (${email.toLowerCase()}, ${name}, ${role}, ${await hashPassword(pw)}) returning id`;
    await sql`insert into therapists (user_id, display_name) values (${u.id}, ${name})`;
    console.log(`Utworzono ${role}: ${email}\nHasło tymczasowe (pokazywane tylko raz): ${pw}`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
