"use client";

import { useParams, useSelectedLayoutSegments } from "next/navigation";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";
import { alternateHref } from "./alternate-href";

// Plain <a>, never next-intl <Link locale>: that forces the locale prefix.
// useParams/useSelectedLayoutSegments live here so they stay inside Suspense.
export function LangSwitch({
  locale,
  toOther,
}: {
  locale: Locale;
  toOther: string;
}) {
  const params = useParams<{ slug?: string }>();
  const segments = useSelectedLayoutSegments();
  const other: Locale = locale === "en" ? "es" : "en";
  const href = getPathname({
    locale: other,
    href: alternateHref(segments, params),
  });
  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      <span aria-current="true" className="hidden text-foreground sm:inline">
        {locale.toUpperCase()}
      </span>
      <span
        aria-hidden="true"
        className="hidden text-muted-foreground sm:inline"
      >
        /
      </span>
      <a
        href={href}
        hrefLang={other}
        lang={other}
        aria-label={toOther}
        onClick={(event) => {
          if (location.hash) {
            event.preventDefault();
            location.assign(`${href}${location.hash}`);
          }
        }}
        className="inline-flex h-8 items-center text-muted-foreground hover:text-foreground motion-safe:transition-colors motion-safe:duration-[160ms]"
      >
        {other.toUpperCase()}
      </a>
    </span>
  );
}
