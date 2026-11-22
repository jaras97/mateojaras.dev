import type { ReactNode } from "react";

type Neighbour = { href: string; title: string };

function NeighbourLink({
  neighbour,
  label,
  align,
}: {
  neighbour: Neighbour;
  label: string;
  align: "start" | "end";
}) {
  return (
    <a
      href={neighbour.href}
      className={`group flex flex-col gap-1 transition-transform duration-[160ms] motion-safe:hover:translate-x-1 motion-safe:focus-visible:translate-x-1 ${
        align === "end" ? "md:items-end md:text-end" : ""
      }`}
    >
      <span className="font-mono text-sm text-muted-foreground">{label}</span>
      <span className="text-[25px] leading-snug transition-colors duration-[160ms] group-hover:text-signal group-focus-visible:text-signal">
        {neighbour.title}
      </span>
    </a>
  );
}

// Neighbours in the admin order; absent when the case has none (D-03).
export function PrevNext({
  prev,
  next,
  labels,
}: {
  prev: Neighbour | null;
  next: Neighbour | null;
  labels: { nav: string; prev: string; next: string };
}): ReactNode {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label={labels.nav}
      className="mt-16 border-t border-border pt-6 lg:mt-24"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {prev ? (
            <NeighbourLink neighbour={prev} label={labels.prev} align="start" />
          ) : null}
        </div>
        <div>
          {next ? (
            <NeighbourLink neighbour={next} label={labels.next} align="end" />
          ) : null}
        </div>
      </div>
    </nav>
  );
}
