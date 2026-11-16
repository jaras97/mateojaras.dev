"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BilingualField } from "@/components/admin/bilingual-field";
import { useFormLabels } from "@/components/admin/form-labels";
import { FormSection } from "@/components/admin/form-section";
import { SectionIndex } from "@/components/admin/section-index";
import { UnsavedGuard } from "@/components/admin/unsaved-guard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isEmptyText } from "@/lib/bilingual";
import { fieldMessage } from "@/lib/form-errors";
import { fill } from "@/lib/messages";
import { slugify } from "@/lib/slug";
import { publishProject, saveProjectDraft } from "../actions";
import {
  type FieldIssue,
  issuesToFieldIssues,
  type ProjectFormValues,
  serverFieldIssues,
  toDraftInput,
  toFormValues,
} from "../form-model";
import { setProjectFeatured } from "../list-actions";
import {
  type ProjectDraftInput,
  projectDraftSchema,
  projectPublishSchema,
  SLUG_LOCKED_MESSAGE,
} from "../validation";

export type SkillOption = { id: string; name: string; category: string };

type Alert = { kind: "session" } | { kind: "text"; text: string } | null;

type Props = {
  // Changes when the server row changes; remounts the body with new defaults
  // (Pitfall 6) while the header state below survives.
  version: string;
  id: string;
  title: string;
  defaults: ProjectDraftInput;
  status: "draft" | "published";
  hasPendingDraft: boolean;
  featured: boolean;
  skillOptions: SkillOption[];
  previewHref: string | null;
  uploadsEnabled: boolean;
};

