import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusLine } from "@/components/site/status-line";
import type { HeroSettings, Locale } from "@/features/site-settings/types";

// Test inputs, not site content: each case states every field it renders.
const base: HeroSettings = {
  headlineEn: "Test headline",
  headlineEs: "Titular de prueba",
  availabilityStatus: "open",
  availableFrom: null,
  timezone: "America/Bogota",
  location: "Test City",
  updatedAt: new Date("2026-10-31T01:00:00Z"),
};

function render(
  overrides: Partial<HeroSettings>,
  locale: Locale = "en",
  showEntryDate = false,
) {
  return renderToStaticMarkup(
    <StatusLine
      settings={{ ...base, ...overrides }}
      locale={locale}
      showEntryDate={showEntryDate}
    />,
  );
}

// The text of each top-level segment, in order.
function segmentTexts(html: string): string[] {
  const inner = html.replace(/^<p[^>]*>/, "").replace(/<\/p>$/, "");
  const segments: string[] = [];
  let depth = 0;
  let current = "";
  for (const token of inner.split(/(<\/?span[^>]*>)/)) {
    if (token.startsWith("<span")) {
      if (depth === 0) current = "";
      depth += 1;
    } else if (token.startsWith("</span")) {
      depth -= 1;
      if (depth === 0) segments.push(current.trim());
    } else if (depth > 0) {
      current += token.replace(/<[^>]+>/g, "");
    }
  }
  return segments;
}

describe("StatusLine", () => {
  it("renders open in English with the location, the offset and a signal dot", () => {
    const html = render({ availabilityStatus: "open" });
    expect(html).toContain("Available now");
    expect(html).toContain("Test City");
    expect(html).toContain("UTC-5");
    expect(html).toContain("bg-signal");
    expect(html).not.toContain("bg-ink-2");
  });

  it("renders closed with a neutral dot", () => {
    const html = render({ availabilityStatus: "closed" });
    expect(html).toContain("Not taking new projects");
    expect(html).toContain("bg-ink-2");
    expect(html).not.toContain("bg-signal");
  });

  it("drops the availability segment for from_date without a date and keeps the rest", () => {
    const html = render({
      availabilityStatus: "from_date",
      availableFrom: null,
    });
    expect(html).not.toContain("Available");
    expect(html).not.toContain("bg-signal");
    expect(html).toContain("Test City");
    expect(html).toContain("UTC-5");
  });

  it("fills the Spanish from_date template with the formatted month", () => {
    const html = render(
      { availabilityStatus: "from_date", availableFrom: "2026-11-01" },
      "es",
    );
    expect(html).toContain("Disponible desde nov 2026");
    expect(html).toContain("horario compatible con Toronto y Madrid");
  });

  it("renders the entry date as a time element only when asked", () => {
    const withDate = render({}, "en", true);
    expect(withDate).toMatch(/<time dateTime="\d{4}-\d{2}-\d{2}">/);
    expect(withDate).toContain('dateTime="2026-10-30"');
    expect(render({}, "en", false)).not.toContain("<time");
  });

  it("never starts a segment with the separator and never ends the line with one", () => {
    const segments = segmentTexts(render({}, "en", true));
    expect(segments.length).toBe(5);
    for (const text of segments) {
      expect(text.startsWith("·")).toBe(false);
    }
    expect(segments.at(-1)?.endsWith("·")).toBe(false);
  });

  it("omits an empty location and its separator but keeps the offset and overlap", () => {
    const html = render({ location: "" });
    const segments = segmentTexts(html);
    expect(segments).toEqual([
      "Available now·",
      "UTC-5·",
      "overlaps with Toronto and Madrid",
    ]);
  });

  it("treats a whitespace-only location as empty", () => {
    expect(segmentTexts(render({ location: "   " }))).toHaveLength(3);
  });

  it("hides the dot and the separators from assistive technology", () => {
    const html = render({});
    const hidden = html.match(/aria-hidden="true"/g) ?? [];
    // one dot plus a separator after each of the first three segments
    expect(hidden.length).toBe(4);
  });

  it("marks the time and overlap nodes for the live script and carries no clock digits", () => {
    const html = render({});
    expect(html).toMatch(/<time[^>]*data-status-time[^>]*>UTC-5<\/time>/);
    expect(html).toMatch(
      /<span[^>]*data-status-overlap[^>]*>overlaps with Toronto and Madrid<\/span>/,
    );
    expect(html).not.toMatch(/\d{2}:\d{2}/);
  });
});
