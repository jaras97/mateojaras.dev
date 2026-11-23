import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { resolveUpstashCredentials } from "@/lib/upstash-env";

let limiter: Ratelimit | null | undefined;

// Null when no complete credential pair exists; the caller fails closed (D-12).
// A complete UPSTASH_REDIS_REST_* pair wins, else a complete KV_REST_API_* pair.
export function getContactLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const creds = resolveUpstashCredentials(process.env);
  if (!creds) return null;
  limiter = new Ratelimit({
    redis: new Redis({ url: creds.url, token: creds.token }),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "contact",
    timeout: 2000,
  });
  return limiter;
}
