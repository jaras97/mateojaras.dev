import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import {
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { ContactForm } from "@/features/contact/components/contact-form";
import { getSiteSettings } from "@/features/site-settings/queries";
import { isLocale } from "@/lib/locale";

export default async function ContactPage() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, settings] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.contact" }),
    getSiteSettings(),
  ]);
  return (
    <div className={heroSectionClass}>
      <h1 className={`${heroTitleClass} lg:col-span-10 lg:col-start-3`}>
        {t("title")}
      </h1>
      <p className="mt-8 max-w-[68ch] lg:col-span-7 lg:col-start-3">
        {t("intro")}
      </p>
      {settings?.email && (
        <div className="mt-12 lg:col-span-6 lg:col-start-3">
          <ContactForm
            locale={param}
            email={settings.email}
            labels={{
              name: t("name"),
              email: t("email"),
              message: t("message"),
              honeypot: t("honeypot"),
              send: t("send"),
              sending: t("sending"),
              confirmation: t("confirmation"),
              errors: {
                nameRequired: t("errors.nameRequired"),
                emailInvalid: t("errors.emailInvalid"),
                messageShort: t("errors.messageShort"),
                messageLong: t.raw("errors.messageLong"),
                rateLimited: t.raw("errors.rateLimited"),
                unavailable: t.raw("errors.unavailable"),
              },
            }}
          />
        </div>
      )}
      {settings?.email && (
        <p className="mt-4 lg:col-span-7 lg:col-start-3">
          <a
            href={`mailto:${settings.email}`}
            className="underline underline-offset-4"
          >
            {settings.email}
          </a>
        </p>
      )}
    </div>
  );
}
