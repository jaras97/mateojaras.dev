import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { docHasText, RichText } from "./rich-text";

const link = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Mira " },
        {
          type: "text",
          text: "el repo",
          marks: [
            { type: "link", attrs: { href: "https://example.com/repo" } },
          ],
        },
      ],
    },
  ],
};

describe("RichText", () => {
  it("renders a https link as an anchor with that href", () => {
    const html = renderToStaticMarkup(<RichText doc={link} />);
    expect(html).toContain('href="https://example.com/repo"');
    expect(html).toContain("el repo");
  });

  it("renders nothing for a doc whose only paragraph is empty", () => {
    const empty = { type: "doc", content: [{ type: "paragraph" }] };
    expect(renderToStaticMarkup(<RichText doc={empty} />)).toBe("");
  });

  it("renders nothing for a doc that breaks the allowlist", () => {
    const script = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    };
    expect(renderToStaticMarkup(<RichText doc={script} />)).toBe("");
  });
});

describe("docHasText", () => {
  it("ignores whitespace-only text", () => {
    expect(
      docHasText({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "  " }] },
        ],
      }),
    ).toBe(false);
  });
});
