# Foundation scaffold report — 2026-09-16

## Scope

Updated the existing AGENTS.md for the approved foundation phase; created the files listed below.
All authored files, dependencies, caches, generated Prisma client, and build output are inside this repository.
No services, Docker images/containers, database migration execution, staging, production, or deployment were started.
No payment/auth provider was selected or integrated. No commit was created.

## Validation

- `npm run check`: passed (Prisma schema validation, client generation, ESLint with zero warnings, Next route type generation, TypeScript, 8/8 unit tests, optimized Next.js build).
- Build output: static `/` and not-found page; dynamic `/admin` with default-denied authentication adapter.
- `docker compose --env-file .env.example -f compose.dev.yaml config --quiet`: passed; configuration only.
- Static Compose assertions: passed; loopback-only app port, unpublished database, private project DB network, repository-local database mount, no external networks.
- Initial generated DDL matches schema in an offline Prisma diff; custom SQL CHECK constraints are separately reviewable.
- `npm ls --all`: valid dependency tree.
- `npm audit` and `npm audit --omit=dev`: zero reported vulnerabilities with the documented scoped overrides.
- Not run: Docker build/start, PostgreSQL migration application, database integration/concurrency tests, HTTP/browser tests, authentication/provider integration, staging or production checks.

## Versions

Host: Node.js 24.21.0, npm 11.19.0. Docker CLI 29.8.1 and Compose 5.5.1 are installed; only static Compose rendering was used.
Configured development images: `node:24.21.0-bookworm-slim`, `postgres:17-bookworm` (not pulled or verified).

| Direct dependency | Pinned version |
| --- | --- |
| `@prisma/adapter-pg` | 7.10.0 |
| `@prisma/client` | 7.10.0 |
| `dotenv` | 17.4.2 |
| `next` | 16.3.5 |
| `pg` | 8.23.0 |
| `react` | 19.3.0 |
| `react-dom` | 19.3.0 |
| `server-only` | 0.0.1 |
| `@eslint/js` | 10.0.1 |
| `@next/eslint-plugin-next` | 16.3.5 |
| `@types/node` | 24.13.5 |
| `@types/pg` | 8.23.1 |
| `@types/react` | 19.3.0 |
| `@types/react-dom` | 19.3.0 |
| `eslint` | 10.10.0 |
| `eslint-plugin-react-hooks` | 7.1.1 |
| `globals` | 17.12.0 |
| `prisma` | 7.10.0 |
| `tsx` | 4.23.13 |
| `typescript` | 5.9.3 |
| `typescript-eslint` | 8.70.0 |

Scoped overrides: `deepmerge-ts` 8.0.2 under `@prisma/config`; `mysql2` 3.24.4 under `prisma`. See [dependency decisions](dependencies.md).

## Repository file inventory

`AGENTS.md` was updated; all other listed files were created. Generated/untracked build artifacts and installed dependencies are excluded from this source inventory.

```text
.dockerignore
.env.example
.gitignore
.npmrc
.nvmrc
AGENTS.md
README.md
compose.dev.yaml
db/migrations/20260916000000_foundation/migration.sql
db/migrations/migration_lock.toml
db/schema.prisma
docker/Dockerfile.dev
docs/architecture.md
docs/database.md
docs/decisions/0001-foundation.md
docs/decisions/0002-open-decisions.md
docs/dependencies.md
docs/scaffold-report.md
docs/workflow.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package-lock.json
package.json
prisma.config.ts
public/.gitkeep
scripts/run-local.mjs
src/app/(booking)/README.md
src/app/(marketing)/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/api/webhooks/README.md
src/app/globals.css
src/app/layout.tsx
src/components/README.md
src/lib/db.ts
src/lib/money.ts
src/modules/auth/README.md
src/modules/auth/authorization.ts
src/modules/auth/session.ts
src/modules/bookings/README.md
src/modules/bookings/guest-token.ts
src/modules/customers/README.md
src/modules/expenses/README.md
src/modules/payments/README.md
src/modules/receipts/README.md
src/modules/reporting/README.md
src/modules/services/README.md
tests/authorization.test.ts
tests/guest-token.test.ts
tests/money.test.ts
tsconfig.json
```

Ignored local outputs: `node_modules/`, `.cache/`, `.next/`, `src/generated/prisma/`, and `tsconfig.tsbuildinfo`. No real `.env` was created.

## Remaining decisions and issues

See [open decisions](decisions/0002-open-decisions.md): auth/MFA/invitations, scheduling policies and resource model, guest-link delivery/lifetime, later payment provider and financial policies, retention/backup/access policies, approved local startup/preview, and later staging/release infrastructure.
Prisma overrides require review on upgrades. Database SQL, container builds and HTTP behavior remain unverified until their respective execution is approved. The scaffold is not a functioning booking/payment/admin product.

Work stops here pending approval for further feature work or any service startup/infrastructure action.
