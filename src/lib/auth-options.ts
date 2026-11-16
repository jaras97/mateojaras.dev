// Better Auth options. Unguarded so scripts and the CLI can import it.
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "@/db/auth-schema";
import type { Db } from "@/db/client";

// Hosts Better Auth may treat as its own origin. No wildcard: each Vercel
// deployment host comes from system env vars; localhost only off Vercel.
function allowedHosts(): string[] {
  const vercel = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((host): host is string => Boolean(host));
  const local = process.env.VERCEL ? [] : ["localhost:3000", "localhost:3100"];
  return [...vercel, ...local];
}

export function authOptions(db: Db): BetterAuthOptions {
  return {
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    emailAndPassword: { enabled: true, disableSignUp: true },
    baseURL: {
      allowedHosts: allowedHosts(),
      fallback: process.env.BETTER_AUTH_URL,
      protocol: "auto",
    },
    // 02-01 B: memory storage (default). Sessions live in the DB, no cookieCache,
    // so signing out revokes immediately.
  };
}
