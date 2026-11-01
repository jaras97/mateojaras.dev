---
phase: 01-identidad-y-contenido
plan: 13
status: skipped
subsystem: content
tags: [skipped, re-scope]
requirements-completed: []
requirements-moved: [IDEN-05, IDEN-06, IDEN-07]
key-files:
  created: []
  modified: []
duration: 0min
completed: 2026-11-01
---

# Phase 1 Plan 13: Aplicar G7 (omitido)

**Plan omitido por decisión de Teo: todo lo que publicaba lo carga él desde el admin en la fase 3.**

## Por qué se omite

01-13 aplicaba la aprobación de G7: marcar como aprobados el contenido, el copy, el fixture y los textos del hero, poner DESIGN.md en APROBADO y commitear las capturas WebP revisadas.

En G7 (01-12-ANSWERS.md) Teo respondió "todo eso lo subo desde admin" y aprobó solo DESIGN.md ("si"). Por eso:

- DESIGN.md ya quedó APROBADO en 01-12 (commit 9eb1f5b).
- Ningún estado de contenido, copy, fixture o hero pasa a aprobado: Teo no los aprobó.
- No se commitea nada de `material/`. Las dos capturas de ManuJ con caras siguen fuera.

Teo eligió el 2026-11-01 mover IDEN-05, IDEN-06 e IDEN-07 a la fase 3 (criterio de éxito 6). Ver `docs/decisions.md` (entrada del 2026-11-01) y ROADMAP.md.

## Lo que queda abierto (fase 3)

- Contenido narrativo, fechas, portadas, media, permisos y URLs de los 4 proyectos (IDEN-05).
- Capturas revisadas por Teo, al menos 3 por proyecto (IDEN-06). Las 7 capturas de ManuJ y EcoExport existen en local, sin revisar.
- Copy final en/es sin borradores, incluidos los bullets de Sofka (IDEN-07).
- Datos abiertos de 01-07: repo que enlaza Finanzas, si inventario-piedras es el inventario, si ManuJ usa Cloudinary.

Siguen registrados como `unmet-truth` en `.planning/WINDOWS.md` (ids 1 a 4).

## Self-Check: PASSED

Ningún archivo de código cambió; el plan no se ejecutó.
