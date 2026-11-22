import { describe, expect, it } from "vitest";
import { getPathname } from "./navigation";
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

  it("localizes the about path in Spanish", () => {
    expect(routing.pathnames?.["/about"]).toEqual({
      en: "/about",
      es: "/sobre-mi",
    });
    expect(getPathname({ locale: "es", href: "/about" })).toBe("/es/sobre-mi");
    expect(getPathname({ locale: "en", href: "/about" })).toBe("/about");
  });

  it("localizes the contact path in Spanish", () => {
    expect(routing.pathnames?.["/contact"]).toEqual({
      en: "/contact",
      es: "/contacto",
    });
    expect(getPathname({ locale: "es", href: "/contact" })).toBe(
      "/es/contacto",
    );
    expect(getPathname({ locale: "en", href: "/contact" })).toBe("/contact");
  });
});
