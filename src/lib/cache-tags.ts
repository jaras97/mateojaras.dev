// Copied from docs/data-model.md "Helpers".
export const tags = {
  settings: "settings",
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  experience: "experience",
  skills: "skills",
  resume: "resume",
} as const;
