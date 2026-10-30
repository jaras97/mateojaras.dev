import { describe, expect, it } from "vitest";
import { localized } from "@/lib/i18n-fields";

describe("localized", () => {
  it("reads the Spanish column for es", () => {
    expect(
      localized({ headlineEn: "a", headlineEs: "b" }, "headline", "es"),
    ).toBe("b");
  });

  it("reads the English column for en", () => {
    expect(
      localized({ headlineEn: "a", headlineEs: "b" }, "headline", "en"),
    ).toBe("a");
  });

  it("falls back to English when the Spanish column is missing", () => {
    expect(
      localized({ headlineEn: "a", headlineEs: undefined }, "headline", "es"),
    ).toBe("a");
  });

  it("falls back to English when the Spanish column is null", () => {
    expect(
      localized({ headlineEn: "a", headlineEs: null }, "headline", "es"),
    ).toBe("a");
  });

  it("keeps an empty Spanish string instead of falling back", () => {
    expect(
      localized({ headlineEn: "a", headlineEs: "" }, "headline", "es"),
    ).toBe("");
  });
});
