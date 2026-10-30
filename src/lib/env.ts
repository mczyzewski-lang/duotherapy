// Konfiguracja środowiska. Brakujące sekrety w trybie produkcyjnym zatrzymują aplikację.

function required(name: string, devFallback?: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (process.env.NODE_ENV !== "production" && devFallback !== undefined) return devFallback;
  throw new Error(`Brak wymaganej zmiennej środowiskowej ${name}`);
}

export const env = {
  get demoMode() {
    return process.env.DEMO_MODE === "true";
  },
  get appUrl() {
    return process.env.APP_URL ?? "http://localhost:3000";
  },
  get databaseUrl() {
    return required("DATABASE_URL", "postgres://duo_app:duo_app_dev@localhost:5432/duo");
  },
  // Klucze deweloperskie są jawnie oznaczone i nigdy nie działają w produkcji.
  get encryptionKey() {
    return required("DATA_ENCRYPTION_KEY", "ZGV2LW9ubHkta2V5LWRvLW5vdC11c2UtaW4tcHJvZCE=");
  },
  get tokenSecret() {
    return required("TOKEN_SECRET", "dev-only-token-secret-do-not-use-in-production");
  },
  get requireMfa() {
    return process.env.REQUIRE_MFA === "true" || (process.env.NODE_ENV === "production" && process.env.REQUIRE_MFA !== "false");
  },
  get chromiumPath() {
    return process.env.CHROMIUM_PATH || undefined;
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};
