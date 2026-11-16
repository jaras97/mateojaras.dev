import { describe, expect, it } from "vitest";
import { richTextDocSchema } from "@/lib/rich-text-schema";

const text = (value: string, marks?: unknown[]) => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});

describe("richTextDocSchema", () => {
  it("accepts allowlisted nodes and marks with an https link", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("hola", [{ type: "bold" }]),
            text("sitio", [{ type: "link", attrs: { href: "https://x.dev" } }]),
          ],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [text("Título")],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [text("uno")] }],
            },
          ],
        },
      ],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(true);
  });

  it("accepts a mailto link", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("correo", [
              { type: "link", attrs: { href: "mailto:a@example.com" } },
            ]),
          ],
        },
      ],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(true);
  });

  it("rejects an image node", () => {
    const doc = {
      type: "doc",
      content: [{ type: "image", attrs: { src: "https://x.dev/a.png" } }],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(false);
  });

  it("rejects a heading level 1", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [text("No")] },
      ],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(false);
  });

  it("rejects a javascript: link href", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("x", [
              { type: "link", attrs: { href: "javascript:alert(1)" } },
            ]),
          ],
        },
      ],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(false);
  });

  it("rejects a plain http link href", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("x", [{ type: "link", attrs: { href: "http://x.dev" } }]),
          ],
        },
      ],
    };
    expect(richTextDocSchema.safeParse(doc).success).toBe(false);
  });

  it("rejects a document whose root is not doc", () => {
    expect(
      richTextDocSchema.safeParse({ type: "paragraph", content: [] }).success,
    ).toBe(false);
  });
});
