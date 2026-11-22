import { describe, expect, it } from "vitest";
import { hashIp } from "./ip-hash";

describe("hashIp", () => {
  it("returns a stable 64-char hex that is not the IP", () => {
    const h = hashIp("1.2.3.4", "k");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe(hashIp("1.2.3.4", "k"));
    expect(h).not.toContain("1.2.3.4");
  });

  it("changes with the key", () => {
    expect(hashIp("1.2.3.4", "k")).not.toBe(hashIp("1.2.3.4", "other"));
  });
});
