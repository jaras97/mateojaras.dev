import { describe, expect, it } from "vitest";
import { routing } from "./routing";

describe("routing", () => {
  it("serves en by default with no detection or locale cookie", () => {
    expect(routing.locales).toEqual(["en", "es"]);
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localeDetection).toBe(false);
    expect(routing.localeCookie).toBe(false);
  });

  it("localizes the case-study path in Spanish", () => {
    const entry = routing.pathnames?.["/projects/[slug]"];
    expect(entry).toEqual({
      en: "/projects/[slug]",
      es: "/proyectos/[slug]",
    });
  });
});
