// Okładki: przejście na kolejny model obrazów, gdy pierwszy nie istnieje dla klucza; komunikat z dostępnymi modelami.
import { afterEach, describe, expect, it, vi } from "vitest";
import { system } from "@/lib/db";
import { coverPhotoMap, coverState, generateCoverPhoto, invalidateCoverPhotos } from "@/lib/cover-photos";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("okładki zdjęciowe", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.OPENAI_API_KEY; });

  it("przechodzi na kolejny model i zapisuje zdjęcie", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const models: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      const m = JSON.parse(String(init.body)).model as string;
      models.push(m);
      return m === "gpt-image-1.5" ? json(404, { error: { message: "The model 'gpt-image-1.5' does not exist." } }) : json(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }));
    const r = await generateCoverPhoto("petla-konfliktu");
    expect(r).toEqual({ ok: true, model: "gpt-image-1" });
    expect(models).toEqual(["gpt-image-1.5", "gpt-image-1"]);
    expect((await coverPhotoMap())["petla-konfliktu"]).toMatch(/^\/wiedza-okladki\/petla-konfliktu\?v=\d+$/);
    await system((tx) => tx`delete from cover_images`);
  });

  it("gdy żaden model nie działa – podaje modele dostępne dla klucza", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal("fetch", vi.fn(async (url: string) =>
      String(url).endsWith("/v1/models") ? json(200, { data: [{ id: "gpt-4o" }, { id: "gpt-image-2" }] }) : json(404, { error: { message: "The model does not exist" } })));
    const r = await generateCoverPhoto("petla-konfliktu");
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toContain("gpt-image-2");
  });

  it("inny błąd (np. limit) – bez prób kolejnych modeli", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const f = vi.fn(async () => json(429, { error: { message: "Rate limit" } }));
    vi.stubGlobal("fetch", f);
    const r = await generateCoverPhoto("petla-konfliktu");
    expect(!r.ok && r.error).toContain("Rate limit");
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("grafika 2D: osobny wariant z promptem maskotek; strona pokazuje wariant wybrany globalnie", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const prompts: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      prompts.push(JSON.parse(String(init.body)).prompt);
      return json(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }));
    expect((await generateCoverPhoto("petla-konfliktu", "illustration")).ok).toBe(true);
    expect(prompts[0]).toContain("DUO mascots");
    expect(prompts[0]).toContain("circular track");
    // domyślnie zdjęcia – grafika 2D nie trafia na stronę
    expect((await coverPhotoMap())["petla-konfliktu"]).toBeUndefined();
    expect((await coverState()).all.illustration["petla-konfliktu"]).toMatch(/\?s=illustration&v=\d+$/);
    await system((tx) => tx`insert into app_settings (key, value) values ('covers', '{"style":"illustration"}') on conflict (key) do update set value = excluded.value`);
    invalidateCoverPhotos();
    expect((await coverPhotoMap())["petla-konfliktu"]).toMatch(/^\/wiedza-okladki\/petla-konfliktu\?s=illustration&v=\d+$/);
    await system((tx) => tx`update app_settings set value = '{"style":"photo"}' where key = 'covers'`);
    await system((tx) => tx`delete from cover_images`);
    invalidateCoverPhotos();
  });
});
