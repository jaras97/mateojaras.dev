// Source: docs/data-model.md, section "resume_versions".
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { localeEnum } from "@/db/columns";

export const resumeVersions = pgTable(
  "resume_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locale: localeEnum("locale").notNull(),
    version: integer("version").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    pdfUrl: text("pdf_url").notNull(),
    overrides: jsonb("overrides").$type<Record<string, string>>(),
  },
  (t) => [uniqueIndex("resume_locale_version_idx").on(t.locale, t.version)],
);
