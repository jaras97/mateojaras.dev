---
status: diagnosed
phase: 04-sitio-p-blico
source: [04-VERIFICATION.md]
started: 2026-11-23T23:51:57Z
updated: 2026-11-24T15:24:44Z
---

## Current Test

[testing complete]

## Tests

### 1. Live contact delivery: set RESEND_API_KEY (domain verified in Porkbun DNS) and Upstash vars in .env.local and Vercel Production+Preview, submit the form on the Preview
expected: Confirmation in the visitor's language; row in contact_messages; Teo receives the email with Reply-To = visitor; email_sent_at non-null; 4th send within an hour rejected
result: pass

### 2. Load ManuJ and EcoExport content from /admin (problem, role, case study, results, metrics, tech decisions in en and es, media), then review /projects/[slug] in en and es
expected: Sections 01-05, Marginalia, metrics with sources and gallery with captions render; Lighthouse stays >= 95 on the populated case
result: issue
reported: "todo eso esta bien, encontre un solo error, en trabajo, al seleccionar un trabajo, ejemplo centro estetico, me aparece un error: Error: FORMATTING_ERROR: The intl string context variable \"n\" was not provided to the string \"{n} / {total}\" at CaseStudy (src/app/[locale]/projects/[slug]/page.tsx:167:37) labels={{ figure: t(\"figure\") }} — GET /es/proyectos/centro-estetico-manuj"
severity: blocker

### 3. Run /impeccable:audit and /impeccable:critique on each public view in en and es
expected: No critical findings
result: pass

### 4. Visual review at 390/768/1440 light and dark, including the scrubbed margin-number scene, theme View Transition with no flash, and the new error boundary copy
expected: Matches UI-SPEC; one accent; no horizontal scroll; Site.error copy approved by Teo
result: pass

## Summary

total: 4
passed: 3
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-04-2
  truth: "Populated case study (/projects/[slug], /es/proyectos/[slug]) renders sections 01-05, Marginalia, metrics and gallery with captions without errors"
  status: failed
  reason: "User reported: todo eso esta bien, encontre un solo error, en trabajo, al seleccionar un trabajo, ejemplo centro estetico, me aparece un error: Error: FORMATTING_ERROR: The intl string context variable \"n\" was not provided to the string \"{n} / {total}\" at CaseStudy (src/app/[locale]/projects/[slug]/page.tsx:167:37) labels={{ figure: t(\"figure\") }} — GET /es/proyectos/centro-estetico-manuj"
  severity: blocker
  test: 2
  root_cause: "page.tsx:167 calls t(\"figure\") with no values; next-intl formats eagerly, so the template \"{n} / {total}\" throws FORMATTING_ERROR. CaseGallery expects the raw template and substitutes n/total itself. Only triggers when hasGallery (non-cover media exists), so seeded e2e projects never hit it."
  artifacts:
    - path: "src/app/[locale]/projects/[slug]/page.tsx"
      issue: "line 167 formats the figure template eagerly via t(\"figure\") instead of passing the raw template"
    - path: "e2e/case-study.spec.ts"
      issue: "no e2e case for a project with gallery media, so the CaseGallery branch never runs in tests"
  missing:
    - "Pass the raw template: t.raw(\"figure\") as string (matches public-site convention in layout.tsx and contact/page.tsx)"
    - "Add an e2e case seeding a project with at least one non-cover media item, open it in en and es, assert no error and the figure counter (e.g. 01 / 01) renders"
  debug_session: ".planning/debug/case-study-figure-intl-format-error.md"
