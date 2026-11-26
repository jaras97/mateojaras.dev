import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { EntryList } from "@/components/site/entry-list";
import { PageSection } from "@/components/site/page-section";
import { RequestedPath } from "@/components/site/requested-path";
import { getProjectStacks, getProjects } from "@/features/projects/queries";
import { Link } from "@/i18n/navigation";
import { isLocale } from "@/lib/locale";

export default async function NotFound() {
  const param = await locale();
  const active = isLocale(param) ? param : "en";
  const [t, tp, rows, stacks] = await Promise.all([
    getTranslations({ locale: active, namespace: "Site.notFound" }),
    getTranslations({ locale: active, namespace: "Site.project" }),
    getProjects(),
    getProjectStacks(),
  ]);
  const linkClass = "underline underline-offset-4";
  return (
    <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <title>{`${t("eyebrow")} · ${t("title")}`}</title>
      <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-sm text-muted-foreground">
        <span>{t("eyebrow")} ·</span>
        <span>{t("pathLabel")}</span>
        <RequestedPath />
      </p>
      <h1 className="mt-4 font-heading text-4xl font-semibold tracking-display text-balance">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-prose">{t("body")}</p>
      {rows.length > 0 && (
        <PageSection
          id="entries"
          number="01"
          title={t("listTitle")}
          className="mt-12 lg:mt-16"
        >
          <EntryList
            rows={rows}
            stacks={stacks}
            locale={active}
            labels={{ internalTool: tp("internalTool") }}
          />
        </PageSection>
      )}
      <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/" className={linkClass}>
          {t("home")}
        </Link>
        <Link href="/contact" className={linkClass}>
          {t("contact")}
        </Link>
      </p>
    </div>
  );
}
