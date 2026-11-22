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
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  className?: string;
  numberClassName?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("mt-16 lg:mt-24", className)}
    >
      <div className="border-t border-border pt-6">
        <div className="flex items-baseline gap-4 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <SectionNumber
            number={number}
            className={cn("lg:col-span-2", numberClassName)}
          />
          <h2
            id={`${id}-title`}
            className="font-heading text-xl font-semibold tracking-display lg:col-span-7"
          >
            {title}
          </h2>
        </div>
        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-7 lg:col-start-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
