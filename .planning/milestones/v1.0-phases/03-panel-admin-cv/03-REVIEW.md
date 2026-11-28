---
phase: 03-panel-admin-cv
reviewed: 2026-11-22T19:14:38Z
depth: standard
files_reviewed: 132
files_reviewed_list:
  - drizzle/0002_keen_mentor.sql
  - next.config.ts
  - scripts/check-cv-pdf.ts
  - scripts/check-phase-3.ts
  - scripts/seed.ts
  - src/app/[locale]/layout.tsx
  - src/app/[locale]/projects/[slug]/page.tsx
  - src/app/admin/(panel)/_components/auth-gate.tsx
  - src/app/admin/(panel)/ajustes/page.tsx
  - src/app/admin/(panel)/cv/page.tsx
  - src/app/admin/(panel)/educacion/[id]/loading.tsx
  - src/app/admin/(panel)/educacion/[id]/page.tsx
  - src/app/admin/(panel)/educacion/nueva/page.tsx
  - src/app/admin/(panel)/educacion/page.tsx
  - src/app/admin/(panel)/experiencia/[id]/loading.tsx
  - src/app/admin/(panel)/experiencia/[id]/page.tsx
  - src/app/admin/(panel)/experiencia/nueva/page.tsx
  - src/app/admin/(panel)/experiencia/page.tsx
  - src/app/admin/(panel)/layout.tsx
  - src/app/admin/(panel)/mensajes/page.tsx
  - src/app/admin/(panel)/page.tsx
  - src/app/admin/(panel)/proyectos/[id]/loading.tsx
  - src/app/admin/(panel)/proyectos/[id]/page.tsx
  - src/app/admin/(panel)/proyectos/nuevo/page.tsx
  - src/app/admin/(panel)/proyectos/page.tsx
  - src/app/admin/(panel)/skills/[id]/page.tsx
  - src/app/admin/(panel)/skills/nueva/page.tsx
  - src/app/admin/(panel)/skills/page.tsx
  - src/app/admin/login/login-form.tsx
  - src/app/admin/login/page.tsx
  - src/app/api/blob/upload/route.ts
  - src/app/api/cv/[lang]/route.ts
  - src/app/api/draft/route.ts
  - src/app/api/resume/[lang]/route.ts
  - src/app/globals.css
  - src/components/admin/admin-link.tsx
  - src/components/admin/admin-nav.tsx
  - src/components/admin/admin-page-header.tsx
  - src/components/admin/bilingual-field.tsx
  - src/components/admin/bilingual-repeater.tsx
  - src/components/admin/delete-confirm.tsx
  - src/components/admin/env-missing-notice.tsx
  - src/components/admin/form-labels.tsx
  - src/components/admin/form-section.tsx
  - src/components/admin/form-skeleton.tsx
  - src/components/admin/image-uploader.tsx
  - src/components/admin/list-header.tsx
  - src/components/admin/mobile-menu.tsx
  - src/components/admin/navigation-blocker.tsx
  - src/components/admin/rich-text-editor.tsx
  - src/components/admin/rich-text-field.tsx
  - src/components/admin/section-index.tsx
  - src/components/admin/sortable-list.tsx
  - src/components/admin/status-badge.tsx
  - src/components/admin/unsaved-guard.tsx
  - src/components/site/draft-banner.tsx
  - src/components/site/draft-exit-form.tsx
  - src/db/columns.ts
  - src/features/admin/panel-queries.ts
  - src/features/contact/actions.ts
  - src/features/contact/admin-queries.ts
  - src/features/contact/components/message-reader.tsx
  - src/features/contact/components/messages-table.tsx
  - src/features/education/actions.ts
  - src/features/education/admin-queries.ts
  - src/features/education/components/education-form.tsx
  - src/features/education/components/education-table.tsx
  - src/features/education/components/new-education-form.tsx
  - src/features/education/queries.ts
  - src/features/education/validation.ts
  - src/features/experience/actions.ts
  - src/features/experience/admin-queries.ts
  - src/features/experience/components/experience-form.tsx
  - src/features/experience/components/experience-table.tsx
  - src/features/experience/components/new-experience-form.tsx
  - src/features/experience/form-model.ts
  - src/features/experience/queries.ts
  - src/features/experience/validation.ts
  - src/features/projects/actions.ts
  - src/features/projects/admin-queries.ts
  - src/features/projects/components/new-project-form.tsx
  - src/features/projects/components/project-form.tsx
  - src/features/projects/components/projects-table.tsx
  - src/features/projects/form-model.ts
  - src/features/projects/list-actions.ts
  - src/features/projects/queries.ts
  - src/features/projects/validation.ts
  - src/features/resume/actions.ts
  - src/features/resume/admin-queries.ts
  - src/features/resume/components/cv-history.tsx
  - src/features/resume/components/cv-links.tsx
  - src/features/resume/components/generate-cv-button.tsx
  - src/features/resume/cv-data.ts
  - src/features/resume/cv-fixture.ts
  - src/features/resume/json-resume-schema.ts
  - src/features/resume/json-resume.ts
  - src/features/resume/pdf/cv-document.tsx
  - src/features/resume/pdf/fonts.ts
  - src/features/resume/queries.ts
  - src/features/site-settings/actions.ts
  - src/features/site-settings/admin-queries.ts
  - src/features/site-settings/components/settings-form.tsx
  - src/features/site-settings/fixture.ts
  - src/features/site-settings/form-model.ts
  - src/features/site-settings/queries.ts
  - src/features/site-settings/schema.ts
  - src/features/site-settings/validation.ts
  - src/features/skills/actions.ts
  - src/features/skills/admin-queries.ts
  - src/features/skills/components/new-skill-form.tsx
  - src/features/skills/components/skill-form.tsx
  - src/features/skills/components/skills-table.tsx
  - src/features/skills/queries.ts
  - src/features/skills/validation.ts
  - src/lib/action-result.ts
  - src/lib/bilingual.ts
  - src/lib/blob-upload.ts
  - src/lib/blob.ts
  - src/lib/cache-tags.ts
  - src/lib/content-export.ts
  - src/lib/dal.ts
  - src/lib/draft-preview.ts
  - src/lib/draft.ts
  - src/lib/form-errors.ts
  - src/lib/mailto.ts
  - src/lib/messages.ts
  - src/lib/rich-text-schema.ts
  - src/lib/rich-text.tsx
  - src/lib/seed-guard.ts
  - src/lib/slug.ts
  - src/lib/tiptap-extensions.ts
  - src/lib/zod-jitless.ts
