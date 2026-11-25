import { describe, expect, it } from "vitest";
import { assertTargetMatches, LOAD_ENTITIES, parseLoadArgs } from "./target";

describe("parseLoadArgs", () => {
  it("defaults to dry-run on every entity", () => {
    const args = parseLoadArgs(["--target=dev"]);
    expect(args.target).toBe("dev");
    expect(args.apply).toBe(false);
    expect(args.allowProduction).toBe(false);
    expect([...args.only]).toEqual([...LOAD_ENTITIES]);
  });

  it("requires --target", () => {
    expect(() => parseLoadArgs([])).toThrow(/--target=dev\|main/);
    expect(() => parseLoadArgs(["--target=staging"])).toThrow(
      /--target=dev\|main/,
    );
  });

  it("reads --apply, --allow-production and --only", () => {
    const args = parseLoadArgs([
      "--target=main",
      "--apply",
      "--allow-production",
      "--only=settings,skills",
    ]);
    expect(args.apply).toBe(true);
    expect(args.allowProduction).toBe(true);
    expect([...args.only]).toEqual(["settings", "skills"]);
  });

  it("rejects unknown entities by name", () => {
    expect(() =>
      parseLoadArgs(["--target=dev", "--only=settings,bogus"]),
    ).toThrow(/bogus/);
  });
});

describe("assertTargetMatches", () => {
  it("rejects main when the database is not production", () => {
    expect(() =>
      assertTargetMatches("main", "ep-other-1 (ep-other-1.neon.tech)"),
    ).toThrow(/no coincide/);
  });

  it("rejects dev when the database is production", () => {
    expect(() =>
      assertTargetMatches(
        "dev",
        "ep-billowing-union-x (ep-billowing-union-x.neon.tech)",
      ),
    ).toThrow(/no coincide/);
  });

  it("accepts matching pairs", () => {
    expect(() =>
      assertTargetMatches("dev", "ep-other-1 (ep-other-1.neon.tech)"),
    ).not.toThrow();
    expect(() =>
      assertTargetMatches("main", "ep-billowing-union-x (h)"),
    ).not.toThrow();
  });
});
