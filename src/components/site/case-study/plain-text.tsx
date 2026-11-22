import { splitPlainText } from "@/lib/plain-text";

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
            {block.text}
          </p>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static blocks, never reordered
          <ul key={i} className="flex list-disc flex-col gap-2 ps-4">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
