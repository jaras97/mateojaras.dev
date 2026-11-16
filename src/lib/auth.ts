import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { authOptions } from "@/lib/auth-options";

// nextCookies must be the last plugin.
export const auth = betterAuth({
  ...authOptions(db),
  plugins: [nextCookies()],
});
