import { describe, expect, it } from "vitest";
import { assertNotProduction, assertSeedable } from "./seed-guard";

describe("assertSeedable", () => {
  it("throws naming the table and --force when a table has rows", () => {
    expect(() =>
      assertSeedable({ nonEmptyTables: ["projects"], force: false }),
    ).toThrow(/projects.*--force/);
  });

  it("returns when force is set", () => {
    expect(() =>
      assertSeedable({ nonEmptyTables: ["projects"], force: true }),
    ).not.toThrow();
  });

  it("returns when every table is empty", () => {
    expect(() =>
      assertSeedable({ nonEmptyTables: [], force: false }),
    ).not.toThrow();
  });
});

describe("assertNotProduction", () => {
  const main =
    "ep-billowing-union-abc123 (ep-billowing-union-abc123.neon.tech)";
  const dev = "ep-floral-queen-xyz (ep-floral-queen-xyz.neon.tech)";

  it("throws naming the endpoint and the flag for the main endpoint", () => {
    expect(() =>
      assertNotProduction({ target: main, vercelEnv: undefined, allow: false }),
    ).toThrow(/ep-billowing-union-abc123.*--allow-production/);
  });

  it("does not throw for the main endpoint when allowed", () => {
    expect(() =>
      assertNotProduction({ target: main, vercelEnv: undefined, allow: true }),
    ).not.toThrow();
  });

  it("throws on VERCEL_ENV production even with a dev endpoint", () => {
    expect(() =>
      assertNotProduction({
        target: dev,
        vercelEnv: "production",
        allow: false,
      }),
    ).toThrow(/producción/);
  });

  it("does not throw for preview or a dev endpoint", () => {
    expect(() =>
      assertNotProduction({ target: dev, vercelEnv: "preview", allow: false }),
    ).not.toThrow();
    expect(() =>
      assertNotProduction({ target: dev, vercelEnv: undefined, allow: false }),
    ).not.toThrow();
  });
});
