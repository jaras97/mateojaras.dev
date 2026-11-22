// Params-based on purpose: root params are unavailable in metadata image
// route handlers. Unknown slugs 404; known slugs are generated at build.
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProject } from "@/features/projects/queries";
import { formatMonthYear } from "@/lib/format";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateImageMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project || !isLocale(locale)) return [];
  const t = await getTranslations({ locale, namespace: "Site.og" });
  return [
    {
      id: "default",
      alt: `${t("caseStudy")}: ${localized(project, "title", locale) as string}`,
      size: ogSize,
      contentType: ogContentType,
    },
  ];
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project || !isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Site.og" });
  const date = project.finishedAt ?? project.startedAt;
  return renderOgImage({
    label: t("caseStudy"),
    title: localized(project, "title", locale) as string,
    date: date ? formatMonthYear(date, locale) : "",
  });
}
