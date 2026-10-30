import { defineConfig } from "@playwright/test";

// E2E na osobnej bazie (duo_test) i osobnym porcie – nie dotyka danych deweloperskich.
const PORT = 3100;
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 600_000,
  expect: { timeout: 15_000 },
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { actionTimeout: 20_000, navigationTimeout: 30_000, baseURL: `http://localhost:${PORT}`, locale: "pl-PL", trace: "retain-on-failure" },
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 600_000,
    env: {
      DATABASE_URL: "postgres://duo_app:duo_app_dev@localhost:5432/duo_test",
      DATABASE_OWNER_URL: "postgres://duo_owner:duo_owner_dev@localhost:5432/duo_test",
      DEMO_MODE: "true",
      APP_URL: `http://localhost:${PORT}`,
      NEXT_DIST_DIR: ".next-e2e",
    },
  },
});
