"use client";

import { cn } from "cn";
import { useEffect, useState } from "react";
import { fill } from "@/lib/messages";
import { useFormLabels } from "./form-labels";

export type SectionEntry = {
  id: string;
  number: string;
  title: string;
  missingEs: number;
};

// Sticky index at >= 1280px. The current entry follows scroll.
export function SectionIndex({ sections }: { sections: SectionEntry[] }) {
  const { form } = useFormLabels();
  const [current, setCurrent] = useState(sections[0]?.id);
  const ids = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const visible = new Set<string>();
    const order = ids.split(",");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setCurrent(first);
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    for (const id of order) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav
      aria-label={form.sectionIndex}
      className="sticky top-24 hidden h-fit w-40 shrink-0 xl:block"
    >
      <ol className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={current === section.id ? "location" : undefined}
              className={cn(
                "flex flex-col gap-0.5 border-l border-transparent pl-3 text-sm text-muted-foreground hover:text-foreground",
                current === section.id &&
                  "border-foreground font-semibold text-foreground",
              )}
            >
              <span>
                <span className="mr-2 font-mono text-xs">{section.number}</span>
                {section.title}
              </span>
              {section.missingEs > 0 ? (
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  {fill(form.missingCount, { n: String(section.missingEs) })}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
