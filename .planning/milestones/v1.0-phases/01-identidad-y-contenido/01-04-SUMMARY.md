---
phase: 01-identidad-y-contenido
plan: 04
subsystem: ui
tags: [site-settings, fixture, status-line, intl, i18n, vitest, react-dom-server]

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-01 Vitest/Biome setup; 01-02 /lab/tokens sections 01-04, Lab namespace and labMessages"
provides:
  - "src/features/site-settings/types.ts: AvailabilityStatus, Locale, SiteSettings (full row), HeroSettings (Pick)"
  - "src/features/site-settings/fixture.ts: heroFixture (satisfies SiteSettings) with Teo's G2 values; heroFixtureMeta with pendingFields []"
  - "src/lib/format.ts: formatMonthYear, formatUtcOffset, formatEntryDate (timezone-independent)"
  - "src/lib/i18n-fields.ts: localized() from docs/data-model.md"
  - "Hero namespace in messages/en.json and messages/es.json; heroMessages and fill in src/lib/messages.ts"
  - "src/components/site/hero-copy.ts: heroCopy (en/es) and heroCopyMeta (status draft until G7)"
  - "src/components/site/status-line.tsx: StatusLine Server Component"
  - "/lab/tokens section 05 (format-specimen rows) and the fixture-headline row in section 02"
affects: [01-06 hero variants, 01-09 G3, 01-12 G7, 01-13, phase 2 site_settings schema and next-intl]

tech-stack:
  added: []
  patterns:
    - "Hand-written row types that phase 2 swaps for Drizzle $inferSelect; fixtures declared with satisfies over the whole row"
    - "Server-side Intl formatting with explicit timeZone, never the machine zone or the clock"
    - "Component tests through react-dom/server renderToStaticMarkup in the node environment (no jsdom)"
    - "Provenance metadata next to human-sourced data: source, authorship, per-language status, pendingFields"

key-files:
  created:
    - src/features/site-settings/types.ts
    - src/features/site-settings/fixture.ts
    - src/lib/format.ts
    - src/lib/format.test.ts
    - src/lib/i18n-fields.ts
    - src/lib/i18n-fields.test.ts
    - src/components/site/hero-copy.ts
    - src/components/site/status-line.tsx
    - src/components/site/status-line.test.tsx
    - .planning/phases/01-identidad-y-contenido/01-04-ANSWERS.md
  modified:
    - src/lib/messages.ts
    - messages/en.json
    - messages/es.json
    - src/app/lab/tokens/page.tsx
    - docs/decisions.md

key-decisions:
  - "Hero headline ES completed by Claude at Teo's explicit request ('termina el texto tu'); EN is Claude's translation; both draft until G7 (headlineEsStatus draft, headlineEnStatus draft-translation, headlineAuthorship records it)"
  - "headlineSource stays exactly 'Teo, 2026-10-30' (the G2 answer) because 01-06's precondition anchors that form; the Claude-authorship note lives in the new headlineAuthorship field"
  - "Fixture availability open, availableFrom null, location 'Medellín, Colombia', exactly as the scripted G2 rule printed"
  - "formatUtcOffset normalizes ICU's GMT+0 / GMT-0 to bare UTC"

patterns-established:
  - "Before building on human-sourced data, downstream plans check heroFixtureMeta.pendingFields is empty and headlineSource is 'Teo, <date>'"

requirements-completed: []
requirements-groundwork: [IDEN-04]

actuals:
  tokens: 7400
  tasks: 3
  commits: 3
plan_head_before: a2936f8a07db1df63f0011b00a6cdfcf642c46f8
plan_head_after: 98935a8099f477828feaaa7e1cacd82f1921a353

duration: 31min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 04: site_settings fixture, StatusLine and Teo's G2 values Summary

**Typed site_settings row filled with Teo's G2 answers (open, Medellín, Colombia, America/Bogota as UTC-5), a timezone-safe StatusLine Server Component locked by 24 tests, and `localized()`. The headline is Claude's completion of Teo's "Construyo ..." at his request and stays draft until G7.**

## Performance

- Duration: 31 min (both sessions, including the G2 wait)
- Tasks: 3 (tracer, G2 checkpoint, apply + tests)
- Files: 15 created or modified

## Accomplishments

- `heroFixture` is the full `site_settings` row (`satisfies SiteSettings`), with only Teo's values, the CLAUDE.md timezone and the fixed id set. Nothing else is filled in.
- `StatusLine` renders date · availability · location · offset · overlap. The offset is derived from the timezone and there is no clock read. The separator closes the previous segment, the dot is static and both are `aria-hidden`.
- /lab/tokens section 05 prerenders every state as a labelled format specimen. Section 02 shows the fixture headline together with its source and authorship.
- Tests: format (7, also run under TZ=UTC), i18n-fields (5) and StatusLine (9). Together with messages they make 24 passing tests under TZ=America/Bogota.

## Task Commits

1. **Task 1: Tracer, fixture to StatusLine to /lab/tokens section 05** – `15fa750` (feat)
2. **Task 2: G2, Teo's answers recorded verbatim** – `3f780da` (docs)
3. **Task 3: Apply Teo's values and lock behavior with tests** – `98935a8` (feat)

