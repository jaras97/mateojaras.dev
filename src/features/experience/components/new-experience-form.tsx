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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { fieldMessage } from "@/lib/form-errors";
import type { AdminMessages } from "@/lib/messages";
import { createExperience } from "../actions";
import { createExperienceSchema } from "../validation";

type Values = {
  company: string;
  roleEs: string;
  roleEn: string;
  type: "employment" | "freelance";
  startDate: string;
};

// Creates the draft and goes to its edit page, where everything else is edited.
export function NewExperienceForm({
  experience,
  requiredMessage,
}: {
  experience: AdminMessages["experience"];
  requiredMessage: string;
}) {
  const labels = useFormLabels();
  const router = useRouter();
  const form = useForm<Values>({
    defaultValues: {
      company: "",
      roleEs: "",
      roleEn: "",
      type: "employment",
      startDate: "",
    },
  });
  const { control, register, getValues, setError } = form;
  const { errors, isSubmitting } = useFormState({ control });
  const [failed, setFailed] = useState(false);
  const types = experience.types as Record<string, string>;
  const f = experience.fields;

  async function submit() {
    setFailed(false);
    const parsed = createExperienceSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(String(issue.path[0]) as keyof Values, {
          message: requiredMessage,
        });
      }
      return;
    }
    try {
      const result = await createExperience(parsed.data);
      if (result.ok) {
        router.push(`/admin/experiencia/${result.id}`);
        return;
      }
    } catch {
      // falls through to the generic message
    }
    setFailed(true);
  }

  const companyError = fieldMessage(errors, "company");
  const startError = fieldMessage(errors, "startDate");
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
          <Label htmlFor="new-company">{f.company.label}</Label>
          <Input
            id="new-company"
            aria-invalid={companyError ? true : undefined}
            aria-describedby={companyError ? "new-company-error" : undefined}
            {...register("company")}
          />
          {companyError ? (
            <p id="new-company-error" className="text-sm text-destructive">
              {companyError}
            </p>
          ) : null}
        </div>
        <BilingualField name="role" label={f.role.label} />
        <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-type">{f.type.label}</Label>
            <NativeSelect id="new-type" {...register("type")}>
              {Object.keys(types).map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {types[value]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-start">{f.startDate.label}</Label>
            <Input
              id="new-start"
              type="date"
              aria-invalid={startError ? true : undefined}
              aria-describedby={startError ? "new-start-error" : undefined}
              {...register("startDate")}
            />
            {startError ? (
              <p id="new-start-error" className="text-sm text-destructive">
                {startError}
              </p>
            ) : null}
          </div>
        </div>
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
