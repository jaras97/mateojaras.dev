import type { ZodIssue } from "zod";
import type { ExperienceDraftInput } from "./validation";

// The form edits bullets as paired rows ({ es, en }); the stored draft keeps
// one array per locale. These functions are the only place that knows both.

export type ExperienceFormValues = {
  company: string;
  roleEs: string;
  roleEn: string;
  type: "employment" | "freelance";
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: { es: string; en: string }[];
  skillIds: string[];
  projectIds: string[];
};

export function toFormValues(
  draft: ExperienceDraftInput,
): ExperienceFormValues {
  const count = Math.max(draft.bulletsEs.length, draft.bulletsEn.length);
  return {
    company: draft.company,
    roleEs: draft.roleEs,
    roleEn: draft.roleEn,
    type: draft.type,
    location: draft.location ?? "",
    startDate: draft.startDate,
    endDate: draft.endDate ?? "",
    current: !draft.endDate,
    bullets: Array.from({ length: count }, (_, i) => ({
      es: draft.bulletsEs[i] ?? "",
      en: draft.bulletsEn[i] ?? "",
    })),
    skillIds: draft.skillIds,
    projectIds: draft.projectIds,
  };
}

export function toDraftInput(
  values: ExperienceFormValues,
): ExperienceDraftInput {
  return {
    company: values.company,
    roleEs: values.roleEs,
    roleEn: values.roleEn,
    type: values.type,
    location: values.location,
    startDate: values.startDate,
    endDate: values.current ? "" : values.endDate,
    bulletsEs: values.bullets.map((row) => row.es),
    bulletsEn: values.bullets.map((row) => row.en),
    skillIds: values.skillIds,
    projectIds: values.projectIds,
  };
}

// Draft path (what Zod reports) -> form field name.
export function formFieldName(path: readonly PropertyKey[]): string {
  const [head, index] = path.map(String);
  if (head === "bulletsEs" || head === "bulletsEn") {
    const locale = head === "bulletsEs" ? "es" : "en";
    return index === undefined ? "bullets" : `bullets.${index}.${locale}`;
  }
  return head;
}

export type FieldIssue = { name: string; message: string };

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

export function serverFieldIssues(
  fieldErrors: Record<string, string[]>,
): FieldIssue[] {
  return Object.entries(fieldErrors).map(([key, messages]) => ({
    name: formFieldName([key]),
    message: messages[0] ?? "",
  }));
}