findings:
  critical: 1
  warning: 11
  info: 10
  total: 22
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-11-22T19:14:38Z
**Depth:** standard
**Files Reviewed:** 132
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

I reviewed the phase 3 admin panel: Server Actions, admin loaders, route handlers (Blob token, Draft Mode, CV, JSON Resume), the draft/publish overlay, client forms and tables, the CV pipeline, content export and the seed.

The auth basics hold up. Every Server Action calls `requireActionSession()` first, every loader and page calls `requireSession()`, the Blob token endpoint and `/api/draft` gate on `requireSessionForRequest()`, and public cores strip `draft`. Next's docs confirm that `draftMode()` inside `'use cache'` bypasses the cache and never writes to it, so drafts do not leak into the public cache.

The defects are in data integrity and edge cases around the draft model:
- Relation ids stored inside `draft` jsonb are never cleaned up when the related row is deleted, which blocks publishing (CR-01).
- Several fields reach the database without server-side validation (WR-03, WR-04).
- Untrimmed names make delete impossible (WR-01).
- Draft Mode outlives sign-out (WR-05).
- The CV action leaks raw error text and skips the export step that every other mutation runs (WR-06, WR-07).

## Critical Issues

### CR-01: A deleted skill or project leaves a stale id inside other rows' pending drafts, and publishing those rows then fails for good

