// Hand-written from docs/data-model.md (availability enum and site_settings).
// Phase 2 replaces SiteSettings with typeof siteSettings.$inferSelect.
// Drizzle defaults: date() reads as a 'YYYY-MM-DD' string, timestamp() as a Date.

export type Locale = "en" | "es";

export type AvailabilityStatus = "open" | "from_date" | "closed";

export type SiteSettings = {
  id: string;
  name: string;
  headlineEn: string;
  headlineEs: string;
  bioEn: string;
  bioEs: string;
  nowEn: unknown | null;
  nowEs: unknown | null;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string | null;
  timezone: string;
  location: string;
  email: string;
  calendarUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  seoTitleEn: string | null;
  seoTitleEs: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionEs: string | null;
  updatedAt: Date;
};

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
