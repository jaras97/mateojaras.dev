"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import { useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fieldMessage } from "@/lib/form-errors";
import { BilingualField } from "./bilingual-field";
import { useFormLabels } from "./form-labels";

// A column of a row: bilingual (two controls, `${key}Es` / `${key}En`, or the
// explicit names) or single (one shared control, e.g. an AI tool name).
export type RepeaterColumn =
  | {
      kind: "bilingual";
      label: string;
      esKey: string;
      enKey: string;
      control?: "input" | "textarea";
      mono?: boolean;
    }
  | { kind: "single"; label: string; key: string; mono?: boolean };

// Rows are paired by index: adding or removing a row affects both locales.
export function BilingualRepeater({
  name,
  label,
  helper,
  addLabel,
  columns,
  emptyRow,
}: {
  name: string;
  label: string;
  helper?: string;
  addLabel: string;
  columns: RepeaterColumn[];
  emptyRow: Record<string, string>;
}) {
  const id = useId();
  const { common } = useFormLabels();
  const { control, register } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const { errors } = useFormState({ control });
  const message =
    fieldMessage(errors, name) ?? fieldMessage(errors, `${name}.root`);

  return (
    <fieldset className="flex flex-col gap-4">
      <legend id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </legend>
      {helper ? (
        <p className="text-sm text-muted-foreground">{helper}</p>
      ) : null}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <ol className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="flex flex-col gap-4 border-l border-border pl-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex gap-1">
                <IconAction
                  label={common.moveUp}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp />
                </IconAction>
                <IconAction
                  label={common.moveDown}
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown />
                </IconAction>
                <IconAction label={common.remove} onClick={() => remove(index)}>
                  <Trash2 />
                </IconAction>
              </div>
            </div>
            {columns.map((column) =>
              column.kind === "bilingual" ? (
                <BilingualField
                  key={column.esKey}
                  esName={`${name}.${index}.${column.esKey}`}
                  enName={`${name}.${index}.${column.enKey}`}
                  label={column.label}
                  accessibleLabel={`${column.label} ${index + 1}`}
                  control={column.control}
                  mono={column.mono}
                />
              ) : (
                <div key={column.key} className="flex max-w-xl flex-col gap-2">
                  <Input
                    aria-label={`${column.label} ${index + 1}`}
                    className={column.mono ? "font-mono" : undefined}
                    {...register(`${name}.${index}.${column.key}`)}
                  />
                </div>
              ),
            )}
          </li>
        ))}
      </ol>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ...emptyRow })}
        >
          <Plus aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </fieldset>
  );
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
