// Osoba, która weszła z osobistego linku (materiał z e-maila / SMS-a albo link z wiadomości w mailingu) – do uzupełnienia
// formularzy jej danymi (imię, e-mail, potwierdzony telefon). Tylko na podstawie ciasteczek httpOnly ustawionych przez te linki.
import { contentReader } from "./content-access";
import { system } from "./db";
import { contactFromCookie } from "./mailing";

export interface KnownVisitor { name: string; email: string; phone: string }

export async function knownVisitor(): Promise<KnownVisitor | null> {
  try {
    return await system(async (tx) => {
      const who = await contentReader(tx);
      if (who) {
        const [r] = await tx<{ name: string | null; email: string; phone: string | null }[]>`
          select name, email, (select phone from content_leads p where lower(p.email) = ${who.email} and p.phone_verified_at is not null and p.phone is not null limit 1) as phone
          from content_leads where lower(email) = ${who.email} order by created_at desc limit 1`;
        if (r) return { name: r.name ?? "", email: r.email, phone: r.phone ?? "" };
      }
      const cid = await contactFromCookie(tx);
      if (cid) {
        const [c] = await tx<{ name: string | null; email_lc: string }[]>`select name, email_lc from mail_contacts where id = ${cid}`;
        if (c) return { name: c.name ?? "", email: c.email_lc, phone: "" };
      }
      return null;
    });
  } catch {
    return null;
  }
}

/** +48XXXXXXXXX → „600 100 123” do pola formularza. */
export const phoneForInput = (p: string) => (p.startsWith("+48") ? p.slice(3).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : p);
