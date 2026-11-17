import { z } from "zod";
import type { education } from "@/db/schema";

// Shared by the admin form and the Server Actions. Mirrors docs/data-model.md
// "education". The draft payload is the full editable payload of a row.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_MESSAGE = "Escribe una fecha válida.";
export const END_BEFORE_START_MESSAGE =
  "La fecha de fin no puede ser anterior al inicio.";

const optionalDate = z
  .union([z.literal(""), z.string().regex(DATE_PATTERN, DATE_MESSAGE)])
  .nullable();

export const educationDraftSchema = z.strictObject({
  institution: z.string(),
  programEn: z.string(),
  programEs: z.string(),
  startDate: optionalDate,
  endDate: optionalDate,
  statusEn: z.string().nullable(),
  statusEs: z.string().nullable(),
});

export const createEducationSchema = z.strictObject({
  institution: z.string().trim().min(1),
  programEn: z.string().trim().min(1),
  programEs: z.string().trim().min(1),
});

export const educationPublishSchema = educationDraftSchema.superRefine(
  (value, ctx) => {
    for (const key of ["institution", "programEn", "programEs"] as const) {
      if (!value[key].trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "required" });
      }
    }
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: END_BEFORE_START_MESSAGE,
      });
    }
  },
);

export type EducationDraftInput = z.input<typeof educationDraftSchema>;

type EducationRow = Omit<typeof education.$inferSelect, "draft">;

// Admin row (after applyDraft) -> form defaults: null text becomes "".
export function educationFormValues(row: EducationRow): EducationDraftInput {
  return {
    institution: row.institution,
    programEn: row.programEn,
    programEs: row.programEs,
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    statusEn: row.statusEn ?? "",
    statusEs: row.statusEs ?? "",
  };
}
