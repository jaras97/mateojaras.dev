"use client";

import dynamic from "next/dynamic";
import { useId } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { docHasText } from "@/lib/rich-text";
import { useFormLabels } from "./form-labels";

// ProseMirror stays out of the initial bundle and off the server.
const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-48 border border-input" />,
});

// ES | EN rich-text pair. Fields are `${name}Es` / `${name}En`.
export function RichTextField({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const id = useId();
  const { common } = useFormLabels();
  const { control } = useFormContext();
  const es = useWatch({ control, name: `${name}Es` });
  const missing = !docHasText(es);
  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {(
          [
            ["es", common.es],
            ["en", common.en],
          ] as const
        ).map(([locale, tag]) => (
          <div key={locale} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {tag}
              </span>
              {locale === "es" && missing ? (
                <span className="inline-flex h-5 items-center rounded-[var(--radius)] border border-dashed border-input px-1.5 font-mono text-xs text-muted-foreground">
                  {common.status.missingEs}
                </span>
              ) : null}
            </div>
            <Controller
              control={control}
              name={`${name}${locale === "es" ? "Es" : "En"}`}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  label={`${label} ${tag}`}
                  lang={locale}
                  missing={locale === "es" && missing}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
