---
phase: 03-panel-admin-cv
plan: 12
subsystem: resume
tags: [json-resume, zod, route-handler, cache-components]
requires: ["03-11"]
provides:
  - jsonResumeSchema / ISO8601_PATTERN (Zod mirror of JSON Resume)
  - toJsonResume / getJsonResume (cached, five content tags)
  - /api/resume/[lang] behind /resume.json and /resume.es.json
affects: [phase-03 gate]
key-files:
  created:
    - src/features/resume/json-resume-schema.ts
    - src/features/resume/json-resume-schema.test.ts
    - src/features/resume/json-resume.ts
    - src/features/resume/json-resume.test.ts
    - src/app/api/resume/[lang]/route.ts
    - e2e/resume-json.spec.ts
  modified:
    - src/features/resume/cv-data.ts
    - src/features/resume/cv-fixture.ts
decisions:
  - "CvData gained raw ISO startDate/endDate and lastModified (additive) so JSON Resume emits YYYY-MM without parsing display strings"
  - "No configured site URL: basics.url and meta.canonical are omitted instead of emitted empty"
metrics:
  tasks: 1
  completed: 2026-11-16
---

# Phase 3 Plan 12: JSON Resume Summary

`/resume.json` and `/resume.es.json` serve JSON Resume built from the same `buildCvData` as the PDF, cached by `getJsonResume` under the settings, projects, experience, skills and education tags, validated by a Zod mirror on every request with a 500 on failure.

## TDD
- RED (8e9ee20): 8 tests (schema accept en/es, reject `2021/08` and `Aug 2021`, YYYY-MM with no endDate for open ranges, closed range, no countryCode/phone, es labels and canonical) against stubs that return `{}` and accept anything. 6 failed on the planned assertions (undefined properties/arrays); the 2 "accepts fixture" tests passed vacuously against `z.any()`. The GSD RED-evidence classifier (`gsd_run`) is not available in this environment, so semantic assessment was manual: failures were on the target behavior, not on imports or syntax.
- GREEN (2282006): schema, mapping, cached helper, route, e2e.
- REFACTOR: none.

## Verification
- vitest resume: 21 tests passed (mapping tests mock `./cv-data` and `next/cache` to keep the DB out of the unit).
- e2e `resume-json.spec.ts`: 2 passed (both locales valid, startDate matches iso8601, no phone/countryCode; temp experience: draft not visible, publish shows it with position "Test role" and "2024-01", draft save with a changed role leaves JSON unchanged, delete removes it).
- `pnpm check` green; build prerenders `/api/resume/en` and `/api/resume/es` (revalidate 30d, expire 1y, tag-invalidated).

## Deviations from Plan
1. **[Rule 3]** CvData only had formatted date strings, so raw `startDate`/`endDate` (experience, education) and `lastModified` (newest `updatedAt`) were added to `CvData` and `cvFixture`. Additive; PDF unaffected.
2. **[Rule 1]** First e2e run returned 500: the route's fail-closed validation caught an empty `NEXT_PUBLIC_SITE_URL` at build time producing `url: "/es"`-style invalid URLs. Mapping now omits `basics.url` and `meta.canonical` when no site URL exists, rather than inventing one. Confirms the 500 guard works.
3. Mapping tests mock `cv-data`/`next/cache`; the e2e uses `input[name=roleEn]:visible` because the admin form renders the label twice.

## Pending manual items
- Real data has no featured project and no skills: `projects` and `skills` arrays are empty in the live JSON until Teo adds them.
- `NEXT_PUBLIC_SITE_URL` should be set in Vercel (Production and Preview) so `basics.url` and `meta.canonical` appear.

## Known Stubs
None.

## Self-Check: PASSED
