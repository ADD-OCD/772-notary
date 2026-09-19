import assert from "node:assert/strict";
import { test } from "node:test";
import { addMoney, money, MAX_AMOUNT_MINOR } from "../src/lib/money";

test("minor-unit arithmetic is exact and retains currency", () => {
  assert.deepEqual(addMoney(money(10, "USD"), money(20, "USD")), { amountMinor: 30, currency: "USD" });
  assert.equal(money(0, "USD").amountMinor, 0);
});
test("reject fractional, negative, non-finite, and overflowing amounts", () => {
  for (const amount of [0.1, -1, NaN, Infinity, MAX_AMOUNT_MINOR + 1]) assert.throws(() => money(amount, "USD"));
  assert.throws(() => addMoney(money(MAX_AMOUNT_MINOR, "USD"), money(1, "USD")));
});
test("reject malformed and mixed currency codes", () => {
  for (const currency of ["usd", "US", "USDD", ""]) assert.throws(() => money(1, currency));
  assert.throws(() => addMoney(money(1, "USD"), money(1, "EUR")));
});
