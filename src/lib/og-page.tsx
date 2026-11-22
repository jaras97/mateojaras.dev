// Shared body of the home, about and contact OG routes. They read only the
// locale param and cached settings, so the images stay static.
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/features/site-settings/queries";
import { formatMonthYear } from "@/lib/format";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export type OgPage = "home" | "about" | "contact";

async function load(page: OgPage, locale: string) {
  if (!isLocale(locale)) notFound();
  const settings = await getSiteSettings();
  if (!settings) notFound();
  const tAbout = await getTranslations({ locale, namespace: "Site.about" });
  const tContact = await getTranslations({ locale, namespace: "Site.contact" });
  const headline = String(localized(settings, "headline", locale) ?? "");
  const label = {
    home: settings.name,
    about: tAbout("title"),
    contact: tContact("title"),
  }[page];
  const title = {
    home: headline,
    about: tAbout("title"),
    contact: tContact("title"),
  }[page];
  return {
    label,
    title,
    // 'YYYY-MM-DD' of the last edit, straight from the row.
    date: formatMonthYear(
      settings.updatedAt.toISOString().slice(0, 10),
      locale,
    ),
  };
}

// generateImageMetadata receives empty params for [locale] routes while Next
// collects page data, so a localized alt is not possible; the image is still
// rendered per request params (locale) below.
export async function renderOgPage(
  page: OgPage,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  return renderOgImage(await load(page, locale));
}
