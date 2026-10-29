# Project Research Summary

**Project:** mateojaras.dev
**Domain:** Bilingual (en at `/`, es at `/es`) developer portfolio with a custom single-admin CMS and a CV generated from data, on Next.js 16.4 (Cache Components) and Vercel
**Researched:** 2026-10-29
**Confidence:** MEDIUM-HIGH. The Next.js mechanics are HIGH because they were checked against the 16.4.3 docs bundled in `node_modules`. Library integration is MEDIUM (Context7 plus the installed sources). Audience and hiring expectations are LOW-MEDIUM.

## Executive Summary

mateojaras.dev is a content-driven portfolio. Its value is concentrated in four case studies (`/projects/[slug]`). Clients and recruiters read them to answer one question: did Teo decide and deliver? The standard way to build this kind of site in 2026 is a public site that is a fully prerendered static shell per URL and locale, and an uncached admin whose writes invalidate the shell by tag. With Next 16.4 the pieces are `'use cache'` + `cacheTag` queries, `updateTag` in Server Actions, and `next/root-params` to supply the locale. Every library in the fixed stack works with Next 16.4.3 and React 19.3. None needs replacing. The risks are configuration traps, not stack choices.

Recommended approach: build a walking skeleton in phase 2 with two root layouts (`app/[locale]` and `app/admin`), one `proxy.ts` that runs the next-intl rewrite and the admin cookie check, locale-agnostic cached queries over `_en`/`_es` columns, and a seeded Neon database. That skeleton is also the test for the pre-approved day-3 Plan B (`cacheComponents: false` + ISR). Write each query as an uncached core plus a thin cached wrapper so a Plan B switch only rewrites the wrappers. The public tree, `/resume.json` and the CV PDF are thin layers over one cached DTO. Rich text is authored in Tiptap and rendered on the server with `@tiptap/static-renderer`, so ProseMirror never ships to visitors.

The biggest risk is not technical: **`docs/content/` is empty** (`.gitkeep` only, `material/` empty, `docs/copy.md` full of `[Teo escribe]` markers), and the core value depends entirely on that material. The main technical risks are all known Cache Components traps: request APIs inside cached scopes (passes `next build`, fails at runtime), `generateStaticParams` that must return at least one item (so the build needs a seeded DB), session reads outside `<Suspense>`, `Date.now()` in the prerendered status line, and nonce CSP, which kills the static shell. Each one has a documented fix, listed below.

## Key Findings

### Recommended Stack

The stack is fixed and every library was confirmed. Installed versions match npm latest. React 19.3.0 to 19.3.1 is recommended as a likely security patch (MEDIUM). Stay on TypeScript 5.9, drizzle 0.45 / drizzle-kit 0.31 (not the 1.0 RC), and dnd-kit core 6 / sortable 10 (not `@dnd-kit/react`). Under pnpm's strict `node_modules`, several packages are present only transitively and **cannot be imported** until they are added as direct dependencies.

**Core technologies:**
- **Next.js 16.4.3** (App Router, `cacheComponents`, `partialPrefetching`, React Compiler): one deploy for the site, admin, PDF and JSON Resume. Includes the fix for CVE-2026-103004 (root-param cache leak). Do not downgrade below 16.3.8.
- **next-intl 4.14.9**: native `next/root-params`. Use `localePrefix: 'as-needed'`, `localeDetection: false`, and localized `pathnames`. No `setRequestLocale`.
- **Drizzle 0.45.4 + `drizzle-orm/neon-http`**: the only runtime driver. Use `db.batch()` for atomic multi-statement writes. `db.transaction()` is unsupported on neon-http.
- **Better Auth 1.7.14**: email+password, `disableSignUp`, `nextCookies()` as the last plugin. The CLI is now the `auth` package (`pnpm dlx auth@1.7.14 generate`), not `@better-auth/cli`.
- **@tiptap 3.32.x + `@tiptap/static-renderer`**: editor in the admin only (`immediatelyRender: false`, `useEditorState`). Server render on public pages. All `@tiptap/*` pinned to one exact version, with one shared extensions list.
- **@react-pdf/renderer 4.9.0**: server-only `renderToBuffer`. Static TTF fonts only (not variable, not WOFF2), traced with `outputFileTracingIncludes`. Spanish hyphenation disabled.
- **TanStack Table 9.3.1**: v9 API (`useTable` + `tableFeatures`). shadcn's DataTable recipe is v8 and must be translated. Budget for it in phase 3.
- **Motion 14 (`motion/react-m` + `LazyMotion`) + GSAP 3.15** (all plugins are free): GSAP only in `src/components/motion/`, inside `useGSAP` + `gsap.matchMedia`.
- **Theme without `next-themes`**: an inline pre-paint script plus `document.startViewTransition`, which is the first-party pattern.

