// Source: docs/data-model.md, sections "projects" and "relaciones N:N".
import {
  boolean,
  date,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { base } from "@/db/columns";
import { skills } from "@/features/skills/schema";

export type TechDecisions = {
  decisions: { title: string; body: string }[];
  tradeoffs?: string;
  validation?: string;
  aiTools?: string[];
};

type Metric = { label: string; value: string };

export const projects = pgTable(
  "projects",
  {
    ...base,
    slug: text("slug").notNull(),
    titleEn: text("title_en").notNull(),
    titleEs: text("title_es").notNull(),
    taglineEn: text("tagline_en"),
    taglineEs: text("tagline_es"),
    problemEn: text("problem_en"),
    problemEs: text("problem_es"),
    roleEn: text("role_en"),
    roleEs: text("role_es"),
    solutionEn: text("solution_en"),
    solutionEs: text("solution_es"),
    caseStudyEn: jsonb("case_study_en"),
    caseStudyEs: jsonb("case_study_es"),
    resultsEn: text("results_en").array(),
    resultsEs: text("results_es").array(),
    metricsEn: jsonb("metrics_en").$type<Metric[]>(),
    metricsEs: jsonb("metrics_es").$type<Metric[]>(),
    techDecisionsEn: jsonb("tech_decisions_en").$type<TechDecisions>(),
    techDecisionsEs: jsonb("tech_decisions_es").$type<TechDecisions>(),
    liveUrl: text("live_url"),
    repoUrl: text("repo_url"),
    coverImage: text("cover_image"),
    media:
      jsonb("media").$type<
        {
          url: string;
          altEn: string;
          altEs: string;
          type: "image" | "video";
          captionEn?: string;
          captionEs?: string;
          capturedAt?: string;
        }[]
      >(),
    featured: boolean("featured").notNull().default(false),
    startedAt: date("started_at"),
    finishedAt: date("finished_at"),
  },
  (t) => [
    uniqueIndex("projects_slug_idx").on(t.slug),
    index("projects_status_idx").on(t.status, t.visible, t.order),
  ],
);

export const projectSkills = pgTable(
  "project_skills",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.skillId] })],
);
