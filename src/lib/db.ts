import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForDb = globalThis as unknown as { notaryDb?: PrismaClient };

/** Lazy: importing this module or building pages never opens a connection. */
export function getDb(): PrismaClient {
  if (globalForDb.notaryDb) return globalForDb.notaryDb;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL must be configured before database access.");
  const adapter = new PrismaPg({ connectionString, max: 5 });
  const client = new PrismaClient({ adapter });
  globalForDb.notaryDb = client;
  return client;
}
