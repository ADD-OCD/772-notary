# Dependency decisions

Direct dependencies are exact-pinned in package.json, with resolved transitives in package-lock.json.
Node 24.21.0 is the tested host version. Stable Prisma 7.10.0 and TypeScript 5.9.3 were chosen deliberately;
the registry's Prisma latest tag pointed to a release candidate during scaffolding.

ESLint 10 uses the official Next.js plugin, React Hooks rules, and typescript-eslint directly.
The bundled eslint-config-next React/import/accessibility plugins were incompatible with ESLint 10;
the compatible older ESLint 9 release was deprecated. Do not reintroduce that incompatible combination.

## Temporary, scoped npm overrides

- `@prisma/config` -> `deepmerge-ts` 8.0.2, replacing vulnerable 7.1.5. This is a major-version override;
  local Prisma config loading, validation, generation, and offline migration generation are exercised.
- `prisma` -> `mysql2` 3.24.4, replacing the advisory-affected transitive package. This application uses
  PostgreSQL only and does not exercise MySQL functionality.

These address audit findings GHSA-ggr8-5vv4-36mx (recursive-merge exhaustion),
GHSA-3f6p-5ww8-9rcr (MySQL auth downgrade), and GHSA-rgwj-5xj2-c3m3 (MySQL decompression).
Review/remove overrides when upstream Prisma dependencies resolve the advisories. Do not use
`npm audit fix --force` blindly. Prisma's optional peer linkage means its tooling can appear in
`npm audit --omit=dev`; do not assume all CLI dependencies are absent from a runtime installation.
A clean audit is not a security guarantee or production approval.

Development Docker bases are Node 24.21.0 Debian slim and PostgreSQL 17 Debian bookworm.
They were pulled/built during authorized runtime validation; the database reports PostgreSQL 17.11.
The app image now installs OpenSSL and CA certificates for Prisma migration tooling; no host packages
were changed. Image vulnerability scanning was not performed. Runtime image IDs are recorded in the
runtime report. Pin release digests during a separately approved release step.
