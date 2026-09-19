# ADR 0001: Approved application foundation

Status: accepted by the user for repository-only scaffolding, 2026-09-16.

Use a modular Next.js/TypeScript application, PostgreSQL, and Prisma. Use versioned reviewable
migrations; never auto-apply production schema changes. Keep development completely isolated from
production and introduce staging only through separate authorization. Docker configuration may be
written now; image builds, container startup, Caddy changes, and deployments are not authorized.

Public content and booking require no customer account. Administrative access is invite-only through
an established provider with MFA support. Provider selection is deferred and access fails closed.
Guest management links must be expiring and cryptographically unguessable.

Scheduling must accommodate configurable booking mode, hours, blocked times, duration, buffers,
cancellation/rescheduling rules, service areas, and travel fees. No business policy is implicitly seeded.

Collect only necessary contact, location, service, appointment, and operational-note data. Do not store
identification/notarized documents, SSNs, card numbers, CVVs, or comparable sensitive data.
Use external hosted payment collection; do not select a provider in this phase. Future webhooks require
signature verification and idempotency.

Money uses integer minor units with explicit currencies. Support operational charges, travel fees,
payments, refunds, receipts, mileage, expenses, and reconciliation. Do not implement a general ledger.
Keep accounting integration behind a separate boundary.

Implementation choices: Node 24, npm exact versions/lockfile, App Router, PostgreSQL 17 development
image tag, stable Prisma 7, and TypeScript 5.9. Runtime/database versions and container digests must
be reviewed again before any authorized deployment. Development images are not release artifacts.

References consulted for framework configuration:
- https://nextjs.org/docs/app/getting-started/installation
- https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7
