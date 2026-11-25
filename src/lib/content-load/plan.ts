import { diffFields, type FieldChange } from "./diff";

// Pure planning for scripts/load-content.ts: the positioning contract, natural
// keys and update allowlists. No database, no file access, no framework.

export type EducationEntry = {
  institution: string;
  programEn: string;
  programEs: string;
  startDate: string | null;
  endDate: string | null;
  statusEn: string | null;
  statusEs: string | null;
  order: number;
  source: string;
};

export type SkillEntry = {
  name: string;
  category: "frontend" | "state" | "testing" | "backend" | "ai" | "tools";
  yearsUsed: number | null;
  featured: boolean;
  order: number;
  source: string;
};

export type ProjectPlacement = {
  slug: string;
  order: number;
  featured: boolean;
  visible: boolean;
  publish: boolean;
  skillNames: string[];
};

export type ExperienceEntry = {
  company: string;
  type: "employment" | "freelance";
  startDate: string;
  roleEn: string;
  roleEs: string;
  location: string | null;
  endDate: string | null;
  bullets: "copy:freelance" | { en: string[]; es: string[] };
  order: number;
  projectSlugs: string[];
  skillNames: string[];
  source: string;
};

// A list left empty or a field left undefined means "do not touch".
export type PositioningContent = {
  seo?: {
    titleEn: string;
    titleEs: string;
    descriptionEn: string;
    descriptionEs: string;
  };
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectPlacement[];
  slugRenames: { from: string; to: string }[];
  retiredSlugs: string[];
  experiences: ExperienceEntry[];
};

type KeyedEntity = "education" | "experiences" | "projects" | "skills";

export function naturalKey(
  entity: KeyedEntity,
  row: Record<string, unknown>,
): string {
  switch (entity) {
    case "education":
      return `${row.institution}|${row.programEn}`;
    case "experiences":
      return `${row.company}|${row.type}|${row.startDate}`;
    case "projects":
      return String(row.slug);
    case "skills":
      return String(row.name);
  }
}

// Blob uploads and the chosen cover live in the target database; the loader
// never writes them (RESEARCH Pitfall 2).
export const PROJECT_PROTECTED_FIELDS = ["media", "coverImage"] as const;

export function projectUpdateSet<T extends Record<string, unknown>>(
  columns: T,
): Omit<T, (typeof PROJECT_PROTECTED_FIELDS)[number]> {
  const out: Record<string, unknown> = { ...columns };
  for (const field of PROJECT_PROTECTED_FIELDS) delete out[field];
  return out as Omit<T, (typeof PROJECT_PROTECTED_FIELDS)[number]>;
}

// Deletes only slugs that are listed and exist; never pattern-based (T-04.1-10).
export function planRetire(retired: string[], existing: string[]): string[] {
  const have = new Set(existing);
  return retired.filter((slug) => have.has(slug));
}

export function planRenames(
  renames: { from: string; to: string }[],
  existingSlugs: string[],
): { from: string; to: string }[] {
  const have = new Set(existingSlugs);
  const out: { from: string; to: string }[] = [];
  for (const rename of renames) {
    if (!have.has(rename.from)) continue;
    if (have.has(rename.to)) {
      throw new Error(
        `slug rename: "${rename.from}" and "${rename.to}" both exist`,
      );
    }
    out.push(rename);
  }
  return out;
}

export function diffEntity(
  entity: KeyedEntity,
  current: Record<string, unknown>,
  next: Record<string, unknown>,
  fields: readonly string[],
): FieldChange[] {
  return diffFields(entity, naturalKey(entity, next), current, next, fields);
}

// D-04: an experience the positioning does not list (Sofka) is never written.
export function isManagedExperience(
  row: { company: string; type: string; startDate: string },
  entries: { company: string; type: string; startDate: string }[],
): boolean {
  const key = naturalKey("experiences", row);
  return entries.some((e) => naturalKey("experiences", e) === key);
}
