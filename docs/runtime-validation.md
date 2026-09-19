# Development runtime validation — completed

Validated 2026-09-16 in `/home/ben/dev/772-notary`. This supersedes the earlier Docker-authentication
blocker. Authorized Docker access used `sudo -n /usr/bin/docker`. Only this project's development
resources were operated. Both development services are left running; feature development is paused.

## Containers and resources

| Container | Image | Final status |
| --- | --- | --- |
| `notary772-dev-app-1` | `notary772-dev-app` | Running, zero restarts; HTTP smoke checks pass |
| `notary772-dev-db-1` | `postgres:17-bookworm` | Running, healthy, zero restarts; PostgreSQL 17.11 |

The app now has a Docker HEALTHCHECK against `/api/health`; its readiness was also verified through HTTP.

Created networks:
- `notary772-dev_app`: project app network, app container only.
- `notary772-dev_database`: internal project database network, app and database containers only.

No named or anonymous Docker volumes were created. PostgreSQL persists in the bind mount
`/home/ben/dev/772-notary/.local/postgres` -> `/var/lib/postgresql/data`. It is git-ignored and owned
as required by the PostgreSQL container; do not delete or reset it casually. The app has no bind mounts.
A temporary `compose run --rm --no-deps app npm run build` container published no ports and was
removed after its successful production build. Final project container inventory contains only app/db.

Validated image IDs:
- App: `sha256:9eeb2a09d89bae4e1e4d96f82ef3346d3c18e65b2ae7c0c0ce1a0dc3a88a6c38`
- PostgreSQL: `sha256:051f7b7b3abdd564d5d1bd1e8c4b9c1b6e77087d1dd22020ede611c096a272e0`

## Safety before startup and after validation

Resolved Compose was parsed before startup: application publishes only `127.0.0.1:3000:3000`,
PostgreSQL publishes no host port, no host networking/privileged services/external networks, and
database storage stays under the development repository. Actual container PortBindings and network
membership were checked after startup and matched the configuration.

TCP/UDP host listeners were recorded before startup and after validation. The only addition was
TCP `127.0.0.1:3000`; no original listeners disappeared. Public SSH TCP 22 and HTTP/HTTPS TCP 80/443
on IPv4/IPv6, plus UDP 443, remained unchanged. Host port 5432 is not listening. No unexpected public
port was introduced. Container-internal wildcard listeners are contained by the verified Docker
networking/publishing configuration.

No commands modified/restarted Caddy, changed SSH/firewall/DNS, installed host packages, operated
unrelated containers/networks or the external `web` network, created staging, or touched `/opt/web`.

## PostgreSQL and migrations

The PostgreSQL image initialized only the development database `notary_dev`. From the app container,
authenticated connectivity verified database `notary_dev` and role `notary_dev` at internal host `db`.

Applied exactly the existing `20260916000000_foundation` migration using Prisma migrate deploy,
then verified migrate status reports the database up to date. No schema/migration files were changed,
and no additional migration was generated. The database's recorded migration checksum matches the
repository SQL; its completion timestamp is present and it is not marked rolled back.

The repository's actual `getDb()` adapter was exercised by `scripts/runtime-db-smoke.mjs`:
- Read PostgreSQL identity/version through Prisma.
- Queried all 15 Prisma models successfully.
- Created/read a synthetic customer inside a transaction, deliberately rolled it back, and verified absence.
- Verified PostgreSQL rejects five isolated synthetic fixtures: missing customer contact, negative expense
  amount, lowercase currency, zero service duration, and negative mileage (CHECK violation SQLSTATE 23514).
- Rolled back every fixture and verified model counts remained unchanged (all zero).

This is foundation runtime coverage, not exhaustive business-rule/concurrency testing. The smoke script
is restricted to `db/notary_dev` and currently expects the single initial migration; review it when future
schema changes are approved. The Compose initialization role is development-only; production will need
separate least-privilege runtime/migration roles under a future approved deployment design.

## Loopback HTTP results

| URL | Result |
| --- | --- |
| `http://127.0.0.1:3000/` | 200; responsive 772 Notary marketing homepage verified |
| `http://127.0.0.1:3000/request` | 200; progressive request wizard verified |
| `http://127.0.0.1:3000/api/health` | 200; exact service health JSON, `no-store` |
| `http://127.0.0.1:3000/admin` | 404; default-denied admin route, administrative heading absent |

Both responses included `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and
`X-Frame-Options: DENY`. Next.js started successfully in the development app container using Turbopack.
No Caddy proxy, public URL, or production route was used.

## Automated checks and builds

- Development Docker image build: passed after the OpenSSL fix below; npm install audit reported zero vulnerabilities.
- Repository `npm run check`: passed Prisma validation/generation, zero-warning lint, route type generation,
  TypeScript checking, 8/8 unit tests, and optimized Next.js production build.
- Production build inside an ephemeral project app container: passed, without sharing the running dev
  container's `.next` directory. No production server or deployment was started.
- Database smoke checks, migration checksum/status, container status, HTTP smoke, and listener comparisons: passed.

## Fix and files changed in the resumed validation

- `docker/Dockerfile.dev`: installed OpenSSL and CA certificates inside the development image. The original
  slim image generated a Prisma libssl-detection warning; the rebuilt image and actual migration succeeded
  without that warning. No host packages were installed.
- `scripts/runtime-db-smoke.mjs`: added repeatable, development-restricted query/rollback/constraint validation.
- `AGENTS.md`: recorded the authorized absolute Docker executable.
- `compose.dev.yaml`: updated its phase comment only; port/network/storage configuration is unchanged.
- `README.md`: current runtime status, safe repeat-check commands, and existing credentials guidance.
- `docs/database.md`, `docs/dependencies.md`, `docs/workflow.md`: updated previous pre-runtime statements.
- `docs/runtime-validation.md`: replaced the blocked report with these verified results.

Ignored runtime artifacts: `.local/postgres/`, `.local/runtime/listeners-before-containers.txt`,
`listeners-after-containers.txt`, `container-http-results.json`, `containers.json`, and `networks.json`.
The existing git-ignored mode-0600 `.env` credentials were reused unchanged. Build/client/cache outputs
were regenerated. No dependencies, application features, or schema/migrations were changed.

## Remaining limitations and stopping point

No unresolved runtime blocker. Both app and database containers have passing healthchecks; direct HTTP readiness passed.
Container image security scanning, booking concurrency, provider integrations, and production readiness
are outside this runtime smoke validation. The current images contain a snapshot of source; changes
require a rebuild. Development containers remain running on the approved isolated configuration.
Stop here pending explicit approval before feature work or any production/staging/infrastructure changes.
