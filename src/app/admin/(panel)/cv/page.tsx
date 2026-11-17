import { getTranslations } from "next-intl/server";
import { AdminLink } from "@/components/admin/admin-link";
import { EnvMissingNotice } from "@/components/admin/env-missing-notice";
import { FormSection } from "@/components/admin/form-section";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  getCvPreflight,
  listResumeVersionsForAdmin,
} from "@/features/resume/admin-queries";
import { CvHistory } from "@/features/resume/components/cv-history";
import { CvLinks } from "@/features/resume/components/cv-links";
import { GenerateCvButton } from "@/features/resume/components/generate-cv-button";
import { hasBlobToken } from "@/lib/blob";
import { requireSession } from "@/lib/dal";

export default async function CvPage() {
  await requireSession();
  const [t, toasts, errors, common] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.cv" }),
    getTranslations({ locale: "es", namespace: "Admin.toasts" }),
    getTranslations({ locale: "es", namespace: "Admin.errors" }),
    getTranslations({ locale: "es", namespace: "Admin.common" }),
  ]);
  const tokenOk = hasBlobToken();

  const [versions, problems] = await Promise.all([
    listResumeVersionsForAdmin().catch((error) => {
      console.error("listResumeVersionsForAdmin failed", error);
      return null;
    }),
    getCvPreflight().catch((error) => {
      console.error("getCvPreflight failed", error);
      return null;
    }),
  ]);

  const has = (locale: "en" | "es") =>
    Boolean(versions?.some((v) => v.locale === locale));

  const button = (
    <GenerateCvButton
      disabled={!tokenOk}
      labels={{
        generate: t("generate"),
        generating: t("generating"),
        generated: toasts("cvGenerated", { n: "{n}" }),
        failed: errors("cvFailed", { motivo: "{motivo}" }),
        sessionExpired: errors("sessionExpired"),
        tokenMissing: errors("tokenMissing"),
      }}
    />
  );

  return (
    <main className="w-full flex-1 px-6 py-12 lg:px-12">
      <h1 className="mb-8 font-heading text-[25px] leading-tight font-semibold tracking-display">
        {t("title")}
      </h1>
      <div className="flex max-w-3xl flex-col gap-12">
        <FormSection id="generar" number="01" title={t("sections.generate")}>
          <p className="max-w-[68ch] text-sm text-muted-foreground">
            {t("helper")}
          </p>
          {problems === null ? (
            <p className="text-sm text-muted-foreground">
              {errors("loadFailed")}
            </p>
          ) : problems.length === 0 ? (
            <p className="font-mono text-xs">{t("preflightEmpty")}</p>
          ) : (
            <ul
              aria-label={t("preflightLabel")}
              className="flex flex-col gap-1"
            >
              {problems.map((problem) => (
                <li
                  key={`${problem.key}-${problem.href}-${problem.locale ?? ""}`}
                >
                  <AdminLink
                    href={problem.href}
                    className="font-mono text-xs underline underline-offset-4"
                  >
                    {t(`preflightProblems.${problem.key}`, {
                      nombre: problem.nombre ?? "",
                      idioma: problem.locale
                        ? t(`languageNames.${problem.locale}`)
                        : "",
                    })}
                  </AdminLink>
                </li>
              ))}
            </ul>
          )}
          {tokenOk ? null : <EnvMissingNotice message={t("tokenMissing")} />}
          <div>{button}</div>
        </FormSection>

        <FormSection id="enlaces" number="02" title={t("sections.links")}>
          <CvLinks
            links={[
              { path: "/cv/en.pdf", available: has("en") },
              { path: "/cv/es.pdf", available: has("es") },
              { path: "/resume.json", available: true },
              { path: "/resume.es.json", available: true },
            ]}
            labels={{
              open: t("open"),
              copy: t("copyLink"),
              copied: t("linkCopied"),
              notGenerated: t("notGenerated"),
            }}
          />
        </FormSection>

        <FormSection id="historial" number="03" title={t("sections.history")}>
          {versions === null ? (
            <p className="text-sm text-muted-foreground">
              {errors("loadFailed")}
            </p>
          ) : versions.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>{t("empty.heading")}</EmptyTitle>
                <EmptyDescription>{t("empty.body")}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>{button}</EmptyContent>
            </Empty>
          ) : (
            <CvHistory
              rows={versions}
              labels={{
                columns: {
                  version: t("columns.version"),
                  locale: t("columns.locale"),
                  generated: t("columns.generated"),
                  status: t("columns.status"),
                  download: t("columns.download"),
                },
                current: common("status.current"),
                download: t("download"),
              }}
            />
          )}
        </FormSection>
      </div>
    </main>
  );
}
