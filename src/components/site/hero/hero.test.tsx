import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroA } from "@/components/site/hero/hero-a";
import { heroCopy } from "@/components/site/hero-copy";
import { heroFixture } from "@/features/site-settings/fixture";
import type { HeroSettings, Locale } from "@/features/site-settings/types";

function render(settings: HeroSettings, locale: Locale) {
  return renderToStaticMarkup(
    <HeroA settings={settings} locale={locale} cta={heroCopy[locale].cta} />,
  );
}

// The text inside h1#hero-title, with tags removed.
function titleText(html: string): string | undefined {
  const match = html.match(/<h1[^>]*id="hero-title"[^>]*>([\s\S]*?)<\/h1>/);
  return match?.[1].replace(/<[^>]+>/g, "");
}

describe("HeroA", () => {
  it.each([
    "en",
    "es",
  ] as const)("renders the fixture headline in h1#hero-title for %s", (locale) => {
    const html = render(heroFixture, locale);
    const expected =
      locale === "en" ? heroFixture.headlineEn : heroFixture.headlineEs;
    expect(titleText(html)).toBe(expected);
    expect(html).toContain('aria-labelledby="hero-title"');
  });

  it("renders nothing when the headline for the locale is empty", () => {
    expect(render({ ...heroFixture, headlineEn: "" }, "en")).toBe("");
    expect(render({ ...heroFixture, headlineEs: "   " }, "es")).toBe("");
  });

  it("links the CTA to the contact route of each locale", () => {
    expect(render(heroFixture, "en")).toMatch(/<a[^>]*href="\/contact"/);
    expect(render(heroFixture, "es")).toMatch(/<a[^>]*href="\/es\/contacto"/);
  });
});
