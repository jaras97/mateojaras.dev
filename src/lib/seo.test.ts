import { describe, expect, it } from "vitest";
import { buildPageMetadata, truncateAtWord } from "./seo";

describe("truncateAtWord", () => {
  it("cuts on a word boundary and adds an ellipsis", () => {
    const out = truncateAtWord(`${"a".repeat(10)} ${"b".repeat(200)}`, 155);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out).toBe(`${"a".repeat(10)}…`);
  });

  it("keeps short text untouched", () => {
    expect(truncateAtWord("short text", 155)).toBe("short text");
  });

  it("cuts at the last space before the limit", () => {
    const out = truncateAtWord("one two three four", 12);
    expect(out).toBe("one two…");
    expect(out.length).toBeLessThanOrEqual(12);
  });

  it("returns an empty string for null or empty", () => {
    expect(truncateAtWord(null)).toBe("");
    expect(truncateAtWord("")).toBe("");
  });
});

describe("buildPageMetadata", () => {
  const base = {
    title: "ManuJ · Mateo Jaramillo",
    description: "x",
    siteName: "Mateo Jaramillo",
  };
  const href = {
    pathname: "/projects/[slug]",
    params: { slug: "m" },
  } as const;

  it("builds a complete Spanish object with hreflang alternates", () => {
    const meta = buildPageMetadata({
      ...base,
      locale: "es",
      href,
      ogType: "article",
    });
    expect(meta.alternates).toEqual({
      canonical: "/es/proyectos/m",
      languages: {
        en: "/projects/m",
        es: "/es/proyectos/m",
        "x-default": "/projects/m",
      },
    });
    expect(meta.openGraph).toMatchObject({
      title: base.title,
      description: "x",
      url: "/es/proyectos/m",
      locale: "es_CO",
      siteName: "Mateo Jaramillo",
      type: "article",
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("uses en_US and a website type by default for English", () => {
    const meta = buildPageMetadata({ ...base, locale: "en", href: "/" });
    expect(meta.openGraph).toMatchObject({
      locale: "en_US",
      type: "website",
      url: "/",
    });
    expect(meta.alternates?.canonical).toBe("/");
  });
});
