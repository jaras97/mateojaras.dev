import { cn } from "@/lib/utils";

// Margin notes for the technical decisions: cols 10-12 from lg, and below lg
// under the decisions with a 1px left rule. Renders nothing without text.
export function Marginalia({
  notes,
  className,
}: {
  notes: { label: string; body: string }[];
  className?: string;
}) {
  const filled = notes.filter((note) => note.body.trim() !== "");
  if (filled.length === 0) return null;
  return (
    <aside
      className={cn(
        "mt-8 flex flex-col gap-6 border-l border-border ps-4 lg:col-span-3 lg:col-start-10 lg:mt-0 lg:border-l-0 lg:ps-0",
        className,
      )}
    >
      {filled.map((note) => (
        <div key={note.label} className="flex flex-col gap-1 font-mono text-sm">
          <p className="text-ink-2">{note.label}</p>
          <p className="text-foreground">{note.body}</p>
        </div>
      ))}
    </aside>
  );
}
