import type { CvData } from "./cv-data";

// Test fixture built only from strings already in content/*.json (the seeded
// rows) and the Cv messages. Nothing here is shown to visitors.
const NAME = "Mateo Jaramillo";

const COPY = {
  en: {
    headline:
      "I build solid frontends with React and Next.js, from the first screen to the admin panel behind it.",
    summary:
      "I’m Mateo Jaramillo, a frontend developer in Medellín, Colombia. I’ve spent more than five years building interfaces with React, Next.js and TypeScript. From 2021 to 2025 I worked at Sofka Technologies, in agile teams. Since September 2025 I’ve worked as an independent contractor, building complete applications, from the first screen to the panel the client uses to manage their content.",
    sofkaRole: "Mid-Senior Frontend Developer",
    freelanceRole: "Frontend Developer",
    bullets: [
      "I built the website for Centro Estético ManuJ with Next.js and Supabase: service catalog, filterable gallery, three-step appointment booking and WhatsApp contact.",
      "I built the bilingual website for EcoExport Costa Rica with Next.js and next-intl: product catalog with PDF spec sheets and technical SEO.",
      "I developed an inventory management system with roles and reports, in Next.js and PostgreSQL.",
    ],
    program: "Telecommunications Engineering",
    status: "Completed through 8th semester",
    present: "Present",
    dates: { sofka: "Aug 2021 – Aug 2025", freelance: "Sep 2025 – Present" },
    labels: {
      summary: "Summary",
      experience: "Experience",
      projects: "Selected projects",
      skills: "Skills",
      education: "Education",
      languages: "Languages",
    },
    languages: [
      { name: "Spanish", level: "Native" },
      { name: "English", level: "B2" },
    ],
  },
  es: {
    headline:
      "Construyo frontends sólidos con React y Next.js, de la primera pantalla al panel de gestión.",
    summary:
      "Soy Mateo Jaramillo, desarrollador frontend en Medellín, Colombia. Llevo más de cinco años construyendo interfaces con React, Next.js y TypeScript. De 2021 a 2025 trabajé en Sofka Technologies, en células ágiles. Desde septiembre de 2025 trabajo como contratista independiente y hago aplicaciones completas, de la primera pantalla al panel con el que el cliente administra su contenido.",
    sofkaRole: "Mid-Senior Frontend Developer",
    freelanceRole: "Frontend Developer",
    bullets: [
      "Construí el sitio de Centro Estético ManuJ con Next.js y Supabase: catálogo de servicios, galería filtrable, reserva de citas en tres pasos y contacto por WhatsApp.",
      "Construí el sitio bilingüe de EcoExport Costa Rica con Next.js y next-intl: catálogo de productos con fichas en PDF y SEO técnico.",
      "Desarrollé un sistema de gestión de inventario con roles y reportes, en Next.js y PostgreSQL.",
    ],
    program: "Ingeniería de Telecomunicaciones",
    status: "Cursado hasta 8.º semestre",
    present: "Actualidad",
    dates: {
      sofka: "ago 2021 – ago 2025",
      freelance: "sep 2025 – Actualidad",
    },
    labels: {
      summary: "Perfil",
      experience: "Experiencia",
      projects: "Proyectos destacados",
      skills: "Habilidades",
      education: "Educación",
      languages: "Idiomas",
    },
    languages: [
      { name: "Español", level: "Nativo" },
      { name: "Inglés", level: "B2" },
    ],
  },
} as const;

export function cvFixture(locale: "en" | "es"): CvData {
  const c = COPY[locale];
  return {
    locale,
    lastModified: "2026-11-01T12:00:00.000Z",
    name: NAME,
    headline: c.headline,
    summary: c.summary,
    contact: {
      email: "mateojaras@gmail.com",
      location: "Medellín, Colombia",
      utcOffset: "UTC-5",
      githubUrl: "https://github.com/jaras97",
      linkedinUrl: "https://www.linkedin.com/in/mateo-jaramilloquiroga",
      siteUrl: "https://mateojaras.dev",
    },
    experience: [
      {
        company: "Freelance",
        role: c.freelanceRole,
        location: "Remote",
        dates: c.dates.freelance,
        startDate: "2025-09-01",
        endDate: null,
        bullets: [...c.bullets],
      },
      {
        company: "Sofka Technologies",
        role: c.sofkaRole,
        location: "Remote",
        dates: c.dates.sofka,
        startDate: "2021-08-01",
        endDate: "2025-08-01",
        bullets: [],
      },
    ],
    projects: [
      {
        title: "Centro Estético ManuJ",
        tagline: null,
        liveUrl: "https://centroesteticomanuj.com",
      },
      {
        title: "EcoExport Costa Rica",
        tagline: null,
        liveUrl: "https://ecoexportcostarica.com/es",
      },
    ],
    skills: [],
    education: [
      {
        institution: "Universidad de Antioquia",
        program: c.program,
        dates: "",
        startDate: null,
        endDate: null,
        status: c.status,
      },
    ],
    languages: c.languages.map((l) => ({ ...l })),
    labels: { ...c.labels },
  };
}
