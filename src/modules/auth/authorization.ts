/** Trusted adapter contract; never construct this principal from request parameters. */
export type AdminPrincipal = Readonly<{
  subject: string;
  invited: boolean;
  active: boolean;
  mfaVerified: boolean;
}>;

/** MFA is required by default; only trusted server policy may relax it. */
export function assertAdmin(principal: AdminPrincipal | null, policy = { requireMfa: true }): asserts principal is AdminPrincipal {
  if (!principal?.subject || !principal.invited || !principal.active || (policy.requireMfa && !principal.mfaVerified)) {
    throw new Error("Administrative access denied.");
  }
}
