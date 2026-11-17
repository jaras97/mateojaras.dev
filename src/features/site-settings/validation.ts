import { z } from "zod";
import { richTextDocSchema } from "@/lib/rich-text-schema";
import type { siteSettings } from "./schema";

// Shared by the admin form and the Server Actions. Mirrors docs/data-model.md
// "site_settings". The draft payload is the full editable payload of the row.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_MESSAGE = "Escribe una fecha válida.";
export const EMAIL_MESSAGE = "Escribe un correo válido.";
export const URL_MESSAGE = "Escribe una URL que empiece por https://.";
export const TIMEZONE_MESSAGE =
  "Escribe una zona horaria válida, por ejemplo America/Bogota.";
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

export const CEFR_LEVELS = [
  "native",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

// https only (T-03-29). Empty means "no link".
const HTTPS_URL = /^https:\/\/[^\s/$.?#][^\s]*$/i;
const link = z
  .union([z.literal(""), z.string().regex(HTTPS_URL, URL_MESSAGE)])
  .nullable();

const optionalDate = z
  .union([z.literal(""), z.string().regex(DATE_PATTERN, DATE_MESSAGE)])
  .nullable();

export function isKnownTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return value.trim() === value && value.length > 0;
  } catch {
    return false;
  }
}

export const settingsDraftSchema = z.strictObject({
  name: z.string(),
  headlineEn: z.string(),
  headlineEs: z.string(),
  bioEn: z.string(),
  bioEs: z.string(),
  nowEn: richTextDocSchema.nullable(),
  nowEs: richTextDocSchema.nullable(),
  availabilityStatus: z.enum(["open", "from_date", "closed"]),
  availableFrom: optionalDate,
  timezone: z.string(),
  location: z.string(),
  languages: z.array(
    z.strictObject({
      code: z.string().regex(/^[a-z]{2}$/, "Usa un código de dos letras."),
      level: z.enum(CEFR_LEVELS),
    }),
  ),
  email: z.string(),
  calendarUrl: link,
  githubUrl: link,
  linkedinUrl: link,
  seoTitleEn: z.string().max(SEO_TITLE_MAX).nullable(),
  seoTitleEs: z.string().max(SEO_TITLE_MAX).nullable(),
  seoDescriptionEn: z.string().max(SEO_DESCRIPTION_MAX).nullable(),
  seoDescriptionEs: z.string().max(SEO_DESCRIPTION_MAX).nullable(),
});

export const settingsPublishSchema = settingsDraftSchema.superRefine(
  (value, ctx) => {
    for (const key of [
      "name",
      "headlineEn",
      "headlineEs",
      "bioEn",
      "bioEs",
    ] as const) {
      if (!value[key].trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "required" });
      }
    }
    if (!value.email.trim()) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "required" });
    } else if (!z.email().safeParse(value.email.trim()).success) {
      ctx.addIssue({ code: "custom", path: ["email"], message: EMAIL_MESSAGE });
    }
    if (value.availabilityStatus === "from_date" && !value.availableFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["availableFrom"],
        message: "required",
      });
    }
    if (!isKnownTimeZone(value.timezone)) {
      ctx.addIssue({
        code: "custom",
        path: ["timezone"],
        message: TIMEZONE_MESSAGE,
      });
    }
  },
);

export type SettingsDraftInput = z.input<typeof settingsDraftSchema>;

type SettingsRow = Omit<typeof siteSettings.$inferSelect, "draft">;

// Admin row (after applyDraft) -> form defaults: null text becomes "".
export function settingsFormValues(row: SettingsRow): SettingsDraftInput {
  return {
    name: row.name,
    headlineEn: row.headlineEn,
    headlineEs: row.headlineEs,
    bioEn: row.bioEn,
    bioEs: row.bioEs,
    nowEn: (row.nowEn ?? null) as SettingsDraftInput["nowEn"],
    nowEs: (row.nowEs ?? null) as SettingsDraftInput["nowEs"],
    availabilityStatus: row.availabilityStatus,
    availableFrom: row.availableFrom ?? "",
    timezone: row.timezone,
    location: row.location,
    languages: row.languages,
    email: row.email,
    calendarUrl: row.calendarUrl ?? "",
    githubUrl: row.githubUrl ?? "",
    linkedinUrl: row.linkedinUrl ?? "",
    seoTitleEn: row.seoTitleEn ?? "",
    seoTitleEs: row.seoTitleEs ?? "",
    seoDescriptionEn: row.seoDescriptionEn ?? "",
    seoDescriptionEs: row.seoDescriptionEs ?? "",
  };
}
