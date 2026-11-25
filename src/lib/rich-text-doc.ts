// Builds Tiptap JSON (now_*, case_study_*) from plain paragraphs and validates
// it against the stored-JSON allowlist before it can reach the database.
import { richTextDocSchema } from "./rich-text-schema";

export type InlinePart = { text: string; href?: string; bold?: boolean };

type Mark = { type: "bold" } | { type: "link"; attrs: { href: string } };

function textNode(part: InlinePart) {
  const marks: Mark[] = [];
  if (part.bold) marks.push({ type: "bold" });
  if (part.href) marks.push({ type: "link", attrs: { href: part.href } });
  return marks.length > 0
    ? { type: "text", text: part.text, marks }
    : { type: "text", text: part.text };
}

export function paragraphsToDoc(paragraphs: InlinePart[][]) {
  const doc = {
    type: "doc",
    content: paragraphs.map((parts) => {
      const content = parts.filter((p) => p.text !== "").map(textNode);
      return content.length > 0
        ? { type: "paragraph", content }
        : { type: "paragraph" };
    }),
  };
  return richTextDocSchema.parse(doc);
}

export function textParagraphsToDoc(paragraphs: string[]) {
  return paragraphsToDoc(paragraphs.map((text) => [{ text }]));
}
