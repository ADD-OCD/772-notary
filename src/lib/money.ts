/** PostgreSQL Int stores signed 32-bit integers. This foundation stores nonnegative amounts. */
export type Money = Readonly<{ amountMinor: number; currency: string }>;
export const MAX_AMOUNT_MINOR = 2_147_483_647;

export function money(amountMinor: number, currency: string): Money {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || amountMinor > MAX_AMOUNT_MINOR) {
    throw new RangeError("Amount must be a nonnegative 32-bit integer in minor units.");
  }
  if (!/^[A-Z]{3}$/.test(currency)) throw new TypeError("Currency must be a three-letter uppercase code.");
  return Object.freeze({ amountMinor, currency });
}

export function addMoney(left: Money, right: Money): Money {
  money(left.amountMinor, left.currency);
  money(right.amountMinor, right.currency);
  if (left.currency !== right.currency) throw new TypeError("Cannot add different currencies.");
  return money(left.amountMinor + right.amountMinor, left.currency);
}
