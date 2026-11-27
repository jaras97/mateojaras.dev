# mateojaras.dev

Bilingual portfolio (English at `/`, Spanish at `/es`) of Mateo Jaramillo, an AI full stack developer based in Medellín, Colombia (UTC-5). The site lives at https://mateojaras.dev.

It has two parts in one Next.js app:

- A public site: home, case studies at `/projects/[slug]`, about, contact, and a CV PDF in English and Spanish generated from the same data.
- A private admin panel at `/admin` (single user, sign-up disabled) to edit all content without a redeploy. Content lives in Postgres, not in components.

## Stack

- Next.js 16 (App Router, Cache Components, React Compiler, Turbopack) and React 19
- TypeScript (strict), Tailwind CSS v4, shadcn/ui on Base UI primitives
- Drizzle ORM and Neon Postgres
- Better Auth (email and password, one admin)
- next-intl with `next/root-params` for the locale
- Tiptap (admin editor, server-side rendering of the stored JSON)
- Vercel Blob (images and CV PDFs), `@react-pdf/renderer` (CV)
- Motion and GSAP (motion lives in `src/components/motion/`)
- React Hook Form and Zod, TanStack Table, dnd-kit
- Resend and Upstash Ratelimit (contact form)
- Vitest and React Testing Library, Playwright, Biome, pnpm

Exact versions are in `package.json`.

## How it is organized

- `src/features/<entity>/`: `schema.ts`, `queries.ts`, `actions.ts`, `validation.ts` and `components/` per entity (projects, experience, education, skills, site settings, resume, contact, auth).
- Public reads are cached queries (`'use cache'` with tags from `src/lib/cache-tags.ts`).
- Every mutation is a Server Action: validate with Zod, check the session, write with Drizzle, invalidate the tag, export a content backup.
- Localized fields are stored as `title_en` / `title_es` columns. UI strings (buttons, labels) live in `messages/en.json` and `messages/es.json`.
- `src/proxy.ts` applies the next-intl rewrites and an optimistic check of the admin session cookie. The real session check runs inside the admin layout and in every loader and action.
- Design rules are in `DESIGN.md`. Data model notes are in `docs/data-model.md`. Architecture decisions are logged in `docs/decisions.md`.

## Run it locally

Requirements: Node 24 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values (see below)
pnpm db:migrate
pnpm seed
pnpm dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin.

The build needs a reachable, seeded database: with Cache Components, `generateStaticParams` must return at least one entry per route.

### Environment

Copy `.env.example` and fill in the variables you need. Never commit `.env.local`.

- Database: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (Neon; use a dev branch locally)
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Site: `NEXT_PUBLIC_SITE_URL`
- Blob: `BLOB_READ_WRITE_TOKEN`
- Contact form: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Seed only: `ADMIN_EMAIL`, `ADMIN_PASSWORD`

Features that depend on a missing variable fail with a clear message instead of using a placeholder.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm check` | Typecheck, lint, unit tests and build |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` | Drizzle migrations and studio |
| `pnpm seed` | Seed the database and the admin user |
| `pnpm export:content` | Export a content backup |

## Tests and CI

Unit and component tests sit next to the code (`*.test.ts(x)`). End-to-end tests are in `e2e/`. GitHub Actions runs `pnpm check` and a Playwright subset on every pull request and on pushes to `main`.

## Deployment

The app deploys on Vercel. Production uses the Neon `main` branch. Previews and local development use the `dev` branch.
