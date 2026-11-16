import type { ZodIssue } from "zod";
import type { ProjectDraftInput } from "./validation";

// The form edits paired lists as rows ({ es, en }) so one row is one field
// group. The stored draft keeps one array per locale. These two functions
// convert between them and are the only place that knows both shapes.

type RichDoc = ProjectDraftInput["caseStudyEn"];
type Tech = NonNullable<ProjectDraftInput["techDecisionsEn"]>;

export type ProjectFormValues = {
  slug: string;
  titleEn: string;
  titleEs: string;
  taglineEn: string;
  taglineEs: string;
  problemEn: string;
  problemEs: string;
  roleEn: string;
  roleEs: string;
  solutionEn: string;
  solutionEs: string;
  caseStudyEn: RichDoc;
  caseStudyEs: RichDoc;
  results: { es: string; en: string }[];
  decisions: {
    titleEs: string;
    titleEn: string;
    bodyEs: string;
    bodyEn: string;
  }[];
  tradeoffsEs: string;
  tradeoffsEn: string;
  validationEs: string;
  validationEn: string;
  aiTools: { value: string }[];
  metrics: {
    valueEs: string;
    labelEs: string;
    valueEn: string;
    labelEn: string;
  }[];
  liveUrl: string;
  repoUrl: string;
  coverImage: string;
  media: ProjectDraftInput["media"];
  startedAt: string;
  finishedAt: string;
  skillIds: string[];
};

const str = (value: string | null | undefined) => value ?? "";

export function toFormValues(draft: ProjectDraftInput): ProjectFormValues {
  const resultsEs = draft.resultsEs ?? [];
  const resultsEn = draft.resultsEn ?? [];
  const metricsEs = draft.metricsEs ?? [];
  const metricsEn = draft.metricsEn ?? [];
  const techEs = draft.techDecisionsEs;
  const techEn = draft.techDecisionsEn;
  const decisionsEs = techEs?.decisions ?? [];
  const decisionsEn = techEn?.decisions ?? [];
  const range = (n: number) => Array.from({ length: n }, (_, i) => i);
  return {
    slug: draft.slug,
    titleEn: draft.titleEn,
    titleEs: draft.titleEs,
    taglineEn: str(draft.taglineEn),
    taglineEs: str(draft.taglineEs),
    problemEn: str(draft.problemEn),
    problemEs: str(draft.problemEs),
    roleEn: str(draft.roleEn),
    roleEs: str(draft.roleEs),
    solutionEn: str(draft.solutionEn),
    solutionEs: str(draft.solutionEs),
    caseStudyEn: draft.caseStudyEn ?? null,
    caseStudyEs: draft.caseStudyEs ?? null,
    results: range(Math.max(resultsEs.length, resultsEn.length)).map((i) => ({
      es: resultsEs[i] ?? "",
      en: resultsEn[i] ?? "",
    })),
    decisions: range(Math.max(decisionsEs.length, decisionsEn.length)).map(
      (i) => ({
        titleEs: decisionsEs[i]?.title ?? "",
        titleEn: decisionsEn[i]?.title ?? "",
        bodyEs: decisionsEs[i]?.body ?? "",
        bodyEn: decisionsEn[i]?.body ?? "",
      }),
    ),
    tradeoffsEs: str(techEs?.tradeoffs),
    tradeoffsEn: str(techEn?.tradeoffs),
    validationEs: str(techEs?.validation),
    validationEn: str(techEn?.validation),
    // One shared list; EN is the source when both exist.
    aiTools: (techEn?.aiTools ?? techEs?.aiTools ?? []).map((value) => ({
      value,
    })),
    metrics: range(Math.max(metricsEs.length, metricsEn.length)).map((i) => ({
      valueEs: metricsEs[i]?.value ?? "",
      labelEs: metricsEs[i]?.label ?? "",
      valueEn: metricsEn[i]?.value ?? "",
      labelEn: metricsEn[i]?.label ?? "",
    })),
    liveUrl: str(draft.liveUrl),
    repoUrl: str(draft.repoUrl),
    coverImage: str(draft.coverImage),
    media: draft.media ?? [],
    startedAt: str(draft.startedAt),
    finishedAt: str(draft.finishedAt),
    skillIds: draft.skillIds,
  };
}

