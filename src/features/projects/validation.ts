import { z } from "zod";
import type { projects } from "@/db/schema";

// Shared by the admin form (zodResolver) and the Server Actions (safeParse).
// Mirrors docs/data-model.md "projects". The draft payload is the full
// editable payload of a project (columns plus relation ids).

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const text = z.string();
const nullableText = z.string().nullable();
const metric = z.strictObject({ label: text, value: text });
const techDecisions = z.strictObject({
  decisions: z.array(z.strictObject({ title: text, body: text })),
  tradeoffs: text.optional(),
  validation: text.optional(),
  aiTools: z.array(text).optional(),
});
const mediaItem = z.strictObject({
  url: z.string().min(1),
  altEn: text,
  altEs: text,
  type: z.enum(["image", "video"]),
});

export const projectDraftSchema = z.strictObject({
  slug: z.string().min(1),
  titleEn: text,
  titleEs: text,
  taglineEn: nullableText,
  taglineEs: nullableText,
  problemEn: nullableText,
  problemEs: nullableText,
  roleEn: nullableText,
  roleEs: nullableText,
  solutionEn: nullableText,
  solutionEs: nullableText,
  caseStudyEn: z.unknown().nullable(),
  caseStudyEs: z.unknown().nullable(),
  resultsEn: z.array(text).nullable(),
  resultsEs: z.array(text).nullable(),
  metricsEn: z.array(metric).nullable(),
  metricsEs: z.array(metric).nullable(),
  techDecisionsEn: techDecisions.nullable(),
  techDecisionsEs: techDecisions.nullable(),
  liveUrl: nullableText,
  repoUrl: nullableText,
  coverImage: nullableText,
  media: z.array(mediaItem).nullable(),
  startedAt: nullableText,
  finishedAt: nullableText,
  skillIds: z.array(z.uuid()),
});

const REQUIRED_TO_PUBLISH = [
  "titleEn",
  "titleEs",
  "taglineEn",
  "taglineEs",
  "problemEn",
  "problemEs",
  "roleEn",
  "roleEs",
  "solutionEn",
  "solutionEs",
] as const;

export const projectPublishSchema = projectDraftSchema.superRefine(
  (value, ctx) => {
    for (const key of REQUIRED_TO_PUBLISH) {
      if (!value[key]?.trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "required" });
      }
    }
    value.media?.forEach((item, index) => {
      for (const key of ["altEn", "altEs"] as const) {
        if (!item[key].trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["media", index, key],
            message: "required",
          });
        }
      }
    });
  },
);

export type ProjectDraftInput = z.input<typeof projectDraftSchema>;
export type ProjectPublishInput = z.input<typeof projectPublishSchema>;

type ProjectRow = Omit<typeof projects.$inferSelect, "draft">;

// Admin row (after applyDraft) -> form defaults: null text becomes "".
export function projectFormValues(
  row: ProjectRow,
  skillIds: string[],
): ProjectDraftInput {
  return {
    slug: row.slug,
    titleEn: row.titleEn,
    titleEs: row.titleEs,
    taglineEn: row.taglineEn ?? "",
    taglineEs: row.taglineEs ?? "",
    problemEn: row.problemEn ?? "",
    problemEs: row.problemEs ?? "",
    roleEn: row.roleEn ?? "",
    roleEs: row.roleEs ?? "",
    solutionEn: row.solutionEn ?? "",
    solutionEs: row.solutionEs ?? "",
    caseStudyEn: row.caseStudyEn ?? null,
    caseStudyEs: row.caseStudyEs ?? null,
    resultsEn: row.resultsEn ?? [],
    resultsEs: row.resultsEs ?? [],
    metricsEn: row.metricsEn ?? [],
    metricsEs: row.metricsEs ?? [],
    techDecisionsEn: row.techDecisionsEn ?? null,
    techDecisionsEs: row.techDecisionsEs ?? null,
    liveUrl: row.liveUrl ?? "",
    repoUrl: row.repoUrl ?? "",
    coverImage: row.coverImage ?? "",
    media: row.media ?? [],
    startedAt: row.startedAt ?? "",
    finishedAt: row.finishedAt ?? "",
    skillIds,
  };
}
