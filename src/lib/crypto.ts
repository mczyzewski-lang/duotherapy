// Kryptografia: szyfrowanie pól wrażliwych (AES-256-GCM), hashe tokenów (HMAC-SHA256),
// hashe haseł (scrypt) i TOTP (RFC 6238) dla MFA.
import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomInt, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { env } from "./env";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

function key(): Buffer {
  const k = Buffer.from(env.encryptionKey, "base64");
  if (k.length !== 32) throw new Error("DATA_ENCRYPTION_KEY musi mieć 32 bajty (base64)");
  return k;
}

export function encrypt(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), ct.toString("base64")].join(":");
}

export function decrypt<T = unknown>(blob: string | null | undefined): T | null {
  if (!blob) return null;
  const [v, iv, tag, ct] = blob.split(":");
  if (v !== "v1") throw new Error("Nieznany format szyfrowania");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8")) as T;
}

/** Token o wysokiej entropii do linków (256 bitów, base64url). */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** 6-cyfrowy kod dostępu przekazywany innym kanałem. */
export function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Deterministyczny hash tokenu (do wyszukania w bazie). Surowy token nigdy nie trafia do bazy. */
export function hashToken(token: string): string {
  return createHmac("sha256", env.tokenSecret).update(token).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = await scrypt(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString("base64")}$${dk.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt") return false;
  const dk = await scrypt(pw, Buffer.from(salt, "base64"), 64, SCRYPT);
  const h = Buffer.from(hash, "base64");
  return h.length === dk.length && timingSafeEqual(h, dk);
}

/** Polityka haseł: min. 12 znaków, nie same cyfry/litery. Zwraca komunikat błędu albo null. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return "Hasło musi mieć co najmniej 12 znaków.";
  if (!/[a-zA-Ząćęłńóśźż]/.test(pw) || !/[^a-zA-Ząćęłńóśźż]/.test(pw)) return "Użyj liter oraz cyfr lub znaków specjalnych.";
  return null;
}

// --- TOTP -------------------------------------------------------------------
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totp(secret: string, at = Date.now(), step = 30): string {
  const counter = Math.floor(at / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const code = ((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).toString();
  return code.padStart(6, "0");
}

export function verifyTotp(secret: string, code: string): boolean {
  const c = code.replace(/\s/g, "");
  return [-1, 0, 1].some((d) => totp(secret, Date.now() + d * 30_000) === c);
}
