/**
 * Sessão do painel /admin.
 * Login por senha única (ADMIN_PASSWORD no .env). O cookie é assinado com
 * HMAC (SESSION_SECRET) e validado no servidor — tanto no proxy quanto em
 * cada server action (defesa em profundidade).
 * Só usa Web Crypto, então funciona em qualquer runtime.
 */
export const SESSION_COOKIE = "luk_admin";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 14; // 14 dias
const VERSION = "v1";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET ausente ou curto (mín. 16 caracteres).");
  return "lukwolfly-dev-secret-change-me";
}

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string, key: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(payload)));
}

export function safeEqual(a: string, b: string) {
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
}

export async function signSession(now = Date.now(), key = secret()): Promise<string> {
  const payload = `${VERSION}.${Math.floor(now / 1000)}`;
  return `${payload}.${await hmac(payload, key)}`;
}

export async function verifySession(token: string | undefined | null, now = Date.now(), key?: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return false;
  const issued = Number(parts[1]);
  if (!Number.isFinite(issued)) return false;
  const age = Math.floor(now / 1000) - issued;
  if (age < -60 || age > SESSION_MAX_AGE_S) return false;
  let k: string;
  try {
    k = key ?? secret();
  } catch {
    return false;
  }
  return safeEqual(await hmac(`${parts[0]}.${parts[1]}`, k), parts[2]);
}

/** Compara a senha digitada com ADMIN_PASSWORD em tempo constante. */
export async function checkPassword(input: string, expected = process.env.ADMIN_PASSWORD ?? ""): Promise<boolean> {
  if (expected.length < 6) return false;
  // compara digests (mesmo tamanho) para não vazar o comprimento
  const [a, b] = await Promise.all([hmac(input, "luk-pw"), hmac(expected, "luk-pw")]);
  return safeEqual(a, b);
}

/* limite simples de tentativas de login (em memória, por IP) */
const attempts = new Map<string, { n: number; until: number }>();
export function loginAllowed(ip: string, now = Date.now()): boolean {
  const a = attempts.get(ip);
  return !a || a.until < now || a.n < 5;
}
export function registerLoginFailure(ip: string, now = Date.now()) {
  const a = attempts.get(ip);
  if (!a || a.until < now) attempts.set(ip, { n: 1, until: now + 10 * 60_000 });
  else a.n++;
}
export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}
