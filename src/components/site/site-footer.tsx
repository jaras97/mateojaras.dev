import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/features/site-settings/queries";
import type { Locale } from "@/features/site-settings/types";
import { FooterLine } from "./footer-line";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "Site.footer" }),
    getSiteSettings(),
  ]);
  if (!settings) return null;
  return (
    <footer className="mt-16 border-t border-border py-12 lg:mt-24">
      <div className="mx-auto max-w-page px-6 md:px-12">
        <FooterLine
          settings={settings}
          locale={locale}
          labels={{
            cv: t("cv"),
            source: t("source"),
            github: t("github"),
            linkedin: t("linkedin"),
          }}
        />
      </div>
    </footer>
  );
}
