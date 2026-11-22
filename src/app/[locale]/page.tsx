import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { EntryList } from "@/components/site/entry-list";
import { HeroA } from "@/components/site/hero/hero-a";
import { heroCopy } from "@/components/site/hero-copy";
import { HomeContact } from "@/components/site/home-contact";
import { PageSection } from "@/components/site/page-section";
import { getProjectStacks, getProjects } from "@/features/projects/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import { isLocale } from "@/lib/locale";

export default async function Home() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, tc, tp, settings, rows, stacks] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.home" }),
    getTranslations({ locale: param, namespace: "Site.contact" }),
    getTranslations({ locale: param, namespace: "Site.project" }),
    getSiteSettings(),
    getProjects(),
    getProjectStacks(),
  ]);
  const tce = await getTranslations({
    locale: param,
    namespace: "Site.copyEmail",
  });
  const copy = heroCopy[param];
  const hasWork = rows.length > 0;

  return (
    <>
      {settings && <HeroA settings={settings} locale={param} cta={copy.cta} />}
      <div className="mx-auto max-w-page px-6 md:px-12">
        {hasWork && (
          <Reveal index={1}>
            <PageSection
              id="work"
              number="01"
              title={copy.index[0].label}
              className="mt-0"
            >
              <EntryList
                rows={rows}
                stacks={stacks}
                locale={param}
                labels={{ internalTool: tp("internalTool") }}
              />
            </PageSection>
          </Reveal>
        )}
        {settings && (
          <Reveal index={hasWork ? 2 : 1}>
            <PageSection
              id="contact"
              number={hasWork ? "02" : "01"}
              title={copy.index[2].label}
              className="mb-16"
            >
              <HomeContact
                intro={tc("intro")}
                email={settings.email}
                calendarUrl={settings.calendarUrl}
                calendarLabel={t("calendar")}
                copyLabels={{
                  copy: tce("copy"),
                  copied: tce("copied"),
                  failed: tce("failed"),
                }}
              />
            </PageSection>
          </Reveal>
        )}
      </div>
    </>
  );
}
