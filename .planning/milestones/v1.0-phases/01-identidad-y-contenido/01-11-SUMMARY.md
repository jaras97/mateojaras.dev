---
phase: 01-identidad-y-contenido
plan: 11
subsystem: identity-copy
tags: [copy, design-md, decisions, hero, g3, g6, authorship]
status: complete

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-04 G2 headline and heroCopy draft; 01-08 hero variants and /lab; 01-09 G3 answers (variante a, P1/P2/P3/P5, findings)"
provides:
  - "docs/decisions.md: variant A, P1/P2/P3/P5 answers, /lab deletion timing (start of phase 2), lab findings, G6 copy provenance"
  - "docs/copy.md restructured (D-09) with hero, about, now, freelance experience, contact and footer filled; English marked draft-translation"
  - "DESIGN.md §1 concept sentences (Claude proposal accepted by Teo); §4 example corrected to '01 Work'; status still PROPUESTA"
  - ".planning/phases/01-identidad-y-contenido/01-11-ANSWERS.md: Teo's G6 reply verbatim plus the proposals he was shown"
affects: [01-12 G7 (approves every Claude-drafted block in docs/copy.md and DESIGN.md §1, and collects the Sofka bullets if Teo does not leave them for the admin), 01-13 (DESIGN.md to APROBADO, removes draft markers), phase 2 (deletes /lab, hero-b, hero-c; seeds copy), phase 3 admin (Sofka bullets)]

actuals:
  tokens: 6100
  tasks: 3
  commits: 3
plan_head_before: 355e724846e78c0f58c06cc586f4b69f3abe5c69
plan_head_after: 8ba89e63e2eb1c6e783232115829baa9713439e6

tech-stack:
  added: []
  patterns:
    - "Inline authorship comment (<!-- autoría: ... -->) next to every block Claude drafted and Teo chose"
    - "A deferred block is written as an explicit 'Pendiente' line with Teo's literal reason, never as invented text"

key-files:
  created:
    - .planning/phases/01-identidad-y-contenido/01-11-ANSWERS.md
  modified:
    - docs/decisions.md
    - docs/copy.md
    - DESIGN.md
    - src/app/lab/_components/specimens.tsx
    - src/features/site-settings/fixture.ts

key-decisions:
  - "Hero variant A chosen by Teo at G3 (verbatim 'variante: a'), logged with P1 mantener, P2, P3 sin respuesta and P5 corregir"
  - "/lab and variants B and C are deleted in the first task of phase 2, so /lab/tokens stays up for the phase 1 verification"
  - "G6 copy and the DESIGN.md §1 concept are Claude proposals that Teo asked for and accepted item by item ('1 ok · 2 ok · 3 freelance ok ... · 4 ok · 5 ok · 6 ok'); authorship is disclosed inline and in docs/decisions.md"
  - "Sofka Technologies bullets stay pending ('Sofka pendiente'); Teo writes them from the admin; no text was proposed or invented"

requirements-completed: [IDEN-04]
requirements-advanced: [IDEN-01, IDEN-07]  # both close in 01-12 (G7) / 01-13

metrics:
  duration: "Task 1 on 2026-10-30; G6 wait; Task 2 and 3 on 2026-11-01 (about 10 min of active continuation)"
  completed: 2026-11-01
---

# Phase 1 Plan 11: Identity loop closed (variant A logged, copy and concept transcribed) Summary

Teo's G3 answers are applied and logged (variant A, P1 mantener, P2 short headline, P5 "01 Work", focusable contrast table). docs/copy.md now holds hero, about, now, freelance experience, contact and footer in Spanish with English drafts marked, and DESIGN.md §1 holds the two concept sentences. Except for the G2/G3 headline, all of that text is Claude's proposal, which Teo asked for and accepted at G6, and it says so wherever the text lives.

## Respuestas de Teo

G6, copied from `.planning/phases/01-identidad-y-contenido/01-11-ANSWERS.md` (Fecha: 2026-11-01):

> 1 ok · 2 ok · 3 freelance ok, el inventario sí fue freelance; Sofka pendiente · 4 ok · 5 ok · 6 ok

Each "ok" accepts the Claude proposal with the same number, as listed under "## Contexto mostrado a Teo" in the ANSWERS file. Item 3 also confirms that the inventory system was freelance work. The Sofka bullets were not proposed and stay pending.

G3 (from 01-09-ANSWERS.md, applied in Task 1): `variante: a · P1 mantener · P2 apruebo las cadenas, CTA se queda, headline: la versión corta · P5 corregir · hallazgos: tabla de contraste enfocable; el resto a la fase 4`.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Tracer: Teo's G3 answers applied and logged | 421628c | docs/decisions.md, DESIGN.md, docs/copy.md, src/app/lab/_components/specimens.tsx, src/features/site-settings/fixture.ts |
| 2 | G6: Teo's reply recorded verbatim (alone) | 9350878 | .planning/phases/01-identidad-y-contenido/01-11-ANSWERS.md |
| 3 | Copy and concept transcribed | 8ba89e6 | docs/copy.md, DESIGN.md, docs/decisions.md |

## What was transcribed (Task 3)

