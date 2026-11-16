// Source: docs/data-model.md, section "education".
import { date, pgTable, text } from "drizzle-orm/pg-core";
import { base } from "@/db/columns";

export const education = pgTable("education", {
  ...base,
  institution: text("institution").notNull(),
  programEn: text("program_en").notNull(),
  programEs: text("program_es").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  statusEn: text("status_en"),
  statusEs: text("status_es"),
});
