import { splitPlainText } from "@/lib/plain-text";

// Renders `code` spans as <code>; the stored text keeps its backticks (K-13).
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/`([^`\n]+)`/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static parts, never reordered
          <code key={i} className="font-mono text-[0.9em]">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Plain stored text (problem, role, solution): paragraphs and "- " lists.
export function PlainText({ text }: { text: string | null | undefined }) {
  const blocks = splitPlainText(text);
  if (blocks.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) =>
        block.kind === "p" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static blocks, never reordered
          <p key={i} className="whitespace-pre-line">
            <InlineText text={block.text} />
          </p>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static blocks, never reordered
          <ul key={i} className="flex list-disc flex-col gap-2 ps-4">
            {block.items.map((item) => (
              <li key={item}>
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
