// Config for `pnpm dlx auth@1.7.25 generate --config scripts/auth-cli.ts --output src/db/auth-schema.ts`.
import { betterAuth } from "better-auth";
import { createDb } from "@/db/client";
import { authOptions } from "@/lib/auth-options";
import { requireEnv } from "@/lib/env";
import { loadLocalEnv } from "./lib/env";

loadLocalEnv();

export const auth = betterAuth(
  authOptions(createDb(requireEnv("DATABASE_URL"))),
);