## Respuestas de Teo

Copied from `01-04-ANSWERS.md` (G2, Fecha: 2026-10-30):

```
1 Construyo ... termina el texto tu
2 tradúcelo
3 open
5 Medellín, Colombia
```

Output of the scripted G2 rule (Task 3 precondition, exit 0):

```
availabilityStatus=open
availableFrom=null
location=Medellín, Colombia
```

- Answer 3 `open` → `availabilityStatus: "open"`. Item 4 is not applicable (open), so `availableFrom: null`. Answer 5 → `location: "Medellín, Colombia"`.
- Answer 1 is a delegation, not a headline. The fixture's `headlineEs` is the text Claude completed at Teo's request, recorded in ANSWERS under "Texto completado por encargo de Teo (ítem 1)":
  - ES: "Construyo aplicaciones web con React y Next.js para empresas y equipos que necesitan un frontend sólido, desde la primera pantalla hasta el panel que las administra."
  - EN (answer 2, "tradúcelo"): "I build web apps with React and Next.js for companies and teams that need a solid frontend, from the first screen to the admin panel behind it."
- Typo fixes applied to Teo's headline: none. There was no full headline to fix.

## Decisions Made

See key-decisions. The delegation is logged in `docs/decisions.md` ("Headline del hero completado por encargo de Teo (G2)").

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] formatUtcOffset printed "UTC+0" for the UTC zone**
- **Found during:** Task 3 (RED run of format.test.ts)
- **Issue:** ICU on Node 24 formats a zero `shortOffset` as `GMT+0`, so the function returned `UTC+0`. The plan's behavior requires bare `UTC`.
- **Fix:** the function now maps `GMT`, `GMT+0` and `GMT-0` to `UTC` before the general `GMT` to `UTC` replacement.
- **Files modified:** src/lib/format.ts
- **Commit:** 98935a8

### Plan adjustments

**2. Headline source from the delegation section, not answer 1 verbatim**
- The plan expects `headlineEs` to match answer 1 character for character. Teo's answer 1 asks Claude to finish the text, so `headlineEs` is the completed text recorded in ANSWERS. The scripted rule read answer 1 as a value and needed no adaptation.

**3. headlineSource kept in 01-06's exact form; provenance moved to new meta fields**
- 01-06's precondition greps `headlineSource: "Teo, YYYY-MM-DD"` with the closing quote. Adding "propuesta de Claude..." inside that string would have broken it. So `headlineSource` is `"Teo, 2026-10-30"`, which points at the G2 answer. Two new meta fields carry the orchestrator's provenance requirement: `headlineAuthorship: "propuesta de Claude por encargo de Teo, 2026-10-30, pendiente de aprobación en G7"` and `headlineEsStatus: "draft"`. /lab/tokens section 02 shows both, so the page never presents the headline as Teo's own text.
- **For 01-06:** the LabBar note should read `headlineEsStatus` and `headlineAuthorship`, as it already does for `headlineEnStatus`. With the current plan text, the "borrador de docs/copy.md" note no longer fires, because the source no longer points at docs/copy.md.

**4. One commit for Task 3, not separate RED/GREEN commits**
- The task has `tdd="true"`, but the plan and CLAUDE.md both ask for one commit per task. RED was observed locally before the commit: i18n-fields was missing, the UTC offset was wrong and a test helper expectation was off. All tests are green in 98935a8.

## TDD Gate Compliance

There is no separate `test(01-04)` RED commit. CLAUDE.md requires one commit per task, which takes precedence. RED was run and observed before implementation (3 failing files), and GREEN is commit 98935a8.

## Known Stubs

None that block the plan goal. `name`, `bioEn`, `bioEs` and `email` are `""`, and the URL, SEO and now columns are `null`, by design (D-03: nothing in phase 1 renders them, and no value Teo did not give enters the fixture). The headline is a delegated draft and is tracked for G7 through `headlineEsStatus` and `headlineEnStatus`.

## Issues Encountered

- Biome wraps long string properties onto their own line, which defeats single-line greps. The meta string read by 01-06 is kept short enough to stay on one line.

## Next Phase Readiness

- 01-06 precondition passes: `headlineSource: "Teo, 2026-10-30"` and `pendingFields: []`.
- G7 (01-12) must ask Teo to approve or rewrite both headlines and the Hero UI strings (`heroCopyMeta.status: "draft"`).

## Self-Check: PASSED

- FOUND: src/features/site-settings/fixture.ts, src/lib/i18n-fields.ts, src/lib/format.test.ts, src/lib/i18n-fields.test.ts, src/components/site/status-line.test.tsx, .planning/phases/01-identidad-y-contenido/01-04-ANSWERS.md
- FOUND commits: 15fa750, 3f780da, 98935a8 (ancestors of HEAD)
- `pnpm check` exit 0; vitest TZ=America/Bogota 24 passed, TZ=UTC format 7 passed; `grep -c borrador fixture.ts` = 0
