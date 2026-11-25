import { describe, expect, it } from "vitest";
import { diffFields, formatChange } from "./diff";

describe("diffFields", () => {
  it("returns one change for a differing field", () => {
    const changes = diffFields(
      "settings",
      "site",
      { headlineEn: "a", other: 1 },
      { headlineEn: "b", other: 2 },
      ["headlineEn"],
    );
    expect(changes).toEqual([
      {
        entity: "settings",
        key: "site",
        field: "headlineEn",
        before: "a",
        after: "b",
      },
    ]);
  });

  it("returns nothing for identical values, comparing jsonb by JSON", () => {
    expect(
      diffFields("s", "k", { a: { x: [1] } }, { a: { x: [1] } }, ["a"]),
    ).toEqual([]);
  });
});

describe("formatChange", () => {
  it("truncates both sides to 80 characters with an ellipsis", () => {
    const long = "x".repeat(200);
    const line = formatChange({
      entity: "settings",
      key: "site",
      field: "bioEn",
      before: long,
      after: "short",
    });
    expect(line.startsWith("~ settings[site].bioEn: ")).toBe(true);
    expect(line).toContain(`${"x".repeat(80)}…`);
    expect(line).not.toContain("x".repeat(81));
    expect(line).toContain('"short"');
  });
});
