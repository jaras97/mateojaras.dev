"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FormProvider,
  useFieldArray,
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
import { RichTextField } from "@/components/admin/rich-text-field";
import { SectionIndex } from "@/components/admin/section-index";
import { UnsavedGuard } from "@/components/admin/unsaved-guard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { isEmptyText } from "@/lib/bilingual";
import { draftPreviewHref } from "@/lib/draft-preview";
import { fieldMessage } from "@/lib/form-errors";
import { type AdminMessages, fill } from "@/lib/messages";
import { docHasText } from "@/lib/rich-text";
import {
  discardSettingsDraft,
  publishSettings,
  saveSettingsDraft,
} from "../actions";
import {
  type FieldIssue,
  issuesToFieldIssues,
  serverFieldIssues,
} from "../form-model";
import {
  CEFR_LEVELS,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  type SettingsDraftInput,
  settingsDraftSchema,
  settingsPublishSchema,
} from "../validation";

type Alert = { kind: "session" } | { kind: "text"; text: string } | null;

export type SettingsFormLabels = {
  settings: AdminMessages["settings"];
  discardConfirm: {
    title: string;
    body: string;
    cancel: string;
    confirm: string;
  };
  // Level names (native, A1..C2) shown in the select.
  levels: Record<string, string>;
  breadcrumb: string;
};

type Props = {
  labels: SettingsFormLabels;
  // Changes when the server row changes; remounts the body with new defaults
  // while the header state below survives.
  version: string;
  defaults: SettingsDraftInput;
  status: "draft" | "published";
  hasPendingDraft: boolean;
};

