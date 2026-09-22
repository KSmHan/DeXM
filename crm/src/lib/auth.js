const encoder = new TextEncoder();

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bufToHex(sig);
}

export const SESSION_COOKIE = "dexm_session";

export async function createSessionToken(secret, ttlSeconds = 60 * 60 * 24 * 30) {
  const expires = Date.now() + ttlSeconds * 1000;
  const sig = await sign(String(expires), secret);
  return `${expires}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (!token) return false;
  const [expiresStr, sig] = token.split(".");
  if (!expiresStr || !sig) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = await sign(expiresStr, secret);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
