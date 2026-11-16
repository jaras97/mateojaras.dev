"use client";

import "@/lib/zod-jitless";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, useFormState } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishProject, saveProjectDraft } from "../actions";
import { type ProjectDraftInput, projectDraftSchema } from "../validation";

export type ProjectFormLabels = {
  title: string;
  es: string;
  en: string;
  saveDraft: string;
  publish: string;
  publishChanges: string;
  saved: string; // contains {hora}
  saveFailed: string;
  sessionExpired: string;
  publishBlocked: string; // contains {n}
};

type Output = z.output<typeof projectDraftSchema>;

// The result message lives outside the keyed body: a publish calls updateTag,
// the route refreshes, `version` changes and the body remounts with the new
// defaults (Pitfall 6) while the message survives.
export function ProjectForm({
  version,
  ...props
}: {
  version: string;
  id: string;
  defaults: ProjectDraftInput;
  isPublished: boolean;
  labels: ProjectFormLabels;
}) {
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-col gap-6">
      <ProjectFormBody key={version} {...props} onMessage={setMessage} />
      <output aria-live="polite" className="text-sm text-muted-foreground">
        {message}
      </output>
    </div>
  );
}

// Minimal body (03-03 tracer): two title inputs. Every other value rides in
// defaultValues so a submit carries the full payload; 03-05 replaces the body.
function ProjectFormBody({
  id,
  defaults,
  isPublished,
  labels,
  onMessage: setMessage,
}: {
  id: string;
  defaults: ProjectDraftInput;
  isPublished: boolean;
  labels: ProjectFormLabels;
  onMessage: (message: string) => void;
}) {
  const { register, handleSubmit, control, setError } = useForm<
    ProjectDraftInput,
    unknown,
    Output
  >({
    resolver: zodResolver(projectDraftSchema),
    defaultValues: defaults,
  });
  const { errors } = useFormState({ control });
  const [pending, startTransition] = useTransition();

  function run(action: typeof saveProjectDraft | typeof publishProject) {
    return handleSubmit((values) => {
      startTransition(async () => {
        const result = await action(id, values);
        if (result.ok) {
          const hora = new Date(result.savedAt).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessage(labels.saved.replace("{hora}", hora));
          return;
        }
        if (result.error === "session") {
          setMessage(labels.sessionExpired);
        } else if (result.error === "validation" && result.fieldErrors) {
          const keys = Object.keys(result.fieldErrors);
          for (const key of keys) {
            setError(key as keyof ProjectDraftInput, {
              message: result.fieldErrors[key]?.[0],
            });
          }
          setMessage(labels.publishBlocked.replace("{n}", String(keys.length)));
        } else {
          setMessage(labels.saveFailed);
        }
      });
    });
  }

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <span id="title-es-label">
          {labels.title} <span id="title-es-tag">{labels.es}</span>
        </span>
        <Input
          lang="es"
          aria-labelledby="title-es-label"
          aria-invalid={Boolean(errors.titleEs)}
          {...register("titleEs")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span id="title-en-label">
          {labels.title} <span id="title-en-tag">{labels.en}</span>
        </span>
        <Input
          lang="en"
          aria-labelledby="title-en-label"
          aria-invalid={Boolean(errors.titleEn)}
          {...register("titleEn")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={run(saveProjectDraft)}
        >
          {labels.saveDraft}
        </Button>
        <Button type="button" disabled={pending} onClick={run(publishProject)}>
          {isPublished ? labels.publishChanges : labels.publish}
        </Button>
      </div>
    </form>
  );
}
