import { notFound } from "next/navigation";
import { z } from "zod";
import { FormLabelsProvider } from "@/components/admin/form-labels";
import {
  getProjectForAdmin,
  listSkillOptionsForAdmin,
} from "@/features/projects/admin-queries";
import { ProjectForm } from "@/features/projects/components/project-form";
import { projectFormValues } from "@/features/projects/validation";
import { hasBlobToken } from "@/lib/blob";
import { requireSession } from "@/lib/dal";
import { draftPreviewHref } from "@/lib/draft-preview";
import { adminMessages } from "@/lib/messages";

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/proyectos/[id]">) {
  await requireSession();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [data, skillOptions] = await Promise.all([
    getProjectForAdmin(id),
    listSkillOptionsForAdmin(),
  ]);
  if (!data) notFound();
  const { row, skillIds, hasPendingDraft } = data;
  const { common, form, projects, richText, errors, toasts, skills } =
    adminMessages;
  return (
    <FormLabelsProvider
      labels={{ common, form, projects, richText, errors, toasts, skills }}
    >
      <ProjectForm
        version={row.updatedAt.toISOString()}
        id={row.id}
        title={row.titleEs}
        defaults={projectFormValues(row, skillIds)}
        status={row.status}
        hasPendingDraft={hasPendingDraft}
        featured={row.featured}
        skillOptions={skillOptions}
        previewHref={draftPreviewHref({ kind: "project", id })}
        uploadsEnabled={hasBlobToken()}
      />
    </FormLabelsProvider>
  );
}
