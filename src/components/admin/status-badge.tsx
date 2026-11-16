import { cn } from "cn";

export type StatusLabels = {
  draft: string;
  published: string;
  pending: string;
  hidden: string;
};

const base =
  "inline-flex h-6 items-center rounded-[var(--radius)] border px-2 font-mono text-xs whitespace-nowrap";

// Shape and border style, not color, tell the states apart.
export function StatusBadge({
  status,
  hasPendingDraft,
  labels,
}: {
  status: "draft" | "published";
  hasPendingDraft: boolean;
  labels: StatusLabels;
}) {
  if (status === "draft") {
    return (
      <span
        className={cn(base, "border-dashed border-input text-muted-foreground")}
      >
        {labels.draft}
      </span>
    );
  }
  if (hasPendingDraft) {
    return (
      <span
        className={cn(
          base,
          "border-dashed border-muted-foreground bg-muted text-foreground",
        )}
      >
        {labels.pending}
      </span>
    );
  }
  return (
    <span className={cn(base, "border-border bg-muted text-foreground")}>
      {labels.published}
    </span>
  );
}

export function HiddenBadge({ label }: { label: string }) {
  return (
    <span className={cn(base, "border-border text-muted-foreground")}>
      {label}
    </span>
  );
}
