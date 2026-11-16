import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./scripts/lib/env";
import { requireEnv } from "./src/lib/env";

loadLocalEnv();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: requireEnv("DATABASE_URL_UNPOOLED") },
});