export function SettingsForm({ version, ...props }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(props.hasPendingDraft);
  const [alert, setAlert] = useState<Alert>(null);
  const [lastVersion, setLastVersion] = useState(version);
  if (lastVersion !== version) {
    setLastVersion(version);
    setPending(props.hasPendingDraft);
  }
  return (
    <SettingsFormBody
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

function SettingsFormBody({
  labels: { settings, discardConfirm, levels, breadcrumb },
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
  const form = useForm<SettingsDraftInput>({ defaultValues: defaults });
  const { control, getValues, reset, setError, clearErrors, setFocus } = form;
  const { isDirty } = useFormState({ control });
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const busyRef = useRef(false);

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
    const input = getValues();
    const schema =
      kind === "publish" ? settingsPublishSchema : settingsDraftSchema;
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
      const run = kind === "publish" ? publishSettings : saveSettingsDraft;
      const result = await run(input);
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
        showIssues(serverFieldIssues(result.fieldErrors));
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

  async function confirmDiscard() {
    try {
      const result = await discardSettingsDraft();
      if (result.ok) {
        toast.success(labels.toasts.discarded);
        router.refresh();
      } else if (result.error === "session") {
        onAlert({ kind: "session" });
      } else {
        toast.error(labels.errors.saveFailed);
      }
    } catch {
      toast.error(labels.errors.saveFailed);
    } finally {
      setDiscarding(false);
    }
  }

  const missing = useMissingEs(control);
  const names = settings.sections;
  const sections = [
    {
      id: "identidad",
      number: "01",
      title: names.identity,
      missingEs: missing.identity,
    },
    { id: "ahora", number: "02", title: names.now, missingEs: missing.now },
    {
      id: "disponibilidad",
      number: "03",
      title: names.availability,
      missingEs: 0,
    },
    { id: "idiomas", number: "04", title: names.languages, missingEs: 0 },
    { id: "enlaces", number: "05", title: names.links, missingEs: 0 },
    { id: "seo", number: "06", title: names.seo, missingEs: missing.seo },
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
        title={settings.title}
        breadcrumb={{ href: "/admin", label: breadcrumb }}
        status={status}
        hasPendingDraft={hasPendingDraft}
        isDirty={isDirty}
        savedAt={savedAt}
        busy={busy}
        previewHref={draftPreviewHref({ kind: "home" })}
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
          {hasPendingDraft ? (
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => setDiscarding(true)}
              >
                {labels.common.discard}
              </Button>
            </div>
          ) : null}
          <FormSection id="identidad" number="01" title={names.identity}>
            <TextField name="name" label={settings.fields.name.label} />
            <BilingualField
              name="headline"
              label={settings.fields.headline.label}
            />
            <BilingualField
              name="bio"
              label={settings.fields.bio.label}
              control="textarea"
            />
          </FormSection>
          <FormSection id="ahora" number="02" title={names.now}>
            <RichTextField name="now" label={settings.fields.now.label} />
          </FormSection>
          <FormSection
            id="disponibilidad"
            number="03"
            title={names.availability}
          >
            <AvailabilitySection settings={settings} />
          </FormSection>
          <FormSection id="idiomas" number="04" title={names.languages}>
            <LanguagesSection settings={settings} levels={levels} />
          </FormSection>
          <FormSection id="enlaces" number="05" title={names.links}>
            <TextField
              name="email"
              type="email"
              label={settings.fields.email.label}
            />
            <TextField
              name="githubUrl"
              type="url"
              label={settings.fields.githubUrl.label}
            />
            <TextField
              name="linkedinUrl"
              type="url"
              label={settings.fields.linkedinUrl.label}
            />
            <TextField
              name="calendarUrl"
              type="url"
              label={settings.fields.calendarUrl.label}
            />
          </FormSection>
          <FormSection id="seo" number="06" title={names.seo}>
            <SeoField
              name="seoTitle"
              label={settings.fields.seoTitle.label}
              helper={settings.fields.seoTitle.helper}
              max={SEO_TITLE_MAX}
            />
            <SeoField
              name="seoDescription"
              label={settings.fields.seoDescription.label}
              helper={settings.fields.seoDescription.helper}
              max={SEO_DESCRIPTION_MAX}
              multiline
            />
          </FormSection>
        </form>
        <SectionIndex sections={sections} />
      </div>
      <AlertDialog open={discarding} onOpenChange={setDiscarding}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{discardConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {discardConfirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{discardConfirm.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>
              {discardConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}

// ES values still empty, per section (the index shows "{n} sin ES").
function useMissingEs(
  control: ReturnType<typeof useForm<SettingsDraftInput>>["control"],
) {
  const v = useWatch({ control });
  const gap = (es: unknown, en: unknown, required = false) =>
    isEmptyText(es) && (required || !isEmptyText(en)) ? 1 : 0;
  return {
    identity:
      gap(v.headlineEs, v.headlineEn, true) + gap(v.bioEs, v.bioEn, true),
    now: !docHasText(v.nowEs) && docHasText(v.nowEn) ? 1 : 0,
    seo:
      gap(v.seoTitleEs, v.seoTitleEn) +
      gap(v.seoDescriptionEs, v.seoDescriptionEn),
  };
}

function TextField({
  name,
  label,
  type,
}: {
  name: keyof SettingsDraftInput;
  label: string;
  type?: string;
}) {
  const { register, control } = useFormContext<SettingsDraftInput>();
  const { errors } = useFormState({ control });
  const message = fieldMessage(errors, name);
  return (
    <div className="flex max-w-xl flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${name}-error` : undefined}
        {...register(name as never)}
      />
      {message ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

// ES | EN pair with a mono "{n}/{max}" counter next to each control.
function SeoField({
  name,
  label,
  helper,
  max,
  multiline = false,
}: {
  name: "seoTitle" | "seoDescription";
  label: string;
  helper: string;
  max: number;
  multiline?: boolean;
}) {
  const { common } = useFormLabels();
  const { register, control } = useFormContext<SettingsDraftInput>();
  const { errors } = useFormState({ control });
  const values = useWatch({
    control,
    name: [`${name}Es`, `${name}En`] as const,
  });
  const columns = [
    { locale: "es", tag: common.es, field: `${name}Es` as const },
    { locale: "en", tag: common.en, field: `${name}En` as const },
  ] as const;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <p className="text-sm text-muted-foreground">{helper}</p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {columns.map(({ locale, tag, field }, i) => {
          const value = values[i] ?? "";
          const message = fieldMessage(errors, field);
          const missingEs = locale === "es" && isEmptyText(value);
          const props = {
            lang: locale,
            "aria-label": `${label} ${tag}`,
            "aria-invalid": message ? true : undefined,
            className: missingEs ? "border-dashed" : undefined,
            ...register(field),
          };
          return (
            <div key={locale} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {tag}
                  </span>
                  {missingEs ? (
                    <span className="inline-flex h-5 items-center rounded-[var(--radius)] border border-dashed border-input px-1.5 font-mono text-xs text-muted-foreground">
                      {common.status.missingEs}
                    </span>
                  ) : null}
                </span>
                <span
                  className={
                    value.length > max
                      ? "font-mono text-xs text-destructive"
                      : "font-mono text-xs text-muted-foreground"
                  }
                >
                  {value.length}/{max}
                </span>
              </div>
              {multiline ? (
                <Textarea rows={3} {...props} />
              ) : (
                <Input {...props} />
              )}
              {message ? (
                <p className="text-sm text-destructive">{message}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilitySection({
  settings,
}: {
  settings: AdminMessages["settings"];
}) {
  const { register, control } = useFormContext<SettingsDraftInput>();
  const { errors } = useFormState({ control });
  const status = useWatch({ control, name: "availabilityStatus" });
  const states = settings.availability as Record<string, string>;
  const dateMessage = fieldMessage(errors, "availableFrom");
  return (
    <>
      <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="availabilityStatus">
            {settings.fields.availabilityStatus.label}
          </Label>
          <NativeSelect
            id="availabilityStatus"
            {...register("availabilityStatus")}
          >
            {Object.keys(states).map((value) => (
              <NativeSelectOption key={value} value={value}>
                {states[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="availableFrom">
            {settings.fields.availableFrom.label}
          </Label>
          <Input
            id="availableFrom"
            type="date"
            disabled={status !== "from_date"}
            aria-invalid={dateMessage ? true : undefined}
            aria-describedby={dateMessage ? "availableFrom-error" : undefined}
            {...register("availableFrom")}
          />
          {dateMessage ? (
            <p id="availableFrom-error" className="text-sm text-destructive">
              {dateMessage}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField name="location" label={settings.fields.location.label} />
        <TextField name="timezone" label={settings.fields.timezone.label} />
      </div>
    </>
  );
}

function LanguagesSection({
  settings,
  levels,
}: {
  settings: AdminMessages["settings"];
  levels: Record<string, string>;
}) {
  const { common } = useFormLabels();
  const { control, register } = useFormContext<SettingsDraftInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });
  const { errors } = useFormState({ control });
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{settings.sections.languages}</legend>
      <ul className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const codeMessage = fieldMessage(errors, `languages.${index}.code`);
          return (
            <li
              key={field.id}
              className="flex flex-wrap items-end gap-4 border-l border-border pl-4"
            >
              <div className="flex w-28 flex-col gap-2">
                <Label htmlFor={`languages-${index}-code`}>
                  {settings.fields.languageCode.label}
                </Label>
                <Input
                  id={`languages-${index}-code`}
                  maxLength={2}
                  className="font-mono"
                  aria-invalid={codeMessage ? true : undefined}
                  {...register(`languages.${index}.code`)}
                />
              </div>
              <div className="flex w-48 flex-col gap-2">
                <Label htmlFor={`languages-${index}-level`}>
                  {settings.fields.languageLevel.label}
                </Label>
                <NativeSelect
                  id={`languages-${index}-level`}
                  {...register(`languages.${index}.level`)}
                >
                  {CEFR_LEVELS.map((level) => (
                    <NativeSelectOption key={level} value={level}>
                      {levels[level] ?? level}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
                {common.remove}
              </Button>
              {codeMessage ? (
                <p className="basis-full text-sm text-destructive">
                  {codeMessage}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ code: "", level: "B1" })}
        >
          <Plus aria-hidden="true" />
          {settings.add.language}
        </Button>
      </div>
    </fieldset>
  );
}
