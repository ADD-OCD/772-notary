# Database schema and migration guide

`db/schema.prisma` defines these models: Customer, Service, SchedulingPolicy, BusinessHours,
BlockedTime, ServiceArea, Appointment, AppointmentManagementToken, Charge, Payment, Refund,
Receipt, MileageEntry, Expense, WebhookEvent.

The initial migration `20260916000000_foundation/migration.sql` was generated from empty to
schema with Prisma migrate diff, without a datasource, then wrapped in a transaction and extended
with reviewable SQL CHECK constraints. It has now been applied only to the authorized development database; its recorded checksum matches the repository file.

## Database-enforced invariants

- UUID primary keys, foreign keys, and indexes for expected lookup paths.
- Currency-matching composite foreign keys from charges/payments to appointments and refunds/
  receipts to payments. All money is integer minor units with uppercase three-letter currency codes.
- Nonnegative monetary values and policy buffers; positive service duration/mileage; valid hours
  and time intervals. Appointment end time matches its duration snapshot.
- At least one nonblank customer contact method; no uniqueness assumption for shared contact data.
- Unique management-token hashes; expiry after creation; no plaintext tokens.
- Unique provider payment/event references and outgoing request idempotency keys.
- Restrictive financial/appointment deletes. Management tokens alone cascade with appointment deletion.

## Not enforced by this foundation

Prisma validation alone does not execute SQL CHECK constraints. Runtime validation applied the migration
to PostgreSQL 17.11, queried all 15 models, tested a rolled-back Prisma write/read, and verified five
rejected SQL fixtures. No concurrent-booking or full migration upgrade/rollback test has been run. Scheduling overlap, resource capacity, DST interpretation, actual
currency-code membership, service-area eligibility, policy immutability, allowed payment transitions,
refund aggregate ceilings, paid-receipt requirements, and snapshot completeness need application
transactions and database-backed tests before those features can write records. Basic receipt rows
are not a complete immutable invoice/receipt implementation. Zero-value financial rows are permitted;
provider-specific minimums remain a future business rule.

## Offline checks now

```sh
npm run db:validate
npm run db:generate
```

No DATABASE_URL is needed for these commands. The lazy application database client requires a URL
only when explicitly called. There is no migration deploy/reset/push hook in build or startup scripts.

## Future migrations after authorization

Use a separately authorized disposable development database and shadow database to create a new
migration with Prisma's `migrate dev --create-only`. Review its SQL and custom constraints, then apply
only to that development database and test. Never edit an already applied migration. Commit schema,
SQL, and migration lock together. Do not use `db push` as a replacement for reviewable migrations.
Do not overwrite the initial SQL by regenerating it: handwritten constraints must be preserved.

The initial draft can be regenerated with `prisma migrate diff --from-empty --to-schema db/schema.prisma
--script` only before its first application, with the transaction and handwritten constraints restored.
This operation alone cannot verify SQL execution against PostgreSQL.

Production migrations require separate explicit authorization and a reviewed backup/rollback plan.
Keep runtime database privileges narrower than the dedicated migration role. No production datasource
or staging configuration exists here.
