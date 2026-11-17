"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isEmptyText } from "@/lib/bilingual";
import { fieldMessage } from "@/lib/form-errors";
import { type AdminMessages, fill } from "@/lib/messages";
import { publishEducation, saveEducationDraft } from "../actions";
import {
  type EducationDraftInput,
  educationDraftSchema,
  educationPublishSchema,
} from "../validation";

type Alert = { kind: "session" } | { kind: "text"; text: string } | null;
type EducationLabels = AdminMessages["education"];
type FieldIssue = { name: string; message: string };

type Props = {
  education: EducationLabels;
  // Changes when the server row changes; remounts the body with new defaults
  // while the header state below survives.
  version: string;
  id: string;
  title: string;
  defaults: EducationDraftInput;
  status: "draft" | "published";
  hasPendingDraft: boolean;
};

export function EducationForm({ version, ...props }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(props.hasPendingDraft);
  const [alert, setAlert] = useState<Alert>(null);
  const [lastVersion, setLastVersion] = useState(version);
  if (lastVersion !== version) {
    setLastVersion(version);
    setPending(props.hasPendingDraft);
  }
  return (
    <EducationFormBody
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

function EducationFormBody({
  education,
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
  const router = useRouter();
  const form = useForm<EducationDraftInput>({ defaultValues: defaults });
  const { control, getValues, reset, setError, clearErrors, setFocus } = form;
  const { isDirty } = useFormState({ control });
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const busyRef = useRef(false);
  const institution = useWatch({ control, name: "institution" });
  const values = useWatch({ control });
  const missingEs =
    (isEmptyText(values.programEs) ? 1 : 0) +
    (isEmptyText(values.statusEs) && !isEmptyText(values.statusEn) ? 1 : 0);

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
    const input = getValues();
    const schema =
      kind === "publish" ? educationPublishSchema : educationDraftSchema;
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const seen = new Set<string>();
      const issues: FieldIssue[] = [];
      for (const issue of parsed.error.issues) {
        const name = issue.path.map(String).join(".");
        if (seen.has(name)) continue;
        seen.add(name);
        issues.push({ name, message: issue.message });
      }
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
      const run = kind === "publish" ? publishEducation : saveEducationDraft;
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
          Object.entries(result.fieldErrors).map(([name, messages]) => ({
            name,
            message: messages[0] ?? "",
          })),
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

  const sections = [
    {
      id: "programa",
      number: "01",
      title: education.sections.program,
      missingEs,
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
        title={institution || title}
        breadcrumb={{ href: "/admin/educacion", label: education.title }}
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
          <FormSection
            id="programa"
            number="01"
            title={education.sections.program}
          >
            <ProgramSection education={education} />
          </FormSection>
        </form>
        <SectionIndex sections={sections} />
      </div>
    </FormProvider>
  );
}

function ProgramSection({ education }: { education: EducationLabels }) {
  const f = education.fields;
  const { control, register } = useFormContext<EducationDraftInput>();
  const { errors } = useFormState({ control });
  const institutionMessage = fieldMessage(errors, "institution");
  const startMessage = fieldMessage(errors, "startDate");
  const endMessage = fieldMessage(errors, "endDate");
  return (
    <>
      <div className="flex max-w-xl flex-col gap-2">
        <Label htmlFor="institution">{f.institution.label}</Label>
        <Input
          id="institution"
          aria-invalid={institutionMessage ? true : undefined}
          aria-describedby={
            institutionMessage ? "institution-error" : undefined
          }
          {...register("institution")}
        />
        {institutionMessage ? (
          <p id="institution-error" className="text-sm text-destructive">
            {institutionMessage}
          </p>
        ) : null}
      </div>
      <BilingualField name="program" label={f.program.label} />
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
      <BilingualField
        name="status"
        label={f.status.label}
        helper={f.status.helper}
      />
    </>
  );
}