### Expected Features

**Must have (table stakes):**
- Case study per project in this order: header and mono meta row, summary box (problem, role, up to 3 metrics), cover, then 01 Problem, 02 Role, 03 Solution, 04 Results, 05 Technical decisions plus trade-offs and validation, 06 prev/next and CTA. Every section hides when its data is missing.
- Home with status line and dated project entries. About with bio, Now, stack with years (no skill bars), experience, education.
- Downloadable CV PDF en/es: ATS-safe (single column, real text layer, no photo), with an automated text-extraction test for accents.
- Contact: name, email and message, with a honeypot, a time-to-submit check, an Upstash rate limit, insert into the DB before sending, Resend with `replyTo`, click-to-copy email, LinkedIn, and Cal.com as a plain link (no embed).
- A language switch that keeps the current page, plus hreflang/`x-default`, per-locale OG, sitemap, robots, and a 404 in both locales.
- Admin: CRUD for the six entities, separate Save draft and Publish actions, a `visible` toggle, dnd-kit reorder with a keyboard fallback, EN/ES side by side with "ES empty" markers, Blob upload with alt text in both languages, slugs that cannot change after publishing, Cmd+S, and a guard against leaving with unsaved changes.

**Should have (differentiators):**
- Technical decisions as `<Marginalia>` that name what was rejected and "how I verified it". Almost no portfolio does this.
- Role boundaries as their own numbered section.
- A status line with availability, Medellín, UTC-5, and DST-safe overlap with Toronto and Madrid.
- CV and JSON Resume generated from the same data as the site, with history in `resume_versions`.
- Metrics that carry their source in the label ("Lighthouse mobile, Oct 2026"). A dated Now section. A "View source" link in the footer.
- Draft Mode preview of drafts on the real public route. Queries must check `draftMode().isEnabled` from day one, because adding it later means touching every query.

**Defer (v1.x / backlog):** contact inbox in admin (P2), resume `overrides` editor (P2), related-experience block. Everything in `docs/backlog.md` stays there. Anti-features to refuse: CAPTCHA, auto-reply email, embedded PDF viewer, email-gated CV, carousels, animated counters, Tiptap in short fields, revision history.

### Architecture Approach

Two root layouts: `app/[locale]` for the public site (prerendered per locale) and `app/admin` (fixed locale, `<Suspense><AuthGate>`). One `proxy.ts` handles both the intl rewrite and the optimistic cookie check. Features live in `src/features/<entity>/`, with a hard file split between `queries.ts` (cached, published only, locale-agnostic) and `admin-queries.ts` (uncached, includes drafts). Cache tags are entity-level with no locale suffix. Every action follows the same sequence: `requireSession()` → Zod → Drizzle → `updateTag` → `after(() => exportContent())`. The goal is zero DB queries per visitor.

