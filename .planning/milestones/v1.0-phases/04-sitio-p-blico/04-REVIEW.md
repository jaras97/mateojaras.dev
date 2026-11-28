---
phase: 04-sitio-p-blico
reviewed: 2026-11-24T00:00:00Z
depth: standard
scope: incremental follow-up (diff 8da2699..HEAD, gap-closure plan 04-15)
supersedes: prior 04-REVIEW.md for the files listed below
files_reviewed: 3
files_reviewed_list:
  - e2e/case-study.spec.ts
  - src/app/[locale]/projects/[slug]/page.tsx
  - src/components/site/case-study/case-study.test.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 04: Code Review Report (gap-closure follow-up, plan 04-15)

**Reviewed:** 2026-11-24
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

This is an incremental review of the changes since `8da2699` (plan 04-15, gap G-04-2). For these 3 files it supersedes the previous 04-REVIEW.md. The findings in the previous report (2026-11-23: WR-01 through WR-04 and IN-01 through IN-04, plus the older ones it carried forward) are on files outside this scope. They were not re-checked here and stay open as recorded in the git history of this file. None of them were on `case-study.test.tsx`.

## Narrative Findings (AI reviewer)

## Summary

### Status of G-04-2

| Gap | Status | Evidence |
|---|---|---|
| G-04-2: a case study with gallery media fails with `FORMATTING_ERROR` (`t("figure")` with no values) | **Resolved** | `page.tsx:167` now passes `t.raw("figure")`, so `CaseGallery` gets the raw `"{n} / {total}"` and fills it in itself. No other label in `Site.project` has ICU placeholders, so no other call in `page.tsx` needs the same change. `contact/page.tsx:68-70` already uses `t.raw` for its templates. |

**Would the new tests fail without the fix?** The summary says this was not checked, so I traced it. In use-intl 4.14.9, `defaultOnError` only calls `console.error`, and `defaultGetMessageFallback` returns `namespace.key`. Under `next start`, which is what Playwright runs against, the unfixed page does not crash. It renders the figcaption as `Site.project.figure`. The e2e locator `figure:has(figcaption:has-text("01 / 01"))` then matches nothing, and `toBeVisible()` fails. So the e2e does catch a revert, but only through the figcaption text. Its two error assertions cannot fail in a production build (WR-01). The stack trace in the UAT report came from the dev overlay, which shows server `console.error` calls. The new unit tests never render `page.tsx`. They are not sensitive to a revert, and the test file says so.

No blockers. The fix is correct and as small as it can be. What is left: the e2e says it checks more than it does, the fixture writes published rows to a shared database without invalidating caches, and the "pass a raw template" contract has no type protection, which is how this bug got in.

## Warnings

### WR-01: The e2e checks for `FORMATTING_ERROR` and for the error title can never fail against a production build

**File:** `e2e/case-study.spec.ts:209-213, 223-225`
**Issue:** `next-intl` reports `FORMATTING_ERROR` on the server (`console.error` in the Node process). Playwright's `page.on("console")` only sees the browser console. Next replays server logs to the browser in `next dev` only, and the `webServer` here runs `pnpm build && pnpm start`. No error is thrown either (the fallback string is returned), so `Site.error.title` never renders and `getByText(errorTitle).toBeHidden()` passes right away. Both checks pass whether or not the fix is in place. Only `hasText: "01 / 01"` guards the regression. That makes the test misleading: the unit-test comment (`case-study.test.tsx:262-263`) and the summary both say the e2e guards `FORMATTING_ERROR`. If someone later loosens the figcaption assertion (for example to `figure img`), the regression goes undetected and nothing looks wrong.
**Fix:** Assert the thing a user would see instead of the log, and remove the dead listeners, or turn the error into a hard failure in non-production:
```ts
// spec: assert the fallback key never reaches the DOM
await expect(page.locator("article")).not.toContainText("Site.project.");
await expect(figure.locator("figcaption")).toHaveText("01 / 01");
```
```ts
// src/i18n/request.ts: make missing ICU values loud in tests/dev
onError(error) {
  if (process.env.NODE_ENV !== "production" || process.env.E2E) throw error;
  console.error(error);
},
```
If you add `onError`, set `E2E=1` in the Playwright `webServer.env` so the e2e fails with the same error the UAT saw.

### WR-02: The gallery fixture writes a published, visible project to the shared dev database without invalidating caches, and the cleanup by prefix deletes other runs' rows

