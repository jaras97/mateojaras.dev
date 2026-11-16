// Copied from docs/data-model.md "Helpers".
export const tags = {
  settings: "settings",
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  experience: "experience",
  skills: "skills",
  education: "education",
  resume: "resume",
} as const;
