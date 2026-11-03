// Nurturing: warunki tagów, treść i linki, oraz cały przebieg na bazie (atrapa wysyłki zamiast Resend).
import { afterAll, describe, expect, it } from "vitest";
import { system } from "@/lib/db";
import {
  captureContact, markPurchase, normTag, parseTags, renderMail, runMailing, tagsAllow, trackingUrl, unsubscribeSig, verifyUnsubscribe,
} from "@/lib/mailing";

describe("mailing – zasady", () => {
  it("tagi: normalizacja i warunki „ma / nie ma”", () => {
    expect(normTag(" #LM Po Zdradzie ")).toBe("lm-po-zdradzie");
    expect(parseTags("#quiz, #klient  #quiz")).toEqual(["quiz", "klient"]);
    const step = { include_tags: ["lm-po-zdradzie", "lm-swiadome-rozstanie"], exclude_tags: ["quiz"] };
    expect(tagsAllow(step, ["lm-po-zdradzie"]).ok).toBe(true);
    expect(tagsAllow(step, ["lm-petla-konfliktu"])).toMatchObject({ ok: false, reason: expect.stringContaining("brak tagu") });
    expect(tagsAllow(step, ["lm-po-zdradzie", "quiz"])).toMatchObject({ ok: false, reason: "ma tag #quiz" });
    expect(tagsAllow({ include_tags: [], exclude_tags: [] }, []).ok).toBe(true);
  });

  it("treść: link /kod maila/kod osoby, wypis, imię, bez wstrzykniętego HTML", () => {
    const m = renderMail(
      { code: "n3", sequence_id: "lead", subject: "Temat", preheader: "P", body: "Akapit {imie}\n\n<b>drugi</b>", cta_label: "Mapa" },
      { code: "abcd2345", name: "Anna Nowak" },
    );
    expect(m.html).toContain(trackingUrl("n3", "abcd2345"));
    expect(m.text).toContain("/n3/abcd2345");
    expect(m.html).toContain("Cześć Anna,");
    expect(m.html).toContain("Akapit Anna");
    expect(m.html).not.toContain("<b>drugi</b>");
    expect(m.text).toContain(`wypisz?k=abcd2345.${unsubscribeSig("abcd2345")}`);
    expect(verifyUnsubscribe(`abcd2345.${unsubscribeSig("abcd2345")}`)).toBe("abcd2345");
    expect(verifyUnsubscribe(`abcd2345.${"0".repeat(32)}`)).toBeNull();
  });
});

describe("mailing – przebieg na bazie", () => {
  const sent: { to: string; subject: string; text: string }[] = [];
  const fake = async (to: string, mail: { subject: string; text: string }) => {
    sent.push({ to, subject: mail.subject, text: mail.text });
    return { ok: true, id: `fake_${sent.length}` };
  };
  const codesFor = async (email: string) =>
    system((tx) => tx`select st.code from mail_sends x join mail_steps st on st.id = x.step_id join mail_contacts c on c.id = x.contact_id
                      where c.email_lc = ${email} and x.status = 'sent' order by x.created_at, st.position`).then((r) => r.map((x) => x.code as string));
  const drain = async () => { for (let i = 0; i < 20; i++) if ((await runMailing(1000, fake)).sent === 0) return; };
  const backdate = (days: number) => system((tx) => tx`update mail_enrollments set enrolled_at = now() - make_interval(days => ${days})`);

  afterAll(() => system((tx) => tx`update mail_sequences set active = false`));

  it("przed zakupem: warunki tagów, zgoda, jedna wiadomość na uruchomienie; zakup przełącza ścieżkę", async () => {
    const a = await system((tx) => captureContact(tx, { email: "a@mail.test", name: "Ala", tags: ["lm-po-zdradzie"], marketing: true }));
    await system((tx) => captureContact(tx, { email: "b@mail.test", tags: ["lm-petla-konfliktu", "quiz"], marketing: true }));
    await system((tx) => captureContact(tx, { email: "c@mail.test", tags: ["lm-po-zdradzie"], marketing: false }));
    // ponowny zapis: tagi się sumują, zgoda nie jest cofana, kod osoby bez zmian
    const a2 = await system((tx) => captureContact(tx, { email: "A@mail.test", tags: ["seria-7-dni"], marketing: false }));
    expect(a2.code).toBe(a.code);
    const [ra] = await system((tx) => tx`select tags, marketing_consent from mail_contacts where id = ${a.id}`);
    expect(ra.tags.sort()).toEqual(["lm-po-zdradzie", "seria-7-dni"]);
    expect(ra.marketing_consent).toBe(true);

    // wyłączona ścieżka – nic nie wychodzi
    await backdate(30);
    expect((await runMailing(1000, fake)).sent).toBe(0);

    await system((tx) => tx`update mail_sequences set active = true where id = 'lead'`);
    const first = await runMailing(1000, fake);
    expect(first.sent).toBe(2); // a i b – po jednej wiadomości; c bez zgody
    await drain();
    expect(await codesFor("a@mail.test")).toEqual(["n1", "n2", "n3", "n5", "n6", "n7", "n8"]); // n4 tylko dla rozstania, n5 po zdradzie
    expect(await codesFor("b@mail.test")).toEqual(["n1", "n2", "n3", "n7", "n8"]); // bez n6 (#quiz)
    expect(await codesFor("c@mail.test")).toEqual([]);
    expect(sent.find((m) => m.to === "a@mail.test")!.text).toContain(`/n1/${a.code}`);
    const [skips] = await system((tx) => tx`select count(*)::int as n from mail_sends x join mail_contacts c on c.id = x.contact_id where c.email_lc = 'b@mail.test' and x.status = 'skipped'`);
    expect(skips.n).toBe(3);

    // zakup: #klient, koniec ścieżki do Mapy, start ścieżki po zakupie
    await system((tx) => markPurchase(tx, { email: "a@mail.test" }));
    const enr = await system((tx) => tx`select sequence_id, status from mail_enrollments e join mail_contacts c on c.id = e.contact_id where c.email_lc = 'a@mail.test' order by sequence_id`);
    expect(enr.map((e) => `${e.sequence_id}:${e.status}`)).toEqual(["customer:active", "lead:done"]);
    await system((tx) => tx`update mail_sequences set active = true where id = 'customer'`);
    await backdate(30);
    await drain();
    expect((await codesFor("a@mail.test")).filter((c) => c.startsWith("k"))).toEqual(["k1", "k2", "k3", "k4"]);
    expect(sent.filter((m) => m.to === "a@mail.test" && /\/k\d\//.test(m.text)).every((m) => !m.text.includes("mapa-relacji"))).toBe(true);

    // kupujący przed zapisem na materiał nie wraca na ścieżkę do Mapy
    await system((tx) => markPurchase(tx, { email: "d@mail.test" }));
    await system((tx) => captureContact(tx, { email: "d@mail.test", tags: ["lm-po-zdradzie"], marketing: true }));
    const [dl] = await system((tx) => tx`select count(*)::int as n from mail_enrollments e join mail_contacts c on c.id = e.contact_id where c.email_lc = 'd@mail.test' and e.sequence_id = 'lead'`);
    expect(dl.n).toBe(0);
  });
});
