import assert from "node:assert/strict";
import { test } from "node:test";
import { assertAdmin, type AdminPrincipal } from "../src/modules/auth/authorization";

const trusted: AdminPrincipal = { subject: "provider-subject", invited: true, active: true, mfaVerified: true };
test("only active invited administrators satisfying MFA policy are accepted", () => {
  assert.doesNotThrow(() => assertAdmin(trusted));
  for (const principal of [null, { ...trusted, subject: "" }, { ...trusted, invited: false }, { ...trusted, active: false }, { ...trusted, mfaVerified: false }]) {
    assert.throws(() => assertAdmin(principal), /access denied/);
  }
});
test("server MFA policy does not bypass invitation or active-status checks", () => {
  assert.doesNotThrow(() => assertAdmin({ ...trusted, mfaVerified: false }, { requireMfa: false }));
  assert.throws(() => assertAdmin({ ...trusted, invited: false }, { requireMfa: false }));
  assert.throws(() => assertAdmin({ ...trusted, active: false }, { requireMfa: false }));
});