**File:** `src/features/skills/actions.ts:299`, `src/features/projects/list-actions.ts:130`, `src/features/projects/actions.ts:136-145,168-175`, `src/features/experience/actions.ts:140-155,176-182`, `src/features/projects/admin-queries.ts:25-29`, `src/features/experience/admin-queries.ts:40-47`
**Issue:** A published project or experience keeps pending relation changes in `draft.skillIds` / `draft.projectIds` (jsonb). `deleteSkill` and `deleteProject` rely on `ON DELETE CASCADE`, and that only cleans the join tables. Ids inside `draft` jsonb stay.

Here is what happens next:
1. `getProjectForAdmin` / `getExperienceForAdmin` feed the stale id back into the form.
2. The checkbox lists only render ids that still exist (`skillOptions` / `projectOptions`), so the stale id stays in `field.value` and the admin has no way to uncheck it.
3. `publishProject` / `publishExperience` then run `replaceSkills` / `replaceRelations`. The insert into `project_skills` / `experience_skills` / `experience_projects` violates the FK, and the action returns the generic `{ error: "server" }` on every attempt.

The only way out is "Descartar borrador", which throws away all the pending edits.

The same failure hits a never-published row if a skill or project is deleted in another tab while its form is open. `z.array(z.uuid())` checks the format only, not whether the id exists.

**Fix:** Filter relation ids against live rows on the server before writing them, and strip them on delete:
```ts
// shared helper, used by saveDraft and publish in projects/experience
async function existingIds(table: typeof skills | typeof projects, ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.select({ id: table.id }).from(table).where(inArray(table.id, ids));
  const live = new Set(rows.map((r) => r.id));
  return ids.filter((id) => live.has(id));
}
// publishProject
const skillIds = await existingIds(skills, parsed.data.skillIds);
...replaceSkills(id, skillIds)
```
Also filter `skillIds` / `projectIds` in `getProjectForAdmin` / `getExperienceForAdmin` against the option lists, so the form never holds an invisible id.

## Warnings

### WR-01: Names with leading or trailing whitespace can never be deleted

**File:** `src/features/projects/list-actions.ts:126`, `src/features/experience/actions.ts:286`, `src/features/education/actions.ts:220`, `src/components/admin/delete-confirm.tsx:87`
**Issue:** The draft schemas use plain `z.string()` for `titleEs`, `company` and `institution`, and `toColumns` stores the value untrimmed. Publish only checks `trim()` for non-emptiness. So "Mi proyecto " is stored with its trailing space.

`DeleteConfirm` enables the button only when `typed.trim() === name`. The server checks `confirmName.trim() !== row.titleEs`. Neither can ever equal an untrimmed name, so the button stays disabled and the action would reject anyway. (Skills are safe because `name` is `.trim()`.)

**Fix:** Trim on the way in (`titleEn/titleEs/company/institution: z.string().trim()` in the draft schemas). In both places, compare trimmed against trimmed: `confirmName.trim() !== row.titleEs.trim()` and `typed.trim() !== name.trim()`.

### WR-02: Project actions don't validate `id`, and the first DB reads sit outside `try`

**File:** `src/features/projects/actions.ts:130-133,163-166,228`
**Issue:** `saveProjectDraft`, `publishProject` and `discardProjectDraft` pass the raw `id` argument to `loadRow()`, and `checkSlug()` also runs outside the `try`. Server Actions are public POST endpoints. A non-UUID `id` makes Postgres throw `invalid input syntax for type uuid`, and a transient Neon error does the same. Either way the action throws instead of returning `ActionResult`, which breaks the contract stated in `src/lib/action-result.ts`. Experience, education and skills keep the read inside `try`, and list-actions validates with `z.uuid()`; projects is the odd one out.
**Fix:** Start each of the three actions with `if (!z.uuid().safeParse(id).success) return { ok: false, error: "validation" };`, and move `loadRow`/`checkSlug` inside the `try`.

### WR-03: Project `startedAt` / `finishedAt` reach a `date` column with no server validation

**File:** `src/features/projects/validation.ts:68-69`
**Issue:** `startedAt: nullableText` / `finishedAt: nullableText` accept any string, which breaks the "Zod validation on the server, always" rule.
- For a draft row, `"abc"` goes straight to a `date` column and the save fails with a generic `server` error.
- For a published row, the junk is stored in `draft` jsonb, then publish fails the same way, and Draft Mode overlays the invalid value onto the row.

