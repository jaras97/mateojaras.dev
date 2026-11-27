---
phase: 05-pulido-y-lanzamiento
reviewed: 2026-11-27T00:00:00Z
depth: standard
files_reviewed: 98
files_reviewed_list:
  - .env.example
  - .github/workflows/ci.yml
  - e2e/a11y-sweep.spec.ts
  - e2e/admin-guards.spec.ts
  - e2e/admin-images.spec.ts
  - e2e/admin-projects.spec.ts
  - e2e/admin-reorder.spec.ts
  - e2e/admin-settings.spec.ts
  - e2e/case-study.spec.ts
  - e2e/csp-sweep.spec.ts
  - e2e/csp.ts
  - e2e/cv.spec.ts
  - e2e/db.ts
  - e2e/favicon.spec.ts
  - e2e/headers.spec.ts
  - e2e/keyboard.spec.ts
  - e2e/not-found.spec.ts
  - e2e/public.spec.ts
  - e2e/reduced-motion.spec.ts
  - e2e/review-fixes.spec.ts
  - e2e/screens-not-found.spec.ts
  - e2e/target.ts
  - messages/en.json
  - messages/es.json
  - next.config.ts
  - package.json
  - playwright.config.ts
  - scripts/check-cv-pdf.ts
  - scripts/check-live.ts
  - scripts/check-phase-4-1.ts
  - scripts/content/positioning.ts
  - scripts/lib/seed-facts.ts
  - scripts/load-content.ts
  - scripts/wait-preview.ts
  - src/app/[locale]/[...rest]/page.tsx
  - src/app/[locale]/layout.tsx
  - src/app/[locale]/not-found.tsx
  - src/app/icon.svg
  - src/components/site/case-study/case-cta.tsx
  - src/components/site/case-study/case-header.tsx
  - src/components/site/case-study/case-metrics.tsx
  - src/components/site/case-study/case-sections.tsx
  - src/components/site/case-study/case-study.test.tsx
  - src/components/site/case-study/plain-text.tsx
  - src/components/site/entry-list.tsx
  - src/components/site/footer-line.tsx
  - src/components/site/hero/hero-parts.tsx
  - src/components/site/hero/hero.test.tsx
  - src/components/site/requested-path.test.tsx
  - src/components/site/requested-path.tsx
  - src/components/site/site-analytics.tsx
  - src/components/site/site-footer.test.tsx
  - src/components/site/site-header.tsx
  - src/features/contact/components/contact-form.tsx
  - src/features/education/actions.ts
  - src/features/education/columns.ts
  - src/features/education/components/education-form.tsx
  - src/features/education/components/new-education-form.tsx
  - src/features/experience/actions.ts
  - src/features/experience/columns.ts
  - src/features/experience/components/experience-form.tsx
  - src/features/experience/components/new-experience-form.tsx
  - src/features/projects/actions.ts
  - src/features/projects/columns.ts
  - src/features/projects/components/new-project-form.tsx
  - src/features/projects/components/project-form.tsx
  - src/features/projects/content-schema.ts
  - src/features/projects/queries.ts
  - src/features/projects/seed-map.test.ts
  - src/features/projects/slug-index.test.ts
  - src/features/projects/slug-index.ts
  - src/features/resume/pdf/cv-document.test.tsx
  - src/features/resume/pdf/cv-document.tsx
  - src/features/site-settings/actions.ts
  - src/features/site-settings/columns.ts
  - src/features/site-settings/components/settings-form.tsx
  - src/features/site-settings/copy-doc.test.ts
  - src/features/site-settings/copy-doc.ts
  - src/features/site-settings/fixture.ts
  - src/features/skills/actions.ts
  - src/features/skills/columns.ts
  - src/features/skills/components/new-skill-form.tsx
  - src/features/skills/components/skill-form.tsx
  - src/features/skills/components/skills-table.tsx
  - src/lib/content-lint.test.ts
  - src/lib/content-lint.ts
  - src/lib/content-load/diff.test.ts
  - src/lib/content-load/diff.ts
  - src/lib/content-load/plan.test.ts
  - src/lib/content-load/plan.ts
  - src/lib/content-load/positioning.test.ts
  - src/lib/content-load/target.test.ts
  - src/lib/content-load/target.ts
  - src/lib/published-slug-guard.test.ts
  - src/lib/published-slug-guard.ts
  - src/lib/rich-text-doc.test.ts
  - src/lib/rich-text-doc.ts
  - src/proxy.ts
