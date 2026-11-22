// One helper returns a complete metadata object per page. Next merges
// metadata shallowly, so a page that omits openGraph or alternates would lose
// the layout's values; every key is always set here (RESEARCH Pitfall 12).
import type { Metadata } from "next";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";

type Href = Parameters<typeof getPathname>[0]["href"];

// Cuts at the last word boundary before `max` characters; the ellipsis counts
// toward the limit and appears only when text was removed.
export function truncateAtWord(text: string | null | undefined, max = 155) {
  const value = (text ?? "").trim();
  if (value.length <= max) return value;
  const head = value.slice(0, max - 1);
  const space = head.lastIndexOf(" ");
  return `${(space > 0 ? head.slice(0, space) : head).trimEnd()}…`;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  href,
  siteName,
  ogType = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  href: Href;
  siteName: string;
  ogType?: "website" | "article";
}): Metadata {
  const path = (l: Locale) => getPathname({ locale: l, href });
  const url = path(locale);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: path("en"), es: path("es"), "x-default": path("en") },
    },
    openGraph: {
      type: ogType,
      title,
      description,
      url,
      locale: locale === "es" ? "es_CO" : "en_US",
      siteName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
