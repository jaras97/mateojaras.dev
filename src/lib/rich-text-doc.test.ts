import { describe, expect, it } from "vitest";
import { richTextDocSchema } from "./rich-text-schema";
import { paragraphsToDoc, textParagraphsToDoc } from "./rich-text-doc";

describe("paragraphsToDoc", () => {
  it("builds a doc that passes the allowlist", () => {
    const doc = paragraphsToDoc([[{ text: "Hola" }]]);
    expect(richTextDocSchema.safeParse(doc).success).toBe(true);
  });

  it("rejects non-https links", () => {
    expect(() => paragraphsToDoc([[{ text: "x", href: "http://x" }]])).toThrow();
  });

  it("maps bold and link to marks", () => {
    const doc = paragraphsToDoc([
      [{ text: "x", bold: true, href: "https://example.com" }],
    ]) as { content: { content: { marks: { type: string }[] }[] }[] };
    const types = doc.content[0].content[0].marks.map((m) => m.type);
    expect(types).toContain("bold");
    expect(types).toContain("link");
  });
});

describe("textParagraphsToDoc", () => {
  it("makes one paragraph per string", () => {
    const doc = textParagraphsToDoc(["uno", "dos"]) as { content: unknown[] };
    expect(doc.content).toHaveLength(2);
  });
});
