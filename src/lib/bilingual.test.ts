import { describe, expect, it } from "vitest";
import { countMissingEs, isEmptyText } from "./bilingual";

describe("isEmptyText", () => {
  it.each(["", "  ", null, undefined])("treats %j as empty", (value) => {
    expect(isEmptyText(value)).toBe(true);
  });

  it("does not treat real text as empty", () => {
    expect(isEmptyText("x")).toBe(false);
  });
});

describe("countMissingEs", () => {
  it("counts only the empty named fields", () => {
    const row = { a: "x", b: "", c: null, d: "  ", ignored: null };
    expect(countMissingEs(row, ["a", "b", "c", "d"])).toBe(3);
  });
});
