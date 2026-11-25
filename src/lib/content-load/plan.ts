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