**Major components:**
1. **`src/proxy.ts`**: `/admin/*` gets a `getSessionCookie` check. Everything else goes to next-intl middleware. The matcher excludes `api`, `_next`, `_vercel`, and paths with a dot.
2. **`src/i18n/{routing,request,navigation}.ts`**: locales, pathnames map, `rootParams.locale()` with an explicit override for actions and handlers.
3. **`features/*/queries.ts` + `src/lib/cache-tags.ts`**: `'use cache'` + `cacheTag` + `cacheLife('max')`. Composite DTOs such as `getResumeData()` tag every entity they read explicitly.
4. **`features/*/actions.ts` + `src/lib/session.ts`**: DAL pattern, with the session re-checked in every action, loader and Blob token route.
5. **`features/resume`**: `getResumeData()` DTO → `toJsonResume()` / `renderCv()`, used by route handlers that receive `lang` from their own segment (root params are unavailable there).
6. **`src/lib/export-content.ts`**: writes to `content/*.json` locally and to private Blob `backup/<date>/` on Vercel, after the response, never rolling back a save.
7. **`src/components/motion/*`**: client islands that wrap server-rendered `children`. A Biome `noRestrictedImports` rule enforces that GSAP is imported only here.

### Critical Pitfalls

1. **Locale read in the wrong place under Cache Components.** `headers()` inside `'use cache'` passes the build and fails at runtime. Read `locale()` from `next/root-params` in RSC, pass the locale explicitly to Server Actions and Route Handlers, and give the admin an explicit locale.
2. **`generateStaticParams` must return at least one item.** The build needs a reachable, seeded Neon DB in CI and on Preview and Production. Make `pnpm seed` part of phase 2's definition of done. Use a placeholder slug only as an empty-DB fallback. Never use `dynamicParams`.
3. **Session reads and timestamps in the shell.** Put `getSession` inside `<Suspense>` in the admin, never inside `'use cache'`. `Date.now()` during prerender is a build error, so the status line renders stored data and any live clock is a client leaf that mounts after hydration.
4. **CV PDF fails on Vercel.** Causes: variable or WOFF2 fonts, relative font paths (ENOENT), English hyphenation in Spanish. Use static TTFs, `process.cwd()` paths with tracing includes, and automated `ñ/á/é/í/ó/ú` extraction in CI. Spike it on day 5, because react-pdf with React 19.3 is unverified (LOW).
5. **Nonce CSP kills the static shell.** Set a static header CSP in `next.config.ts` (`'unsafe-inline'` or a hash for the theme script). Ship it Report-Only on Preview first.
6. **Content is late (schedule risk HIGH).** The phase 1 gate is a per-project inventory checklist with permissions and metric sources. If content slips, let phases 2 and 3 run on whatever exists, and block only the phase 3 gate and the phase 4 case-study pages.

Also: neon-http has no transactions (use `db.batch`). Run migrations in the Vercel build with `DATABASE_URL_UNPOOLED` and never `push` to `main`. `exportContent` must not write to the filesystem on Vercel. Blob uploads must be client uploads because of the 4.5 MB limit. Upstash fails open on timeout. Start Resend DNS on Porkbun on day 1 of phase 4.

## Implications for Roadmap

The owner's five phases stand. The research confirms the order (content → base → admin → public → polish) but moves some work across phase labels.

### Phase 1: Identity and content
**Rationale:** Content gates everything. The admin cannot be verified and the case studies cannot be designed without real material.
**Delivers:** Approved DESIGN.md, OKLCH tokens and shadcn theme, `next/font` setup, three hero variants as **pure presentational components** typed against a props contract derived from the planned `site_settings` (fed by a fixture, no DB). Per-project content inventory (tagline, problem, role, solution, results, 2 to 3 decisions, 3 or more 16:10 screenshots, URLs, client permission, metric sources). Static TTF instances in `assets/fonts-pdf/`.
**Addresses:** case-study anatomy prerequisites, metric source convention, "internal tool, sample data" handling for the inventory project.
**Avoids:** Pitfall 10 (content late), phase 1 pulling phase 2 work forward, font/LCP choices made blindly.

