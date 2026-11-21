/**
 * Signed admin sessions (HMAC-SHA256) using the Web Crypto API, so the same
 * code runs in the Node runtime (route handlers) and the middleware.
 *
 * Cookie value format: `<expiresAtMs>.<base64url signature>`
 * The signature covers a fixed prefix plus the expiry, so a value cannot be
 * forged or extended without SESSION_SECRET.
 */

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

const encoder = new TextEncoder();

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64Url(signature);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Creates a signed session value, or null if SESSION_SECRET is missing/too short. */
export async function createAdminSession(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const signature = await sign(`admin.${expiresAt}`, secret);
  return `${expiresAt}.${signature}`;
}

/** True only for an unexpired value signed with the current SESSION_SECRET. */
export async function verifyAdminSession(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;

  const secret = getSecret();
  if (!secret) return false;

  const dot = value.indexOf('.');
  if (dot < 1) return false;

  const expiresAtRaw = value.slice(0, dot);
  const providedSignature = value.slice(dot + 1);
  if (!/^\d{10,16}$/.test(expiresAtRaw)) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await sign(`admin.${expiresAt}`, secret);
  return safeEqual(providedSignature, expected);
}

/** Convenience for route handlers: reads and verifies the cookie on a request. */
export async function isAdminRequest(req: { cookies: { get(name: string): { value: string } | undefined } }) {
  return verifyAdminSession(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
