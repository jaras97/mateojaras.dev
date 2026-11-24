---
status: diagnosed
trigger: "case-study-figure-intl-format-error: opening a populated project (e.g. /es/proyectos/centro-estetico-manuj) throws FORMATTING_ERROR for {n} / {total}"
created: 2026-11-24T00:00:00Z
updated: 2026-11-24T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED. page.tsx calls t("figure") with no values; next-intl formats ICU eagerly and throws because {n}/{total} are missing. CaseGallery expects the raw template and substitutes itself.
test: code reading + stack trace line match (page.tsx:167)
expecting: n/a
next_action: return diagnosis (find_root_cause_only)

## Symptoms

expected: Sections 01-05, Marginalia, metrics with sources and gallery with captions render without errors on a populated case study, in en and es.
actual: Opening a project such as Centro Estetico ManuJ throws an error.
errors: "FORMATTING_ERROR: The intl string context variable \"n\" was not provided to the string \"{n} / {total}\" at CaseStudy (src/app/[locale]/projects/[slug]/page.tsx:167:37)"
reproduction: pnpm dev, open /es/proyectos/centro-estetico-manuj (and /projects/centro-estetico-manuj)
started: Discovered during phase 04 UAT

## Eliminated

## Evidence

- timestamp: 2026-11-24
  checked: src/app/[locale]/projects/[slug]/page.tsx:162-168
  found: CaseGallery rendered only when hasGallery (media beyond the cover); labels={{ figure: t("figure") }} with t from getTranslations({ locale, namespace: "Site.project" }), no values argument.
  implication: The throw only happens for projects with at least one non-cover media item, which explains why it surfaces on a populated project.

- timestamp: 2026-11-24
  checked: messages/en.json:45, messages/es.json:45
  found: "figure": "{n} / {total}" in both locales.
  implication: ICU arguments n and total are required; t() without values throws FORMATTING_ERROR.

- timestamp: 2026-11-24
  checked: src/components/site/case-study/case-gallery.tsx
  found: labels.figure.replace("{n}", two(index + 1)).replace("{total}", two(total)); typed labels: { figure: string }.
  implication: The component is designed to receive the raw template and substitute itself (zero-padded per item). The call site must not format.

- timestamp: 2026-11-24
  checked: other call sites of placeholder templates
  found: Public site uses t.raw (layout.tsx:43 te.raw("write"); contact/page.tsx:68-70 t.raw("errors.*")). Admin uses pass-through values: c("moreActions", { nombre: "{nombre}" }), d("over", {...}), toasts("cvGenerated", { n: "{n}" }), etc. about/page.tsx formats with real values (years, nowUpdated). Scanned every message key containing a placeholder; Site.project.figure is the only one called with t() and no values.
  implication: Single faulty call site; fix does not need to touch other places.

- timestamp: 2026-11-24
  checked: src/components/site/case-study/case-study.test.tsx:199-200; e2e/*.spec.ts
  found: Unit test passes labels = { figure: "{n} / {total}" } as a literal, bypassing next-intl, so it never exercises the page wiring. No e2e spec references gallery/media/figure; seeded e2e projects evidently have no non-cover media, so hasGallery is false and CaseGallery (and t("figure")) never runs.
  implication: Explains why the suite missed it: the faulty line is conditionally reached only with gallery media, which no test seeds.

## Resolution

root_cause: src/app/[locale]/projects/[slug]/page.tsx:167 passes t("figure") to CaseGallery. The message "{n} / {total}" has ICU arguments; next-intl formats eagerly and throws FORMATTING_ERROR when values are absent. CaseGallery expects the unformatted template and replaces {n}/{total} itself. Only triggered when the project has media beyond the cover (hasGallery), which no test fixture covers.
fix:
verification:
files_changed: []
