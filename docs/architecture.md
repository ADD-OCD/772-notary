# Architecture

One Next.js App Router application with TypeScript and PostgreSQL via Prisma. Route handlers,
server actions, and server components should call business modules; modules own state transitions
and call the server-only database layer. Presentation components do not query the database.
No microservices, queue, accounting engine, or separate customer identity system is needed yet.

## Implemented versus reserved

Implemented: public placeholder, default-denied admin layout, null authentication adapter,
admin-policy assertion, integer-money validation/addition, cryptographic guest-token primitives,
lazy Prisma client, schema/migration, local checks and development container files.

Reserved: booking UI/writes, actual availability evaluation, auth provider and invitations,
token redemption/delivery, payment provider and webhooks, receipt issuance, reporting queries,
accounting adapters, email/SMS, rate limiting, audit logging and service deployment.
No reservation directory exposes an endpoint simply by containing a README.

## Domain boundaries

Customers hold only required name/contact data, without account credentials. Appointment location
belongs to the appointment, not a perpetual address profile. Free-text operational notes are bounded
but still require collection guidance and access controls; sensitive information is prohibited there too.

Appointments reference services, versioned scheduling policies, and optional service areas. They
snapshot service name/duration, buffers, timezone, and charges. Policy rows must be treated as immutable
once referenced. Hours use local minutes and ISO weekdays; blocked intervals and appointments use UTC
instants with explicit IANA timezone metadata. No active policy is seeded and no timezone, booking mode,
price, or cutoff is chosen. Geographic eligibility, travel calculation, resource assignment, overlap
prevention, and DST handling require implementation before booking writes.

Operational finance consists of charge lines, payment attempts, refunds, receipt records, mileage,
expenses, and reconciliation status. Store nonnegative signed-32-bit integer minor units plus explicit
currency; USD cents are an example, not a global currency default. Money primitives reject fractional
amounts, overflow, malformed currency codes, and mixed-currency arithmetic. Validate supported actual
currency codes at future API boundaries. No FX, ledger accounts, journal entries, or tax calculation exists.

Accounting integration belongs behind reporting/export contracts using stable internal IDs and
provider references, never inside booking policy code. External effects should eventually use a durable
outbox/retry design, introduced with the first integration rather than speculative infrastructure now.

## Security boundaries

Admin authentication must use an established solution with invitation controls and verifiable MFA.
The adapter currently returns null; the admin page is inaccessible. An MFA policy assertion is not
an authentication system. Every future action/handler needs its own server-side authorization; layouts
alone are insufficient. Identity and permissions must come from verified sessions/server records.

Guest management uses 32 cryptographically random bytes and stores only SHA-256 token hashes, expiry,
and revocation. Future redemption must enforce those values on each request, limit attempts, prevent
cross-appointment access, and protect mutation requests from CSRF. Choose lifetime/rotation separately.
Do not log URLs containing tokens or put analytics on token pages. No token endpoint is implemented.

Payment collection must be provider-hosted. Persist safe IDs and processing state, never card details
or raw webhook payloads. Verify webhook signatures before deduplicating; use atomic transactions,
processing ownership/retry rules, and outgoing idempotency keys. Schema uniqueness is a foundation,
not a working idempotent webhook handler.

No upload path or document storage exists. Protect and minimize personal data in logs, database access,
exports, and backups. Final CSP/session-cookie/origin/rate-limit settings depend on future auth/payment
flows and must be completed before exposure; the scaffold includes basic no-referrer, frame-denial,
content-type, and permissions headers. Robots metadata disables indexing but is not access control.
