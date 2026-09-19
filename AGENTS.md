# 772 Notary — repository operating rules

## Scope and authorization

- This repository is the DEVELOPMENT workspace: `/home/ben/dev/772-notary`.
- The separate PRODUCTION deployment directory is `/opt/web/772-notary`.
- Keep development work, project files, dependencies, and generated artifacts inside this repository. Configure project-local caches where needed.
- Do not modify, delete, restart, reconfigure, or deploy anything outside this repository without explicit user authorization.
- In particular, do not modify `/opt/web`, production deployments, Caddy configuration, SSH configuration, UFW/firewall configuration, system services, other Docker containers or networks, other applications, DNS, or system-wide packages.
- Do not use `sudo` without explicit user authorization.
- Do not publish development services directly to the public Internet.
- Do not deploy automatically. A successful development build does not authorize production deployment.
- If work requires an exception to these boundaries, explain the specific action and obtain authorization before proceeding.

## Current phase: approved homepage and request-wizard demo

- The user approved a Next.js/TypeScript foundation, PostgreSQL with Prisma, a reviewable initial schema and versioned migrations, repository-local npm dependencies, development Docker/Compose files, validation, and documentation.
- The public homepage and progressive `/request` wizard are authorized as development/demo UI. Use 772 Notary, `(772) 800-4555`, and `info@772notary.com`; prominent request CTAs lead to `/request`.
- The wizard must remain client-only in this phase: no permanent appointment creation, email/SMS, payments, authentication, or production deployment. Demo completion must state that nothing was submitted or confirmed.
- Development runtime validation remains authorized for this repository's existing project containers. Verify loopback-only application publishing and no PostgreSQL host port before startup.
- Use `sudo -n /usr/bin/docker ...` for authorized Docker/Compose operations. Sudo is authorized ONLY for Docker/Docker Compose commands required for this project's development containers. Do not modify the external `web` network, other containers/applications, system packages, SSH, firewall, DNS, Caddy, staging, or production. Do not broaden product functionality. Report data-model defects before changing schema/migrations; no additional migrations unless needed for a reported repository defect. Stop after the homepage/wizard validation report.
- Administrative access is invite-only, with an established authentication solution and support for required MFA. Authentication provider selection remains open; do not implement custom passwords.
- Guest appointment management will use expiring, cryptographically unguessable links. Scheduling policies must remain configurable rather than hard-coded.
- Store monetary amounts as integer minor units with explicit currency codes; never floating-point money. Limit finance to operational charges, fees, payments, refunds, receipts, mileage, expenses, and reconciliation; do not build a general ledger.
- Do not choose or integrate a payment provider yet. Future payment webhooks must be verified and idempotent.
- Do not implement storage of identification/notarized documents, Social Security numbers, card numbers, CVVs, or similar sensitive data. Minimize contact, location, appointment, and operational-note data.

## Product direction

- Business/site name: **772 Notary**.
- Planned capabilities: public marketing website, mobile notary services, service-area pages, appointment booking, customer records, administrative dashboard, payments, receipts, mileage and expenses, bookkeeping/reporting, and future accounting integrations.
- Customers must initially be able to book without creating an account.
- Preferred stack: Next.js, TypeScript, PostgreSQL, Docker / Docker Compose, and the existing external Caddy reverse proxy.
- Do not configure or replace the existing external reverse proxy without explicit authorization.

## Security and data boundaries

- Never store payment card numbers or CVVs in the application database. Use an external payment provider when payments are implemented.
- Design payment collection so raw card details do not pass through application servers, logs, analytics, fixtures, or backups; use provider-hosted/tokenized collection.
- Production PostgreSQL must be private and must not publish port 5432 publicly.
- Keep secrets out of version control and logs. Commit only placeholder environment examples; use distinct credentials for each environment.
- Use synthetic data and payment-provider test mode in development and staging. Do not copy production customer data into development without explicit authorization and an agreed protection process.
- Enforce administrative authentication and authorization on the server. Public booking must not grant access to customer records or administrative functions.
- Validate untrusted input on the server. Minimize collected personal information and avoid logging sensitive customer data.

## Development service isolation (after scaffolding approval)

- Bind host-published development ports only to loopback (`127.0.0.1` / `::1`), never all interfaces. Use an approved access method for remote previews.
- PostgreSQL must not publish any host port during development runtime validation; run database tooling from the application container.
- Use project-specific Compose names, networks, and storage. Do not attach to existing shared/production networks or mount production directories.
- Keep bind-mounted development data inside this repository. Creation of Docker-managed storage outside it requires explicit authorization under the scope rule above.
- Docker operations change host-managed state even when Compose files are local. Obtain explicit authorization for the specific project service startup and required Docker resources before first use; installing Docker is not authorized.
- Do not use global Docker cleanup/prune commands or broad container/network operations.
- Avoid destructive database operations or volume deletion without explicit authorization. Never assume data is disposable.

## Implementation and verification (after approval)

- Inspect existing changes before editing and preserve user work.
- Keep changes scoped to the approved task; do not introduce unrelated infrastructure or dependencies.
- Use repository-local dependency installation and a committed lockfile. Pin supported dependency/runtime versions during approved scaffolding.
- Version database migrations and review data-loss and compatibility risks before running them. Production migrations require explicit authorization.
- Run checks appropriate to the change and report results and limitations honestly. Never describe unrun checks as passing.
- Document required environment variables, local startup, tests, migration procedures, and release/rollback procedures as those features are implemented.
- Treat CI publishing, staging provisioning, and production releases as separate actions with explicit authorization; local validation alone permits none of them.

## Release boundary

- Proposed lifecycle: isolated development → automated checks → approved isolated staging → explicit production release approval.
- Keep development, staging, and production databases, credentials, payment modes, and storage separate.
- Before any authorized production release, identify the exact artifact/revision, migrations, backup/restore readiness, validation steps, and rollback procedure.
- Do not run commands against `/opt/web/772-notary` or alter traffic routing until the user explicitly authorizes that release scope.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
