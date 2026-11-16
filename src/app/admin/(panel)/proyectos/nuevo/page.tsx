import { FormLabelsProvider } from "@/components/admin/form-labels";
import { NewProjectForm } from "@/features/projects/components/new-project-form";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function NewProjectPage() {
  await requireSession();
  const { common, form, projects, richText, errors, toasts, skills, login } =
    adminMessages;
  return (
    <FormLabelsProvider
      labels={{ common, form, projects, richText, errors, toasts, skills }}
    >
      <main className="w-full flex-1 px-6 py-12 lg:px-12">
        <h1 className="font-heading mb-8 text-[25px] leading-tight font-semibold tracking-display">
          {projects.newTitle}
        </h1>
        <NewProjectForm requiredMessage={login.required} />
      </main>
    </FormLabelsProvider>
  );
}
