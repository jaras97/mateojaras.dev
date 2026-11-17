import { getTranslations } from "next-intl/server";
import { FormLabelsProvider } from "@/components/admin/form-labels";
import { getSettingsForAdmin } from "@/features/site-settings/admin-queries";
import { SettingsForm } from "@/features/site-settings/components/settings-form";
import { settingsFormValues } from "@/features/site-settings/validation";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function SettingsPage() {
  await requireSession();
  const [data, cv, nav, confirm] = await Promise.all([
    getSettingsForAdmin(),
    getTranslations({ locale: "es", namespace: "Cv" }),
    getTranslations({ locale: "es", namespace: "Admin.nav" }),
    getTranslations({ locale: "es", namespace: "Admin.confirm" }),
  ]);
  const { common, form, projects, richText, errors, toasts, skills, images } =
    adminMessages;

  if (!data) {
    return (
      <main className="w-full flex-1 px-6 py-12 lg:px-12">
        <p className="text-sm text-muted-foreground">{errors.loadFailed}</p>
      </main>
    );
  }
  const { row, hasPendingDraft } = data;
  const levels = Object.fromEntries(
    (["native", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map((level) => [
      level,
      cv(`levels.${level}`),
    ]),
  );
  return (
    <FormLabelsProvider
      labels={{
        common,
        form,
        projects,
        richText,
        errors,
        toasts,
        skills,
        images,
      }}
    >
      <SettingsForm
        labels={{
          settings: adminMessages.settings,
          discardConfirm: {
            title: confirm("discard.title"),
            body: confirm("discard.body"),
            cancel: confirm("discard.cancel"),
            confirm: confirm("discard.confirm"),
          },
          levels,
          breadcrumb: nav("panel"),
        }}
        version={row.updatedAt.toISOString()}
        defaults={settingsFormValues(row)}
        status={row.status}
        hasPendingDraft={hasPendingDraft}
      />
    </FormLabelsProvider>
  );
}
