// Applies drizzle/ migrations to the database in DATABASE_URL_UNPOOLED.
// Usage: pnpm db:migrate   (reads .env.local unless the variables are already set)
// Never use drizzle-kit push; schema reaches Neon only through migration files.
import { Client } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { describeDbTarget } from "../src/lib/db-target";
import { requireEnv } from "../src/lib/env";
import { loadLocalEnv } from "./lib/env";

const MIGRATION_LOCK_ID = 727_001;

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL_UNPOOLED");
  console.log(`migrate target: ${describeDbTarget(url)}`);
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
    await migrate(drizzle(client), { migrationsFolder: "drizzle" });
    console.log("migrations applied");
  } finally {
    await client
      .query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID])
      .catch(() => {});
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "migrate failed");
  process.exitCode = 1;
});
