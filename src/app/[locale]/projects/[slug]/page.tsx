import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { getProject, getPublishedSlugsCore } from "@/features/projects/queries";
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

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const { slug } = await params;
  const param = await locale();
  if (!isLocale(param)) notFound();
  const project = await getProject(slug);
  if (!project) notFound();
  const t = await getTranslations({ locale: param, namespace: "Site.project" });
  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
        {localized(project, "title", param) as string}
      </h1>
      <p className="mt-8">
        <Link href="/" className="underline underline-offset-4">
          {t("backHome")}
        </Link>
      </p>
    </main>
  );
}
