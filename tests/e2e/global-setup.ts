import { execSync } from "node:child_process";

export default function globalSetup() {
  const env = { ...process.env, DATABASE_OWNER_URL: "postgres://duo_owner:duo_owner_dev@localhost:5432/duo_test", DEMO_MODE: "true" };
  execSync("npx tsx scripts/migrate.ts --reset && npx tsx scripts/seed.ts", { env, stdio: "inherit" });
}
