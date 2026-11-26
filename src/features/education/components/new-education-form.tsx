"use client";

import "@/lib/zod-jitless";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import { BilingualField } from "@/components/admin/bilingual-field";
import { useFormLabels } from "@/components/admin/form-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldMessage } from "@/lib/form-errors";
import type { AdminMessages } from "@/lib/messages";
import { createEducation } from "../actions";
import { createEducationSchema } from "../validation";

type Values = {
  institution: string;
  programEs: string;
  programEn: string;
};

// Creates the draft and goes to its edit page, where everything else is edited.
export function NewEducationForm({
  education,
  requiredMessage,
}: {
  education: AdminMessages["education"];
  requiredMessage: string;
}) {
  const labels = useFormLabels();
  const router = useRouter();
  const form = useForm<Values>({
    defaultValues: { institution: "", programEs: "", programEn: "" },
  });
  const { control, register, getValues, setError } = form;
  const { errors, isSubmitting } = useFormState({ control });
  const [failed, setFailed] = useState(false);
  const f = education.fields;

  async function submit() {
    setFailed(false);
    const parsed = createEducationSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(String(issue.path[0]) as keyof Values, {
          message: requiredMessage,
        });
      }
      return;
    }
    try {
      const result = await createEducation(parsed.data);
      if (result.ok) {
        router.push(`/admin/educacion/${result.id}`);
        return;
      }
    } catch {
      // falls through to the generic message
    }
    setFailed(true);
  }

  const institutionError = fieldMessage(errors, "institution");
  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="flex max-w-4xl flex-col gap-8"
      >
        <div className="flex max-w-xl flex-col gap-2">
          <Label htmlFor="new-institution">{f.institution.label}</Label>
          <Input
            id="new-institution"
            aria-invalid={institutionError ? true : undefined}
            aria-describedby={
              institutionError ? "new-institution-error" : undefined
            }
            {...register("institution")}
          />
          {institutionError ? (
            <p id="new-institution-error" className="text-sm text-destructive">
              {institutionError}
            </p>
          ) : null}
        </div>
        <BilingualField name="program" label={f.program.label} />
        {failed ? (
          <p role="alert" className="text-sm text-destructive">
            {labels.errors.saveFailed}
          </p>
        ) : null}
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting || undefined}
          >
            {labels.common.saveDraft}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
