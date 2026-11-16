// SiteSettings is the Drizzle row type (docs/data-model.md, site_settings).
// Drizzle defaults: date() reads as a 'YYYY-MM-DD' string, timestamp() as a Date.
import type { siteSettings } from "./schema";

export type Locale = "en" | "es";

export type AvailabilityStatus = "open" | "from_date" | "closed";

export type SiteSettings = typeof siteSettings.$inferSelect;

// What the hero variants and StatusLine accept.
export type HeroSettings = Pick<
  SiteSettings,
  | "headlineEn"
  | "headlineEs"
  | "availabilityStatus"
  | "availableFrom"
  | "timezone"
  | "location"
  | "updatedAt"
>;
