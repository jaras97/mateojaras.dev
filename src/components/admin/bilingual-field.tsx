"use client";

import { cn } from "cn";
import { useId } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isEmptyText } from "@/lib/bilingual";
import { fieldMessage } from "@/lib/form-errors";
import { useFormLabels } from "./form-labels";

// D-12: one label over two controls, ES left and EN right, stacked ES first
// below 768px. An empty ES control gets the "Falta ES" badge and a dashed
// border. Field names are `${name}Es` / `${name}En` unless given explicitly.
export function BilingualField({
  name,
  esName = `${name}Es`,
  enName = `${name}En`,
  label,
  accessibleLabel = label,
  helper,
  control = "input",
  mono = false,
  type,
}: {
  name?: string;
  esName?: string;
  enName?: string;
  label: string;
  accessibleLabel?: string;
  helper?: string;
  control?: "input" | "textarea";
  mono?: boolean;
  type?: string;
}) {
  const id = useId();
  const { common } = useFormLabels();
  const form = useFormContext();
  const esValue = useWatch({ control: form.control, name: esName });
  const { errors } = useFormState({ control: form.control });
  const missing = isEmptyText(esValue);

  const columns = [
    { locale: "es", fieldName: esName, tag: common.es },
    { locale: "en", fieldName: enName, tag: common.en },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      {helper ? (
        <p id={`${id}-helper`} className="text-sm text-muted-foreground">
          {helper}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {columns.map(({ locale, fieldName, tag }) => {
          const message = fieldMessage(errors, fieldName);
          const isEsMissing = locale === "es" && missing;
          const props = {
            lang: locale,
            "aria-label": `${accessibleLabel} ${tag}`,
            "aria-invalid": message ? true : undefined,
            "aria-describedby":
              [
                helper ? `${id}-helper` : null,
                message ? `${id}-${locale}-error` : null,
              ]
                .filter(Boolean)
                .join(" ") || undefined,
            className: cn(
              mono && "font-mono",
              isEsMissing && "border-dashed",
              control === "textarea" && "max-w-[68ch]",
            ),
            ...form.register(fieldName),
          };
          return (
            <div key={locale} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {tag}
                </span>
                {isEsMissing ? (
                  <span className="inline-flex h-5 items-center rounded-[var(--radius)] border border-dashed border-input px-1.5 font-mono text-xs text-muted-foreground">
                    {common.status.missingEs}
                  </span>
                ) : null}
              </div>
              {control === "textarea" ? (
                <Textarea rows={3} {...props} />
              ) : (
                <Input type={type} {...props} />
              )}
              {message ? (
                <p
                  id={`${id}-${locale}-error`}
                  className="text-sm text-destructive"
                >
                  {message}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
