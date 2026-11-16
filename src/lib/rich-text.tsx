import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { richTextDocSchema } from "./rich-text-schema";
import { richTextExtensions } from "./tiptap-extensions";

type Content = Parameters<typeof renderToReactElement>[0]["content"];

// True when the doc has at least one text node with visible characters.
export function docHasText(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return false;
  const node = doc as { type?: string; text?: string; content?: unknown[] };
  if (node.type === "text") return (node.text ?? "").trim() !== "";
  return (node.content ?? []).some(docHasText);
}

// Server renderer for stored Tiptap JSON. Emits React elements, never raw
// HTML, and ships no ProseMirror to the page. Renders nothing for an invalid
// or empty doc.
export function RichText({ doc }: { doc: unknown }) {
  const parsed = richTextDocSchema.safeParse(doc);
  if (!parsed.success || !docHasText(parsed.data)) return null;
  return renderToReactElement({
    content: parsed.data as Content,
    extensions: richTextExtensions,
  });
}
