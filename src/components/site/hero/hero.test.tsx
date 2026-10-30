import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroA } from "@/components/site/hero/hero-a";
import { HeroB } from "@/components/site/hero/hero-b";
import { HeroC } from "@/components/site/hero/hero-c";
import type { HeroProps } from "@/components/site/hero/hero-parts";
import { heroCopy } from "@/components/site/hero-copy";
import { heroFixture } from "@/features/site-settings/fixture";
import type { HeroSettings, Locale } from "@/features/site-settings/types";

const VARIANTS: [string, ComponentType<HeroProps>][] = [
  ["HeroA", HeroA],
  ["HeroB", HeroB],
  ["HeroC", HeroC],
];

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

// The inner HTML of the first <ol>.
function indexList(html: string): string {
  return html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? "";
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
});

describe("the three variants", () => {
  it.each([
    "en",
    "es",
  ] as const)("share the same headline and CTA href for %s", (locale) => {
    const rendered = VARIANTS.map(([, Hero]) =>
      render(Hero, heroFixture, locale),
    );
    expect(new Set(rendered.map(titleText)).size).toBe(1);
    expect(new Set(rendered.map(ctaHref)).size).toBe(1);
  });
});

describe("HeroB", () => {
  it("opens with the status line and its entry date, then a rule, then the h1", () => {
    const html = render(HeroB, heroFixture, "en");
    const time = html.search(/<time dateTime="\d{4}-\d{2}-\d{2}">/);
    const rule = html.indexOf("<hr");
    const title = html.indexOf("<h1");
    expect(time).toBeGreaterThan(-1);
    expect(rule).toBeGreaterThan(time);
    expect(title).toBeGreaterThan(rule);
  });

  it("does not show an entry date in A or C", () => {
    expect(render(HeroA, heroFixture, "en")).not.toContain("<time");
    expect(render(HeroC, heroFixture, "en")).not.toContain("<time");
  });
});

describe("HeroC", () => {
  it.each([
    ["en", ["01 Work", "02 About", "03 Contact"]],
    ["es", ["01 Trabajo", "02 Sobre mí", "03 Contacto"]],
  ] as const)("renders the numbered index as plain text in %s", (locale, labels) => {
    const list = indexList(render(HeroC, heroFixture, locale));
    const items = list.match(/<li[\s\S]*?<\/li>/g) ?? [];
    expect(items.map(stripTags)).toEqual(labels);
    expect(list).not.toMatch(/<a[\s>]/);
  });

  it("never paints the index numbers with the accent", () => {
    expect(indexList(render(HeroC, heroFixture, "en"))).not.toContain("signal");
  });
});
