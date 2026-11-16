import { describe, expect, it } from "vitest";
import { describeDbTarget } from "@/lib/db-target";

// Synthetic inputs: no real endpoint or credential.
describe("describeDbTarget", () => {
  const url =
    "postgresql://u:p@ep-cool-name-123-pooler.us-east-2.aws.neon.tech/db";

  it("names the endpoint id", () => {
    expect(describeDbTarget(url)).toContain("ep-cool-name-123");
  });

  it("never includes user or password", () => {
    const out = describeDbTarget(url);
    expect(out).not.toContain("u:");
    expect(out).not.toContain(":p@");
    expect(out).not.toContain("@");
  });

  it("returns the host for a URL without credentials", () => {
    expect(describeDbTarget("postgresql://db.example.com/x")).toContain(
      "db.example.com",
    );
  });

  it("throws on a non-URL string without echoing it", () => {
    expect(() => describeDbTarget("secret-not-a-url")).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining("secret-not-a-url"),
      }),
    );
  });
});
