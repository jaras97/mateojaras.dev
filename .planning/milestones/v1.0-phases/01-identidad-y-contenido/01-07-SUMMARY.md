---
phase: 01-identidad-y-contenido
plan: 07
subsystem: content
tags: [content, interview, g4, docs-content, pending-fields]
status: complete

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-05 docs/content contract (content-schema.ts, content-file.ts, pnpm content:check) and README; 01-06 hero variants shown before the interview"
provides:
  - "docs/content/centro-estetico-manuj.md, ecoexport-costa-rica.md, sistema-gestion-inventario.md, finanzas-personales.md: contract-valid skeletons with verifiable facts only and explicit pendingFields"
  - ".planning/phases/01-identidad-y-contenido/01-07-ANSWERS.md: Teo's G4 reply verbatim, the pre-fill he was shown and the reading of G4"
  - "docs/decisions.md entry: G4 delegated to admin editing (phase 3), IDEN-05 narrative stays open"
affects: [01-10 captures (no views or covers given), 01-12 G7 (pendingFields to ask), phase 2 seed (files load but narrative is empty), phase 3 admin (Teo fills the narrative there)]

actuals:
  tokens: 4400
  tasks: 3
  commits: 3
plan_head_before: 9bc191ecd9699516854314888400206c62a317a8
plan_head_after: aa44dec8b2b0d719d8f1aebabcb0d0e65fb4c549

tech-stack:
  added: []
  patterns:
    - "A delegated answer ('rellena con info de prueba') is honored with verifiable facts plus pendingFields, never with invented prose or numbers"

key-files:
  created:
    - .planning/phases/01-identidad-y-contenido/01-07-ANSWERS.md
    - docs/content/centro-estetico-manuj.md
    - docs/content/ecoexport-costa-rica.md
    - docs/content/sistema-gestion-inventario.md
    - docs/content/finanzas-personales.md
  modified:
    - docs/decisions.md

key-decisions:
  - "G4 delegated to admin editing: Teo will fill or replace the content from the admin (phase 3); the files carry only verifiable facts and every narrative field he did not give is in pendingFields"
  - "Slugs centro-estetico-manuj, ecoexport-costa-rica, sistema-gestion-inventario, finanzas-personales accepted by delegation and fixed from now on"
  - "metrics: [] in all four files; no figure without a source given by Teo"
  - "ManuJ stack follows its repo (no Cloudinary), and Cloudinary is left out of its solution list too, so the file does not contradict the repo"
  - "Inventory and finance: clientPermission, liveUrl and repoUrl pending (Teo gave no sí/no and did not confirm which repo or site is the project)"

patterns-established:
  - "When Teo delegates content, provenance stays interview-YYYY-MM-DD and the ANSWERS file records exactly what he was shown"

requirements-completed: []
requirements-advanced: [IDEN-05]  # stays Pending: the narrative half is open until Teo fills it (admin, phase 3, or G7)

duration: 10min
completed: 2026-10-30
---

# Phase 1 Plan 07: Contenido de proyectos (G4) Summary

**Four contract-valid docs/content files built only from verifiable facts (names, repo stacks, URLs, D-12 permission, D-14 sample data) after Teo delegated G4 to admin editing; all narrative fields stay in pendingFields and IDEN-05 remains open.**

## Performance

