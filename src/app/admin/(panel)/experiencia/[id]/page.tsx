import { notFound } from "next/navigation";
import { z } from "zod";
import { FormLabelsProvider } from "@/components/admin/form-labels";
import {
  getExperienceForAdmin,
  listProjectOptionsForAdmin,
} from "@/features/experience/admin-queries";
import { ExperienceForm } from "@/features/experience/components/experience-form";
import { experienceFormValues } from "@/features/experience/validation";
import { listSkillOptionsForAdmin } from "@/features/projects/admin-queries";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function EditExperiencePage({
  params,
}: PageProps<"/admin/experiencia/[id]">) {
  await requireSession();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [data, skillOptions, projectOptions] = await Promise.all([
    getExperienceForAdmin(id),
    listSkillOptionsForAdmin(),
    listProjectOptionsForAdmin(),
  ]);
  if (!data) notFound();
  const { row, skillIds, projectIds, hasPendingDraft } = data;
  const { common, form, projects, richText, errors, toasts, skills, images } =
    adminMessages;
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
      <ExperienceForm
        experience={adminMessages.experience}
        version={row.updatedAt.toISOString()}
        id={row.id}
        title={row.company}
        defaults={experienceFormValues(row, skillIds, projectIds)}
        status={row.status}
        hasPendingDraft={hasPendingDraft}
        skillOptions={skillOptions}
        projectOptions={projectOptions}
      />
    </FormLabelsProvider>
  );
}
