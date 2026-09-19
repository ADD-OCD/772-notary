# 772 Notary

Repository-only development foundation for a modular Next.js application. Read
[AGENTS.md](AGENTS.md) before work. Development: `/home/ben/dev/772-notary`.
Production: `/opt/web/772-notary` (outside the authorized scope).

## Current state

- Responsive public homepage plus a four-step `/request` workflow; no customer accounts.
- Admin route denies access until an established authentication provider is integrated.
- PostgreSQL/Prisma schema and initial migration applied and verified in the private development database.
- Offline checks, unit tests, database smoke checks, and loopback HTTP validation completed; development containers are running.
- Requests are validated server-side and persisted separately from appointments. Submission does not confirm or create an appointment. Provider-neutral email templates are present, but delivery remains safely disabled until a transactional provider is approved and configured.

## Local installation and checks

Use Node 24 (`.nvmrc` records the tested patch). From this repository:

```sh
npm ci --ignore-scripts
npm run check
```

Dependency lifecycle scripts are unnecessary for this scaffold. Prisma generation is explicit.
`.npmrc` keeps the npm cache inside the repository; the local tool runner keeps tool caches
and temporary files here and disables Next.js telemetry. No `.env` or database is required
for validation, client generation, type checking, unit tests, or the build. The build uses
Webpack and local system fonts; it does not fetch fonts or query services. `npm run check`
does not launch a server or apply migrations.

Individual commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:validate`,
`npm run db:generate`, `npm run build`. `npm audit` contacts the npm advisory service;
it is separate from the offline check suite.

## Development runtime

Development startup was explicitly authorized and validated; see [the runtime report](docs/runtime-validation.md). Further feature development and all staging/production changes still require approval. Host-based
`npm run dev` binds only to `127.0.0.1:3000`. `npm start` serves the built application on
loopback as well. A remote preview access method remains to be approved; do not change
SSH, Caddy, firewall, or DNS settings or expose these ports publicly.

The development Compose configuration publishes only `127.0.0.1:3000`; PostgreSQL has
no published port. It uses its own networks and `./.local/postgres` data directory.
The Docker daemon still creates images/network state outside the repository, so image
builds and service startup require explicit authorization, granted for this development validation.
The app image copies the repository; later source changes require a rebuild (no live host mount).

A git-ignored, mode-0600 `.env` now contains generated development-only credentials. For a new
checkout, create it from `.env.example` after authorization, replace placeholders, and review resolved
Compose configuration before startup.
Use URI-safe generated credentials or percent-encode connection URL values correctly.
The example loopback DATABASE_URL is illustrative: the supplied Compose database has no host
port, so host-side database commands cannot use it. Inside Compose the database host is `db`.
An approved database-command workflow should run inside the project app container; do not
publish PostgreSQL merely to make the example URL work.

Neither the Dockerfile nor Compose entrypoints run migrations. Only the existing initial migration was authorized and applied to development. Further migrations
require the applicable approval and review; see [the database guide](docs/database.md).
There is intentionally no deploy script, production Compose file, Caddy configuration, or CI release hook.

## Layout and decisions

- `src/app`: responsive marketing homepage, progressive request wizard, health route, reserved webhooks, and denied admin route.
- `src/modules`: auth, bookings, customers, services, payments, receipts, expenses, reporting.
- `src/lib`: lazy server-only database client and integer-money primitives.
- `src/components`, `public`: shared UI/static-asset boundaries.
- `db`: Prisma schema and versioned SQL migrations.
- `tests`: offline money, guest-token, and admin-authorization unit tests.
- `scripts/run-local.mjs`: repository-local tool execution environment.
- `docker`, `compose.dev.yaml`: inactive development container configuration.
- `docs`: architecture, data invariants, workflow, decisions, dependency and validation records.

Start with [architecture](docs/architecture.md), [decisions](docs/decisions/0001-foundation.md),
[workflow](docs/workflow.md), and [remaining decisions](docs/decisions/0002-open-decisions.md).

### Repeat authorized runtime checks

From this repository, with authenticated Docker access:

```sh
sudo -n /usr/bin/docker compose -f compose.dev.yaml ps
sudo -n /usr/bin/docker compose -f compose.dev.yaml exec -T app node scripts/run-local.mjs prisma migrate status
sudo -n /usr/bin/docker compose -f compose.dev.yaml exec -T app node --conditions=react-server --import=tsx --input-type=module < scripts/runtime-db-smoke.mjs
```

The database smoke script only accepts host `db` and database `notary_dev`, checks all model queries,
validates the applied migration checksum, and rolls back its synthetic fixtures. It does not apply
migrations. This initial-schema smoke check will need review when future migrations are approved.
Do not run production builds in the active dev container's `.next` directory; use an ephemeral
project container with `compose run --rm --no-deps app npm run build`, without service ports.
