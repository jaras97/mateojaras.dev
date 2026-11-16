// Source: docs/data-model.md, section "contact_messages".
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { localeEnum } from "@/db/columns";

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  locale: localeEnum("locale").notNull(),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});