### Phase 2: Technical base (walking skeleton + Plan B gate)
**Rationale:** The Cache Components + next-intl decision can only be made against a running `[locale]` + `'use cache'` + root-params skeleton, so the public route tree must start here, not in phase 4.
**Delivers:** Scaffold root layout deleted. Two root layouts. `proxy.ts`. `i18n/*`. Drizzle schema and first migration (including Better Auth tables from `auth generate`). `lib/{auth,session,cache-tags,i18n-fields,export-content,env}`. Login. `queries.ts` stubs written as uncached core plus cached wrapper. Seed with at least one published project and the admin user. Export/seed round trip. CSP skeleton (Report-Only). `pnpm check` in CI. Vercel Preview on the Neon `dev` branch. `/`, `/es`, `/projects/x` and `/es/proyectos/x` rendering real titles. All dependency approvals asked here, in one request.
**Uses:** neon-http + `db.batch`, Better Auth with `disableSignUp`, next-intl root params.
**Avoids:** Pitfalls 1, 2, 3, 4, 7, plus the CSP skeleton. Decide the day-3 Plan B here.

### Phase 3: Admin (+ CV and JSON Resume)
**Rationale:** Public pages read only `published AND visible`, so publishing has to exist first. The PDF gate lives here, so `/cv/*.pdf` and `/resume.json` are built here even though they are public URLs.
**Delivers:** `AuthGate` shell, forms (RHF + Zod, same schema on client and server), TanStack v9 tables, dnd-kit reorder, Tiptap editor, actions wired to `updateTag` + `after(exportContent)`, Blob client upload (request the token at the start of the phase), Draft Mode preview, `features/resume` (DTO, CvDocument, fonts, JSON Resume, handlers, rewrites), real content loaded through the admin.
**Avoids:** Pitfall 5 (PDF spike on day 5), the Blob 4.5 MB limit, filesystem export on Vercel, Tiptap in the public bundle.

### Phase 4: Public site
**Rationale:** Needs content already in the DB. The core value is delivered here.
**Delivers:** Site chrome with StatusLine (stored data plus a client `LocalClock` leaf), home, case study with Marginalia and the static Tiptap renderer, About + Now, contact (request Resend/Upstash keys and start DNS on the first morning), `generateMetadata` with hreflang/OG, sitemap, robots, localized 404, motion islands, theme toggle with View Transitions. Captures at 390/768/1440 plus impeccable audits after each view.
**Avoids:** Pitfalls 8 and 9, SplitText before fonts load, GSAP inside `<Activity>`, Upstash failing open, font preload hurting LCP.

### Phase 5: Polish
**Delivers:** a11y and reduced-motion pass, analytics (CSP + matcher), Lighthouse ≥ 95 on all 8 route/locale combinations **measured on the Preview**, a Playwright check that public routes are served prerendered and have zero CSP violations, review by three people.

### Phase Ordering Rationale
- Content → schema → publish → public reads is a strict data dependency chain.
- The Plan B decision needs a public skeleton in phase 2.
- `export-content` is a phase 2 library that gets wired into actions in phase 3.
- Accounts arrive in the phase that needs them (Blob in 3, Resend/Upstash/Cal in 4, analytics in 5). Until then, code checks for the env var and fails loudly.

### Research Flags
Need `/gsd-plan-phase --research-phase`:
- **Phase 2:** next-intl + root params + Cache Components with two root layouts, Better Auth on Preview URLs (`trustedOrigins`/`allowedHosts`), seeding the admin with signup disabled, Neon branch race on first preview build.
- **Phase 3:** react-pdf with React 19.3 and font tracing on Vercel (build-time vs request-time render), the exact `@tiptap/static-renderer` entry point, TanStack Table v9 recipes, Draft Mode with `'use cache'`.

Standard patterns (skip research): **Phase 1** (design tokens, fonts, presentational components), **Phase 4** mostly (documented patterns; spot-check GSAP + Activity only), **Phase 5** (audits).

## Conflicts Reconciled

