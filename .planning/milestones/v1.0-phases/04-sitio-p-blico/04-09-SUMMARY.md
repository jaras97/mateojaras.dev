---
phase: 04-sitio-p-blico
plan: 09
subsystem: ui
tags: [about, rich-text, intl, tdd]
requires: [04-01, 04-03, 04-12]
provides: [about page, numberSections, NowSection, StackList, ExperienceList, EducationList, LanguageList]
affects: [04-10, 04-11]
key-files:
  created:
    - src/lib/section-numbers.ts
    - src/components/site/about/now-section.tsx
    - src/components/site/about/stack-list.tsx
    - src/components/site/about/experience-list.tsx
    - src/components/site/about/education-list.tsx
    - src/components/site/about/language-list.tsx
    - e2e/about.spec.ts
    - e2e/screens-about.spec.ts
  modified:
    - src/app/[locale]/about/page.tsx
requirements-completed: [SITE-04, MOTN-01, QUAL-04]
duration: 25min
completed: 2026-11-22
---

# Phase 4 Plan 09: About page Summary

About page with the dated Now section (RichText, settings.updatedAt in settings.timezone), stack with years only, experience, education and CEFR languages, numbered over the sections that exist.

## Commits
- 756ee26 test(04-09): RED tests for components and numbering
- b59d5d4 feat(site): about page (GREEN)
- Task 2 commit: test(site): about screenshots and audit review

## Deviations from Plan
- Period lines sit above the entry (mono) rather than in a left margin column; PageSection already places content in cols 3-9. Visually clean at 390/1440.
- Section-numbers RED commit: the impl file was moved out of the tree for the RED commit so the failing state was real.

## Findings
- Dev DB has no published skills, so Stack does not render on /about (correct per "no content, no section"); covered by unit tests only.
- Nav About link does a full load: cause is plain `<a>` in nav-links.tsx (not a root-layout split). Outside this plan's files; diagnosed in deferred-items.md.
- Header language link axe issue excluded as in prior specs; copy untouched.

## impeccable
Playwright captures exist (12 PNGs in test-results/screens/about/, 390/768/1440, light+dark, en+es), reviewed visually (1440 light, 390 es dark): hierarchy, numbering, no overflow. Formal `/impeccable:audit` and `/impeccable:critique`: PENDING (not run). Visual notes: section spacing (mt-24 plus bottom padding) is generous, left as is; no criticals observed.

## Decisiones
- Quién: executor. Now date is composed from formatToParts as "day month year" in both locales (plain Intl gives "Nov 22, 2026" in en). Assumption flagged in the plan stands: updatedAt moves with any settings change.
- Quién: executor. Section keys are filtered before numbering, so an empty Now makes Stack 01.

## Self-Check: PASSED
pnpm check passes; about unit tests and e2e green.
