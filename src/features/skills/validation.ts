import { z } from "zod";
import type { skills } from "@/db/schema";

// Shared by the admin form and the Server Actions. Mirrors docs/data-model.md
// "skills". The draft payload is the full editable payload of a row.

export const SKILL_CATEGORIES = [
  "frontend",
  "state",
  "testing",
  "backend",
  "ai",
  "tools",
] as const;

export const categorySchema = z.enum(SKILL_CATEGORIES);
const name = z.string().trim().min(1, "required");

export const skillDraftSchema = z.strictObject({
  name,
  category: categorySchema,
  icon: z.string().nullable(),
  yearsUsed: z.number().int().min(0).max(50).nullable(),
  featured: z.boolean(),
});

// Publish needs a name and a category, which the draft schema already
// guarantees (the column is not null and unique), so the schemas coincide.
export const skillPublishSchema = skillDraftSchema;

export const createSkillSchema = z.strictObject({
  name,
  category: categorySchema,
});

export type SkillDraftInput = z.input<typeof skillDraftSchema>;

type SkillRow = Omit<typeof skills.$inferSelect, "draft">;

// Admin row (after applyDraft) -> form defaults.
export function skillFormValues(row: SkillRow): SkillDraftInput {
  return {
    name: row.name,
    category: row.category,
    icon: row.icon ?? "",
    yearsUsed: row.yearsUsed,
    featured: row.featured,
  };
}
