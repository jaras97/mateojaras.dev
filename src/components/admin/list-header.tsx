import type { ReactNode } from "react";

// Page title, a mono count line and the primary action of a list.
export function ListHeader({
  title,
  count,
  action,
}: {
  title: string;
  count: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[25px] font-semibold leading-tight tracking-display">
          {title}
        </h1>
        <p className="font-mono text-xs text-muted-foreground">{count}</p>
      </div>
      {action}
    </div>
  );
}
