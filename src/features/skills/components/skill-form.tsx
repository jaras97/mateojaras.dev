"use client";

import "@/lib/zod-jitless";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useFormLabels } from "@/components/admin/form-labels";
import { FormSection } from "@/components/admin/form-section";
import { UnsavedGuard } from "@/components/admin/unsaved-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { fieldMessage } from "@/lib/form-errors";
import { fill } from "@/lib/messages";
import { publishSkill, saveSkillDraft } from "../actions";
import {
  SKILL_CATEGORIES,
  type SkillDraftInput,
  skillDraftSchema,
  skillPublishSchema,
} from "../validation";

type Values = {
  name: string;
  category: (typeof SKILL_CATEGORIES)[number];
  icon: string;
  yearsUsed: string;
  featured: boolean;
};

type Alert = { kind: "session" } | { kind: "text"; text: string } | null;

type Props = {
  // Changes when the server row changes; remounts the body with new defaults
  // while the header state survives.
  version: string;
  id: string;
  title: string;
  defaults: SkillDraftInput;
  status: "draft" | "published";
  hasPendingDraft: boolean;
};

function toValues(draft: SkillDraftInput): Values {
  return {
    name: draft.name,
    category: draft.category,
    icon: draft.icon ?? "",
    yearsUsed: draft.yearsUsed === null ? "" : String(draft.yearsUsed),
    featured: draft.featured,
  };
}

function toInput(values: Values): SkillDraftInput {
  const years = values.yearsUsed.trim();
  return {
    name: values.name,
    category: values.category,
    icon: values.icon,
    yearsUsed: years === "" ? null : Number(years),
    featured: values.featured,
  };
}

export function SkillForm({ version, ...props }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(props.hasPendingDraft);
  const [alert, setAlert] = useState<Alert>(null);
  const [lastVersion, setLastVersion] = useState(version);
  if (lastVersion !== version) {
    setLastVersion(version);
    setPending(props.hasPendingDraft);
  }
  return (
    <SkillFormBody
      key={version}
      {...props}
      hasPendingDraft={pending}
      savedAt={savedAt}
      alert={alert}
      onSaved={(time, nowPending) => {
        setSavedAt(time);
        setPending(nowPending);
      }}
      onAlert={setAlert}
    />
  );
}

