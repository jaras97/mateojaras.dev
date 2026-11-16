import { describe, expect, it } from "vitest";
import { draftPreviewHref, safeReturnPath } from "./draft-preview";

describe("draftPreviewHref", () => {
  it("builds the project link with the id and the default locale es", () => {
    expect(draftPreviewHref({ kind: "project", id: "abc" })).toBe(
      "/api/draft?kind=project&id=abc&locale=es",
    );
  });

  it("builds the home link for a given locale", () => {
    expect(draftPreviewHref({ kind: "home", locale: "en" })).toBe(
      "/api/draft?kind=home&locale=en",
    );
  });
});

describe("safeReturnPath", () => {
  it("keeps a single-slash relative path", () => {
    expect(safeReturnPath("/es/proyectos/x")).toBe("/es/proyectos/x");
  });

  it.each([
    ["protocol-relative", "//evil.example"],
    ["absolute url", "https://evil.example"],
    ["backslash", "/\\evil"],
    ["non-string", 42],
    ["empty", ""],
  ])("falls back to / for %s", (_name, value) => {
    expect(safeReturnPath(value)).toBe("/");
  });
});