### CV PDF: snapshot on publish vs live render (owner decision)
- **PITFALLS:** generate on publish in an admin Server Action, `put()` to Blob, record in `resume_versions`, and point the public link at the Blob URL. Visitors never pay the multi-MB cold start, and the file is exactly what Teo reviewed.
- **ARCHITECTURE:** `/cv/[lang].pdf` → route handler rendering live from the cached `getResumeData()`, prerendered at build and regenerated on tag. Always in sync with the site. The Blob snapshot is history.
- **Recommendation: snapshot on publish, served from Blob** (the handler at `/cv/[lang].pdf` redirects to the latest `resume_versions.pdf_url`). Reasons: a CV is a reviewed document, so a recruiter should get the version Teo approved. It removes the riskiest runtime path (react-pdf + fonts inside a public function on Vercel) from the Lighthouse-gated site. It matches the `resume_versions` table already in the data model. The cost of drift is one "Generate" click, which the admin can prompt after any publish that touches resume entities. Keep `/resume.json` as a live cached handler, because JSON is cheap and has no review step. **Teo decides.**

### Other inconsistencies between files (resolve during planning)
- **Seeding the admin:** STACK recommends Better Auth `internalAdapter.createUser` + `linkAccount` (internal API, wrapped in one helper). PITFALLS offers the `admin()` plugin with CLI `create-admin`, or an env-gated sign-up flag. Recommend the internalAdapter helper (no new plugin, no signup toggle). Verify it in the phase 2 research.
- **JSON Resume URLs:** `/resume.json?lang=es` (FEATURES) vs `/resume.json` + `/resume.es.json` via rewrites (ARCHITECTURE). Recommend the rewrite pair, which can be prerendered (a query string is runtime data).
- **PITFALLS cites `npx @better-auth/cli generate`.** It is outdated. Use `auth@1.7.14 generate` (STACK).
- **Migrations:** running `db:migrate` in the Vercel build command (PITFALLS) is recommended. Note that it runs against `dev` on Preview and `main` on Production.

## Decisions Pending for Teo

Every item below needs approval under CLAUDE.md before code depends on it. Log each one in `docs/decisions.md`.

| # | Decision | Category | Recommendation | Needed by |
|---|----------|----------|----------------|-----------|
| 1 | Bump `react`/`react-dom` 19.3.0 → 19.3.1 | Dependency | Yes (likely security patch) | Phase 2 |
| 2 | Add direct deps: `@tiptap/pm`, `@tiptap/static-renderer` (and align all `@tiptap/*` to 3.32.1), `@dnd-kit/utilities`, `server-only`; dev: `@testing-library/dom`, `@testing-library/user-event`, `@axe-core/playwright`, `tsx`, `@types/node@^24`; `engines.node: 24.x` | Dependency | Yes, all at once; under pnpm these imports fail without them | Phase 2 |
| 3 | Optional: Biome 2.4 → 2.6; `@vercel/analytics` + `@vercel/speed-insights` (phase 5); `vite-tsconfig-paths` only if `resolve.tsconfigPaths` fails | Dependency | Analytics at phase 5; others optional | Phase 2/5 |
| 4 | Add `site_settings.languages` jsonb (`[{language, fluency}]`, CEFR) | Data model | Yes; the PDF and JSON Resume need it | Phase 2 migration |
| 5 | Slug history / redirects list for published slug changes | Data model | Optional; slugs are already immutable after publish | Phase 2 |
| 6 | Fix `docs/data-model.md` line 144: `npx @better-auth/cli generate` → `pnpm dlx auth@1.7.14 generate` | Doc change | Yes | Phase 2 |
| 7 | Amend CLAUDE.md: "`proxy.ts` only checks the session cookie" → "…and runs the next-intl rewrite for the site tree" | CLAUDE.md | Yes; localized pathnames are impossible otherwise | Phase 2 |
| 8 | Amend the "validate in `admin/layout.tsx`" rule to "AuthGate inside `<Suspense>` in the admin layout + `requireSession()` in every action, loader and Blob token route" | CLAUDE.md wording | Yes (Cache Components requirement) | Phase 2 |
| 9 | `/now` Spanish path: `/es/ahora` (ARCHITECTURE) vs `/es/now` (STACK); also confirm `/now` as a route at all vs a section on `/about` | New route | `/es/ahora` if it is a page | Phase 2 routing |
| 10 | New public URLs: `/resume.json`, `/resume.es.json`, `/cv/en.pdf`, `/cv/es.pdf` (+ internal `/api/cv/[lang]`, `/api/resume/[lang]`, `/api/blob/upload`) | New routes | Yes | Phase 3 |
| 11 | CV PDF: snapshot on publish (Blob) vs live render | Architecture | Snapshot (see above) | Phase 3 |
| 12 | Admin UI language: Spanish via explicit `locale: 'es'`, strings still in `messages/es.json` | Convention | Spanish | Phase 2 |
| 13 | Plan B trigger: confirm the end of day 3 as the go/no-go for `cacheComponents` | Process | Yes | Phase 2 |
| 14 | Content questions: client permission for ManuJ/EcoExport screenshots and numbers; is the finance app repo public; "independent contractor" line in About or not; metric source in the label vs a `note` field | Content | Source in the label (no schema change) | Phase 1 |
| 15 | Production `exportContent` is skipped (with a warning) until the Blob token exists in phase 3 | Process | Accept and log | Phase 2 |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions checked on npm and in installed sources. Bundled Next 16.4.3 docs. Only the React patch rationale and TS 7 are MEDIUM/LOW. |
| Features | MEDIUM | Case-study anatomy and admin table stakes are agreed across sources. Canada/EU hiring expectations come from vendor blogs (LOW). |
| Architecture | MEDIUM-HIGH | Cache Components patterns come from the bundled docs (HIGH). next-intl, Better Auth and Blob come from Context7 (MEDIUM). react-pdf on Vercel is LOW. |
| Pitfalls | HIGH for Next.js | Verified against the bundled docs. Library pitfalls are MEDIUM. Repository content state was observed directly. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address
- react-pdf 4.9 with the React 19.3 reconciler, and build-time PDF rendering on Vercel: spike on day 5.
- Exact `@tiptap/static-renderer` entry point (`/pm/react` vs `/react`) and the Tiptap v3 rerender default.
- Better Auth on Preview URLs (`trustedOrigins` vs `allowedHosts`) and the internalAdapter seed (an internal API).
- Exact CSP host list once Blob, Cal and analytics exist. Verify in the browser.
- Next 16 `images.qualities` default. `resolve.tsconfigPaths` in Vite 8.
- Spanish support in `@react-pdf/hyphenate` (otherwise disable hyphenation).
- Neon–Vercel branch settings: Preview → `dev`, Production → `main`. The first-build race is known.
- All content: nothing exists in `docs/content/` yet.

