import type { SiteSettings } from "./types";

// The type comes from the schema (typeof siteSettings.$inferSelect).
// The whole site_settings row the hero variants render in phase 1 (D-03).
// Availability and location are Teo's G2 answers (01-04-ANSWERS.md, read by
// the scripted G2 rule). The headline is the short version Claude proposed and
// Teo chose at G3 (01-09-ANSWERS.md, "headline: la versión corta"); the English
// one is Claude's translation, chosen with it. Both wait for his approval at
// G7 (01-12). Columns nothing renders in phase 1 stay empty.
export const heroFixture = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "",
  headlineEn:
    "I build solid frontends with React and Next.js, from the first screen to the admin panel behind it.",
  headlineEs:
    "Construyo frontends sólidos con React y Next.js, de la primera pantalla al panel de gestión.",
  bioEn: "",
  bioEs: "",
  nowEn: null,
  nowEs: null,
  availabilityStatus: "open",
  availableFrom: null,
  timezone: "America/Bogota",
  location: "Medellín, Colombia",
  languages: [],
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

// headlineSource names Teo's G2 answer (01-06 reads that exact form). In it
// Teo wrote "Construyo ... termina el texto tu"; at G3 he chose Claude's short
// version of that sentence. headlineAuthorship says so and headlineEsStatus
// stays draft until he approves it at G7 (01-12).
export const heroFixtureMeta: {
  headlineSource: string;
  headlineAuthorship: string;
  headlineEsStatus: "draft" | "approved";
  headlineEnStatus: "draft-translation" | "approved";
  pendingFields: HeroFixturePendingField[];
} = {
  headlineSource: "Teo, 2026-10-30",
  headlineAuthorship:
    "versión corta propuesta por Claude y elegida por Teo en G3, 2026-10-30, pendiente de aprobación en G7",
  headlineEsStatus: "draft",
  headlineEnStatus: "draft-translation",
  pendingFields: [],
};