There is also no `finishedAt >= startedAt` check, even though experience and education have one.
**Fix:**
```ts
const optionalDate = z.union([z.literal(""), z.iso.date()]).nullable();
startedAt: optionalDate, finishedAt: optionalDate,
// in projectPublishSchema.superRefine:
if (value.startedAt && value.finishedAt && value.finishedAt < value.startedAt) ctx.addIssue(...)
```

### WR-04: An invalid timezone in the settings draft crashes the Draft Mode home preview

**File:** `src/features/site-settings/validation.ts:56,99-105`, `src/lib/draft.ts:16-24`
**Issue:** `timezone` is only checked with `isKnownTimeZone` in `settingsPublishSchema`. A draft save accepts any string, for example a half-typed `"America/Bog"`. `getSiteSettings()` in Draft Mode overlays the draft through `applyDraft`. `StatusLine` (via `hero-a.tsx`) then calls `formatEntryDate` / `formatUtcOffset` with that zone, and `Intl.DateTimeFormat` throws `RangeError`. So the admin's preview of `/` errors out.
**Fix:** Run the timezone check in `settingsDraftSchema` as well (`timezone: z.string().refine(isKnownTimeZone, TIMEZONE_MESSAGE)`). You can also make `formatUtcOffset`/`formatEntryDate` fall back to UTC when the zone is invalid.

### WR-05: Draft Mode outlives sign-out, so unpublished and hidden content stays visible in that browser

**File:** `src/app/admin/(panel)/actions.ts:9-13`, `src/features/projects/queries.ts:66-76`
**Issue:** `/api/draft` checks the session only when it turns Draft Mode on. After that, public pages trust nothing but the `__prerender_bypass` cookie. With that cookie, `getProjects` and `getProject` return every row, including `status = 'draft'` and `visible = false` (the hidden EcoExport case), with drafts overlaid. `signOutAction` never calls `draftMode().disable()`, and a session that expires naturally leaves the cookie in place too. On a shared or borrowed machine, the next person sees all unpublished content until the browser session ends.
**Fix:** In `signOutAction`, call `(await draftMode()).disable()` before `redirect`. Optionally, have `DraftBanner` (which is already dynamic) check the session and show an "exit" state when the session is gone.

### WR-06: `generateCv` sends raw internal error messages to the client

**File:** `src/features/resume/actions.ts:19-23`
**Issue:** `failure()` puts `error.message` into `fieldErrors.motivo`, and `GenerateCvButton` shows it in a toast. Driver errors from Neon (constraint names such as `resume_locale_version_idx`, SQL fragments), Blob SDK errors and `@react-pdf` filesystem errors (absolute `process.cwd()` font paths) all reach the browser. The other actions deliberately log on the server and return a code.
**Fix:** Log the full error on the server and return a mapped, user-safe reason. For example: `"fuentes"` when the message mentions font loading, `"almacenamiento"` for Blob errors, `"versión duplicada"` for unique violations (code `23505`), and a generic code otherwise.

### WR-07: `generateCv` skips `exportContent()`, so the content backup drifts and a restore rolls the CV back

**File:** `src/features/resume/actions.ts:63-72`, `src/lib/content-export.ts:38`
**Issue:** `resume_versions` is in `CONTENT_TABLES`, and CLAUDE.md requires every mutation to end with `updateTag` followed by `exportContent()`. `generateCv` stops after `updateTag(tags.resume)`. `content/resume_versions.json` (and the Blob backup) never includes new CV versions. `pnpm seed --from-content` deletes the table and restores the stale file, so `/cv/en.pdf` falls back to an older PDF, or returns 404 if none was exported.
**Fix:** After the batch insert, add `after(() => exportContent({ db, tables: ["resume_versions"] }).catch((e) => console.error("exportContent failed", e)));`.

### WR-08: The upload path regex rejects ordinary file names, and the uploader shows only a generic error