## Sources

### Primary (HIGH confidence)
- Bundled Next.js 16.4.3 docs in `node_modules/next/dist/docs/01-app/`: `next-root-params`, `use-cache`, `generate-static-params`, `updateTag`/`revalidateTag`/`cacheTag`/`after`, `migrating-to-cache-components`, `authentication-with-cache-components`, `incremental-static-regeneration-cache-components`, `content-security-policy`, `preventing-flash-before-hydration`, `proxy`, `serverExternalPackages`, `output`, `not-found`
- npm registry (2026-10-29) and installed package sources (`@upstash/redis`, `@vercel/blob`, `gsap`, Next font data)
- CVE-2026-103004 (OpenCVE/NVD)

### Secondary (MEDIUM confidence)
- Context7: next-intl 4.14.9 (+ root-params blog), Better Auth, Drizzle, Tiptap, Vercel Blob, react-pdf v4, GSAP, Upstash Ratelimit, Next.js Draft Mode
- TanStack Table v9 migration guide, Motion upgrade guide, GSAP standard license, RHF resolvers releases
- Hiring-manager and case-study sources (Scrimba, Profy.dev survey, GreatFrontEnd), CMS UX (Ibexa, DatoCMS, Strapi), anti-spam (Formspree, Basin), JSON Resume schema

### Tertiary (LOW confidence)
- Canada/EU remote-hiring vendor blogs, CV-format career blogs, NDA portfolio advice
- react-pdf on serverless (ENOENT) community reports, Neon first-build race thread, Vercel Analytics CSP thread
- Reference portfolios: eduardbodak.com, antfu.me (finethought.com.au not fetched)

---
*Research completed: 2026-10-29*
*Ready for roadmap: yes*
