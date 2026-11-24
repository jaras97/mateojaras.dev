import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { CaseCover } from "@/components/site/case-study/case-cover";
import { CaseCta } from "@/components/site/case-study/case-cta";
import { CaseGallery } from "@/components/site/case-study/case-gallery";
import { CaseHeader } from "@/components/site/case-study/case-header";
import { CaseMetrics } from "@/components/site/case-study/case-metrics";
import { CaseSections } from "@/components/site/case-study/case-sections";
import { PrevNext } from "@/components/site/case-study/prev-next";
import { Marginalia } from "@/components/site/marginalia";
import { pageGridClass } from "@/components/site/page-section";
import { adjacentProjects } from "@/features/projects/adjacent";
import {
  getProject,
  getProjectStacks,
  getProjects,
  getPublishedSlugsCore,
} from "@/features/projects/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";
import { buildPageMetadata, truncateAtWord } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getPublishedSlugsCore()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const param = await locale();
  const [project, settings] = await Promise.all([
    getProject(slug),
    getSiteSettings(),
  ]);
  if (!project || !settings || !isLocale(param)) return {};
  const title = localized(project, "title", param) as string;
  const tagline = localized(project, "tagline", param) as string | null;
  return buildPageMetadata({
    locale: param,
    title: `${title} · ${settings.name}`,
    description:
      tagline?.trim() ||
      truncateAtWord(localized(project, "problem", param) as string | null),
    href: { pathname: "/projects/[slug]", params: { slug } },
    siteName: settings.name,
    ogType: "article",
  });
}

type Params = PageProps<"/[locale]/projects/[slug]">["params"];

// The slug is URL data: it is read inside Suspense so the route's App Shell
// (unknown slug) never awaits it. Awaiting it above the boundary makes the
// shell's runtime regeneration bail out after updateTag(settings) and every
// case study answers 500 (docs: adopting-partial-prefetching "Move URL data
// behind Suspense"). Slugs from generateStaticParams stay fully static.
async function CaseStudy({
  params,
  locale,
}: {
  params: Params;
  locale: Locale;
}) {
  const { slug } = await params;
  const [project, all, stacks, t] = await Promise.all([
    getProject(slug),
    getProjects(),
    getProjectStacks(),
    getTranslations({ locale, namespace: "Site.project" }),
  ]);
  if (!project) notFound();

  const metrics =
    (localized(project, "metrics", locale) as
      | { label: string; value: string }[]
      | null) ?? [];
  const coverAlt = project.media?.find(
    (item) => item.url === project.coverImage,
  );
  const { prev, next } = adjacentProjects(all, slug);
  const neighbour = (row: (typeof all)[number] | null) =>
    row
      ? {
          href: getPathname({
            locale,
            href: { pathname: "/projects/[slug]", params: { slug: row.slug } },
          }),
          title: localized(row, "title", locale) as string,
        }
      : null;
  const media = project.media ?? [];
  const hasGallery = media.some((item) => item.url !== project.coverImage);
  const tech = localized(project, "techDecisions", locale) as {
    tradeoffs?: string;
    validation?: string;
    aiTools?: string[];
  } | null;
  const notes = [
    { label: t("marginalia.tradeoffs"), body: tech?.tradeoffs ?? "" },
    { label: t("marginalia.validation"), body: tech?.validation ?? "" },
    { label: t("marginalia.aiTools"), body: (tech?.aiTools ?? []).join(" · ") },
  ];
  const contactHref = getPathname({ locale, href: "/contact" });

  return (
    <article className={pageGridClass}>
      <Reveal index={0} className="lg:col-span-12">
        <CaseHeader
          title={localized(project, "title", locale) as string}
          tagline={localized(project, "tagline", locale) as string | null}
          locale={locale}
          stack={stacks[project.id] ?? []}
          startedAt={project.startedAt}
          finishedAt={project.finishedAt}
          liveUrl={project.liveUrl}
          repoUrl={project.repoUrl}
          backHref={`${getPathname({ locale, href: "/" })}#work`}
          contactHref={contactHref}
          labels={{
            backHome: t("backHome"),
            present: t("present"),
            source: t("source"),
            internalTool: t("internalTool"),
            demoText: t("demoText"),
            demoLink: t("demoLink"),
          }}
        />
      </Reveal>
      {metrics.length > 0 ? (
        <Reveal index={1} className="mt-12 lg:col-span-10 lg:col-start-3">
          <CaseMetrics metrics={metrics} label={t("metrics")} />
        </Reveal>
      ) : null}
      {project.coverImage ? (
        <div className="mt-12 lg:col-span-10 lg:col-start-3">
          <CaseCover
            src={project.coverImage}
            alt={
              coverAlt
                ? (localized(coverAlt, "alt", locale) as string)
                : (localized(project, "title", locale) as string)
            }
          />
        </div>
      ) : null}
      <Reveal index={2} className="lg:col-span-12">
        <ScrollScene>
          <CaseSections
            project={project}
            locale={locale}
            slug={slug}
            solutionExtra={
              hasGallery ? (
                <CaseGallery
                  media={media}
                  cover={project.coverImage}
                  locale={locale}
                  labels={{ figure: t.raw("figure") as string }}
                />
              ) : null
            }
            decisionsAside={<Marginalia notes={notes} />}
            labels={{
              problem: t("sections.problem"),
              role: t("sections.role"),
              solution: t("sections.solution"),
              results: t("sections.results"),
              decisions: t("sections.decisions"),
            }}
          />
        </ScrollScene>
      </Reveal>
      <div className="lg:col-span-12">
        <PrevNext
          prev={neighbour(prev)}
          next={neighbour(next)}
          labels={{ nav: t("more"), prev: t("prev"), next: t("next") }}
        />
        <CaseCta closing={t("closing")} label={t("cta")} href={contactHref} />
      </div>
    </article>
  );
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const param = await locale();
  if (!isLocale(param)) notFound();
  return (
    // Reserves the heading line while an unlisted slug streams in.
    <Suspense
      fallback={
        <div className={pageGridClass}>
          <div aria-hidden="true" className="h-10 lg:col-span-12" />
        </div>
      }
    >
      <CaseStudy params={params} locale={param} />
    </Suspense>
  );
}
