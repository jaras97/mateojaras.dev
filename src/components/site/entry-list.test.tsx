import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { type Entry, EntryList } from "@/components/site/entry-list";

const labels = { internalTool: "Internal tool, sample data" };

// Test inputs, not site content.
const base: Entry = {
  id: "p1",
  slug: "alpha",
  titleEn: "Alpha title",
  titleEs: "Titulo alfa",
  taglineEn: "Alpha tagline",
  taglineEs: "Lema alfa",
  liveUrl: "https://example.com",
  startedAt: "2025-01-10",
  finishedAt: "2025-06-20",
};

function render(
  rows: Entry[],
  stacks: Record<string, string[]> = {},
  locale: "en" | "es" = "en",
) {
  return renderToStaticMarkup(
    <EntryList rows={rows} stacks={stacks} locale={locale} labels={labels} />,
  );
}

describe("EntryList", () => {
  it("renders nothing without rows", () => {
    expect(render([])).toBe("");
  });

  it("renders an ordered list with one link per entry in the given order", () => {
    const html = render([
      base,
      { ...base, id: "p2", slug: "beta", titleEn: "Beta title" },
    ]);
    expect(html).toMatch(/^<ol/);
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html.indexOf("Alpha title")).toBeLessThan(
      html.indexOf("Beta title"),
    );
    expect(html).toContain('href="/projects/alpha"');
  });

  it("localizes the link and the text", () => {
    const html = render([base], {}, "es");
    expect(html).toContain('href="/es/proyectos/alpha"');
    expect(html).toContain("Titulo alfa");
    expect(html).toContain("Lema alfa");
    expect(html).toContain("jun 2025");
  });

  it("dates by finishedAt, else startedAt, else no time element", () => {
    expect(render([base])).toMatch(
      /<time[^>]*dateTime="2025-06-20"[^>]*>Jun 2025<\/time>/,
    );
    expect(render([{ ...base, finishedAt: null }])).toContain(
      'dateTime="2025-01-10"',
    );
    expect(
      render([{ ...base, finishedAt: null, startedAt: null }]),
    ).not.toContain("<time");
  });

  it("omits empty tagline and stack lines", () => {
    const html = render([
      { ...base, taglineEn: null, liveUrl: "https://x.dev" },
    ]);
    expect(html).not.toContain("Alpha tagline");
    expect(html).not.toContain("Internal tool");
  });

  it("joins the stack and appends the internal-tool segment when liveUrl is null", () => {
    const html = render([{ ...base, liveUrl: null }], {
      p1: ["React", "Next.js"],
    });
    expect(html).toContain("React");
    expect(html).toContain("Next.js");
    expect(html).toContain("Internal tool, sample data");
  });

  it("uses no shadows", () => {
    expect(render([base])).not.toContain("shadow");
  });
});
