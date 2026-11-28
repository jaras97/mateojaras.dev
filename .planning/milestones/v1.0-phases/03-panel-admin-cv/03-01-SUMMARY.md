---
phase: 03-panel-admin-cv
plan: 01
subsystem: ui
tags: [shadcn, sonner, unpdf, next-intl, messages, decisions]

requires:
  - phase: 02-base-tecnica
    provides: shadcn base-nova primitives, messages parity test, decisions log
provides:
  - Teo's phase-start approvals (03-01-ANSWERS.md, Lectura A..I)
  - sonner 2.0.8 and unpdf 2.1.0 pinned exact, no next-themes
  - 19 shadcn primitives plus hand-written Toaster, destructive button variant, --destructive and stronger --input tokens
  - Every admin, DraftMode and Cv string in es and en with key parity
  - Phase 3 start decisions in docs/decisions.md
affects: [03-02, 03-03, 03-04, 03-07, 03-11, 03-13]

tech-stack:
  added: [sonner@2.0.8, unpdf@2.1.0 (dev)]
  patterns: [admin strings centralized in messages/*.json before the screens, shadcn output normalized to repo conventions (no backdrop-blur, motion-safe transitions)]

key-files:
  created: [.planning/phases/03-panel-admin-cv/03-01-ANSWERS.md, src/components/ui/sonner.tsx, "src/components/ui/{alert-dialog,badge,checkbox,dialog,dropdown-menu,empty,field,kbd,native-select,popover,progress,select,separator,sheet,skeleton,switch,table,textarea,tooltip}.tsx"]
  modified: [package.json, pnpm-lock.yaml, src/app/globals.css, src/components/ui/button.tsx, src/components/ui/label.tsx, "src/app/admin/(panel)/page.tsx", src/app/admin/login/page.tsx, messages/es.json, messages/en.json, docs/decisions.md]

key-decisions:
  - "Teo delegated all recommended options: A verificado, B si, C si, D a, E si, F si, G si, H luego, I produccion"
  - "sonner installed by hand with a hand-written Toaster to avoid next-themes"

requirements-completed: [ADMN-01]

duration: 25min
completed: 2026-11-16
---

# Phase 3 Plan 01: Approvals, primitives and admin strings Summary

**Phase-3 approvals recorded, sonner/unpdf pinned, 19 shadcn primitives themed, and the full admin/DraftMode/Cv copy contract in es and en with parity.**

## Accomplishments
- Task 1: Teo's delegated answers stored verbatim with a nine-line Lectura and `versiones: sonner=2.0.8 unpdf=2.1.0`.
- Task 2: packages installed exact, primitives generated without overwriting button/input/label, `--destructive` (light and dark) and `--input` tokens, destructive Button variant, static skeleton, semibold Label, `font-display` replaced by `font-heading tracking-display`, 12 decision entries.
- Task 3: `Admin.{nav,panel.status,common,form,projects,settings,experience,skills,education,images,richText,dnd,toasts,errors,confirm,cv,messages}`, `DraftMode`, `Cv` (+ `levels`, `skillCategories`) in both locales; no em-dashes, emojis or exclamation marks.

## Task Commits
1. Task 1: 73ddbfe docs(03): record Teo's phase-start answers
2. Task 2: e97cb38 chore(deps): install phase 3 approvals and admin primitives
3. Task 3: f09e60b feat(admin): add admin, draft mode and CV strings

## Deviations from Plan

**1. [Rule 1 - Convention] Generated shadcn files normalized.** Removed `backdrop-blur` (glassmorphism banned) from dialog, alert-dialog and sheet; added `motion-safe:` to transitions in switch, checkbox and progress. Fixed biome errors in field.tsx (`===`, stable key, biome-ignore for role="group"). Ran `biome --write` over generated files.

**2. [Rule 3] shadcn prompts.** The CLI asked to overwrite label/button; answered no with `yes n`. Button and label were then edited by hand as planned. input.tsx untouched.

Otherwise the plan ran as written. The en `panel.title` stayed "Admin" (existing value); only `nav.panel` is "Dashboard".

## Issues Encountered
None blocking. `pnpm check` passes.

## Known Stubs
None. Strings are copy only; later plans consume them.

## Next
Item H is `luego`: Teo must create the Vercel Blob store (Public) and paste `BLOB_READ_WRITE_TOKEN` into `.env.local` and Vercel before 03-07/03-11 can upload. Code stays behind the env check.

## Self-Check: PASSED
Commits 73ddbfe, e97cb38, f09e60b exist; ANSWERS, SUMMARY, sonner.tsx and popover.tsx exist.
