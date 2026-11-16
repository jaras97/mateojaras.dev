import StarterKit from "@tiptap/starter-kit";

// One extensions list for the admin editor and the server renderer: a
// mismatch silently drops nodes. It mirrors RICH_TEXT_NODES / RICH_TEXT_MARKS
// in rich-text-schema.ts (the allowlist the Server Actions enforce).
// No "use client" and no editor-side imports: the public pages load this.
export const richTextExtensions = [
  StarterKit.configure({
    heading: { levels: [3] },
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    link: {
      openOnClick: false,
      autolink: true,
      protocols: ["https", "mailto"],
      defaultProtocol: "https",
    },
  }),
];
