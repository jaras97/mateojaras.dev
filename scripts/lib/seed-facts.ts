// Verified facts the seed writes. Each value names its source. Anything
// without a verified source (Sofka bullets, Sofka U program, skills
// categories) is deliberately absent: Teo writes it from the admin.
// Month-precision sources are stored as the first day of the month.
import { readFileSync } from "node:fs";
import {
  readAbout,
  readFreelanceBullets,
} from "@/features/site-settings/copy-doc";

// 02-01-ANSWERS.md, reading C: languages {code, level}[], es native, en B2.
// PROJECT.md line 4 (name, links) and line 15 (email, languages).
export const siteFacts = {
  name: "Mateo Jaramillo",
  email: "mateojaras@gmail.com",
  githubUrl: "https://github.com/jaras97",
  linkedinUrl: "https://www.linkedin.com/in/mateo-jaramilloquiroga",
  languages: [
    { code: "es", level: "native" },
    { code: "en", level: "B2" },
  ] as { code: string; level: "native" | "B2" }[],
};

// 02-01-ANSWERS.md, reading E: bio and freelance bullets come from docs/copy.md
// (About accepted at G6; English is a draft translation); Sofka bullets stay empty.
export function copyFacts(path = "docs/copy.md") {
  const raw = readFileSync(path, "utf8");
  return { about: readAbout(raw), freelance: readFreelanceBullets(raw) };
}

export function experienceFacts(freelance: { en: string[]; es: string[] }) {
  return [
    {
      // docs/copy.md "### Sofka Technologies · Mid-Senior Frontend Developer · Aug 2021 – Aug 2025 · Remote"
      company: "Sofka Technologies",
      roleEn: "Mid-Senior Frontend Developer",
      roleEs: "Mid-Senior Frontend Developer",
      type: "employment" as const,
      location: "Remote",
      startDate: "2021-08-01",
      endDate: "2025-08-01",
      bulletsEn: [] as string[],
      bulletsEs: [] as string[],
      order: 1,
    },
    {
      // docs/copy.md "### Freelance · AI Full Stack Developer · Sep 2025 – present · Remote"
      company: "Freelance",
      roleEn: "AI Full Stack Developer",
      roleEs: "AI Full Stack Developer",
      type: "freelance" as const,
      location: "Remote",
      startDate: "2025-09-01",
      endDate: null,
      bulletsEn: freelance.en,
      bulletsEs: freelance.es,
      order: 0,
    },
  ];
}

// PROJECT.md line 15: U. de Antioquia, Ing. de Telecomunicaciones, 8.º semestre.
export const educationFacts = [
  {
    institution: "Universidad de Antioquia",
    programEn: "Telecommunications Engineering",
    programEs: "Ingeniería de Telecomunicaciones",
    startDate: null,
    endDate: null,
    statusEn: "Completed through 8th semester",
    statusEs: "Cursado hasta 8.º semestre",
    order: 0,
  },
];
