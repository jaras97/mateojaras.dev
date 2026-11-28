---
phase: 04-sitio-p-blico
plan: 04
subsystem: public-site
tags: [case-study, marginalia, gallery, prev-next, e2e]
requires: ["04-01", "04-12"]
provides:
  - "CaseHeader, CaseMetrics, CaseCover, CaseSections, PlainText, CaseGallery, PrevNext, CaseCta, Marginalia"
  - "adjacentProjects, projectStacksQuery, getProjectStacksCore, getProjectStacks"
  - "media[].captionEn/captionEs/capturedAt (JSON, no migration)"
affects: [04-05, 04-10, 04-11]
key-files:
  created:
    - src/components/site/case-study/{case-header,case-metrics,case-cover,case-sections,plain-text,case-gallery,prev-next,case-cta}.tsx
    - src/components/site/case-study/case-study.test.tsx
    - src/components/site/marginalia.tsx
    - src/components/site/marginalia.test.tsx
    - src/features/projects/adjacent.ts
    - src/features/projects/adjacent.test.ts
    - e2e/case-study.spec.ts
  modified:
    - src/app/[locale]/projects/[slug]/page.tsx
    - src/components/site/page-section.tsx
    - src/features/projects/{queries,schema,validation,content-schema,form-model}.ts
    - src/components/admin/image-uploader.tsx
    - e2e/axe.ts
requirements-completed: [CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, CASE-07, MOTN-01]
completed: 2026-11-22
---

# Phase 4 Plan 04: Case study Summary

Full bilingual case study page on the cached cores: header with meta row and internal-tool branch, metrics dl, 16:10 cover, sections 01-05 with fixed numbering, Marginalia notes, captioned gallery, prev/next without wrap and the contact CTA, with the slug still resolved inside Suspense.

## Commits
- 29dd0cf feat(site): case study page from header to contact call (task 1, tracer)
- a309aa9 feat(site): case study margin notes, gallery captions and stack line (task 2)

## Verification
- `pnpm check` green (typecheck, lint, 349 tests, build). No migration generated (`drizzle/*.sql` count unchanged at 3).
- `e2e/case-study.spec.ts`: 7 passed (read in en and es with axe, no ProseMirror/tiptap in client scripts, late slug opens with 200, unknown slug shows not-found, Marginalia below decisions at 390 and beside at 1440, internal-tool label and demo link).
- `e2e/admin-images.spec.ts` passed in the combined run before the final spec edits.

## Decisiones
| Decision | Quién | Por qué |
|---|---|---|
| `PageSection` gains an optional `aside` slot (cols 10-12 from lg) instead of a bespoke decisions layout | Claude | Keeps one section component; backwards compatible with 04-12 callers |
| Header renders the internal-tool segment, stack and demo line in task 1 (not task 2) | Claude | One component, tested once; task 2 only wired the stack data |
| Unknown slug answers HTTP 200 with the not-found UI streamed | Claude | Consequence of the documented slug-inside-Suspense structure (CASE-07); e2e asserts the UI, not the status |
| Empty caption/date inputs are stripped in `form-model.compactMedia`, not in Zod | Claude | Stored JSON never carries `""` keys |
| `expectNoBlockingViolations` takes an optional `exclude` selector list | Claude | Lets the case spec skip a known 04-03 issue without hiding other violations |

## Deviations from Plan
1. **[Rule 3 - Blocking] Pre-existing axe violation in the header language link.** `a[hreflang]` fails `label-content-name-mismatch` (aria-label "Ver esta página en español" vs visible "ES"). Belongs to 04-03 and needs a copy change in messages (not allowed here). Logged in `deferred-items.md`; the case e2e excludes that selector.
2. **TDD commits.** Tests were written before implementation in each task but committed together with the implementation, not as separate RED commits.
3. **CASE-07 e2e** inserts a published row through SQL (cache miss on an unbuilt slug) instead of publishing through the admin form; the admin publish plus updateTag path is already covered by `e2e/admin-projects.spec.ts`.
4. **Margin-note and internal-tool e2e** use an inserted fixture row because the seeded published project has no stored margin notes / has a live URL, so real-data variants would always skip.

## Pending (could not run here)
- Playwright MCP screenshots at 390/768/1440 (light and dark), `/impeccable:audit` and `/impeccable:critique` for the case page: not run, pending for Teo or the phase verification pass.
- Human check: Teo reads the ManuJ case in en and es (problem, role, solution, results, decisions).
- Metrics source labels: stored metric `{label, value}` is rendered as-is; the label is expected to carry the source text. ManuJ has `metrics: []`, so no metric renders on real data yet.

## Known Stubs
None.

## Threat surface
No new endpoints or auth paths. T-04-07..T-04-10 mitigations hold: public cores only, RichText allowlist, strict media schema with caption max 120 and capturedAt regex, https-only URLs rendered as hrefs.

## Self-Check: PASSED
