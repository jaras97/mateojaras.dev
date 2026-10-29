# Modelo de datos (v1) — Drizzle + Neon Postgres

Convenciones: tablas `snake_case`, uuid como id (`gen_random_uuid()`), `created_at`/`updated_at` con `timestamptz`, campos localizados duplicados `_en` / `_es`. Toda entidad de contenido tiene `status` (`draft` | `published`), `visible` (bool) y `order` (int). El sitio público solo lee `status = 'published' AND visible = true`.

## Enums
```ts
export const statusEnum = pgEnum('status', ['draft', 'published']);
export const availabilityEnum = pgEnum('availability', ['open', 'from_date', 'closed']);
export const experienceTypeEnum = pgEnum('experience_type', ['employment', 'freelance']);
export const skillCategoryEnum = pgEnum('skill_category', ['frontend', 'state', 'testing', 'backend', 'ai', 'tools']);
export const localeEnum = pgEnum('locale', ['en', 'es']);
```

## Esquema (src/features/*/schema.ts, re-exportado en src/db/schema.ts)
```ts
import { pgTable, uuid, text, boolean, integer, timestamp, date, jsonb, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core';

const base = {
  id: uuid('id').primaryKey().defaultRandom(),
  status: statusEnum('status').notNull().default('draft'),
  visible: boolean('visible').notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

// ---------- site_settings (una sola fila, id fijo '00000000-0000-0000-0000-000000000001')
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  headlineEn: text('headline_en').notNull(),  headlineEs: text('headline_es').notNull(),
  bioEn: text('bio_en').notNull(),            bioEs: text('bio_es').notNull(),
  nowEn: jsonb('now_en'),                     nowEs: jsonb('now_es'),           // Tiptap JSON
  availabilityStatus: availabilityEnum('availability_status').notNull().default('open'),
  availableFrom: date('available_from'),
  timezone: text('timezone').notNull().default('America/Bogota'),
  location: text('location').notNull().default('Medellín, Colombia'),
  email: text('email').notNull(),
  calendarUrl: text('calendar_url'),
  githubUrl: text('github_url'), linkedinUrl: text('linkedin_url'),
  seoTitleEn: text('seo_title_en'), seoTitleEs: text('seo_title_es'),
  seoDescriptionEn: text('seo_description_en'), seoDescriptionEs: text('seo_description_es'),
  updatedAt: base.updatedAt,
});

// ---------- projects
export const projects = pgTable('projects', {
  ...base,
  slug: text('slug').notNull(),
  titleEn: text('title_en').notNull(),       titleEs: text('title_es').notNull(),
  taglineEn: text('tagline_en'),             taglineEs: text('tagline_es'),
  problemEn: text('problem_en'),             problemEs: text('problem_es'),
  roleEn: text('role_en'),                   roleEs: text('role_es'),
  solutionEn: text('solution_en'),           solutionEs: text('solution_es'),
  caseStudyEn: jsonb('case_study_en'),       caseStudyEs: jsonb('case_study_es'),   // Tiptap JSON
  resultsEn: text('results_en').array(),     resultsEs: text('results_es').array(),
  metrics: jsonb('metrics').$type<{ label: string; value: string }[]>(),
  techDecisionsEn: jsonb('tech_decisions_en').$type<TechDecisions>(),
  techDecisionsEs: jsonb('tech_decisions_es').$type<TechDecisions>(),
  liveUrl: text('live_url'), repoUrl: text('repo_url'),
  coverImage: text('cover_image'),            // URL de Blob
  media: jsonb('media').$type<{ url: string; altEn: string; altEs: string; type: 'image' | 'video' }[]>(),
  featured: boolean('featured').notNull().default(false),
  startedAt: date('started_at'), finishedAt: date('finished_at'),
}, (t) => [uniqueIndex('projects_slug_idx').on(t.slug), index('projects_status_idx').on(t.status, t.visible, t.order)]);

export type TechDecisions = {
  decisions: { title: string; body: string }[];   // qué decidí y por qué
  tradeoffs?: string;
  validation?: string;                              // cómo lo verifiqué (tests, métricas)
  aiTools?: string[];                               // herramientas de IA usadas, como una más
};

// ---------- experiences
export const experiences = pgTable('experiences', {
  ...base,
  company: text('company').notNull(),
  roleEn: text('role_en').notNull(),          roleEs: text('role_es').notNull(),
  type: experienceTypeEnum('type').notNull(),
  location: text('location'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),                   // null = actual
  bulletsEn: text('bullets_en').array().notNull().default([]),
  bulletsEs: text('bullets_es').array().notNull().default([]),
});

// ---------- skills
export const skills = pgTable('skills', {
  ...base,
  name: text('name').notNull(),
  category: skillCategoryEnum('category').notNull(),
  icon: text('icon'),                          // nombre de icono (simple-icons) o null
  yearsUsed: integer('years_used'),
  featured: boolean('featured').notNull().default(false),
}, (t) => [uniqueIndex('skills_name_idx').on(t.name)]);

// ---------- education
export const education = pgTable('education', {
  ...base,
  institution: text('institution').notNull(),
  programEn: text('program_en').notNull(),     programEs: text('program_es').notNull(),
  startDate: date('start_date'), endDate: date('end_date'),
  statusEn: text('status_en'),                 statusEs: text('status_es'),   // "completed through 8th semester"
});

// ---------- relaciones N:N
export const projectSkills = pgTable('project_skills', {
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.projectId, t.skillId] })]);

export const experienceSkills = pgTable('experience_skills', {
  experienceId: uuid('experience_id').notNull().references(() => experiences.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.experienceId, t.skillId] })]);

export const experienceProjects = pgTable('experience_projects', {
  experienceId: uuid('experience_id').notNull().references(() => experiences.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.experienceId, t.projectId] })]);

// ---------- resume_versions
export const resumeVersions = pgTable('resume_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  locale: localeEnum('locale').notNull(),
  version: integer('version').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  pdfUrl: text('pdf_url').notNull(),           // Blob
  overrides: jsonb('overrides').$type<Record<string, string>>(),   // retoques solo para el PDF
}, (t) => [uniqueIndex('resume_locale_version_idx').on(t.locale, t.version)]);

// ---------- contact_messages
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  locale: localeEnum('locale').notNull(),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp('read_at', { withTimezone: true }),
});

// ---------- Better Auth: user, session, account, verification (generadas con `npx @better-auth/cli generate`)
```

