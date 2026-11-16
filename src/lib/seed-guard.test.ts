import { describe, expect, it } from "vitest";
import { assertSeedable } from "./seed-guard";

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
