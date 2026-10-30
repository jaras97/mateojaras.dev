import { cn } from "@/lib/utils";

export function SectionNumber({
  number,
  className,
}: {
  number: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-sm text-muted-foreground", className)}>
      {number}
    </span>
  );
}
