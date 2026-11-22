import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import {
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { ContactAside } from "@/features/contact/components/contact-aside";
import { ContactForm } from "@/features/contact/components/contact-form";
import { getSiteSettings } from "@/features/site-settings/queries";
import { isLocale } from "@/lib/locale";

export default async function ContactPage() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, tce, settings] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.contact" }),
    getTranslations({ locale: param, namespace: "Site.copyEmail" }),
    getSiteSettings(),
  ]);
  return (
    <div className={heroSectionClass}>
      <h1 className={`${heroTitleClass} lg:col-span-10 lg:col-start-3`}>
        {t("title")}
      </h1>
      <Reveal index={0} className="lg:col-span-7 lg:col-start-3">
        <p className="mt-8 max-w-[68ch]">{t("intro")}</p>
      </Reveal>
      {settings?.email && (
        <Reveal index={1} className="lg:col-span-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
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
            <ContactAside
              email={settings.email}
              calendarUrl={settings.calendarUrl}
              labels={{
                orWrite: t("orWrite"),
                preferCall: t("preferCall"),
                calendar: t("calendar"),
                copy: {
                  copy: tce("copy"),
                  copied: tce("copied"),
                  failed: tce("failed"),
                },
              }}
            />
          </div>
        </Reveal>
      )}
    </div>
  );
}
