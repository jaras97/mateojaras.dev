import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Segment = { key: string; content: ReactNode; className?: string };

// The separator closes the preceding segment inside its nowrap span, so a
// wrapped line can end with "·" but never start with one.
export function SegmentLine({
  segments,
  className,
  as: Tag = "p",
}: {
  segments: Segment[];
  className?: string;
  as?: "p" | "div";
}) {
  const visible = segments.filter(
    (s) => s.content !== null && s.content !== undefined,
  );
  return (
    <Tag
      className={cn(
        "flex flex-wrap gap-x-2 gap-y-1 font-mono text-sm",
        className,
      )}
    >
      {visible.map((segment, i) => (
        <span
          key={segment.key}
          className={cn("whitespace-nowrap", segment.className)}
        >
          {segment.content}
          {i < visible.length - 1 ? (
            <span aria-hidden="true" className="ms-2 text-muted-foreground">
              ·
            </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}
