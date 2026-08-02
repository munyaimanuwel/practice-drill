// Edge-safe session marker helpers for middleware.
// No iron-session / Node crypto imports — only WebCrypto, so this can run in
// the Next.js Edge middleware runtime (and the dev loader).
const MARKER_COOKIE = "drill_auth";
const MARKER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, matches sessionOptions
const FALLBACK_SECRET =
  "dev-only-secret-please-set-AUTH_SECRET-in-env-00000000000000000000000000000000";

export function authMarkerCookieName(): string {
  return MARKER_COOKIE;
}

function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  return s && s !== "change-me-to-a-long-random-string" ? s : FALLBACK_SECRET;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`drill-marker:${authSecret()}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function createAuthMarker(userId: string): Promise<string> {
  const key = await hmacKey();
  const payload = `${userId}:${Date.now() + MARKER_TTL_MS}`;
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}:${bytesToHex(new Uint8Array(sig))}`;
}

export async function verifyAuthMarker(value: string): Promise<boolean> {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  const [userId, exp, sigHex] = parts;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;
  if (!/^[0-9a-f]+$/.test(sigHex) || sigHex.length % 2 !== 0) return false;
  try {
    const key = await hmacKey();
    const sig = hexToBytes(sigHex);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      new TextEncoder().encode(`${userId}:${exp}`)
    );
  } catch {
    return false;
  }
}
