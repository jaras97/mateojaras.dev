import type { ZodIssue } from "zod";

// Zod path -> react-hook-form field name. The settings form edits the draft
// payload as is, so the dotted path is the field name.
export type FieldIssue = { name: string; message: string };

export function issuesToFieldIssues(issues: readonly ZodIssue[]): FieldIssue[] {
  const seen = new Set<string>();
  const out: FieldIssue[] = [];
  for (const issue of issues) {
    const name = issue.path.map(String).join(".");
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, message: issue.message });
  }
  return out;
}

export function serverFieldIssues(
  fieldErrors: Record<string, string[]>,
): FieldIssue[] {
  return Object.entries(fieldErrors).map(([name, messages]) => ({
    name,
    message: messages[0] ?? "",
  }));
}