findings:
  critical: 1
  warning: 8
  info: 8
  total: 17
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-11-27
**Depth:** standard (focus on `git diff 55e16ed..HEAD`)
**Files Reviewed:** 98
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

Scope: the phase 5 changes plus the interleaved phase 4.1 work. That covers the enforced CSP, the proxy guard that returns 404 for unknown slugs, the localized 404 page, Vercel Analytics, the shared `*Columns` mappers, the content loader (`scripts/load-content.ts` and `src/lib/content-load/*`), the content linter, the live-check scripts, and the e2e/CI additions.

The site-facing changes are mostly sound. The column-mapper extraction preserves behavior exactly, the CSP stays nonce-free, and `RequestedPath` renders only as text. Most of the problems are in the tooling that writes to the database:
- The loader silently clears a pending site-settings draft.
- The linter rejects ordinary Spanish copy ("todo").
- The e2e production guard checks the wrong variable.

The new proxy guard also lets unauthenticated traffic trigger a database read on every request for an unknown slug.

## Critical Issues

### CR-01: The loader silently discards a pending site-settings draft

**File:** `scripts/load-content.ts:631-708`
**Issue:** Every other entity group calls `noteDraft()`, so the dry-run shows `! ...[key] has a pending draft (will be cleared)`. The settings group does not. When any headline, bio, now or SEO field differs, it runs `.set({ ...picked, draft: null })`, which deletes whatever draft the admin has saved for site settings. That draft can hold edits to fields the loader never manages, such as email, calendarUrl, availability or languages. The draft is lost on `--apply` against main, and the dry-run never mentions it. The payload is also built from `settingsFormValues(row)`, which reads only the live columns, so none of the draft survives. This is silent data loss on a script that is run against production.
**Fix:** Do what the other groups do. Report the draft, and either refuse or preserve it:
```ts
const cleared = noteDraft(group, "site", row);
const found = diffFields("settings", "site", row, columns, fields);
noteChanges(group, found);
if (found.length > 0 || cleared) {
  // or: if (row.draft) throw new Error("site_settings has a pending draft; publish or discard it first");
  group.statements.push(db.update(siteSettings).set({ ...picked, draft: null }).where(...));
}
```
The safer option is to throw when `row.draft` is set, because the settings draft carries fields outside the loader's allowlist.

## Warnings

### WR-01: The lint "marker" rule rejects the ordinary Spanish word "todo"

**File:** `src/lib/content-lint.ts:45`
**Issue:** `MARKER = /\[Teo escribe\]|\bTODO\b|lorem/i` uses the `i` flag, so it matches the common Spanish word "todo" ("everything"). I confirmed this with node: `"La regla que ordena todo"` and `"Todo el sistema"` both match. `docs/content/prendo.md:122` already contains the heading "La regla que ordena todo". The loader lints the row's existing `caseStudyEs` (via `projectFormValues(row)` inside `lintable`), so once that case study is in the database, every `--only=projects` run aborts with `lint: N issues, nothing written`. `scripts/check-phase-4-1.ts` would report FAIL on the same text. The test at `content-lint.test.ts:41` only checks "Todos", which passes because of `\b`.
**Fix:** Make the TODO marker case-sensitive and keep the rest case-insensitive:
```ts
const MARKER_CI = /\[Teo escribe\]|lorem/i;
const MARKER_CS = /\bTODO\b|\bFIXME\b/;
```
Add a test for `lintText("La regla que ordena todo")` returning `[]`.

### WR-02: Any visitor can make the proxy guard read the database on every request

**File:** `src/lib/published-slug-guard.ts:56-70`, `src/proxy.ts:43-46`
**Issue:** When a slug is missing from the cached set ("warm miss"), the guard always calls `refresh(load)`, a full `select slug from projects` on Neon, and negatives are never cached on purpose. `inflight` only collapses requests that are concurrent. A scanner or bot requesting `/projects/<random>` sequentially therefore costs one database round-trip per request, from unauthenticated traffic, on every instance. That is a cost and availability amplification vector against the database.
**Fix:** Throttle re-reads on a miss and keep read-your-writes for a fresh publish. For example, skip the reload if the cached set was refreshed in the last ~2 s:
```ts
const MISS_REFRESH_MS = 2_000;
if (memo && now() - memo.at < MISS_REFRESH_MS) return false;
```
Alternatively, rate-limit the refresh with the existing Upstash limiter.

### WR-03: The e2e production guard checks `E2E_BASE_URL` but the writes go to `DATABASE_URL`

