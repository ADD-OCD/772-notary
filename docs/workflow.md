# Development and release workflow

## Current authorized phase

The repository foundation and development runtime validation are authorized and completed. Only this
project's containers/resources and existing initial development migration were used. See
[runtime validation](runtime-validation.md) for results. Stop after reporting; no application features,
staging, Caddy, or production changes are authorized. Build success does not confer release permission.

## Development after separate startup approval

Use a `codex/` feature branch, small reviewable changes, synthetic data, and test-mode integrations.
Review migration SQL separately from application code. Run `npm run check` and domain-specific tests.
Database tests will require a separately authorized disposable project database. Never use production
credentials or datasets. Validate loopback-only port mappings and project-specific Docker resources.
The current repository has no automated CI publishing or deployment hooks.

## Staging later

Provision only after explicit approval of location, resources, secrets, and routing. Use a separate
database, credentials, storage, and payment test mode with restricted access. Build an immutable release
artifact and exercise guest booking, access controls, webhook replays, and migrations in staging.
Do not share data volumes or networks with development/production by default.

## Production later

Before requesting release approval, prepare the exact revision/image digest, tested migration SQL,
backup/restore evidence, least-privilege credentials, health checks, and rollback procedure. Promote the
same tested artifact only after explicit authorization. Coordinate any Caddy/routing changes separately.
PostgreSQL must remain private with no published host port 5432. Avoid destructive migrations; prefer
backward-compatible expand/contract changes. Application rollback does not undo a schema migration:
plan a forward fix or explicitly approved restore, including the potential data-loss window.

Nothing in these instructions authorizes work in `/opt/web/772-notary`, system package installation,
changes to shared infrastructure, `sudo`, global Docker operations, or public development exposure.
