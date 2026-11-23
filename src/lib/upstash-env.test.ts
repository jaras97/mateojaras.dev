import { describe, expect, it } from "vitest";
import { resolveUpstashCredentials } from "./upstash-env";

describe("resolveUpstashCredentials", () => {
  it("returns the UPSTASH pair when complete", () => {
    expect(
      resolveUpstashCredentials({
        UPSTASH_REDIS_REST_URL: "https://u",
        UPSTASH_REDIS_REST_TOKEN: "t",
      }),
    ).toEqual({ url: "https://u", token: "t" });
  });

  it("falls back to KV when UPSTASH lines are empty or blank", () => {
    expect(
      resolveUpstashCredentials({
        UPSTASH_REDIS_REST_URL: "",
        UPSTASH_REDIS_REST_TOKEN: "  ",
        KV_REST_API_URL: "https://k",
        KV_REST_API_TOKEN: "kt",
      }),
    ).toEqual({ url: "https://k", token: "kt" });
  });

  it("prefers the UPSTASH pair when both are complete", () => {
    expect(
      resolveUpstashCredentials({
        UPSTASH_REDIS_REST_URL: "https://u",
        UPSTASH_REDIS_REST_TOKEN: "t",
        KV_REST_API_URL: "https://k",
        KV_REST_API_TOKEN: "kt",
      }),
    ).toEqual({ url: "https://u", token: "t" });
  });

  it("never mixes providers", () => {
    expect(
      resolveUpstashCredentials({
        UPSTASH_REDIS_REST_URL: "https://u",
        KV_REST_API_TOKEN: "kt",
      }),
    ).toBeNull();
  });

  it("uses KV when UPSTASH is incomplete and KV is complete", () => {
    expect(
      resolveUpstashCredentials({
        UPSTASH_REDIS_REST_URL: "https://u",
        UPSTASH_REDIS_REST_TOKEN: "",
        KV_REST_API_URL: "https://k",
        KV_REST_API_TOKEN: "kt",
      }),
    ).toEqual({ url: "https://k", token: "kt" });
  });

  it("trims values and returns null for an empty env", () => {
    expect(
      resolveUpstashCredentials({
        KV_REST_API_URL: " https://k ",
        KV_REST_API_TOKEN: " kt ",
      }),
    ).toEqual({ url: "https://k", token: "kt" });
    expect(resolveUpstashCredentials({})).toBeNull();
  });
});