**File:** `e2e/target.ts:8-16`, `e2e/db.ts:45-67`, `e2e/not-found.spec.ts:87`
**Issue:** `insertTempProject()` and `deleteTempProjects()` (`delete from projects where slug like 'e2e-temp-%'`) refuse production only when `E2E_BASE_URL` is a production host. The SQL actually runs against `DATABASE_URL`. A local run with no `E2E_BASE_URL` and `DATABASE_URL` pointing at Neon main writes and deletes rows in production. That setup is plausible: the loader docs tell Teo to pass `DATABASE_URL='<Neon main>'` inline, and `playwright.config.ts` loads `.env.local`. The repo already has the right check in `src/lib/seed-guard.ts`.
**Fix:** Guard on the database endpoint too:
```ts
import { describeDbTarget } from "@/lib/db-target";
import { PRODUCTION_DB_ENDPOINT_PREFIX } from "@/lib/seed-guard";
export function isProductionTarget() {
  const db = process.env.DATABASE_URL;
  if (db && describeDbTarget(db).startsWith(PRODUCTION_DB_ENDPOINT_PREFIX)) return true;
  // ...existing E2E_BASE_URL host check
}
```

### WR-04: `RequestedPath` reads `usePathname()` during SSR on a page reached through a proxy rewrite

**File:** `src/components/site/requested-path.tsx:14-20`, `src/proxy.ts:47`
**Issue:** For unknown or draft slugs, the proxy rewrites to `/${locale}/__missing`, and next-intl rewrites `/foo` to `/en/foo`. The bundled Next docs (`use-pathname.md`, "Avoid hydration mismatch with rewrites") warn that `usePathname()` then gives the rewrite destination on the server and the browser URL on the client. Two results follow:
- The SSR HTML, which is what crawlers and no-JS clients see, can show `/en/__missing` or `/en/foo` instead of what the visitor typed.
- Hydration hits a text mismatch.

The e2e check `page.locator("code", { hasText: path })` matches substrings, so `/en/foo` satisfies it for `/foo`. The slug-404 tests (`expectLocalized404`) do not check the path text at all.
**Fix:** Use the documented pattern: render a stable fallback on the server and fill it in after mount.
```tsx
const pathname = usePathname();
const [shown, setShown] = useState("");
useEffect(() => setShown(decode(pathname ?? "")), [pathname]);
return <code ...>{shown}</code>;
```
Tighten the e2e check to an exact text match.

### WR-05: The 404 page renders its own `<title>` while the layout metadata also emits one

**File:** `src/app/[locale]/not-found.tsx:21`, `src/app/[locale]/layout.tsx:18-24`
**Issue:** `generateMetadata` in the `[locale]` layout sets `title: settings.name`, and Next renders that as a `<title>`. The not-found component also renders `<title>{"404 · ..."}</title>`, which React 19 hoists into the head. React does not deduplicate `<title>`, so the document can end up with two titles, and which one the browser uses depends on order. No e2e test checks `document.title` on the 404 page.
**Fix:** Assert `await expect(page).toHaveTitle(...)` in `not-found.spec.ts`, and check that `document.querySelectorAll("title").length === 1`. If there are two, drop the layout-level `title` for this segment, or move the 404 title into a single mechanism.

### WR-06: Loader groups are written in separate batches, and retire runs first

**File:** `scripts/load-content.ts:723-727`, `:249-263`
**Issue:** Each group (retire, skills, projects, experiences, education, settings) is a separate `db.batch`. A failure in a later group, such as a unique violation on a rename or a constraint error, leaves the earlier groups committed. Retire runs first and is irreversible. It also cascades (`experience_projects.project_id ... onDelete: "cascade"`), removing experience-to-project links, and that removal never appears in the dry-run diff unless `experiences` is also selected. The result is a half-applied positioning in production.
**Fix:** Put every statement in a single `db.batch` (neon-http batches are atomic), or move retire to the end. Also list the cascaded `experience_projects` rows in the retire dry-run lines.

### WR-07: A natural-key change in the positioning creates duplicate public rows

**File:** `src/lib/content-load/plan.ts:69-83`, `scripts/load-content.ts:447-452, 587`
**Issue:** Experiences are keyed by `company|type|startDate` and education by `institution|programEn`. If positioning.ts corrects a start date or rewords `programEn`, the old row no longer matches. For experiences, `isManagedExperience` then filters the old row out and the loader never touches it again, so a second published row is inserted next to the old one. Both show on `/about` and in the CV. The dry-run shows only `+ new`, with no hint that a near-duplicate exists.
**Fix:** Add a stable explicit key to the positioning entries (`id` or `key`), or have the loader fail when a new row shares `company+type` (or `institution`) with an existing published row, so Teo resolves it on purpose.