function tech(values: ProjectFormValues, locale: "Es" | "En"): Tech | null {
  const decisions = values.decisions.map((row) => ({
    title: row[`title${locale}`],
    body: row[`body${locale}`],
  }));
  const tradeoffs = values[`tradeoffs${locale}`];
  const validation = values[`validation${locale}`];
  const aiTools = values.aiTools
    .map((row) => row.value.trim())
    .filter((value) => value !== "");
  if (
    decisions.length === 0 &&
    tradeoffs.trim() === "" &&
    validation.trim() === "" &&
    aiTools.length === 0
  ) {
    return null;
  }
  return {
    decisions,
    ...(tradeoffs.trim() !== "" ? { tradeoffs } : {}),
    ...(validation.trim() !== "" ? { validation } : {}),
    ...(aiTools.length > 0 ? { aiTools } : {}),
  };
}

export function toDraftInput(values: ProjectFormValues): ProjectDraftInput {
  return {
    slug: values.slug,
    titleEn: values.titleEn,
    titleEs: values.titleEs,
    taglineEn: values.taglineEn,
    taglineEs: values.taglineEs,
    problemEn: values.problemEn,
    problemEs: values.problemEs,
    roleEn: values.roleEn,
    roleEs: values.roleEs,
    solutionEn: values.solutionEn,
    solutionEs: values.solutionEs,
    caseStudyEn: values.caseStudyEn,
    caseStudyEs: values.caseStudyEs,
    resultsEn: values.results.map((row) => row.en),
    resultsEs: values.results.map((row) => row.es),
    metricsEn: values.metrics.map((row) => ({
      value: row.valueEn,
      label: row.labelEn,
    })),
    metricsEs: values.metrics.map((row) => ({
      value: row.valueEs,
      label: row.labelEs,
    })),
    techDecisionsEn: tech(values, "En"),
    techDecisionsEs: tech(values, "Es"),
    liveUrl: values.liveUrl,
    repoUrl: values.repoUrl,
    coverImage: values.coverImage,
    media: values.media,
    startedAt: values.startedAt,
    finishedAt: values.finishedAt,
    skillIds: values.skillIds,
  };
}

// Draft path (what Zod reports) -> form field name.
export function formFieldName(path: readonly PropertyKey[]): string {
  const [head, ...rest] = path.map(String);
  const locale = head.endsWith("Es") ? "Es" : head.endsWith("En") ? "En" : "";
  if (head === "resultsEs" || head === "resultsEn") {
    return rest[0] === undefined
      ? "results"
      : `results.${rest[0]}.${locale.toLowerCase()}`;
  }
  if (head === "metricsEs" || head === "metricsEn") {
    return rest[0] === undefined
      ? "metrics"
      : `metrics.${rest[0]}.${rest[1] ?? "value"}${locale}`;
  }
  if (head === "techDecisionsEs" || head === "techDecisionsEn") {
    if (rest[0] === "decisions") {
      return rest[1] === undefined
        ? "decisions"
        : `decisions.${rest[1]}.${rest[2] ?? "title"}${locale}`;
    }
    if (rest[0] === "aiTools") {
      return rest[1] === undefined ? "aiTools" : `aiTools.${rest[1]}.value`;
    }
    if (rest[0] === "tradeoffs" || rest[0] === "validation") {
      return `${rest[0]}${locale}`;
    }
    return "decisions";
  }
  return path.map(String).join(".");
}

export type FieldIssue = { name: string; message: string };

// One entry per distinct form field, in the order Zod found them.
export function issuesToFieldIssues(issues: readonly ZodIssue[]): FieldIssue[] {
  const seen = new Set<string>();
  const out: FieldIssue[] = [];
  for (const issue of issues) {
    const name = formFieldName(issue.path);
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, message: issue.message });
  }
  return out;
}

// Server fieldErrors (top-level keys of the draft) -> form field issues.
export function serverFieldIssues(
  fieldErrors: Record<string, string[]>,
): FieldIssue[] {
  return Object.entries(fieldErrors).map(([key, messages]) => ({
    name: formFieldName([key]),
    message: messages[0] ?? "",
  }));
}
