import { z } from "zod";

// Allowlist for stored Tiptap JSON (T-03-11). It mirrors the StarterKit config
// of the editor (codeBlock, horizontalRule, strike and underline are off) and
// only lets https: and mailto: hrefs through. Heading is level 3 only: the
// page already owns h1 and h2.
export const RICH_TEXT_NODES = [
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "code",
  "hardBreak",
] as const;
export const RICH_TEXT_MARKS = ["bold", "italic", "code", "link"] as const;

const HREF = /^(https:\/\/|mailto:)/;

const mark = z.union([
  z.strictObject({ type: z.literal("bold") }),
  z.strictObject({ type: z.literal("italic") }),
  z.strictObject({ type: z.literal("code") }),
  z.strictObject({
    type: z.literal("link"),
    attrs: z.strictObject({
      href: z.string().regex(HREF),
      target: z.string().nullable().optional(),
      rel: z.string().nullable().optional(),
      class: z.string().nullable().optional(),
    }),
  }),
]);

const node: z.ZodType = z.lazy(() =>
  z.union([
    z.strictObject({
      type: z.literal("text"),
      text: z.string(),
      marks: z.array(mark).optional(),
    }),
    z.strictObject({
      type: z.literal("heading"),
      attrs: z.strictObject({ level: z.literal(3) }),
      content: z.array(node).optional(),
    }),
    z.strictObject({
      type: z.literal("orderedList"),
      attrs: z
        .strictObject({
          start: z.number().int().optional(),
          type: z.string().nullable().optional(),
        })
        .optional(),
      content: z.array(node).optional(),
    }),
    z.strictObject({
      type: z.enum([
        "paragraph",
        "bulletList",
        "listItem",
        "blockquote",
        "code",
        "hardBreak",
      ]),
      content: z.array(node).optional(),
    }),
  ]),
);

export const richTextDocSchema = z.strictObject({
  type: z.literal("doc"),
  content: z.array(node).optional(),
});