### WR-08: The loader writes to the database but skips `exportContent()` and cache invalidation

**File:** `scripts/load-content.ts:723-731`
**Issue:** CLAUDE.md says every mutation ends with `updateTag` and then `exportContent()`. The loader writes published content directly. Public queries use `cacheLife("max")`, so nothing changes on the site until the next deploy. 04.1-VERIFICATION confirms that "the production deploy refreshed the cache." The JSON export (`docs/content` or the export folder) also drifts from the database. Neither step is printed at the end, so relying on a redeploy is easy to forget.
**Fix:** After `--apply`, print an explicit next step (`redeploy or run export:content`). Better, call a protected revalidation endpoint, or run `exportContent()` from the script.

## Info

### IN-01: The stale loader comment hides that `docs/content` case studies are ignored

**File:** `scripts/load-content.ts:361`
**Issue:** The comment says "docs/content has none", but `docs/content/prendo.md` has `## caseStudyEs` / `## caseStudyEn` sections, which `projectRowFromContent` drops (`seed-map.ts:46-47`). New rows get `caseStudy: null` even though the file has a case study.
**Fix:** Fix the comment. Alternatively, warn when a content file has a case study that the loader is discarding.

### IN-02: The `__prerender_bypass` cookie bypasses the 404 guard for anyone

**File:** `src/proxy.ts:33`
**Issue:** The guard only checks that the cookie exists. Any visitor who sets a dummy `__prerender_bypass` gets the old soft-404 (200) for unknown slugs. The impact is low (a status code only), but the check is not tied to Draft Mode actually being enabled.
**Fix:** Accept this and document it, or skip the guard only for admin-session requests (`getSessionCookie(req)`).

### IN-03: `check-live.ts` puts synthetic page views into production analytics

**File:** `scripts/check-live.ts:193-240`
**Issue:** The analytics group hides `navigator.webdriver` and spoofs a desktop Chrome UA so that the production beacon counts the visit. Every run adds fake visits to the analytics data that phase 5 just started collecting. The script also sends `VERCEL_AUTOMATION_BYPASS_SECRET` to whatever origin is passed in argv.
**Fix:** Run the analytics group only against Preview by default, or filter these visits by a query parameter. Send the bypass headers only to `*.vercel.app` hosts.

### IN-04: `headers.spec.ts` now needs a database but has no skip guard

**File:** `e2e/headers.spec.ts:6-9`
**Issue:** `paths()` calls `firstPublishedProject()` without `test.skip(!process.env.DATABASE_URL)`. Without a database, the spec errors instead of skipping, although it used to run without one. It also wraps `test` from `./csp` (which already collects violations) and calls `collectCsp` again. That registers two listeners and init scripts, so every violation is reported twice.
**Fix:** Add the DATABASE_URL skip and remove the duplicate `collectCsp` (rely on the fixture).

### IN-05: Unused `Site.header.home` message key

**File:** `src/components/site/site-header.tsx:35-43`, `messages/en.json:64`, `messages/es.json`
**Issue:** The `aria-label={t("home")}` was removed, so "Mateo Jaramillo, home" is dead copy. The link's accessible name also no longer says it goes home.
**Fix:** Remove the key, or keep the "home" context in the sr-only text.

### IN-06: Redundant union type

**File:** `src/features/site-settings/fixture.ts:48`
**Issue:** `headlineEsStatus: "approved" | "approved"` is a leftover from the `"draft" | "approved"` edit.
**Fix:** `headlineEsStatus: "approved"` (or restore `"draft" | "approved"`).

### IN-07: `review-fixes.spec.ts` K-28 can pass without checking anything

**File:** `e2e/review-fixes.spec.ts:53-63`
**Issue:** Unlike K-13, there is no `expect(hrefs.length).toBeGreaterThan(0)`, so an empty home list passes. `\w{3}` also cannot match accented month abbreviations.
**Fix:** Add the length assertion, and use `[\p{L}.]+` with the `u` flag.

### IN-08: The Preview CSP hardcodes a single Pusher shard

**File:** `next.config.ts:22`
**Issue:** `wss://ws-us3.pusher.com` is a specific cluster host used by the Vercel Toolbar. If Vercel moves clusters, Preview starts showing CSP violations and `csp-sweep` fails on Preview.
**Fix:** Use `wss://*.pusher.com`. It only applies on Preview.

---

_Reviewed: 2026-11-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
