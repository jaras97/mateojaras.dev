export type UpstashCredentials = { url: string; token: string };

// Chooses one complete pair as a whole: an empty UPSTASH_* line (as copied from
// .env.example) must not shadow a complete Marketplace KV_* pair, and a URL
// from one provider must never be paired with a token from the other.
export function resolveUpstashCredentials(
  env: Record<string, string | undefined>,
): UpstashCredentials | null {
  const pick = (urlKey: string, tokenKey: string) => {
    const url = env[urlKey]?.trim();
    const token = env[tokenKey]?.trim();
    return url && token ? { url, token } : null;
  };
  return (
    pick("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN") ??
    pick("KV_REST_API_URL", "KV_REST_API_TOKEN")
  );
}
