import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { getProjects } from "@/features/projects/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";

export default async function Home() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, settings, rows] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.home" }),
    getSiteSettings(),
    getProjects(),
  ]);
  return (
    <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      {settings && (
        <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
          {settings.name}
        </h1>
      )}
      {rows.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-2xl font-semibold">
            {t("projectsHeading")}
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.slug}>
                <Link
                  href={{
                    pathname: "/projects/[slug]",
                    params: { slug: row.slug },
                  }}
                  className="underline underline-offset-4"
                >
                  {localized(row, "title", param) as string}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
