import assert from "node:assert/strict";
import { test } from "node:test";
import { createGuestToken, hashGuestToken, isGuestTokenActive } from "../src/modules/bookings/guest-token";

const now = new Date("2026-09-16T12:00:00Z");
const expiry = new Date("2026-09-16T13:00:00Z");
test("management tokens contain 256 random bits and persist as hashes", () => {
  const first = createGuestToken(expiry, now);
  const second = createGuestToken(expiry, now);
  assert.equal(Buffer.from(first.token, "base64url").length, 32);
  assert.notEqual(first.token, second.token);
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(hashGuestToken(first.token), first.tokenHash);
  assert.notEqual(first.tokenHash, first.token);
});
test("expiry boundary and revocation deny access", () => {
  assert.equal(isGuestTokenActive({ expiresAt: expiry, revokedAt: null }, now), true);
  assert.equal(isGuestTokenActive({ expiresAt: now, revokedAt: null }, now), false);
  assert.equal(isGuestTokenActive({ expiresAt: now, revokedAt: null }, expiry), false);
  assert.equal(isGuestTokenActive({ expiresAt: expiry, revokedAt: now }, now), false);
  assert.equal(isGuestTokenActive({ expiresAt: new Date(NaN), revokedAt: null }, now), false);
});
test("invalid tokens and non-future expiry are rejected", () => {
  for (const token of ["", "short", "a".repeat(44), "/".repeat(43)]) assert.throws(() => hashGuestToken(token));
  for (const date of [now, new Date(NaN)]) assert.throws(() => createGuestToken(date, now));
});
