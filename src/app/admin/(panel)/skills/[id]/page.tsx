import { notFound } from "next/navigation";
import { z } from "zod";
import { FormLabelsProvider } from "@/components/admin/form-labels";
import { getSkillForAdmin } from "@/features/skills/admin-queries";
import { SkillForm } from "@/features/skills/components/skill-form";
import { skillFormValues } from "@/features/skills/validation";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function EditSkillPage({
  params,
}: PageProps<"/admin/skills/[id]">) {
  await requireSession();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const data = await getSkillForAdmin(id);
  if (!data) notFound();
  const { row, hasPendingDraft } = data;
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
      <SkillForm
        version={row.updatedAt.toISOString()}
        id={row.id}
        title={row.name}
        defaults={skillFormValues(row)}
        status={row.status}
        hasPendingDraft={hasPendingDraft}
      />
    </FormLabelsProvider>
  );
}
