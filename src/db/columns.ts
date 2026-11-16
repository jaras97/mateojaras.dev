// Enums and shared columns. Source: docs/data-model.md, sections "Enums" and "Esquema".
import { boolean, integer, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["draft", "published"]);
export const availabilityEnum = pgEnum("availability", [
  "open",
  "from_date",
  "closed",
]);
export const experienceTypeEnum = pgEnum("experience_type", [
  "employment",
  "freelance",
]);
export const skillCategoryEnum = pgEnum("skill_category", [
  "frontend",
  "state",
  "testing",
  "backend",
  "ai",
  "tools",
]);
export const localeEnum = pgEnum("locale", ["en", "es"]);

export const base = {
  id: uuid("id").primaryKey().defaultRandom(),
  status: statusEnum("status").notNull().default("draft"),
  visible: boolean("visible").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
