import { randomBytes } from "node:crypto";

export function createRequestReference() {
  return `772-${randomBytes(8).toString("hex").toUpperCase()}`;
}
