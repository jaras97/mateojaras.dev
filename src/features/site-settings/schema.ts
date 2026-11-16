// Source: docs/data-model.md, section "site_settings".
import { date, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { availabilityEnum, base } from "@/db/columns";

export const SITE_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  headlineEn: text("headline_en").notNull(),
  headlineEs: text("headline_es").notNull(),
  bioEn: text("bio_en").notNull(),
  bioEs: text("bio_es").notNull(),
  nowEn: jsonb("now_en"),
  nowEs: jsonb("now_es"),
  availabilityStatus: availabilityEnum("availability_status")
    .notNull()
    .default("open"),
  availableFrom: date("available_from"),
  timezone: text("timezone").notNull().default("America/Bogota"),
  location: text("location").notNull().default("Medellín, Colombia"),
  languages: jsonb("languages")
    .$type<
      {
        code: string;
        level: "native" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
      }[]
    >()
    .notNull()
    .default([]),
  email: text("email").notNull(),
  calendarUrl: text("calendar_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  seoTitleEn: text("seo_title_en"),
  seoTitleEs: text("seo_title_es"),
  seoDescriptionEn: text("seo_description_en"),
  seoDescriptionEs: text("seo_description_es"),
  updatedAt: base.updatedAt,
});
