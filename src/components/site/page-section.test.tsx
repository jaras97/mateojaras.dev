import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageSection, pageGridClass } from "@/components/site/page-section";
import { heroSectionClass } from "@/components/site/hero/hero-parts";

describe("PageSection", () => {
  const html = renderToStaticMarkup(
    <PageSection id="intro" number="01" title="Intro">
      body
    </PageSection>,
  );

  it("labels the section by its h2", () => {
    expect(html).toContain('aria-labelledby="intro-title"');
    expect(html).toMatch(/<h2[^>]*id="intro-title"[^>]*>Intro<\/h2>/);
    expect(html).toContain('id="intro"');
  });

  it("renders the section number and content", () => {
    expect(html).toContain(">01<");
    expect(html).toContain("body");
  });

  it("shares the hero grid class", () => {
    expect(pageGridClass).toBe(heroSectionClass);
  });
});