function SkillFormBody({
  id,
  title,
  defaults,
  status,
  hasPendingDraft,
  savedAt,
  alert,
  onSaved,
  onAlert,
}: Omit<Props, "version"> & {
  savedAt: string | null;
  alert: Alert;
  onSaved: (time: string, hasPendingDraft: boolean) => void;
  onAlert: (alert: Alert) => void;
}) {
  const labels = useFormLabels();
  const s = labels.skills;
  const router = useRouter();
  const form = useForm<Values>({ defaultValues: toValues(defaults) });
  const {
    control,
    register,
    getValues,
    reset,
    setError,
    clearErrors,
    setFocus,
  } = form;
  const { isDirty, errors } = useFormState({ control });
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const busyRef = useRef(false);
  const name = useWatch({ control, name: "name" });
  const categories = s.categories as Record<string, string>;

  function message(code: string) {
    if (code === "required") return labels.form.requiredPublish;
    if (code === "taken") return s.nameTaken;
    return code;
  }

  function showIssues(issues: { name: keyof Values; message: string }[]) {
    for (const issue of issues) {
      setError(issue.name, {
        type: "validation",
        message: message(issue.message),
      });
    }
    if (issues[0]) setFocus(issues[0].name);
  }

  async function submit(kind: "save" | "publish") {
    if (busyRef.current) return;
    clearErrors();
    onAlert(null);
    const input = toInput(getValues());
    const schema = kind === "publish" ? skillPublishSchema : skillDraftSchema;
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        name: String(issue.path[0]) as keyof Values,
        message: issue.path[0] === "yearsUsed" ? s.yearsInvalid : issue.message,
      }));
      showIssues(issues);
      onAlert({
        kind: "text",
        text:
          kind === "publish"
            ? fill(labels.form.publishBlocked, { n: String(issues.length) })
            : labels.errors.saveFailed,
      });
      return;
    }
    busyRef.current = true;
    setBusy(kind);
    try {
      const run = kind === "publish" ? publishSkill : saveSkillDraft;
      const result = await run(id, input);
      if (result.ok) {
        const time = new Date(result.savedAt).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        });
        reset(getValues());
        onSaved(time, kind === "save" && status === "published");
        toast(
          kind === "publish"
            ? labels.toasts.published
            : status === "published"
              ? labels.toasts.draftSaved
              : labels.toasts.draftSavedNew,
        );
        if (kind === "publish") router.refresh();
      } else if (result.error === "session") {
        onAlert({ kind: "session" });
      } else if (result.fieldErrors) {
        showIssues(
          Object.entries(result.fieldErrors).flatMap(([field, codes]) =>
            codes[0]
              ? [{ name: field as keyof Values, message: codes[0] }]
              : [],
          ),
        );
        onAlert({ kind: "text", text: labels.errors.saveFailed });
      } else {
        failToast(kind);
      }
    } catch {
      failToast(kind);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  function failToast(kind: "save" | "publish") {
    toast.error(labels.errors.saveFailed, {
      duration: Number.POSITIVE_INFINITY,
      action: { label: labels.toasts.retry, onClick: () => submit(kind) },
    });
  }

  const nameError = fieldMessage(errors, "name");
  const yearsError = fieldMessage(errors, "yearsUsed");
  return (
    <FormProvider {...form}>
      <UnsavedGuard
        isDirty={isDirty}
        busy={busy !== null}
        onSave={() => submit("save")}
        onLeave={() => reset()}
      />
      <AdminPageHeader
        title={name || title}
        breadcrumb={{ href: "/admin/skills", label: s.title }}
        status={status}
        hasPendingDraft={hasPendingDraft}
        isDirty={isDirty}
        savedAt={savedAt}
        busy={busy}
        onSave={() => submit("save")}
        onPublish={() => submit("publish")}
      />
      <div className="px-6 pt-8 pb-28 md:pb-16 lg:px-12">
        <form
          noValidate
          onSubmit={(event) => event.preventDefault()}
          className="flex max-w-4xl flex-col gap-12"
        >
          {alert ? (
            <p role="alert" className="text-sm text-destructive">
              {alert.kind === "session" ? (
                <>
                  {labels.errors.sessionExpired}{" "}
                  <Link
                    href="/admin/login"
                    target="_blank"
                    rel="noopener"
                    className="font-semibold underline underline-offset-4"
                  >
                    {labels.errors.signIn}
                  </Link>
                </>
              ) : (
                alert.text
              )}
            </p>
          ) : null}
          <FormSection id="skill" number="01" title={s.sections.skill}>
            <div className="flex max-w-xl flex-col gap-2">
              <Label htmlFor="name">{s.fields.name.label}</Label>
              <Input
                id="name"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "name-error" : undefined}
                {...register("name")}
              />
              {nameError ? (
                <p id="name-error" className="text-sm text-destructive">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">{s.fields.category.label}</Label>
                <NativeSelect id="category" {...register("category")}>
                  {SKILL_CATEGORIES.map((value) => (
                    <NativeSelectOption key={value} value={value}>
                      {categories[value]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="yearsUsed">{s.fields.yearsUsed.label}</Label>
                <Input
                  id="yearsUsed"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  step={1}
                  aria-invalid={yearsError ? true : undefined}
                  aria-describedby={yearsError ? "yearsUsed-error" : undefined}
                  {...register("yearsUsed")}
                />
                {yearsError ? (
                  <p id="yearsUsed-error" className="text-sm text-destructive">
                    {yearsError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex max-w-xl flex-col gap-2">
              <Label htmlFor="icon">{s.fields.icon.label}</Label>
              <Input
                id="icon"
                aria-describedby="icon-helper"
                {...register("icon")}
              />
              <p id="icon-helper" className="text-sm text-muted-foreground">
                {s.fields.icon.helper}
              </p>
            </div>
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Label className="font-normal">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {s.fields.featured.label}
                </Label>
              )}
            />
          </FormSection>
        </form>
      </div>
    </FormProvider>
  );
}
