import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroA } from "@/components/site/hero/hero-a";
import type { HeroProps } from "@/components/site/hero/hero-parts";
import { heroCopy } from "@/components/site/hero-copy";
import { heroFixture } from "@/features/site-settings/fixture";
import type { HeroSettings, Locale } from "@/features/site-settings/types";

const VARIANTS: [string, ComponentType<HeroProps>][] = [["HeroA", HeroA]];

function render(
  Hero: ComponentType<HeroProps>,
  settings: HeroSettings,
  locale: Locale,
) {
  return renderToStaticMarkup(
    <Hero settings={settings} locale={locale} cta={heroCopy[locale].cta} />,
  );
}

// The text inside h1#hero-title, with tags removed.
function titleText(html: string): string | undefined {
  const match = html.match(/<h1[^>]*id="hero-title"[^>]*>([\s\S]*?)<\/h1>/);
  return match?.[1].replace(/<[^>]+>/g, "");
}

function ctaHref(html: string): string | undefined {
  return html.match(/<a[^>]*href="([^"]*)"/)?.[1];
}

describe.each(VARIANTS)("%s", (_name, Hero) => {
  it.each([
    "en",
    "es",
  ] as const)("renders the fixture headline in h1#hero-title for %s", (locale) => {
    const html = render(Hero, heroFixture, locale);
    const expected =
      locale === "en" ? heroFixture.headlineEn : heroFixture.headlineEs;
    expect(titleText(html)).toBe(expected);
    expect(html).toContain('aria-labelledby="hero-title"');
  });

  it("renders nothing when the headline for the locale is empty", () => {
    expect(render(Hero, { ...heroFixture, headlineEn: "" }, "en")).toBe("");
    expect(render(Hero, { ...heroFixture, headlineEs: "   " }, "es")).toBe("");
  });

  it("links the CTA to the contact route of each locale", () => {
    expect(ctaHref(render(Hero, heroFixture, "en"))).toBe("/contact");
    expect(ctaHref(render(Hero, heroFixture, "es"))).toBe("/es/contacto");
  });

  it("ships the clock script and the static shell without a clock time", () => {
    const html = render(Hero, heroFixture, "en");
    expect(html).toContain("data-status-time");
    expect(html).toContain("data-status-overlap");
    expect(html).toContain("<script");
    expect(html).not.toMatch(/\d{2}:\d{2} UTC-5/);
  });
});