- Duration: about 10 min (continuation after the G4 checkpoint)
- Completed: 2026-10-30
- Tasks: 3 (Task 1 resolved by Teo's delegation; Tasks 2 and 3 written)
- Files: 5 created, 1 modified

## Respuestas de Teo

Teo answered G4 once for the four projects, on 2026-10-30, verbatim in `.planning/phases/01-identidad-y-contenido/01-07-ANSWERS.md`:

> pero se supone que en el admin se pueden modificar toda esta info, rellena con info de prueba que luego desde admin actualizo todo

| Proyecto | ¿Respondió? | Origen de cada dato |
|---|---|---|
| ManuJ (`centro-estetico-manuj`) | Delegó (sin respuestas a los puntos 1 a 10) | Nombre: PROJECT.md. Solución: docs/copy.md sin Cloudinary. Stack: `package.json` del repo. liveUrl: PROJECT.md. repoUrl: `gh repo view` (público). clientPermission `true`: D-12 (Teo no lo cambió en G4). |
| EcoExport (`ecoexport-costa-rica`) | Delegó | Nombre y solución: PROJECT.md. Stack: `package.json` del repo. liveUrl: PROJECT.md. repoUrl: `gh repo view` (público). clientPermission `true`: D-12. |
| Inventario (`sistema-gestion-inventario`) | Delegó | Nombre y solución (roles, reportes) y stack (Next.js, PostgreSQL): PROJECT.md. sampleData `true`: D-14. Permiso y URLs: pendientes. |
| Finanzas (`finanzas-personales`) | Delegó | Nombre: PROJECT.md. Stack: `package.json` de finanzas-personal-frontend y `requirements.txt` de finanzas-personales-backend (públicos). sampleData `true`: D-14. Permiso, URLs y solución: pendientes. |

Preguntas pendientes por proyecto: en los cuatro, los puntos 1 (tagline), 2 (problema), 3 (rol), 5 (resultados), 6 (decisiones técnicas), 8 (fechas) y 10 (vistas, portada, datos personales). En inventario y finanzas además 7 (URLs) y 9 (permiso). En finanzas además 4 (solución). El punto 0 (slug) quedó aceptado por delegación.

## Correcciones de gramática

None. No hay texto de Teo que corregir. Los elementos de solución son los de PROJECT.md y docs/copy.md con mayúscula inicial, en lista; el inglés es su traducción literal (`enStatus: draft-translation`).

## Vistas para 01-10

Teo no dio vistas, portada ni avisos de datos personales en G4. No hay líneas de vista; los faltantes están en "Campos pendientes". Tampoco dijo nada sobre cómo levantar en local el inventario y la app de finanzas (D-14): se le pide en 01-10.

## Campos pendientes

pendingFields por archivo (para que 01-12 los pida en G7, o Teo los llene desde el admin en la fase 3):

- centro-estetico-manuj: taglineEs, taglineEn, problemEs, problemEn, roleEs, roleEn, resultsEs, resultsEn, techDecisionsEs, techDecisionsEn, startedAt, finishedAt
- ecoexport-costa-rica: taglineEs, taglineEn, problemEs, problemEn, roleEs, roleEn, resultsEs, resultsEn, techDecisionsEs, techDecisionsEn, startedAt, finishedAt
- sistema-gestion-inventario: clientPermission, taglineEs, taglineEn, problemEs, problemEn, roleEs, roleEn, resultsEs, resultsEn, techDecisionsEs, techDecisionsEn, liveUrl, repoUrl, startedAt, finishedAt
- finanzas-personales: clientPermission, taglineEs, taglineEn, problemEs, problemEn, roleEs, roleEn, solutionEs, solutionEn, resultsEs, resultsEn, techDecisionsEs, techDecisionsEn, liveUrl, repoUrl, startedAt, finishedAt

Vistas y portada (D-13):

- centro-estetico-manuj: faltan 3 vistas
- centro-estetico-manuj: portada
- ecoexport-costa-rica: faltan 3 vistas
- ecoexport-costa-rica: portada
- sistema-gestion-inventario: faltan 3 vistas
- sistema-gestion-inventario: portada
- finanzas-personales: faltan 3 vistas
- finanzas-personales: portada

Para G7: clientPermission de inventario y finanzas necesita el sí o no de Teo; mientras no lo dé, sus capturas solo se publican con "liberar:" archivo por archivo (01-12). Teo también debe decir cuál repo enlaza finanzas (frontend, backend o ambos; el contrato solo admite un `repoUrl`) y si inventario-piedras es el sistema de inventario. Conviene confirmar si ManuJ usa Cloudinary (PROJECT.md lo dice, el repo no).

## Task Commits

1. Task 1: G4, respuestas de Teo: `63f7f6e` (docs(01): record Teo's G4 answers)
2. Task 2: tracer ManuJ y EcoExport: `ccb2a2d` (docs(content): add ManuJ and EcoExport case study content)
3. Task 3: inventario y finanzas, más el registro en docs/decisions.md: `aa44dec` (docs(content): add inventory and finance case study content)

## Deviations from Plan

### Instrucción del orquestador ante la delegación de Teo

**1. G4 delegado: archivos con hechos verificables y pendingFields en vez de respuestas transcritas**
- Found during: Task 1 (resume)
- Issue: Teo pidió "info de prueba" en vez de responder. El plan transcribe solo respuestas de Teo; CLAUDE.md prohíbe inventar proyectos, lorem ipsum y cifras sin fuente.
- Fix: según la decisión del orquestador, los archivos llevan solo datos de los repos y de los documentos del proyecto; todo lo narrativo va a pendingFields. Registrado en docs/decisions.md.
- Files: los cuatro de docs/content, 01-07-ANSWERS.md, docs/decisions.md

**2. Finanzas sin repoUrl (criterio de aceptación de Task 3 sin cumplir)**
- Issue: el plan pide un `repoUrl` no nulo para finanzas (D-12). Hay dos repos públicos (frontend y backend) y Teo no dijo cuál enlazar.
- Fix: `repoUrl` omitido y en pendingFields, por instrucción del orquestador. Se resuelve en G7 o desde el admin.

**3. Inventario con stack de PROJECT.md**
- Issue: no está confirmado que jaras97/inventario-piedras sea este proyecto.
- Fix: stack solo con lo que dice PROJECT.md (Next.js, PostgreSQL); sin URLs.

**4. Solución de ManuJ sin Cloudinary**
- Issue: docs/copy.md lista Cloudinary pero el repo no lo usa.
- Fix: el orquestador pidió quitarlo del stack; también se dejó fuera de la solución para no contradecir el repo. Pendiente de confirmar con Teo.

Total: 4 desviaciones, todas por instrucción del orquestador o por no inventar datos. Impacto: IDEN-05 queda abierto en su parte narrativa; el contrato y `pnpm check` siguen en verde.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- El seed de la fase 2 puede cargar los cuatro archivos, pero ninguno tiene la narrativa completa (problema, rol, resultados, decisiones). La fase 3 (admin) es donde Teo la escribe, según su respuesta.
- 01-10 no tiene vistas ni portada de Teo: tiene que pedírselas (D-13) antes de capturar.

## Known Stubs

None. Los campos vacíos no son stubs: el archivo no los lleva y pendingFields los nombra.

## Verification

- `CONTENT_MIN_FILES=4 pnpm content:check`: 19 tests pasan con los cuatro archivos.
- `pnpm check` (typecheck, lint, test, build): exit 0.
- 4 archivos de proyecto, 2 con `sampleData: true`, ningún U+2014 en docs/content.

## Self-Check: PASSED

All five created files exist; commits 63f7f6e, ccb2a2d and aa44dec are ancestors of HEAD.
