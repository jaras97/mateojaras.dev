import type { ReactNode } from "react";
import { pageGridClass } from "@/components/site/hero/hero-parts";
import { SectionNumber } from "@/components/site/section-number";
import { cn } from "@/lib/utils";

export { pageGridClass };

// Numbered section: top rule, number and h2, content in cols 3-9 from lg.
// Case study callers pass slug-prefixed ids (several sections share a page).
export function PageSection({
  id,
  number,
  title,
  children,
  className,
  numberClassName,
  aside,
  marginNumber,
  scene,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  className?: string;
  numberClassName?: string;
  // Margin notes in cols 10-12 from lg; below lg they follow the content.
  aside?: ReactNode;
  // Large margin number from lg (replaces the inline one at that width).
  marginNumber?: ReactNode;
  // Marks the section for the scrubbed scene (ScrollScene).
  scene?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-scene-section={scene ? "" : undefined}
      className={cn("mt-16 lg:mt-24", className)}
    >
      <div className="border-t border-border pt-6">
        <div className="flex items-baseline gap-4 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <SectionNumber
            number={number}
            className={cn(
              "lg:col-span-2",
              marginNumber ? "lg:hidden" : null,
              numberClassName,
            )}
          />
          <h2
            id={`${id}-title`}
            className={cn(
              "font-heading text-xl font-semibold tracking-display lg:col-span-7",
              marginNumber ? "lg:col-start-3" : null,
            )}
          >
            {title}
          </h2>
        </div>
        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-6">
          {marginNumber}
          <div className="lg:col-span-7 lg:col-start-3">{children}</div>
          {aside}
        </div>
      </div>
    </section>
  );
}
