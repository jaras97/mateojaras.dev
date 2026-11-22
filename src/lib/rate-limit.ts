import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null | undefined;

// Null when the Upstash variables are missing; the caller fails closed (D-12).
// Accepts the Marketplace names (KV_REST_API_*) as well.
export function getContactLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  )?.trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  )?.trim();
  if (!url || !token) return null;
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "contact",
    timeout: 2000,
  });
  return limiter;
}
