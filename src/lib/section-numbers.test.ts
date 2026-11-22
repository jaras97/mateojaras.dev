import { describe, expect, it } from "vitest";
import { numberSections } from "./section-numbers";

describe("numberSections", () => {
  it("numbers sections in order with two digits", () => {
    expect(numberSections(["now", "stack", "experience"])).toEqual({
      now: "01",
      stack: "02",
      experience: "03",
    });
  });

  it("starts at 01 when the first section is absent", () => {
    expect(numberSections(["stack", "experience"]).stack).toBe("01");
  });

  it("returns an empty map for no sections", () => {
    expect(numberSections([])).toEqual({});
  });
});
