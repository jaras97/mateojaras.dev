import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { EducationList } from "@/components/site/about/education-list";
import { ExperienceList } from "@/components/site/about/experience-list";
import { LanguageList } from "@/components/site/about/language-list";
import { NowSection } from "@/components/site/about/now-section";
import { StackList } from "@/components/site/about/stack-list";
import { heroTitleClass } from "@/components/site/hero/hero-parts";
import { PageSection, pageGridClass } from "@/components/site/page-section";
import { getEducation } from "@/features/education/queries";
import { getExperiences } from "@/features/experience/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getSkills } from "@/features/skills/queries";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";
import { docHasText } from "@/lib/rich-text";
import { numberSections } from "@/lib/section-numbers";

export default async function AboutPage() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, tc, settings, skills, experiences, education] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.about" }),
    getTranslations({ locale: param, namespace: "Cv" }),
    getSiteSettings(),
    getSkills(),
    getExperiences(),
    getEducation(),
  ]);
  const bio = settings ? String(localized(settings, "bio", param) ?? "") : "";
  const nowDoc = settings ? localized(settings, "now", param) : null;
  const languages = settings?.languages ?? [];

  const present = (
    [
      ["now", settings && docHasText(nowDoc)],
      ["stack", skills.length > 0],
      ["experience", experiences.length > 0],
      ["education", education.length > 0],
      ["languages", languages.length > 0],
    ] as const
  )
    .filter(([, has]) => has)
    .map(([key]) => key);
  const n = numberSections(present);
  const first = present[0];
  const wrap = (key: string, node: React.ReactNode) =>
    key === first ? <Reveal index={1}>{node}</Reveal> : node;

  const years = (count: number) => t("years", { n: count });
  const levels = Object.fromEntries(
    (["native", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map((k) => [
      k,
      tc(`levels.${k}`),
    ]),
  );

  return (
    <div className={pageGridClass}>
      <h1 className={`${heroTitleClass} lg:col-span-10 lg:col-start-3`}>
        {t("title")}
      </h1>
      {bio.trim() && (
        <Reveal index={0} className="lg:col-span-7 lg:col-start-3">
          <p className="mt-8 max-w-[68ch]">{bio}</p>
        </Reveal>
      )}
      <div className="lg:col-span-12">
        {present.includes("now") && settings
          ? wrap(
              "now",
              <PageSection id="about-now" number={n.now} title={t("now")}>
                <NowSection
                  doc={nowDoc}
                  updatedAt={settings.updatedAt}
                  timeZone={settings.timezone}
                  locale={param}
                  updatedLabel={(date) => t("nowUpdated", { date })}
                />
              </PageSection>,
            )
          : null}
        {present.includes("stack")
          ? wrap(
              "stack",
              <PageSection id="about-stack" number={n.stack} title={t("stack")}>
                <StackList
                  skills={skills}
                  years={years}
                  categoryLabels={{
                    frontend: tc("skillCategories.frontend"),
                    state: tc("skillCategories.state"),
                    testing: tc("skillCategories.testing"),
                    backend: tc("skillCategories.backend"),
                    ai: tc("skillCategories.ai"),
                    tools: tc("skillCategories.tools"),
                  }}
                />
              </PageSection>,
            )
          : null}
        {present.includes("experience")
          ? wrap(
              "experience",
              <PageSection
                id="about-experience"
                number={n.experience}
                title={t("experience")}
              >
                <ExperienceList
                  locale={param}
                  labels={{
                    present: t("present"),
                    type: {
                      employment: t("type.employment"),
                      freelance: t("type.freelance"),
                    },
                  }}
                  rows={experiences.map((e) => ({
                    id: e.id,
                    company: e.company,
                    role: String(localized(e, "role", param) ?? ""),
                    type: e.type,
                    location: e.location,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    bullets: (localized(e, "bullets", param) ?? []) as string[],
                  }))}
                />
              </PageSection>,
            )
          : null}
        {present.includes("education")
          ? wrap(
              "education",
              <PageSection
                id="about-education"
                number={n.education}
                title={t("education")}
              >
                <EducationList
                  locale={param}
                  presentLabel={t("present")}
                  rows={education.map((e) => ({
                    id: e.id,
                    institution: e.institution,
                    program: String(localized(e, "program", param) ?? ""),
                    startDate: e.startDate,
                    endDate: e.endDate,
                    status: (localized(e, "status", param) ?? null) as
                      | string
                      | null,
                  }))}
                />
              </PageSection>,
            )
          : null}
        {present.includes("languages")
          ? wrap(
              "languages",
              <PageSection
                id="about-languages"
                number={n.languages}
                title={t("languages")}
              >
                <LanguageList
                  languages={languages}
                  locale={param}
                  levels={levels}
                />
              </PageSection>,
            )
          : null}
      </div>
    </div>
  );
}
