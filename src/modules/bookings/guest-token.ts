import { createHash, randomBytes } from "node:crypto";

/** Store only the hash. Never log the raw token or the management URL. */
export function hashGuestToken(token: string): string {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new TypeError("Invalid management token.");
  return createHash("sha256").update(token).digest("hex");
}

export function createGuestToken(expiresAt: Date, now = new Date()) {
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    throw new RangeError("Token expiry must be in the future.");
  }
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashGuestToken(token), expiresAt: new Date(expiresAt) };
}

export function isGuestTokenActive(record: { expiresAt: Date; revokedAt: Date | null }, now = new Date()) {
  return record.revokedAt === null && record.expiresAt.getTime() > now.getTime();
}
