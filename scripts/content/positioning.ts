// Approved positioning facts the loader writes. Every value names its source.
// An empty list means "nothing to change", never a placeholder. Text approved
// by Teo on 2026-11-25 (04.1-ANSWERS.md, "todo ok"; blocks in 04.1-REVIEW.md).
import type { PositioningContent } from "@/lib/content-load/plan";
import { educationFacts } from "../lib/seed-facts";

const REVIEW = "04.1-REVIEW.md, approved in 04.1-ANSWERS";

export const positioning: PositioningContent = {
  // 04.1-REVIEW.md "SEO" block
  seo: {
    titleEn: "Mateo Jaramillo · AI full stack developer",
    titleEs: "Mateo Jaramillo · AI full stack developer",
    descriptionEn:
      "Portfolio of Mateo Jaramillo, AI full stack developer in Medellín. Complete products with React, Next.js, Python and Postgres, built with agents and tests.",
    descriptionEs:
      "Portafolio de Mateo Jaramillo, AI full stack developer en Medellín. Productos completos con React, Next.js, Python y Postgres, hechos con agentes y tests.",
  },
  education: [
    ...educationFacts.map((fact) => ({
      ...fact,
      // PROJECT.md line 15
      source: "PROJECT.md line 15",
    })),
    // D-12 and 04.1-REVIEW.md "Educación" block (Q5.1 default: short titles, no month)
    {
      institution: "Udemy",
      programEn: "AI Coder: Complete Claude Code & Coding Agents Course",
      programEs: "AI Coder: Complete Claude Code & Coding Agents Course",
      startDate: null,
      endDate: "2026-11-01",
      statusEn: "Completed Nov 2026 · 16.5 h",
      statusEs: "Completado nov 2026 · 16.5 h",
      order: 1,
      source: "Teo, 2026-11-25 (D-12)",
    },
    {
      institution: "Udemy",
      programEn: "FastAPI",
      programEs: "FastAPI",
      startDate: null,
      endDate: null,
      statusEn: "2025",
      statusEs: "2025",
      order: 2,
      source: "Teo, 2026-11-25 (D-12)",
    },
    {
      institution: "Udemy",
      programEn: "Python Data Structures & Algorithms",
      programEs: "Python Data Structures & Algorithms",
      startDate: null,
      endDate: null,
      statusEn: "2025",
      statusEs: "2025",
      order: 3,
      source: "Teo, 2026-11-25 (D-12)",
    },
    {
      institution: "Udemy",
      programEn: "Next.js",
      programEs: "Next.js",
      startDate: null,
      endDate: null,
      statusEn: "2024",
      statusEs: "2024",
      order: 4,
      source: "Teo, 2026-11-25 (D-12)",
    },
    {
      institution: "Udemy",
      programEn: "CSS",
      programEs: "CSS",
      startDate: null,
      endDate: null,
      statusEn: "2023",
      statusEs: "2023",
      order: 5,
      source: "Teo, 2026-11-25 (D-12)",
    },
  ],
  // 04.1-REVIEW.md "Skills" table. "Css" keeps its current spelling: the loader
  // keys skills by name, so "CSS" would insert a duplicate row.
  skills: [
    { name: "React", category: "frontend", yearsUsed: 5, featured: true },
    { name: "Next.js", category: "frontend", yearsUsed: 5, featured: true },
    { name: "TypeScript", category: "frontend", yearsUsed: 5, featured: true },
    {
      name: "Tailwind CSS",
      category: "frontend",
      yearsUsed: 5,
      featured: false,
    },
    { name: "Css", category: "frontend", yearsUsed: 5, featured: false },
    { name: "Playwright", category: "testing", yearsUsed: 1, featured: false },
    { name: "Python", category: "backend", yearsUsed: 1, featured: true },
    { name: "FastAPI", category: "backend", yearsUsed: 1, featured: true },
    { name: "SQLAlchemy", category: "backend", yearsUsed: 1, featured: false },
    { name: "Postgres", category: "backend", yearsUsed: 1, featured: true },
    { name: "Supabase", category: "backend", yearsUsed: 1, featured: false },
    { name: "Claude API", category: "ai", yearsUsed: 1, featured: true },
    { name: "Apify", category: "ai", yearsUsed: 1, featured: false },
    { name: "Claude Code", category: "tools", yearsUsed: 1, featured: true },
    { name: "MCP", category: "tools", yearsUsed: 1, featured: false },
    {
      name: "Subagentes y skills",
      category: "tools",
      yearsUsed: 1,
      featured: false,
    },
  ].map((skill, order) => ({
    ...skill,
    category: skill.category as
      | "frontend"
      | "state"
      | "testing"
      | "backend"
      | "ai"
      | "tools",
    order,
    source: REVIEW,
  })),
  // D-11, Q5.3 and Q6 defaults: order Prendo, ManuJ, bot, Finanzas, Metales y
  // Brillantes, EcoExport; featured Prendo, ManuJ, bot, Metales y Brillantes.
  // clientPermission true for all (04.1-ANSWERS Notas).
  projects: (
    [
      {
        slug: "prendo",
        featured: true,
        skillNames: [
          "Python",
          "FastAPI",
          "SQLAlchemy",
          "Postgres",
          "Supabase",
          "React",
          "TypeScript",
          "Playwright",
          "Claude Code",
          "MCP",
          "Subagentes y skills",
        ],
      },
      {
        slug: "centro-estetico-manuj",
        featured: true,
        skillNames: ["Next.js", "Tailwind CSS", "Supabase", "Claude Code"],
      },
      {
        slug: "bot-arbitraje",
        featured: true,
        skillNames: [
          "Python",
          "FastAPI",
          "SQLAlchemy",
          "Postgres",
          "Supabase",
          "Apify",
          "Claude API",
        ],
      },
      {
        slug: "finanzas-personales",
        featured: false,
        skillNames: [
          "Next.js",
          "Tailwind CSS",
          "FastAPI",
          "SQLAlchemy",
          "Postgres",
        ],
      },
      {
        slug: "metales-y-brillantes",
        featured: true,
        // problem text given by Teo on 2026-11-25 (after the 04.1-06 review).
        publish: true,
        skillNames: ["Next.js", "Postgres"],
      },
      {
        slug: "ecoexport-costa-rica",
        featured: false,
        // problem text given by Teo on 2026-11-25 (after the 04.1-06 review).
        publish: true,
        skillNames: ["Next.js", "Tailwind CSS"],
      },
    ] as {
      slug: string;
      featured: boolean;
      publish?: boolean;
      skillNames: string[];
    }[]
  ).map((project, order) => ({
    ...project,
    order,
    visible: true,
    publish: project.publish ?? true,
  })),
  // D-04: no Sofka entry. Bullets come from docs/copy.md. projectSlugs lists
  // projects that have a docs/content file (the approved Freelance bullets
  // link all four).
  experiences: [
    {
      company: "Freelance",
      type: "freelance",
      startDate: "2025-09-01",
      roleEn: "AI Full Stack Developer",
      roleEs: "AI Full Stack Developer",
      location: "Remote",
      endDate: null,
      bullets: "copy:freelance",
      order: 0,
      projectSlugs: [
        "prendo",
        "metales-y-brillantes",
        "centro-estetico-manuj",
        "ecoexport-costa-rica",
      ],
      skillNames: [
        "React",
        "Next.js",
        "TypeScript",
        "Python",
        "FastAPI",
        "Postgres",
        "Claude Code",
      ],
      source: "docs/copy.md Freelance heading, approved 04.1-ANSWERS",
    },
  ],
  // 04.1-ANSWERS Q4.2 (default): rename to metales-y-brillantes
  slugRenames: [
    { from: "sistema-gestion-inventario", to: "metales-y-brillantes" },
  ],
  // CONTEXT Claude's Discretion: stale e2e probe created in dev by the 2026-11-16 debug session
  retiredSlugs: ["e2e-stale-probe"],
};
