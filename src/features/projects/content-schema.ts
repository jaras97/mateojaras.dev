import { z } from "zod";

/**
 * Contract for docs/content/<slug>.md (D-08). Field names follow
 * docs/data-model.md (camelCase) so the phase 2 seed can import this module
 * unchanged. Metrics are bilingual in docs/content (Teo, 2026-10-30); the
 * database keeps `metrics: { label, value }[]` (D-11) and phase 2 decides how
 * each language's label and source reach it.
 *
 * No field declares a default: an absent field stays absent, and it is only
 * accepted when `pendingFields` lists it (D-06, D-12).
 */

const text = z.string().trim().min(1);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected a quoted 'YYYY-MM-DD' date");
const httpUrl = z.url({ protocol: /^https?$/ });
const materialPath = z
  .string()
  .regex(/^material\/[a-z0-9-]+\/[^/]+$/, "expected material/<slug>/<file>");

/** One metric: label and source in both languages, value shared (D-10). */
export const metricSchema = z.strictObject({
  labelEs: text,
  labelEn: text,
  value: text,
  sourceEs: text,
  sourceEn: text,
});

/** Mirrors the TechDecisions type of docs/data-model.md. */
export const techDecisionsSchema = z.strictObject({
  decisions: z
    .array(z.strictObject({ title: text, body: text }))
    .min(2)
    .max(3),
  tradeoffs: text.optional(),
  validation: text.optional(),
  aiTools: z.array(text).optional(),
});

/** A capture under material/. At the phase 3 Blob upload `file` becomes `url`. */
export const mediaSchema = z.strictObject({
  file: materialPath,
  altEs: text,
  altEn: text,
  type: z.literal("image"),
  captionEs: z.string().trim().min(1).max(120).optional(),
  captionEn: z.string().trim().min(1).max(120).optional(),
  capturedAt: z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/)
    .optional(),
});

export const projectFrontMatterSchema = z.strictObject({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "expected a kebab-case slug"),
  enStatus: z.enum(["draft-translation", "approved"]),
  altStatus: z.enum(["draft", "approved"]).optional(),
  source: z
    .string()
    .regex(/^interview-\d{4}-\d{2}-\d{2}$/, "expected interview-YYYY-MM-DD"),
  pendingFields: z.array(text).optional(),
  clientPermission: z.boolean(),
  sampleData: z.boolean(),
  titleEs: text,
  titleEn: text,
  taglineEs: text,
  taglineEn: text,
  liveUrl: httpUrl.nullable(),
  repoUrl: httpUrl.nullable(),
  startedAt: isoDate.nullable(),
  finishedAt: isoDate.nullable(),
  stack: z.array(text).min(1),
  metrics: z.array(metricSchema).max(3),
  resultsEs: z.array(text).min(1),
  resultsEn: z.array(text).min(1),
  techDecisionsEs: techDecisionsSchema,
  techDecisionsEn: techDecisionsSchema,
  coverImage: materialPath.nullable().optional(),
  media: z.array(mediaSchema).optional(),
});

/** Body sections: each "## fieldName" heading is the exact field name. */
export const projectSectionsSchema = z.strictObject({
  problemEs: text,
  problemEn: text,
  roleEs: text,
  roleEn: text,
  solutionEs: text,
  solutionEn: text,
  caseStudyEs: text.optional(),
  caseStudyEn: text.optional(),
});

export type ProjectMetric = z.infer<typeof metricSchema>;
export type ProjectTechDecisions = z.infer<typeof techDecisionsSchema>;
export type ProjectMedia = z.infer<typeof mediaSchema>;
export type ProjectFrontMatter = z.infer<typeof projectFrontMatterSchema>;
export type ProjectSections = z.infer<typeof projectSectionsSchema>;

export type ProjectContent = {
  frontMatter: unknown;
  sections: Record<string, string>;
};

const knownFields = new Set<string>([
  ...Object.keys(projectFrontMatterSchema.shape),
  ...Object.keys(projectSectionsSchema.shape),
]);

/** Issues under these fields are reported even when pendingFields lists them. */
const neverPending = new Set(["slug", "metrics", "pendingFields"]);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pendingOf(frontMatter: unknown): string[] {
  const listed = asRecord(frontMatter).pendingFields;
  return Array.isArray(listed)
    ? listed.filter((f): f is string => typeof f === "string")
    : [];
}

function formatIssue(issue: z.core.$ZodIssue): string {
  const where = issue.path.length > 0 ? issue.path.join(".") : "(root)";
  return `${where}: ${issue.message}`;
}

