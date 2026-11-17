import { FormLabelsProvider } from "@/components/admin/form-labels";
import { NewSkillForm } from "@/features/skills/components/new-skill-form";
import { requireSession } from "@/lib/dal";
import { adminMessages } from "@/lib/messages";

export default async function NewSkillPage() {
  await requireSession();
  const {
    common,
    form,
    projects,
    richText,
    errors,
    toasts,
    skills,
    images,
    login,
  } = adminMessages;
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
      <main className="w-full flex-1 px-6 py-12 lg:px-12">
        <h1 className="font-heading mb-8 text-[25px] leading-tight font-semibold tracking-display">
          {skills.newTitle}
        </h1>
        <NewSkillForm requiredMessage={login.required} />
      </main>
    </FormLabelsProvider>
  );
}
