// Source: docs/data-model.md, section "skills".
import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { base, skillCategoryEnum } from "@/db/columns";

export const skills = pgTable(
  "skills",
  {
    ...base,
    name: text("name").notNull(),
    category: skillCategoryEnum("category").notNull(),
    icon: text("icon"),
    yearsUsed: integer("years_used"),
    featured: boolean("featured").notNull().default(false),
  },
  (t) => [uniqueIndex("skills_name_idx").on(t.name)],
);