function crossFieldIssues(frontMatter: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const media = Array.isArray(frontMatter.media) ? frontMatter.media : [];
  const files = media
    .map((m) => asRecord(m).file)
    .filter((f): f is string => typeof f === "string");
  const slug = frontMatter.slug;

  if (media.length > 0 && frontMatter.altStatus === undefined) {
    issues.push("altStatus: required once media has entries");
  }
  if (typeof slug === "string") {
    for (const file of files) {
      if (!file.startsWith(`material/${slug}/`)) {
        issues.push(`media: ${file} is not under material/${slug}/`);
      }
    }
  }
  const cover = frontMatter.coverImage;
  if (typeof cover === "string" && !files.includes(cover)) {
    issues.push(`coverImage: ${cover} is not one of the media files`);
  }
  return issues;
}

/**
 * Validates one parsed content file. Issues whose first path segment is listed
 * in pendingFields are dropped, except slug, metrics and pendingFields itself:
 * a metric without a source never enters (D-10), and the slug is fixed at G4.
 */
export function validateProjectContent(content: ProjectContent): {
  issues: string[];
} {
  const pending = pendingOf(content.frontMatter);
  const droppable = (field: unknown) =>
    typeof field === "string" &&
    !neverPending.has(field) &&
    pending.includes(field);

  const issues: string[] = [];
  const keep = (result: z.ZodSafeParseResult<unknown>) => {
    if (result.success) return;
    for (const issue of result.error.issues) {
      if (!droppable(issue.path[0])) issues.push(formatIssue(issue));
    }
  };

  keep(projectFrontMatterSchema.safeParse(content.frontMatter));
  keep(projectSectionsSchema.safeParse(content.sections));

  for (const issue of crossFieldIssues(asRecord(content.frontMatter))) {
    if (!droppable(issue.split(":")[0])) issues.push(issue);
  }
  for (const field of pending) {
    if (field === "slug") {
      issues.push("pendingFields: slug is fixed at G4 and cannot be pending");
    } else if (neverPending.has(field) && field !== "metrics") {
      issues.push(`pendingFields: ${field} cannot be pending`);
    } else if (!knownFields.has(field)) {
      issues.push(`pendingFields: unknown field ${field}`);
    }
  }
  return { issues };
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(stringsIn);
  }
  return [];
}

function digitTokens(texts: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of texts) {
    for (const token of t.match(/\d+/g) ?? []) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return counts;
}

function surplus(a: Map<string, number>, b: Map<string, number>): string[] {
  const out: string[] = [];
  for (const [token, count] of a) {
    for (let i = b.get(token) ?? 0; i < count; i++) out.push(token);
  }
  return out.sort((x, y) => Number(x) - Number(y) || x.localeCompare(y));
}

/** Front-matter pairs compared by checkNumberParity (value is shared). */
const pairedFrontMatterFields = [
  "title",
  "tagline",
  "results",
  "techDecisions",
] as const;
const pairedSections = ["problem", "role", "solution", "caseStudy"] as const;

/**
 * Anti-invention check (D-06, D-07): the multiset of digit sequences in the
 * English text must equal the one in the Spanish text, so a translation cannot
 * add or change a figure or a date. "2.5" and "2,5" compare equal on purpose.
 */
export function checkNumberParity(content: ProjectContent): {
  ok: boolean;
  onlyInEs: string[];
  onlyInEn: string[];
} {
  const fm = asRecord(content.frontMatter);
  const es: unknown[] = [];
  const en: unknown[] = [];

  for (const field of pairedFrontMatterFields) {
    es.push(fm[`${field}Es`]);
    en.push(fm[`${field}En`]);
  }
  for (const field of pairedSections) {
    es.push(content.sections[`${field}Es`]);
    en.push(content.sections[`${field}En`]);
  }
  const lists = [fm.metrics, fm.media];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const row = asRecord(item);
      es.push(row.labelEs, row.sourceEs, row.altEs);
      en.push(row.labelEn, row.sourceEn, row.altEn);
    }
  }

  const esTokens = digitTokens(stringsIn(es));
  const enTokens = digitTokens(stringsIn(en));
  const onlyInEs = surplus(esTokens, enTokens);
  const onlyInEn = surplus(enTokens, esTokens);
  return {
    ok: onlyInEs.length === 0 && onlyInEn.length === 0,
    onlyInEs,
    onlyInEn,
  };
}
