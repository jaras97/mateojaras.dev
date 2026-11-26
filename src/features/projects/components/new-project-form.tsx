"use client";

import "@/lib/zod-jitless";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form";
import { BilingualField } from "@/components/admin/bilingual-field";
import { useFormLabels } from "@/components/admin/form-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldMessage } from "@/lib/form-errors";
import { slugify } from "@/lib/slug";
import { createProject } from "../actions";
import { createProjectSchema, SLUG_FORMAT_MESSAGE } from "../validation";

type Values = { titleEs: string; titleEn: string; slug: string };

// Creates the draft and goes to its edit page, where everything else is edited.
export function NewProjectForm({
  requiredMessage,
}: {
  requiredMessage: string;
}) {
  const labels = useFormLabels();
  const router = useRouter();
  const form = useForm<Values>({
    defaultValues: { titleEs: "", titleEn: "", slug: "" },
  });
  const { control, register, getValues, setValue, setError } = form;
  const { errors, isSubmitting } = useFormState({ control });
  const [failed, setFailed] = useState(false);
  const lastAuto = useRef("");
  const slugMessage = fieldMessage(errors, "slug");

  // The slug follows the EN title until it is edited by hand.
  const titleEn = useWatch({ control, name: "titleEn" });
  useEffect(() => {
    const next = slugify(titleEn);
    if (getValues("slug") === lastAuto.current) setValue("slug", next);
    lastAuto.current = next;
  }, [titleEn, getValues, setValue]);

  async function submit() {
    setFailed(false);
    const values = getValues();
    const parsed = createProjectSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path.join(".") as keyof Values, {
          message:
            issue.path[0] === "slug" && values.slug.trim() !== ""
              ? SLUG_FORMAT_MESSAGE
              : requiredMessage,
        });
      }
      return;
    }
    try {
      const result = await createProject(parsed.data);
      if (result.ok) {
        router.push(`/admin/proyectos/${result.id}`);
        return;
      }
      if (result.fieldErrors?.slug) {
        setError("slug", { message: result.fieldErrors.slug[0] });
        return;
      }
    } catch {
      // falls through to the generic message
    }
    setFailed(true);
  }

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
        <BilingualField
          name="title"
          label={labels.projects.fields.title.label}
        />
        <div className="flex max-w-md flex-col gap-2">
          <Label htmlFor="new-slug">{labels.projects.fields.slug.label}</Label>
          <Input
            id="new-slug"
            className="font-mono"
            aria-invalid={slugMessage ? true : undefined}
            aria-describedby={slugMessage ? "new-slug-error" : undefined}
            {...register("slug")}
          />
          {slugMessage ? (
            <p id="new-slug-error" className="text-sm text-destructive">
              {slugMessage}
            </p>
          ) : null}
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
