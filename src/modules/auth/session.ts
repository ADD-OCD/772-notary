import "server-only";
import type { AdminPrincipal } from "./authorization";

/** Fail closed until an established provider verifies identity, invitation, and MFA. */
export async function getAdminPrincipal(): Promise<AdminPrincipal | null> {
  return null;
}
