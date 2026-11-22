import { describe, expect, it } from "vitest";
import { alternateHref } from "./alternate-href";

describe("alternateHref", () => {
  it("maps the home page", () => {
    expect(alternateHref([], {})).toBe("/");
  });
  it("maps about and contact", () => {
    expect(alternateHref(["about"], {})).toBe("/about");
    expect(alternateHref(["contact"], {})).toBe("/contact");
  });
  it("maps a case study with its slug", () => {
    expect(alternateHref(["projects", "x"], { slug: "x" })).toEqual({
      pathname: "/projects/[slug]",
      params: { slug: "x" },
    });
  });
  it("falls back to home for unknown segments", () => {
    expect(alternateHref(["nope"], {})).toBe("/");
    expect(alternateHref(["projects", "x"], {})).toBe("/");
  });
});
