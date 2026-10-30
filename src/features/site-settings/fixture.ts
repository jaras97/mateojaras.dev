import type { SiteSettings } from "./types";

// The whole site_settings row the hero variants render in phase 1 (D-03).
// Before G2 the headline is the docs/copy.md example (draft) and availability
// and location are pending: location is empty and from_date has no date, the
// one combination StatusLine renders as nothing. No data-model default and no
// invented value is used. Columns nothing renders in phase 1 stay empty.
export const heroFixture = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "",
  headlineEn:
    "I build complete web apps with React and Next.js, from the first screen to the admin behind it.",
  headlineEs:
    "Construyo aplicaciones web completas con React y Next.js, desde la primera pantalla hasta el panel que las administra.",
  bioEn: "",
  bioEs: "",
  nowEn: null,
  nowEs: null,
  availabilityStatus: "from_date",
  availableFrom: null,
  timezone: "America/Bogota",
  location: "",
  email: "",
  calendarUrl: null,
  githubUrl: null,
  linkedinUrl: null,
  seoTitleEn: null,
  seoTitleEs: null,
  seoDescriptionEn: null,
  seoDescriptionEs: null,
  updatedAt: new Date("2026-10-30T12:00:00-05:00"),
} satisfies SiteSettings;

export type HeroFixturePendingField = "availabilityStatus" | "location";

export const heroFixtureMeta: {
  headlineSource: string;
  headlineEnStatus: "draft-translation" | "approved";
  pendingFields: HeroFixturePendingField[];
} = {
  headlineSource: "docs/copy.md (ejemplo, borrador)",
  headlineEnStatus: "draft-translation",
  pendingFields: ["availabilityStatus", "location"],
};
