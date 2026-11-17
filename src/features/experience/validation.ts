import { z } from "zod";
import type { experiences } from "@/db/schema";

// Shared by the admin form and the Server Actions. Mirrors docs/data-model.md
// "experiences". The draft payload is the full editable payload of a row
// (columns plus relation ids).

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_MESSAGE = "Escribe una fecha válida.";
export const END_BEFORE_START_MESSAGE =
  "La fecha de fin no puede ser anterior al inicio.";

const text = z.string();
const date = z.string().regex(DATE_PATTERN, DATE_MESSAGE);
const optionalDate = z.union([z.literal(""), date]).nullable();
const type = z.enum(["employment", "freelance"]);

export const experienceDraftSchema = z.strictObject({
  company: text,
  roleEn: text,
  roleEs: text,
  type,
  location: z.string().nullable(),
  startDate: date,
  endDate: optionalDate,
  bulletsEn: z.array(text),
  bulletsEs: z.array(text),
  skillIds: z.array(z.uuid()),
  projectIds: z.array(z.uuid()),
});

export const createExperienceSchema = z.strictObject({
  company: z.string().trim().min(1),
  roleEn: z.string().trim().min(1),
  roleEs: z.string().trim().min(1),
  type,
  startDate: date,
});

export const experiencePublishSchema = experienceDraftSchema.superRefine(
  (value, ctx) => {
    for (const key of ["company", "roleEn", "roleEs"] as const) {
      if (!value[key].trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "required" });
      }
    }
    const count = Math.max(value.bulletsEn.length, value.bulletsEs.length);
    for (let i = 0; i < count; i++) {
      if (!value.bulletsEs[i]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["bulletsEs", i],
          message: "required",
        });
      }
      if (!value.bulletsEn[i]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["bulletsEn", i],
          message: "required",
        });
      }
    }
    if (value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: END_BEFORE_START_MESSAGE,
      });
    }
  },
);

export type ExperienceDraftInput = z.input<typeof experienceDraftSchema>;
export type ExperiencePublishInput = z.input<typeof experiencePublishSchema>;

type ExperienceRow = Omit<typeof experiences.$inferSelect, "draft">;

// Admin row (after applyDraft) -> form defaults: null text becomes "".
export function experienceFormValues(
  row: ExperienceRow,
  skillIds: string[],
  projectIds: string[],
): ExperienceDraftInput {
  return {
    company: row.company,
    roleEn: row.roleEn,
    roleEs: row.roleEs,
    type: row.type,
    location: row.location ?? "",
    startDate: row.startDate,
    endDate: row.endDate ?? "",
    bulletsEn: row.bulletsEn,
    bulletsEs: row.bulletsEs,
    skillIds,
    projectIds,
  };
}