**File:** `src/lib/blob-upload.ts:13-27`, `src/components/admin/image-uploader.tsx:97-99,130-131`
**Issue:** The client checks the MIME type and then uploads to `projects/<id>/${safeUploadName(file.name)}`. The server requires the name to end in `.(avif|webp|jpe?g|png)` with at least one character before the dot. Several common cases fail:
- names with no Latin characters (`截图.png` becomes `-.png`, then `.png` after the leading `-` is stripped),
- files whose extension doesn't match the MIME type (`photo.jfif` or `image.heic.jpg` with no extension, or a pasted `blob` with no extension),
- extensions like `.JPG.webp` after renaming.

`onBeforeGenerateToken` throws `pathname not allowed`, and the admin sees only `images.failed`.
**Fix:** Build the server path name from the MIME type rather than the user's file name. For example, `${safeUploadName(base) || "imagen"}-${Date.now()}.${EXT[file.type]}`, where `EXT` maps each allowed MIME type to its extension.

### WR-09: The editor creates `http://` links that the server schema rejects, and the error points at no field

**File:** `src/lib/tiptap-extensions.ts:14-19`, `src/lib/rich-text-schema.ts:21`, `src/features/projects/form-model.ts:205`
**Issue:** `link.protocols: ["https", "mailto"]` adds protocols to Tiptap's defaults; it does not restrict them. So autolink (typing `http://x.com `) and pasted HTML still produce `link` marks with `http:` or other hrefs. `richTextDocSchema` only allows `https://` and `mailto:`, so the whole draft save fails.

`formFieldName` maps the issue path (`caseStudyEn.content.0.content.1.marks.0.attrs.href`) to a dotted name that matches no registered field. As a result, `setError`/`setFocus` do nothing visible, and the admin sees only "saveFailed" with no idea which link is wrong. The same applies to `nowEn/nowEs` in settings.
**Fix:** Restrict the protocols at the source:
```ts
link: { openOnClick: false, autolink: true, defaultProtocol: "https",
  isAllowedUri: (url) => /^(https:\/\/|mailto:)/.test(url) },
```
Also map any `caseStudy*` / `now*` path to the field name (`caseStudyEs`) so the error shows on the editor.

### WR-10: Signing out with unsaved changes skips the unsaved-changes guard

**File:** `src/app/admin/(panel)/_components/auth-gate.tsx:50-54`, `src/components/admin/navigation-blocker.tsx`
**Issue:** The sign-out button is a Server Action `<form>` that ends in `redirect("/admin/login")`. That is a client-side navigation: `AdminLink.onNavigate` doesn't see it, and `beforeunload` never fires. A dirty form is thrown away without the "leave without saving?" dialog that every other navigation in the shell shows.
**Fix:** Make the sign-out control a client component that reads `useNavigationBlocker()`. When `blocked`, it opens the same dialog, and on "leave" it calls `onLeave` and then submits the form (`form.requestSubmit()`).

### WR-11: Content backups go to a public Blob store and include unpublished and hidden content

**File:** `src/lib/content-export.ts:152-159`
**Issue:** On Vercel, every mutation writes `backup/<stamp>/<table>.json` with `access: "public"`. These files hold the `draft` jsonb of published rows, every `status = 'draft'` row and rows hidden with `visible = false` (EcoExport). The random suffix makes the URLs hard to guess, but they are unauthenticated and cached by the CDN for a month. They also show up in Vercel/Blob dashboards and logs, and anyone who sees a URL can read the content Teo deliberately hid.
**Fix:** Write backups to a private Blob store, or encrypt the payload with a server-only key before `put`. At minimum, record the accepted risk in `docs/decisions.md`.

## Info

### IN-01: The server-side delete confirmation compares the row name with itself

**File:** `src/features/projects/components/projects-table.tsx` (`confirmDelete`), `src/features/experience/components/experience-table.tsx:324`, `src/features/education/components/education-table.tsx:314`, `src/features/skills/components/skills-table.tsx:418`
**Issue:** Each table sends `row.titleEs` / `row.company` / `row.institution` / `row.name` as `confirmName`, not the text the admin typed. So the server check in each delete action always passes; only the client-side check exists. That is acceptable for one admin, but the server check adds nothing.
**Fix:** Either pass the typed value up from `DeleteConfirm` (`onConfirm(typed)`) or drop the parameter.