Each block below is "propuesta de Claude, aceptada por Teo" (G6, 2026-11-01). Every block carries an `<!-- autoría: ... -->` comment, and docs/decisions.md has the entry "Copy del sitio y concepto de DESIGN.md: propuestas de Claude aceptadas por Teo (G6)".

| Block | Where | Teo's answer | English |
| ----- | ----- | ------------ | ------- |
| About (includes "contratista independiente", D-12) | docs/copy.md | 1 ok | Claude translation, `draft-translation` |
| Now | docs/copy.md | 2 ok | Claude translation, `draft-translation` |
| Freelance bullets: ManuJ, EcoExport, inventario | docs/copy.md | 3 freelance ok, inventario sí fue freelance | Claude translation, one `draft-translation` marker per bullet |
| Sofka bullets | docs/copy.md | Sofka pendiente | none (explicit "Pendiente" line) |
| Contact intro (fields, button, success unchanged) | docs/copy.md | 4 ok | Claude translation, `draft-translation` |
| Footer (unchanged) | docs/copy.md | 5 ok | n/a (single line) |
| Concept, two sentences | DESIGN.md §1 blockquote | 6 ok | n/a (DESIGN.md is in Spanish) |

**Grammar fixes:** none. The Spanish in docs/copy.md and DESIGN.md §1 matches the proposals in 01-11-ANSWERS.md byte for byte (checked by script).

**English choices worth reviewing at G7:** "células ágiles" became "agile teams"; "me ayuda a avanzar" became "it helps me make progress"; "alguien que decida del otro lado" became "someone on the other side who makes the decisions"; "fichas en PDF" became "PDF spec sheets". Digits match in both languages (2021, 2025, Next.js 16, UTC-5).

**Length:** the Spanish About is 116 words (English 126). docs/copy.md's 120–180 guidance is not a gate (plan edge_coverage). Teo accepted the text at that length.

## IDEN-01 / IDEN-07 authorship disclosure

The plan's truth "DESIGN.md §1 holds Teo's two concept sentences verbatim; Claude proposed no wording (IDEN-01)", its prohibition "Claude writes no copy and no concept sentence", and IDEN-07's "escritos por Teo" no longer hold literally. Teo asked for proposals instead of writing, and he chose each one explicitly. That disclosed choice replaces the literal truth. It is recorded in 01-11-ANSWERS.md, in docs/decisions.md and in the inline authorship comments, so none of this text is presented as Teo's own writing. IDEN-01 and IDEN-07 are **not** marked complete: 01-12 (G7 approval of the whole set, en and es) and 01-13 (DESIGN.md to APROBADO, draft markers removed) own them. At G7 Teo can still rewrite any block in his own words.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] fixture.ts edited for the short headline (Task 1)**
- **Found during:** Task 1
- **Issue:** P2 "headline: la versión corta" changes the headline, and the headline lives in `src/features/site-settings/fixture.ts`, which the Task 1 file list does not name (the docs/copy.md key link points to it).
- **Fix:** the short headline ES/EN went into fixture.ts. `headlineEsStatus` stays draft and `headlineEnStatus` stays draft-translation.
- **Commit:** 421628c

**2. [Rule 1 - Lint] `<section aria-label tabIndex={0}>` instead of `role="region"` (Task 1)**
- **Found during:** Task 1 (the focusable contrast table finding)
- **Issue:** Biome's a11y rules reject `role="region"` on a div and ask for the native element.
- **Fix:** a named `<section>`, which has the implicit `region` role, with `tabIndex={0}`. It gives the same axe outcome.
- **Commit:** 421628c

### Process deviations

**3. G6 answered with accepted proposals, not Teo's own wording (Task 2/3)**
- The plan expected Teo to write the text and Claude to propose none. Teo asked for recommendations, and the orchestrator showed him one proposal per item. This is disclosed above and logged in docs/decisions.md.

**4. Sofka bullets left as an explicit pending line (Task 3)**
- Teo answered "Sofka pendiente". The bullet-count instruction became "Pendiente: Teo escribe estos bullets desde el admin ... no hay texto propuesto ni inventado." Task 3's verify passes, because its grep looks only for the old marker forms. But success criterion 4 ("docs/copy.md has no marker") is not really met for Sofka: the line is still a pending marker. It is in the broken-windows ledger as an unmet truth, so G7 or the admin has to close it.

## Known Stubs

| File | Line | Reason |
| ---- | ---- | ------ |
| docs/copy.md | Sofka Technologies section ("Pendiente: ...") | Teo deferred the Sofka bullets to the admin at G6. Not invented. Closes at G7 (01-12) or in the phase 3 admin |

## Threat Flags

None. These are documentation-only changes; the threat model's T-01-19 and T-01-20 mitigations hold: provenance is logged, the English is marked draft, DESIGN.md is edited only in §1 and §4 and still says PROPUESTA.

## Verification

- Task 1 verify: passed at 421628c (variant entry, Proyectos gone, no `[ejemplo`, zero U+2014 in copy.md, `Estado: PROPUESTA`).
- Task 3 verify: passed (no bracket markers, no `> [`, no `EN/ES bullets`, zero U+2014, concept placeholder gone, "contratista independiente" present). `Estado: PROPUESTA` count 1; 7 `enStatus: draft-translation` markers; no emoji.
- `pnpm check` (typecheck + lint + test + build): exit 0 after Task 3.

## Self-Check: PASSED
