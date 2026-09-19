import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "db/schema.prisma",
  migrations: { path: "db/migrations" },
  // Omission permits offline generation/validation. Database commands must have an explicit URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
