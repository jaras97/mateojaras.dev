import type { Locale } from "@/features/site-settings/types";

export const locales = ["en", "es"] as const satisfies readonly Locale[];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}
