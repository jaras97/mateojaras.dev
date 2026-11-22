import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Staggered load reveal (MOTN-01). Server Component: the animation is pure
// CSS in globals.css and only runs under prefers-reduced-motion: no-preference.
export function Reveal({
  index,
  children,
  className,
  as: Tag = "div",
}: {
  index: number;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const style = {
    "--reveal-index": Math.min(Math.max(index, 0), 5),
  } as CSSProperties;
  return (
    <Tag className={cn("reveal", className)} style={style}>
      {children}
    </Tag>
  );
}