## Helpers
```ts
// src/lib/i18n-fields.ts
export function localized<T extends Record<string, unknown>>(row: T, field: string, locale: 'en' | 'es') {
  const key = `${field}${locale === 'en' ? 'En' : 'Es'}` as keyof T;
  return (row[key] ?? row[`${field}En` as keyof T]) as T[keyof T];   // fallback a inglés
}

// src/lib/cache-tags.ts
export const tags = {
  settings: 'settings',
  projects: 'projects',
  project: (slug: string) => `project:${slug}`,
  experience: 'experience',
  skills: 'skills',
  resume: 'resume',
} as const;
```

## Reglas
- `queries.ts` públicas: `'use cache'` + `cacheTag(tags.x)` + `cacheLife('max')`. Nunca leen drafts.
- `actions.ts`: `requireSession()` → Zod → Drizzle → `updateTag(tags.x)` → `exportContent('projects')`.
- Slugs inmutables una vez publicados (si cambian, crear redirect en `next.config.ts`).
- Export: `scripts/export-content.ts` escribe `content/<tabla>.json` (local) o `backup/<fecha>/<tabla>.json` en Blob (producción). `pnpm seed --from-content` restaura.
- Backlog (no crear en v1, pero no bloquear): `courses`, `services`, `testimonials`, `posts`, `pages`, `guestbook_entries`, `reactions`, `page_views`, `changelog_entries`.
