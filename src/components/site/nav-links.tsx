"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type NavLabels = { work: string; about: string; contact: string };

const base =
  "inline-flex h-8 items-center text-sm font-semibold motion-safe:transition-colors motion-safe:duration-[160ms]";
const inactive = "text-muted-foreground hover:text-foreground";
const active =
  "text-foreground underline decoration-signal decoration-2 underline-offset-8";

const hrefs = {
  work: { pathname: "/", hash: "work" },
  about: "/about",
  contact: "/contact",
} as const;

// Same links without active state: the Suspense fallback and the static shell.
export function StaticNav({
  labels,
  current = null,
}: {
  labels: NavLabels;
  current?: string | null;
}) {
  return (
    <ul className="flex items-center gap-4 sm:gap-6">
      {(["work", "about", "contact"] as const).map((key) => {
        const isActive = current === key;
        return (
          <li key={key}>
            <Link
              href={hrefs[key]}
              aria-current={isActive ? "page" : undefined}
              className={cn(base, isActive ? active : inactive)}
            >
              {labels[key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks({ labels }: { labels: NavLabels }) {
  const segment = useSelectedLayoutSegment();
  const current = segment === "about" || segment === "contact" ? segment : null;
  return <StaticNav labels={labels} current={current} />;
}
