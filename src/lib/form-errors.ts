import { type FieldErrors, type FieldValues, get } from "react-hook-form";

// Message of the error at a dotted field path, or undefined.
export function fieldMessage(
  errors: FieldErrors<FieldValues>,
  name: string,
): string | undefined {
  const entry = get(errors, name) as { message?: unknown } | undefined;
  return typeof entry?.message === "string" ? entry.message : undefined;
}
