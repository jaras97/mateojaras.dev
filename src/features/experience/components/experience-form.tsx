"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import { BilingualRepeater } from "@/components/admin/bilingual-repeater";
import { useFormLabels } from "@/components/admin/form-labels";
import { FormSection } from "@/components/admin/form-section";
import { SectionIndex } from "@/components/admin/section-index";
import { UnsavedGuard } from "@/components/admin/unsaved-guard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { isEmptyText } from "@/lib/bilingual";
import { fieldMessage } from "@/lib/form-errors";
import { type AdminMessages, fill } from "@/lib/messages";
import { publishExperience, saveExperienceDraft } from "../actions";
import {
  type ExperienceFormValues,
  type FieldIssue,
  issuesToFieldIssues,
  serverFieldIssues,
  toDraftInput,
  toFormValues,
} from "../form-model";
import {
  type ExperienceDraftInput,
  experienceDraftSchema,
  experiencePublishSchema,
} from "../validation";

export type SkillOption = { id: string; name: string; category: string };
export type ProjectOption = { id: string; titleEs: string };

type Alert = { kind: "session" } | { kind: "text"; text: string } | null;

type ExperienceLabels = AdminMessages["experience"];

type Props = {
  experience: ExperienceLabels;
  // Changes when the server row changes; remounts the body with new defaults
  // while the header state below survives.
  version: string;
  id: string;
  title: string;
  defaults: ExperienceDraftInput;
  status: "draft" | "published";
  hasPendingDraft: boolean;
  skillOptions: SkillOption[];
  projectOptions: ProjectOption[];
};

