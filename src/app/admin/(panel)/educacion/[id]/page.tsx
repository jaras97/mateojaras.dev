import { notFound } from "next/navigation";
import { z } from "zod";
import { FormLabelsProvider } from "@/components/admin/form-labels";
import { getEducationForAdmin } from "@/features/education/admin-queries";
import { EducationForm } from "@/features/education/components/education-form";
import { educationFormValues } from "@/features/education/validation";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function EditEducationPage({
  params,
}: PageProps<"/admin/educacion/[id]">) {
  await requireSession();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const data = await getEducationForAdmin(id);
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
      <EducationForm
        education={adminMessages.education}
        version={row.updatedAt.toISOString()}
        id={row.id}
        title={row.institution}
        defaults={educationFormValues(row)}
        status={row.status}
        hasPendingDraft={hasPendingDraft}
      />
    </FormLabelsProvider>
  );
}
