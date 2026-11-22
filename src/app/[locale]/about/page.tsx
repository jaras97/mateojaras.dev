import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import {
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { getSiteSettings } from "@/features/site-settings/queries";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";

export default async function AboutPage() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, settings] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.about" }),
    getSiteSettings(),
  ]);
  const bio = settings ? String(localized(settings, "bio", param) ?? "") : "";
  return (
    <div className={heroSectionClass}>
      <h1 className={`${heroTitleClass} lg:col-span-10 lg:col-start-3`}>
        {t("title")}
      </h1>
      {bio.trim() && (
        <p className="mt-8 max-w-[68ch] lg:col-span-7 lg:col-start-3">{bio}</p>
      )}
    </div>
  );
}
