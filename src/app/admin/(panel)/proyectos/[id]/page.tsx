import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { getProjectForAdmin } from "@/features/projects/admin-queries";
import { ProjectForm } from "@/features/projects/components/project-form";
import { projectFormValues } from "@/features/projects/validation";
import { requireSession } from "@/lib/dal";

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/proyectos/[id]">) {
  await requireSession();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const data = await getProjectForAdmin(id);
  if (!data) notFound();
  const t = await getTranslations({
    locale: "es",
    namespace: "Admin.projects",
  });
  const c = await getTranslations({ locale: "es", namespace: "Admin.common" });
  const e = await getTranslations({ locale: "es", namespace: "Admin.errors" });
  const f = await getTranslations({ locale: "es", namespace: "Admin.form" });
  const { row, skillIds } = data;
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="font-heading mb-8 text-3xl font-semibold tracking-display">
        {row.titleEs}
      </h1>
      <ProjectForm
        version={row.updatedAt.toISOString()}
        id={row.id}
        defaults={projectFormValues(row, skillIds)}
        isPublished={row.status === "published"}
        labels={{
          title: t("fields.title.label"),
          es: c("es"),
          en: c("en"),
          saveDraft: c("saveDraft"),
          publish: c("publish"),
          publishChanges: c("publishChanges"),
          saved: c("saved", { hora: "{hora}" }),
          saveFailed: e("saveFailed"),
          sessionExpired: e("sessionExpired"),
          publishBlocked: f("publishBlocked", { n: "{n}" }),
        }}
      />
    </main>
  );
}