export function ProjectForm({ version, ...props }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(props.hasPendingDraft);
  const [alert, setAlert] = useState<Alert>(null);
  const [lastVersion, setLastVersion] = useState(version);
  if (lastVersion !== version) {
    setLastVersion(version);
    setPending(props.hasPendingDraft);
  }
  return (
    <ProjectFormBody
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

function ProjectFormBody({
  id,
  title,
  defaults,
  status,
  hasPendingDraft,
  featured,
  skillOptions,
  previewHref,
  savedAt,
  alert,
  onSaved,
  onAlert,
}: Omit<Props, "version" | "uploadsEnabled"> & {
  savedAt: string | null;
  alert: Alert;
  onSaved: (time: string, hasPendingDraft: boolean) => void;
  onAlert: (alert: Alert) => void;
}) {
  const labels = useFormLabels();
  const router = useRouter();
  const form = useForm<ProjectFormValues>({
    defaultValues: toFormValues(defaults),
  });
  const { control, getValues, reset, setError, clearErrors, setFocus } = form;
  const { isDirty } = useFormState({ control });
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const busyRef = useRef(false);
  const titleEs = useWatch({ control, name: "titleEs" });

  function showIssues(issues: FieldIssue[]) {
    for (const issue of issues) {
      setError(issue.name as never, {
        type: "validation",
        message:
          issue.message === "required"
            ? labels.form.requiredPublish
            : issue.message,
      });
    }
    if (issues[0]) setFocus(issues[0].name as never);
  }

  async function submit(kind: "save" | "publish") {
    if (busyRef.current) return;
    clearErrors();
    onAlert(null);
    const input = toDraftInput(getValues());
    const schema =
      kind === "publish" ? projectPublishSchema : projectDraftSchema;
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const issues = issuesToFieldIssues(parsed.error.issues);
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
      const run = kind === "publish" ? publishProject : saveProjectDraft;
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
        const issues = serverFieldIssues(result.fieldErrors);
        showIssues(issues);
        onAlert({
          kind: "text",
          text:
            kind === "publish"
              ? fill(labels.form.publishBlocked, { n: String(issues.length) })
              : labels.errors.saveFailed,
        });
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

  const missing = useMissingEs(control);
  const sections = [
    {
      id: "basico",
      number: "01",
      title: labels.projects.sections.basic,
      missingEs: missing.basic,
    },
  ];

  return (
    <FormProvider {...form}>
      <UnsavedGuard
        isDirty={isDirty}
        busy={busy !== null}
        onSave={() => submit("save")}
        onLeave={() => reset()}
      />
      <AdminPageHeader
        title={titleEs || title}
        breadcrumb={{ href: "/admin/proyectos", label: labels.projects.title }}
        status={status}
        hasPendingDraft={hasPendingDraft}
        isDirty={isDirty}
        savedAt={savedAt}
        busy={busy}
        previewHref={previewHref}
        onSave={() => submit("save")}
        onPublish={() => submit("publish")}
      />
      <div className="flex gap-12 px-6 pt-8 pb-28 md:pb-16 lg:px-12">
        <form
          noValidate
          onSubmit={(event) => event.preventDefault()}
          className="flex min-w-0 max-w-4xl flex-1 flex-col gap-12"
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
          <FormSection
            id="basico"
            number="01"
            title={labels.projects.sections.basic}
          >
            <BasicSection
              id={id}
              status={status}
              featured={featured}
              skillOptions={skillOptions}
            />
          </FormSection>
        </form>
        <SectionIndex sections={sections} />
      </div>
    </FormProvider>
  );
}

// ES values still empty, per section (the index shows "{n} sin ES").
function useMissingEs(
  control: ReturnType<typeof useForm<ProjectFormValues>>["control"],
) {
  const v = useWatch({ control });
  const gap = (es: unknown, en: unknown, required = false) =>
    isEmptyText(es) && (required || !isEmptyText(en)) ? 1 : 0;
  return {
    basic:
      gap(v.titleEs, v.titleEn, true) + gap(v.taglineEs, v.taglineEn, true),
  };
}

function BasicSection({
  id,
  status,
  featured,
  skillOptions,
}: {
  id: string;
  status: "draft" | "published";
  featured: boolean;
  skillOptions: SkillOption[];
}) {
  const { projects, common, skills, errors } = useFormLabels();
  const form = useFormContext<ProjectFormValues>();
  const { control, register, getValues, setValue } = form;
  const { errors: fieldErrors } = useFormState({ control });
  const titleEn = useWatch({ control, name: "titleEn" });
  const locked = status === "published";
  const slugError = fieldMessage(fieldErrors, "slug");

  // The slug follows the EN title until Teo edits it by hand: it only updates
  // while it still equals the slug of the previous title.
  const lastAuto = useRef(slugify(getValues("titleEn")));
  useEffect(() => {
    const next = slugify(titleEn);
    if (!locked && next && getValues("slug") === lastAuto.current) {
      setValue("slug", next, { shouldDirty: true });
    }
    lastAuto.current = next;
  }, [titleEn, locked, getValues, setValue]);

  const [isFeatured, setIsFeatured] = useState(featured);
  async function toggleFeatured(next: boolean) {
    setIsFeatured(next);
    try {
      const result = await setProjectFeatured(id, next);
      if (!result.ok) throw new Error(result.error);
    } catch {
      setIsFeatured(!next);
      toast.error(errors.generic);
    }
  }

  const categories = Object.entries(
    Object.groupBy(skillOptions, (skill) => skill.category),
  );
  const categoryLabels = skills.categories as Record<string, string>;

  return (
    <>
      <BilingualField name="title" label={projects.fields.title.label} />
      <div className="flex max-w-md flex-col gap-2">
        <Label htmlFor="slug" className="flex items-center gap-2">
          {projects.fields.slug.label}
          {locked ? (
            <Lock aria-label={common.lock} className="size-3.5" />
          ) : null}
        </Label>
        <Input
          id="slug"
          className="font-mono"
          readOnly={locked}
          aria-invalid={slugError ? true : undefined}
          aria-describedby={
            locked ? "slug-helper" : slugError ? "slug-error" : undefined
          }
          {...register("slug")}
        />
        {locked ? (
          <p id="slug-helper" className="text-sm text-muted-foreground">
            {SLUG_LOCKED_MESSAGE}
          </p>
        ) : null}
        {slugError ? (
          <p id="slug-error" className="text-sm text-destructive">
            {slugError}
          </p>
        ) : null}
      </div>
      <BilingualField
        name="tagline"
        label={projects.fields.tagline.label}
        control="textarea"
      />
      <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startedAt">{projects.fields.startedAt.label}</Label>
          <Input id="startedAt" type="date" {...register("startedAt")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="finishedAt">{projects.fields.finishedAt.label}</Label>
          <Input id="finishedAt" type="date" {...register("finishedAt")} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="featured"
          checked={isFeatured}
          onCheckedChange={toggleFeatured}
        />
        <Label htmlFor="featured">{projects.fields.featured.label}</Label>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(["liveUrl", "repoUrl"] as const).map((name) => {
          const message = fieldMessage(fieldErrors, name);
          return (
            <div key={name} className="flex flex-col gap-2">
              <Label htmlFor={name}>{projects.fields[name].label}</Label>
              <Input
                id={name}
                type="url"
                inputMode="url"
                className="font-mono"
                aria-invalid={message ? true : undefined}
                aria-describedby={message ? `${name}-error` : undefined}
                {...register(name)}
              />
              {message ? (
                <p id={`${name}-error`} className="text-sm text-destructive">
                  {message}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {skillOptions.length > 0 ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-sm font-semibold">
            {projects.fields.skills.label}
          </legend>
          <Controller
            control={control}
            name="skillIds"
            render={({ field }) => (
              <div className="flex flex-col gap-4">
                {categories.map(([category, options]) => (
                  <div key={category} className="flex flex-col gap-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {categoryLabels[category] ?? category}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {options?.map((skill) => (
                        <Label key={skill.id} className="font-normal">
                          <Checkbox
                            checked={field.value.includes(skill.id)}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked
                                  ? [...field.value, skill.id]
                                  : field.value.filter((v) => v !== skill.id),
                              )
                            }
                          />
                          {skill.name}
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </fieldset>
      ) : null}
    </>
  );
}
