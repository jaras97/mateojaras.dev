import type { SiteSettings } from "./types";

// The whole site_settings row the hero variants render in phase 1 (D-03).
// Availability and location are Teo's G2 answers (01-04-ANSWERS.md, read by
// the scripted G2 rule). The Spanish headline is Claude's completion of Teo's
// "Construyo ..." at his explicit request, and the English one is Claude's
// translation; both wait for his approval at G7 (01-12). Columns nothing
// renders in phase 1 stay empty.
export const heroFixture = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "",
  headlineEn:
    "I build web apps with React and Next.js for companies and teams that need a solid frontend, from the first screen to the admin panel behind it.",
  headlineEs:
    "Construyo aplicaciones web con React y Next.js para empresas y equipos que necesitan un frontend sólido, desde la primera pantalla hasta el panel que las administra.",
  bioEn: "",
  bioEs: "",
  nowEn: null,
  nowEs: null,
  availabilityStatus: "open",
  availableFrom: null,
  timezone: "America/Bogota",
  location: "Medellín, Colombia",
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
// Teo wrote "Construyo ... termina el texto tu", so the Spanish headline is
// Claude's proposal at his request: headlineAuthorship says so and
// headlineEsStatus stays draft until he approves it at G7 (01-12).
export const heroFixtureMeta: {
  headlineSource: string;
  headlineAuthorship: string;
  headlineEsStatus: "draft" | "approved";
  headlineEnStatus: "draft-translation" | "approved";
  pendingFields: HeroFixturePendingField[];
} = {
  headlineSource: "Teo, 2026-10-30",
  headlineAuthorship:
    "propuesta de Claude por encargo de Teo, 2026-10-30, pendiente de aprobación en G7",
  headlineEsStatus: "draft",
  headlineEnStatus: "draft-translation",
  pendingFields: [],
};
