"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFormLabels } from "@/components/admin/form-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { createSkill } from "../actions";
import { createSkillSchema, SKILL_CATEGORIES } from "../validation";

type Values = { name: string; category: (typeof SKILL_CATEGORIES)[number] };

// Creates the draft and goes to its edit page, where the rest is edited.
export function NewSkillForm({ requiredMessage }: { requiredMessage: string }) {
  const labels = useFormLabels();
  const s = labels.skills;
  const router = useRouter();
  const {
    register,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { name: "", category: "frontend" } });
  const [failed, setFailed] = useState(false);
  const categories = s.categories as Record<string, string>;

  async function submit() {
    setFailed(false);
    const parsed = createSkillSchema.safeParse(getValues());
    if (!parsed.success) {
      setError("name", { message: requiredMessage });
      return;
    }
    try {
      const result = await createSkill(parsed.data);
      if (result.ok) {
        router.push(`/admin/skills/${result.id}`);
        return;
      }
      if (result.error === "conflict") {
        setError("name", { message: s.nameTaken });
        return;
      }
    } catch {
      // falls through to the generic message
    }
    setFailed(true);
  }

  const nameError = errors.name?.message;
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex max-w-xl flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-name">{s.fields.name.label}</Label>
        <Input
          id="new-name"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "new-name-error" : undefined}
          {...register("name")}
        />
        {nameError ? (
          <p id="new-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-category">{s.fields.category.label}</Label>
        <NativeSelect id="new-category" {...register("category")}>
          {SKILL_CATEGORIES.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {categories[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
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
  );
}
