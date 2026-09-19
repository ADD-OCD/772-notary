// Run from /app in the authorized development app container with:
// node --conditions=react-server --import=tsx --input-type=module < scripts/runtime-db-smoke.mjs
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "db", "Runtime smoke is restricted to the Compose development database.");
assert.equal(url.pathname, "/notary_dev");
const { getDb } = await import(pathToFileURL(resolve("src/lib/db.ts")).href);
const db = getDb();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const identity = await db.$queryRaw`SELECT current_database() AS database, current_user AS role, version() AS version`;
  assert.equal(identity[0].database, "notary_dev");
  const migrations = await db.$queryRaw`SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`;
  const expectedMigrations = ["20260916000000_foundation", "20260919000000_request_intake"];
  assert.deepEqual(migrations.map(({ migration_name }) => migration_name), expectedMigrations);
  for (const migration of migrations) {
    assert.ok(migration.finished_at);
    assert.equal(migration.rolled_back_at, null);
    const sql = await readFile(`db/migrations/${migration.migration_name}/migration.sql`);
    assert.equal(migration.checksum, createHash("sha256").update(sql).digest("hex"));
  }
  const models = ["customer", "service", "schedulingPolicy", "businessHours", "blockedTime", "serviceArea", "appointment", "appointmentManagementToken", "charge", "payment", "refund", "receipt", "mileageEntry", "expense", "webhookEvent", "notaryRequest"];
  const counts = Object.fromEntries(await Promise.all(models.map(async (name) => [name, await db[name].count()])));
  // Verify real Prisma writes/reads without retaining synthetic data.
  const rollback = new Error("intentional smoke-test rollback");
  const id = randomUUID();
  await assert.rejects(db.$transaction(async (tx) => {
    await tx.customer.create({ data: { id, name: "Runtime smoke fixture", email: "runtime@example.invalid" } });
    assert.equal((await tx.customer.findUniqueOrThrow({ where: { id } })).email, "runtime@example.invalid");
    const requestId = randomUUID();
    await tx.notaryRequest.create({ data: {
      id: requestId,
      reference: "772-RUNTIME00000001",
      idempotencyKey: randomUUID(),
      service: "HEALTHCARE_DOCUMENTS",
      documentCount: 1,
      locationType: "NOTARY_OFFICE",
      preferredDate: new Date("2030-01-01T00:00:00.000Z"),
      preferredTimeOfDay: "FLEXIBLE",
      customerName: "Runtime smoke fixture",
      phone: "(772) 555-0123",
      email: "runtime@example.invalid",
      preferredContactMethod: "EMAIL",
      acknowledgedAt: new Date(),
    } });
    assert.equal((await tx.notaryRequest.findUniqueOrThrow({ where: { id: requestId } })).status, "RECEIVED");
    throw rollback;
  }), (error) => error === rollback);
  assert.equal(await db.customer.findUnique({ where: { id } }), null);
  // Each rejected fixture is isolated in a transaction and rolled back.
  const cases = [
    ["customer contact", 'INSERT INTO "Customer" (id,name,"updatedAt") VALUES ($1,$2,now())', [randomUUID(), "Runtime smoke fixture"], "23514"],
    ["negative money", 'INSERT INTO "Expense" (id,"occurredOn",category,description,"amountMinor",currency) VALUES ($1,CURRENT_DATE,$2,$3,-1,$4)', [randomUUID(), "smoke", "synthetic fixture", "USD"], "23514"],
    ["currency format", 'INSERT INTO "Expense" (id,"occurredOn",category,description,"amountMinor",currency) VALUES ($1,CURRENT_DATE,$2,$3,1,$4)', [randomUUID(), "smoke", "synthetic fixture", "usd"], "23514"],
    ["service duration", 'INSERT INTO "Service" (id,name,"durationMinutes") VALUES ($1,$2,0)', [randomUUID(), "Runtime smoke fixture"], "23514"],
    ["negative mileage", 'INSERT INTO "MileageEntry" (id,"occurredOn","distanceMeters",purpose) VALUES ($1,CURRENT_DATE,-1,$2)', [randomUUID(), "Runtime smoke fixture"], "23514"],
    ["office address privacy", 'INSERT INTO "NotaryRequest" (id,reference,"idempotencyKey",service,"documentCount","locationType",address,"preferredDate","preferredTimeOfDay","customerName",phone,email,"preferredContactMethod","acknowledgedAt","updatedAt") VALUES ($1,$2,$3,$4,1,$5,$6,CURRENT_DATE,$7,$8,$9,$10,$11,now(),now())', [randomUUID(), "772-BADOFFICE00001", randomUUID(), "BUSINESS_DOCUMENTS", "NOTARY_OFFICE", "must-not-persist", "FLEXIBLE", "Runtime smoke", "(772) 555-0123", "runtime@example.invalid", "EMAIL"], "23514"],
    ["mobile location required", 'INSERT INTO "NotaryRequest" (id,reference,"idempotencyKey",service,"documentCount","locationType","preferredDate","preferredTimeOfDay","customerName",phone,email,"preferredContactMethod","acknowledgedAt","updatedAt") VALUES ($1,$2,$3,$4,1,$5,CURRENT_DATE,$6,$7,$8,$9,$10,now(),now())', [randomUUID(), "772-BADMOBILE00001", randomUUID(), "BUSINESS_DOCUMENTS", "HOME_OR_RESIDENCE", "FLEXIBLE", "Runtime smoke", "(772) 555-0123", "runtime@example.invalid", "EMAIL"], "23514"],
  ];
  for (const [name, query, values, code] of cases) {
    await client.query("BEGIN");
    try { await assert.rejects(client.query(query, values), (error) => error.code === code, name); }
    finally { await client.query("ROLLBACK"); }
  }
  const after = Object.fromEntries(await Promise.all(models.map(async (name) => [name, await db[name].count()])));
  assert.deepEqual(after, counts);
  console.log(JSON.stringify({ identity, migrations: expectedMigrations, migrationChecksums: "matched", modelQueries: models.length, counts, prismaTransactionRollback: "passed", databaseConstraintChecks: cases.length, persistentTestData: "none" }, null, 2));
} finally {
  await Promise.all([client.end(), db.$disconnect()]);
}