export function ExperienceForm({ version, ...props }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(props.hasPendingDraft);
  const [alert, setAlert] = useState<Alert>(null);
  const [lastVersion, setLastVersion] = useState(version);
  if (lastVersion !== version) {
    setLastVersion(version);
    setPending(props.hasPendingDraft);
  }
  return (
    <ExperienceFormBody
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

function ExperienceFormBody({
  experience,
  id,
  title,
  defaults,
  status,
  hasPendingDraft,
  skillOptions,
  projectOptions,
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
  const router = useRouter();
  const form = useForm<ExperienceFormValues>({
    defaultValues: toFormValues(defaults),
  });
  const { control, getValues, reset, setError, clearErrors, setFocus } = form;
  const { isDirty } = useFormState({ control });
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const busyRef = useRef(false);
  const company = useWatch({ control, name: "company" });

  function issueMessage(issue: FieldIssue) {
    return issue.message === "required"
      ? labels.form.requiredPublish
      : issue.message;
  }

  function showIssues(issues: FieldIssue[]) {
    for (const issue of issues) {
      setError(issue.name as never, {
        type: "validation",
        message: issueMessage(issue),
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
      kind === "publish" ? experiencePublishSchema : experienceDraftSchema;
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
      const run = kind === "publish" ? publishExperience : saveExperienceDraft;
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

  const missing = useMissingEs(control);
  const names = experience.sections;
  const sections = [
    {
      id: "puesto",
      number: "01",
      title: names.position,
      missingEs: missing.position,
    },
    {
      id: "logros",
      number: "02",
      title: names.achievements,
      missingEs: missing.achievements,
    },
    { id: "relaciones", number: "03", title: names.relations, missingEs: 0 },
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
        title={company || title}
        breadcrumb={{
          href: "/admin/experiencia",
          label: experience.title,
        }}
        status={status}
        hasPendingDraft={hasPendingDraft}
        isDirty={isDirty}
        savedAt={savedAt}
        busy={busy}
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
          <FormSection id="puesto" number="01" title={names.position}>
            <PositionSection experience={experience} />
          </FormSection>
          <FormSection id="logros" number="02" title={names.achievements}>
            <BilingualRepeater
              name="bullets"
              label={experience.fields.bullets.label}
              addLabel={experience.add.bullet}
              emptyRow={{ es: "", en: "" }}
              columns={[
                {
                  kind: "bilingual",
                  label: experience.fields.bullets.label,
                  esKey: "es",
                  enKey: "en",
                  control: "textarea",
                },
              ]}
            />
          </FormSection>
          <FormSection id="relaciones" number="03" title={names.relations}>
            <RelationsSection
              experience={experience}
              skillOptions={skillOptions}
              projectOptions={projectOptions}
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
  control: ReturnType<typeof useForm<ExperienceFormValues>>["control"],
) {
  const v = useWatch({ control });
  const gap = (es: unknown, en: unknown, required = false) =>
    isEmptyText(es) && (required || !isEmptyText(en)) ? 1 : 0;
  return {
    position: gap(v.roleEs, v.roleEn, true),
    achievements: (v.bullets ?? []).reduce(
      (sum, row) => sum + gap(row?.es, row?.en),
      0,
    ),
  };
}

function PositionSection({ experience }: { experience: ExperienceLabels }) {
  const f = experience.fields;
  const { control, register, setValue } =
    useFormContext<ExperienceFormValues>();
  const { errors } = useFormState({ control });
  const current = useWatch({ control, name: "current" });
  const types = experience.types as Record<string, string>;
  const simple = (name: "company" | "location", label: string) => {
    const message = fieldMessage(errors, name);
    return (
      <div className="flex max-w-xl flex-col gap-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
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
  };
  const startMessage = fieldMessage(errors, "startDate");
  const endMessage = fieldMessage(errors, "endDate");
  return (
    <>
      {simple("company", f.company.label)}
      <BilingualField name="role" label={f.role.label} />
      <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">{f.type.label}</Label>
          <NativeSelect id="type" {...register("type")}>
            {Object.keys(types).map((value) => (
              <NativeSelectOption key={value} value={value}>
                {types[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        {simple("location", f.location.label)}
      </div>
      <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">{f.startDate.label}</Label>
          <Input
            id="startDate"
            type="date"
            aria-invalid={startMessage ? true : undefined}
            aria-describedby={startMessage ? "startDate-error" : undefined}
            {...register("startDate")}
          />
          {startMessage ? (
            <p id="startDate-error" className="text-sm text-destructive">
              {startMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">{f.endDate.label}</Label>
          <Input
            id="endDate"
            type="date"
            disabled={current}
            aria-invalid={endMessage ? true : undefined}
            aria-describedby={endMessage ? "endDate-error" : undefined}
            {...register("endDate")}
          />
          {endMessage ? (
            <p id="endDate-error" className="text-sm text-destructive">
              {endMessage}
            </p>
          ) : null}
        </div>
      </div>
      <Controller
        control={control}
        name="current"
        render={({ field }) => (
          <Label className="font-normal">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked === true);
                if (checked) setValue("endDate", "", { shouldDirty: true });
              }}
            />
            {f.current.label}
          </Label>
        )}
      />
    </>
  );
}

function RelationsSection({
  experience,
  skillOptions,
  projectOptions,
}: {
  experience: ExperienceLabels;
  skillOptions: SkillOption[];
  projectOptions: ProjectOption[];
}) {
  const { skills } = useFormLabels();
  const { control } = useFormContext<ExperienceFormValues>();
  const categories = Object.entries(
    Object.groupBy(skillOptions, (skill) => skill.category),
  );
  const categoryLabels = skills.categories as Record<string, string>;
  return (
    <>
      {skillOptions.length > 0 ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-sm font-semibold">
            {experience.fields.skills.label}
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
      {projectOptions.length > 0 ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-sm font-semibold">
            {experience.fields.projects.label}
          </legend>
          <Controller
            control={control}
            name="projectIds"
            render={({ field }) => (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {projectOptions.map((project) => (
                  <Label key={project.id} className="font-normal">
                    <Checkbox
                      checked={field.value.includes(project.id)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...field.value, project.id]
                            : field.value.filter((v) => v !== project.id),
                        )
                      }
                    />
                    {project.titleEs}
                  </Label>
                ))}
              </div>
            )}
          />
        </fieldset>
      ) : null}
    </>
  );
}
