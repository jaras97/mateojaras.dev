import type { MetadataRoute } from "next";
import { getSitemapProjects } from "@/features/projects/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getPathname } from "@/i18n/navigation";
import { siteUrl } from "@/lib/site-url";

type Href = Parameters<typeof getPathname>[0]["href"];

// Every entry is the English URL with hreflang alternates for en, es and
// x-default. lastModified comes from the DB, never from the clock.
function entry(base: string, href: Href, lastModified?: Date) {
  const url = (locale: "en" | "es") =>
    `${base}${getPathname({ locale, href })}`;
  return {
    url: url("en"),
    lastModified,
    alternates: {
      languages: { en: url("en"), es: url("es"), "x-default": url("en") },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getSitemapProjects(),
  ]);
  const pagesModified = settings?.updatedAt;
  return [
    entry(base, "/", pagesModified),
    entry(base, "/about", pagesModified),
    entry(base, "/contact", pagesModified),
    ...projects.map((p) =>
      entry(
        base,
        { pathname: "/projects/[slug]", params: { slug: p.slug } },
        p.updatedAt,
      ),
    ),
  ];
}
