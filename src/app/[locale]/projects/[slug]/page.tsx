import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getProject, getPublishedSlugsCore } from "@/features/projects/queries";
import type { Locale } from "@/features/site-settings/types";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";

export async function generateStaticParams() {
  return (await getPublishedSlugsCore()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const param = await locale();
  const project = await getProject(slug);
  if (!project || !isLocale(param)) return {};
  return { title: localized(project, "title", param) as string };
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
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
      {localized(project, "title", locale) as string}
    </h1>
  );
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const t = await getTranslations({ locale: param, namespace: "Site.project" });
  return (
    <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      {/* Reserves the heading line while an unlisted slug streams in. */}
      <Suspense fallback={<div aria-hidden="true" className="h-10" />}>
        <CaseStudy params={params} locale={param} />
      </Suspense>
      <p className="mt-8">
        <Link href="/" className="underline underline-offset-4">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
