import type { Locale } from "@/features/site-settings/types";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

// Interface strings live in messages/en.json and messages/es.json (CLAUDE.md).
// next-intl is wired in phase 2; until then components read the files directly.
// The types come from en, so a key that es lacks fails tsc. An extra key in es
// does not, which is what messages.test.ts catches.

export type HeroMessages = typeof en.Hero;

export const heroMessages: Record<Locale, HeroMessages> = {
  en: en.Hero,
  es: es.Hero,
};

// Replaces each {name} in an ICU-style template with values[name]. A
// placeholder without a value is left as written, never filled with a guess.
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? values[name] : match,
  );
}

// The admin UI is always Spanish (D-08). Server pages hand slices of this to
// client form components; the type is shared through `AdminMessages`.
export const adminMessages = es.Admin;
export type AdminMessages = typeof es.Admin;
