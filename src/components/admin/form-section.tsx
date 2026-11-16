import type { ReactNode } from "react";

// A numbered form section: 1px top rule, mono number, h2.
export function FormSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border pt-4"
    >
      <h2
        id={`${id}-title`}
        className="flex items-baseline gap-3 text-sm font-semibold"
      >
        <span className="font-mono text-xs text-muted-foreground">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}
