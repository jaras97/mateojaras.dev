// Source: docs/data-model.md, sections "experiences" and "relaciones N:N".
import { date, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { base, experienceTypeEnum } from "@/db/columns";
import { projects } from "@/features/projects/schema";
import { skills } from "@/features/skills/schema";

export const experiences = pgTable("experiences", {
  ...base,
  company: text("company").notNull(),
  roleEn: text("role_en").notNull(),
  roleEs: text("role_es").notNull(),
  type: experienceTypeEnum("type").notNull(),
  location: text("location"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  bulletsEn: text("bullets_en").array().notNull().default([]),
  bulletsEs: text("bullets_es").array().notNull().default([]),
});

export const experienceSkills = pgTable(
  "experience_skills",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.experienceId, t.skillId] })],
);

export const experienceProjects = pgTable(
  "experience_projects",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.experienceId, t.projectId] })],
);
