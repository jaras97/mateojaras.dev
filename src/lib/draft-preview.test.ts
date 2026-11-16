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
  it.each([
    "/",
    "/es",
    "/projects/foo",
    "/es/proyectos/foo",
  ])("keeps the known public route %s", (path) => {
    expect(safeReturnPath(path)).toBe(path);
  });

  it("keeps a single-slash relative path", () => {
    expect(safeReturnPath("/es/proyectos/x")).toBe("/es/proyectos/x");
  });

  it.each([
    ["protocol-relative", "//evil.example"],
    ["absolute url", "https://evil.example"],
    ["backslash", "/\\evil"],
    ["non-string", 42],
    ["empty", ""],
    ["encoded backslash", "/%5Cevil.com"],
    ["tab char", "/\tevil"],
    ["backslash host", "/\\evil.com"],
    ["javascript scheme", "javascript:alert(1)"],
    ["encoded double slash", "/%2F%2Fevil.com"],
    ["unknown route", "/admin/proyectos"],
    ["whitespace", "/es /x"],
  ])("falls back to / for %s", (_name, value) => {
    expect(safeReturnPath(value)).toBe("/");
  });
});
