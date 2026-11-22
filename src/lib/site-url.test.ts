import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "@/lib/site-url";

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "prod.example.test");
    expect(siteUrl()).toBe("https://example.test");
  });

  it("falls back to the Vercel production url over https", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "  ");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "prod.example.test");
    expect(siteUrl()).toBe("https://prod.example.test");
  });

  it("falls back to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
