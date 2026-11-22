import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SegmentLine } from "@/components/site/segment-line";

const count = (html: string) => html.split('aria-hidden="true"').length - 1;

describe("SegmentLine", () => {
  it("renders a separator inside every segment but the last", () => {
    const html = renderToStaticMarkup(
      <SegmentLine
        segments={[
          { key: "a", content: "A" },
          { key: "b", content: "B" },
          { key: "c", content: "C" },
        ]}
      />,
    );
    expect(count(html)).toBe(2);
    expect(html).toMatch(
      /<span class="whitespace-nowrap">A<span[^>]*>·<\/span><\/span>/,
    );
  });

  it("renders no separator for a single segment", () => {
    const html = renderToStaticMarkup(
      <SegmentLine segments={[{ key: "a", content: "A" }]} />,
    );
    expect(count(html)).toBe(0);
  });

  it("skips segments with null content", () => {
    const html = renderToStaticMarkup(
      <SegmentLine
        segments={[
          { key: "a", content: "A" },
          { key: "b", content: null },
          { key: "c", content: "C" },
        ]}
      />,
    );
    expect(count(html)).toBe(1);
    expect(html).not.toContain("null");
  });
});
