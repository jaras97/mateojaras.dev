import { getTranslations } from "next-intl/server";
import { EnvMissingNotice } from "@/components/admin/env-missing-notice";
import { FormSection } from "@/components/admin/form-section";
import { GenerateCvButton } from "@/features/resume/components/generate-cv-button";
import { hasBlobToken } from "@/lib/blob";
import { requireSession } from "@/lib/dal";

export default async function CvPage() {
  await requireSession();
  const [t, toasts, errors] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.cv" }),
    getTranslations({ locale: "es", namespace: "Admin.toasts" }),
    getTranslations({ locale: "es", namespace: "Admin.errors" }),
  ]);
  const tokenOk = hasBlobToken();

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
          {tokenOk ? null : <EnvMissingNotice message={t("tokenMissing")} />}
          <div>
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
          </div>
        </FormSection>
      </div>
    </main>
  );
}
