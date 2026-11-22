export type PlainBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

// Blank-line separated text becomes paragraphs; consecutive lines starting
// with "- " become one list. Lines of a paragraph are kept joined by "\n".
export function splitPlainText(text: string | null | undefined): PlainBlock[] {
  if (text === null || text === undefined || text.trim() === "") return [];
  const blocks: PlainBlock[] = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    let paragraph: string[] = [];
    let items: string[] = [];
    const flushParagraph = () => {
      if (paragraph.length > 0) {
        blocks.push({ kind: "p", text: paragraph.join("\n") });
        paragraph = [];
      }
    };
    const flushList = () => {
      if (items.length > 0) {
        blocks.push({ kind: "ul", items });
        items = [];
      }
    };
    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (line === "") continue;
      if (line.startsWith("- ")) {
        flushParagraph();
        items.push(line.slice(2).trim());
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  }
  return blocks;
}
