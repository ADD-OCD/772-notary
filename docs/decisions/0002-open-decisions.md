# Decisions before feature implementation or service startup

These do not prevent the repository-only scaffold, but must precede the corresponding feature.

1. Authentication provider, invitation/bootstrap owner, MFA enrollment/recovery, session lifetime,
   initial admin roles and authorization/audit policy. No password system will be built here.
2. Booking mode, business timezone, available services/durations, notice/horizon rules, hours, blocked
   intervals, buffers, cancellation/rescheduling cutoffs, resource/staff model, and geographic coverage.
   Decide concurrent reservation locking and expiring holds before accepting instant bookings.
3. Guest-token lifetime, renewal/revocation behavior, verified contact/delivery channel, notification
   provider, abuse limits and consent. No notification provider is selected.
4. Payment provider later, supported currencies, deposits/full payment, cancellation/refund policy,
   webhook retry/reconciliation rules, and receipt numbering/line-item/tax requirements.
5. Personal-data retention/deletion, operational-note guidance, admin audit-event retention,
   backup encryption/restore tests, reporting/export access, and applicable business requirements.
6. Authorized local service startup and preview access method. Verify available loopback ports;
   authorize Docker-managed resources before builds/startup. The current configuration uses no
   existing container network and does not publish PostgreSQL.
7. Future staging location/access controls, secrets delivery, backup owner, recovery targets,
   immutable release artifacts, production least-privilege database roles and migration procedure.
8. Validate the initial SQL against disposable PostgreSQL after service approval. Static schema checks
   cannot establish migration execution, database constraints, or transaction behavior.
9. Review pinned transitive dependency overrides on Prisma upgrades; see ../dependencies.md.
