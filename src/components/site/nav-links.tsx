"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type NavLabels = { work: string; about: string; contact: string };

const base =
  "inline-flex h-8 items-center text-sm font-semibold motion-safe:transition-colors motion-safe:duration-[160ms]";
const inactive = "text-muted-foreground hover:text-foreground";
const active =
  "text-foreground underline decoration-signal decoration-2 underline-offset-8";

export function navHrefs(locale: Locale) {
  return {
    work: `${getPathname({ locale, href: "/" })}#work`,
    about: getPathname({ locale, href: "/about" }),
    contact: getPathname({ locale, href: "/contact" }),
  };
}

// Same links without active state: the Suspense fallback and the static shell.
export function StaticNav({
  locale,
  labels,
  current = null,
}: {
  locale: Locale;
  labels: NavLabels;
  current?: string | null;
}) {
  const hrefs = navHrefs(locale);
  return (
    <ul className="flex items-center gap-4 sm:gap-6">
      {(["work", "about", "contact"] as const).map((key) => {
        const isActive = current === key;
        return (
          <li key={key}>
            <a
              href={hrefs[key]}
              aria-current={isActive ? "page" : undefined}
              className={cn(base, isActive ? active : inactive)}
            >
              {labels[key]}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks({
  locale,
  labels,
}: {
  locale: Locale;
  labels: NavLabels;
}) {
  const segment = useSelectedLayoutSegment();
  const current = segment === "about" || segment === "contact" ? segment : null;
  return <StaticNav locale={locale} labels={labels} current={current} />;
}