**File:** `e2e/case-study.spec.ts:168-202` (with `:9-11` `afterAll`)
**Issue:** `withGalleryFixture` adds a third `status = 'published', visible = true` row with raw SQL (after `Late e2e` and `Notes e2e`). It bypasses the Server Action, so no `updateTag` runs on insert or on delete.
- While the row exists, any cold cache fill of `getProjects()` / `getPublishedSlugsCore()` keeps "Gallery e2e" in the public list. Examples: the first visit to `/` on a fresh Preview instance when `E2E_BASE_URL` is set, or someone browsing the Preview that shares the Neon `dev` branch. `cacheLife("max")` then holds it there after the row is deleted. The home page and the prev/next links then point to a 404 until the next admin save.
- `afterAll` runs `delete ... where slug like 'e2e-late-%'`. `workers: 1` only serializes one process. A second run against the same `DATABASE_URL` (CI and a local run, or two CI jobs) deletes the other run's fixture mid-test, which makes that test flaky.
- `getProject(slug)` entries for each `e2e-late-gallery-<ts>` slug stay in the cache forever with the project data. With a local `next start` this is only junk. On a remote Preview, it is persistent junk in the shared data cache.

**Fix:** Give each run its own ID and clean up only that run's rows. Revalidate the tags the row can leak into:
```ts
const RUN = `${LATE_PREFIX}${process.env.GITHUB_RUN_ID ?? process.pid}-`;
const slug = `${RUN}gallery-${Date.now()}`;
// afterAll: delete from projects where slug like ${`${RUN}%`}
```
For remote runs, call an e2e-only revalidation endpoint (protected by a secret), or skip the fixture tests when `E2E_BASE_URL` is set. Document in `e2e/db.ts` that fixtures must not run against a database that serves a public deployment.

### WR-03: The raw-template contract is stringly typed, so the same bug comes back as soon as any caller passes `t("figure")`

**File:** `src/app/[locale]/projects/[slug]/page.tsx:167`, `src/components/site/case-study/case-gallery.tsx:30, 50-52`
**Issue:** `labels.figure` is a `string` in both the raw and the formatted form, so TypeScript cannot tell `t("figure")` from `t.raw("figure")`. That is exactly how G-04-2 shipped. The `as string` cast hides the type as well (on `contact/page.tsx`, `t.raw` is used without a cast). The hand-rolled `.replace("{n}", ...)` also bypasses ICU. It replaces only the first `{n}`, and any future ICU syntax in the catalog (`{total, number}`, plural, `'{'` escaping) prints literally. `CaseGallery` has no `'use client'`, so it is a Server Component and can take a function prop.
**Fix:** Let next-intl format, and pass a formatter instead of a template:
```tsx
// case-gallery.tsx
labels: { figure: (n: string, total: string) => string };
// ...
content: labels.figure(two(index + 1), two(total)),

// page.tsx
labels={{ figure: (n, total) => t("figure", { n, total }) }}
```
Now a caller that forgets the values fails typecheck, and the unit tests can pass `(n, t) => \`${n} / ${t}\``. If you keep the string contract, rename the prop to `figureTemplate` and drop the `as string`, so the call site shows what it expects.

## Info

### IN-01: The new "real catalog" unit tests mostly repeat the existing `CaseGallery` tests

**File:** `src/components/site/case-study/case-study.test.tsx:262-314`
**Issue:** The existing `describe("CaseGallery")` already renders with `"{n} / {total}"` and covers "only the cover renders nothing" (`:215-218`). The new block adds sensitivity only to a change in the catalog text. The test name "renders zero-padded counters" duplicates `"04 / 04"` / `"02 / 02"` from `:236` and `:246`. The JSON imports through `../../../../messages/*.json` are fragile compared with the `@/` alias the rest of the file uses (if the alias reaches `messages/`).
**Fix:** Delete the cover-only case in the new block. Keep one `it.each` over the catalogs. If you adopt WR-03, replace it with a test that `t("figure", { n, total })` formats in both locales.

### IN-02: The fixture media points at a blob host that does not exist, which adds image-optimizer 4xx noise on every run

**File:** `e2e/case-study.spec.ts:166, 173-186`
**Issue:** `https://e2e-fixture.public.blob.vercel-storage.com/e2e/*.png` matches `remotePatterns`, so `/_next/image` fetches it and logs upstream 404/400s. The summary notes this. On a remote Preview, every run also adds failed optimizations to the image cache. The test asserts only `alt`, so it does not need a real image.
**Fix:** Use a small PNG committed under `public/e2e/` (a local `src` skips remote fetches), or accept the noise and filter it from server-log checks if any are added later.

---

_Reviewed: 2026-11-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
