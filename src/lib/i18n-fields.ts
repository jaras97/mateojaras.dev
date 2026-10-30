import type { Locale } from "@/features/site-settings/types";

// Copied from docs/data-model.md "Helpers". Falls back to English only when
// the localized column is null or undefined; an empty string is kept.
export function localized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale,
) {
  const key = `${field}${locale === "en" ? "En" : "Es"}` as keyof T;
  return (row[key] ?? row[`${field}En` as keyof T]) as T[keyof T];
}
