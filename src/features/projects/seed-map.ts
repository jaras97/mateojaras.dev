// Pure mapping from a docs/content file to a `projects` row (D-05, D-08).
// Fields in pendingFields stay null; nothing is ever filled with guessed text.

import type {
  ProjectContent,
  ProjectFrontMatter,
  ProjectMetric,
} from "./content-schema";
import type { projects } from "./schema";

type ProjectInsert = typeof projects.$inferInsert;

// Reading "b" (02-01-ANSWERS): the label carries the source, one list per language.
function metricsFor(metrics: ProjectMetric[], locale: "En" | "Es") {
  if (metrics.length === 0) return null;
  return metrics.map((m) => ({
    label: `${m[`label${locale}`]} (${m[`source${locale}`]})`,
    value: m.value,
  }));
}

export function projectRowFromContent(
  content: ProjectContent,
  order: number,
): ProjectInsert {
  const fm = content.frontMatter as Partial<ProjectFrontMatter> &
    Record<string, unknown>;
  const s = content.sections;
  const pending = new Set(fm.pendingFields ?? []);

  const row = {
    slug: fm.slug as string,
    status: fm.clientPermission === true ? "published" : "draft",
    visible: true,
    order,
    titleEs: fm.titleEs as string,
    titleEn: fm.titleEn as string,
    taglineEs: fm.taglineEs ?? null,
    taglineEn: fm.taglineEn ?? null,
    problemEs: s.problemEs ?? null,
    problemEn: s.problemEn ?? null,
    roleEs: s.roleEs ?? null,
    roleEn: s.roleEn ?? null,
    solutionEs: s.solutionEs ?? null,
    solutionEn: s.solutionEn ?? null,
    caseStudyEs: null,
    caseStudyEn: null,
    resultsEs: fm.resultsEs ?? null,
    resultsEn: fm.resultsEn ?? null,
    metricsEs: metricsFor(fm.metrics ?? [], "Es"),
    metricsEn: metricsFor(fm.metrics ?? [], "En"),
    techDecisionsEs: fm.techDecisionsEs ?? null,
    techDecisionsEn: fm.techDecisionsEn ?? null,
    liveUrl: fm.liveUrl ?? null,
    repoUrl: fm.repoUrl ?? null,
    startedAt: fm.startedAt ?? null,
    finishedAt: fm.finishedAt ?? null,
  } satisfies ProjectInsert;

  // A pending field is null whatever the file carries (D-05).
  const out: Record<string, unknown> = { ...row };
  for (const field of pending) {
    if (field in out && field !== "slug") out[field] = null;
  }
  return out as ProjectInsert;
}
