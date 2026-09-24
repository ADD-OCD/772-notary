import assert from "node:assert/strict";
import { test } from "node:test";
import { requestOriginIsAllowed } from "../src/modules/requests/origin";

function proxiedRequest(origin?: string, overrides: Record<string, string> = {}) {
  const headers = new Headers({
    host: "notary.addocd.cloud",
    "x-forwarded-proto": "https",
    ...overrides,
  });
  if (origin) headers.set("origin", origin);
  return new Request("http://app:3000/api/requests", { method: "POST", headers });
}

test("allows a direct same-origin request", () => {
  const request = new Request("http://127.0.0.1:3000/api/requests", {
    method: "POST",
    headers: { origin: "http://127.0.0.1:3000" },
  });
  assert.equal(requestOriginIsAllowed(request), true);
});

test("allows the public HTTPS origin when the request is received behind the proxy", () => {
  assert.equal(requestOriginIsAllowed(proxiedRequest("https://notary.addocd.cloud")), true);
});

test("rejects a foreign origin", () => {
  assert.equal(requestOriginIsAllowed(proxiedRequest("https://attacker.example")), false);
});

test("does not trust a forwarded host supplied separately from the request authority", () => {
  assert.equal(requestOriginIsAllowed(proxiedRequest("https://attacker.example", {
    "x-forwarded-host": "attacker.example",
  })), false);
});

test("rejects an unvalidated forwarded protocol", () => {
  assert.equal(requestOriginIsAllowed(proxiedRequest("https://notary.addocd.cloud", {
    "x-forwarded-proto": "https, http",
  })), false);
});

test("retains the existing policy of allowing requests without an Origin header", () => {
  assert.equal(requestOriginIsAllowed(proxiedRequest()), true);
});