### IN-02: `"code"` is listed as a node type in the rich-text allowlist

**File:** `src/lib/rich-text-schema.ts:16,66`
**Issue:** `code` is a mark in Tiptap (it is already in `RICH_TEXT_MARKS`), not a node. Listing it as a node accepts `{ type: "code", content: [...] }`, which no extension renders.
**Fix:** Remove `"code"` from `RICH_TEXT_NODES` and from the node enum.

### IN-03: `DATE_PATTERN` accepts dates that don't exist

**File:** `src/features/experience/validation.ts:8`, `src/features/education/validation.ts:7`, `src/features/site-settings/validation.ts:8`
**Issue:** `/^\d{4}-\d{2}-\d{2}$/` passes `2026-02-31`. Postgres then rejects it and the admin gets a generic `server` error instead of the field message.
**Fix:** Use `z.iso.date()`.

### IN-04: Changing a skill's category keeps its old `order`

**File:** `src/features/skills/actions.ts:139-144,166-169`
**Issue:** `order` is assigned per category on create (`max(order) where category = ...`). Saving or publishing with a new category keeps the old value, so it can collide with or jump ahead of the rows already in that category.
**Fix:** When `category` changes, set `order` to `max(order) + 1` of the target category.

### IN-05: `GenerateCvButton` is rendered twice with separate busy state

**File:** `src/app/admin/(panel)/cv/page.tsx:46-58,101,132`
**Issue:** When there is no history yet, the same `button` element appears in "Generar" and in the empty state. Each instance has its own `busy`/`useTransition`, so both can run at once. The unique index rejects the second run, and with WR-06 the admin sees the raw constraint text.
**Fix:** Render one button, or lift the pending state into a shared parent or context.

### IN-06: The CSP is Report-Only, so it is not enforced

**File:** `next.config.ts:26`
**Issue:** `Content-Security-Policy-Report-Only` with no `report-uri`/`report-to` neither enforces anything nor sends reports anywhere. CLAUDE.md requires a CSP. This is separate from the known connect-src deferral.
**Fix:** Add a `report-to` endpoint now and set a date to switch the header to `Content-Security-Policy`.

### IN-07: `media[].url` and `coverImage` accept any string

**File:** `src/features/projects/validation.ts:37-42,66`
**Issue:** Nothing requires `https:` or the Blob host. Today only the admin `<img>` renders them. Once the case study renders them with `next/image`, any host outside `remotePatterns` will error during rendering.
**Fix:** `z.url({ protocol: /^https$/, hostname: /\.public\.blob\.vercel-storage\.com$/ })`.

### IN-08: Saves are last-write-wins across tabs

**File:** `src/features/projects/components/project-form.tsx:55-58,170-171` (same pattern in the other forms)
**Issue:** `version` (`updatedAt`) is only used as a remount key and never reaches the action. Two tabs editing the same row silently overwrite each other.
**Fix:** Send `version` with the save and reject with `conflict` when `row.updatedAt.toISOString() !== version`.

### IN-09: `seed --from-content` only checks `projects` before wiping all nine tables

**File:** `scripts/seed.ts:50-55`
**Issue:** When `projects` is empty but other content tables have admin edits, the guard passes without `--force`, and `restoreContent` deletes every content table.
**Fix:** Count rows in every table in `CONTENT_TABLES` before `assertSeedable`.

### IN-10: `createProject` reports a slug race as `server`, not `conflict`

**File:** `src/features/projects/actions.ts:194-222`
**Issue:** The check-then-insert can lose to the `projects_slug_idx` unique index, and the `catch` returns `server`. `skills/actions.ts` already handles this case with `isUniqueViolation`.
**Fix:** Reuse `isUniqueViolation` (move it to `src/lib`) and return the `SLUG_TAKEN_MESSAGE` conflict.

---

_Reviewed: 2026-11-22T19:14:38Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
