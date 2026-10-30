import { headers } from "next/headers";

/** Adres IP klienta (do limitów prób). Nie zapisujemy go w danych sprawy. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}
