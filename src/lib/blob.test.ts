import { describe, expect, it } from "vitest";
import { isAllowedUploadPath, safeUploadName } from "./blob-upload";

const id = "00000000-0000-4000-8000-000000000001";

describe("isAllowedUploadPath", () => {
  it("accepts a project image path", () => {
    expect(isAllowedUploadPath(`projects/${id}/captura-1.png`)).toBe(true);
    expect(isAllowedUploadPath(`projects/${id}/a.webp`)).toBe(true);
  });

  it("rejects traversal, other types, uppercase and a missing uuid", () => {
    expect(isAllowedUploadPath("../x.png")).toBe(false);
    expect(isAllowedUploadPath(`projects/${id}/../x.png`)).toBe(false);
    expect(isAllowedUploadPath(`projects/${id}/x.svg`)).toBe(false);
    expect(isAllowedUploadPath(`projects/${id}/X.png`)).toBe(false);
    expect(isAllowedUploadPath("projects/x/y.png")).toBe(false);
  });
});

describe("safeUploadName", () => {
  it("lowercases, strips accents and replaces unsafe characters", () => {
    expect(safeUploadName("Captura Inicio é.PNG")).toBe("captura-inicio-e.png");
  });
});
