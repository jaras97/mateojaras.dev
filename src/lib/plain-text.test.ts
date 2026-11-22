import { describe, expect, it } from "vitest";
import { splitPlainText } from "@/lib/plain-text";

describe("splitPlainText", () => {
  it("returns an empty list for null, empty and whitespace", () => {
    expect(splitPlainText(null)).toEqual([]);
    expect(splitPlainText("")).toEqual([]);
    expect(splitPlainText("  \n ")).toEqual([]);
  });

  it("splits blank-line separated text into paragraphs", () => {
    expect(splitPlainText("a\n\nb")).toEqual([
      { kind: "p", text: "a" },
      { kind: "p", text: "b" },
    ]);
  });

  it("groups consecutive dash lines into one list", () => {
    expect(splitPlainText("intro\n- x\n- y\n\nend")).toEqual([
      { kind: "p", text: "intro" },
      { kind: "ul", items: ["x", "y"] },
      { kind: "p", text: "end" },
    ]);
  });

  it("turns a single dash line into a list", () => {
    expect(splitPlainText("- x")).toEqual([{ kind: "ul", items: ["x"] }]);
  });
});
