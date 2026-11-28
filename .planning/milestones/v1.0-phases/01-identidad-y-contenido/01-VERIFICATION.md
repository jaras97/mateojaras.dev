---
phase: 01-identidad-y-contenido
verified: 2026-11-01T20:30:00Z
status: passed
score: 4/4 must-haves verified
covered_files:
  - ".planning/phases/01-identidad-y-contenido/01-01-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-01-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-02-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-02-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-03-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-03-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-04-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-04-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-05-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-05-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-06-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-06-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-07-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-07-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-08-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-08-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-09-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-09-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-10-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-10-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-11-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-11-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-12-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-12-SUMMARY.md"
  - ".planning/phases/01-identidad-y-contenido/01-13-PLAN.md"
  - ".planning/phases/01-identidad-y-contenido/01-13-SUMMARY.md"
  - "DESIGN.md"
  - "scripts/check-phase-1.sh"
  - "src/app/fonts.ts"
  - "src/app/globals.css"
  - "src/components/site/hero/hero-a.tsx"
  - "src/components/site/hero/hero-b.tsx"
  - "src/components/site/hero/hero-c.tsx"
  - "src/features/site-settings/fixture.ts"
  - "src/features/site-settings/types.ts"
covered_digest: "v4:sha256:f3030a524c508a352e6298d1ce7eb274fac86e116e534fb29329f0a8bfd3d16c"
behavior_unverified: 0
overrides_applied: 1
overrides:
  - must_have: "DESIGN.md dice APROBADO con las dos frases del concepto escritas por Teo"
    reason: "Las dos frases del concepto las propuso Claude y Teo las aceptó (G6, 'ok' al punto 6) y aprobó DESIGN.md completo en G7 ('si'). Está declarado en docs/decisions.md (2026-11-01, G6), en el comentario de autoría de DESIGN.md §1 y en 01-11-ANSWERS.md. No es un fallo oculto."
    accepted_by: "Teo (G6 '6 ok' y G7 'si', 2026-11-01)"
    accepted_at: "2026-11-01T00:00:00Z"
---

# Phase 1: Identidad y contenido Verification Report

**Phase Goal:** Teo aprueba la identidad del sitio (DESIGN.md, tokens, fuentes, variante del hero) y el repo tiene la base de contenido verificable de los 4 proyectos, sin marcadores ni datos inventados; el contenido narrativo, las capturas y el copy final los carga Teo desde el admin en la fase 3 (re-alcance del 2026-11-01)
**Verified:** 2026-11-01
**Status:** passed
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths (ROADMAP success criteria, post re-scope)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `DESIGN.md` APROBADO con las dos frases del concepto; una página de muestra renderiza tokens OKLCH (claro y oscuro), escala tipográfica y tema shadcn propio con las tres fuentes servidas desde el propio dominio | PASSED (override) | `DESIGN.md:3` "Estado: APROBADO el 2026-11-01 por Teo en G7"; concepto en §1 con comentario de autoría. `src/app/globals.css`: 14 valores `oklch(` en `:root` y `.dark`, alias shadcn, `@theme` con escala `--text-xs..4xl`, `--font-sans/heading/mono`. `src/app/fonts.ts` carga las 3 familias con `next/font/google`, subsets latin + latin-ext, `display: swap`. `.next/static/media/*.woff2` presentes y 0 coincidencias de `fonts.googleapis/gstatic` en `.next/server/app` y `.next/static`. Páginas `/lab` y `/lab/tokens` compilan como estáticas en `pnpm build`. Desviación de autoría "escritas por Teo": ver override y Advertencia W1 |
| 2 | Teo ve las 3 variantes del hero con datos de un fixture que cumple el contrato de `site_settings`, eligió una y consta en `docs/decisions.md` | VERIFIED | `hero-a.tsx`, `hero-b.tsx`, `hero-c.tsx` existen, montadas en `src/app/lab/hero/page.tsx`. `fixture.ts` termina en `satisfies SiteSettings`; `types.ts` coincide campo a campo con `docs/data-model.md` (`site_settings`). `docs/decisions.md:106` "Variante del hero elegida": "variante: a", cita literal de Teo, verificación en `01-09-ANSWERS.md`. `hero.test.tsx` y `status-line.test.tsx` pasan dentro de las 62 pruebas |
| 3 | (Movido a fase 3) Contenido de los 4 proyectos | RE-MAPPED, no se evalúa como cumplido | Ver "Requirements Coverage". `docs/content/` tiene los 4 archivos con la base verificable (ver truth 4) |
| 4 | (Movido a fase 3) `docs/copy.md` sin `[Teo escribe]` | RE-MAPPED, no se evalúa como cumplido | `copy-markers` PASS (no queda ningún `[Teo escribe]`); el copy pendiente/draft lo aprueba Teo en el admin |
| 5 | `assets/fonts-pdf/` con TTF estáticos de las tres familias con glifos latin-ext | VERIFIED | `python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf`: 6 OK (FunnelDisplay Bold y SemiBold 348 glifos, GeistMono Regular 889, HankenGrotesk Regular, Bold e Italic 550). Tres licencias OFL presentes. Gate `pdf-fonts` PASS |
| 6 | Base de contenido verificable de los 4 proyectos, sin marcadores ni datos inventados (parte de la meta que queda en fase 1) | VERIFIED | `docs/content/{centro-estetico-manuj,ecoexport-costa-rica,finanzas-personales,sistema-gestion-inventario}.md` existen (66/65/41/40 líneas) más README de 163 líneas. Cada archivo declara `pendingFields` explícitos, `enStatus: draft-translation`, `metrics: []` donde no hay fuente: nada inventado. `pnpm content:check` 19/19 pasan; gates `content-files`, `content-dashes`, `metric-sources`, `copy-markers`, `decisions` PASS. Grep de `TBD/FIXME/XXX/[Teo escribe]/lorem` en `docs src scripts DESIGN.md messages`: sin coincidencias (solo texto citado en `decisions.md:93`) |

**Score:** 4/4 must-haves de fase 1 verificados (criterios 1, 2, 5 y la base de contenido de la meta). Los criterios 3 y 4 pasaron a la fase 3 y no cuentan. 0 verdades con comportamiento sin verificar.

### Deferred Items

Los criterios 3 y 4 del ROADMAP original (IDEN-05, IDEN-06, IDEN-07) los cubre explícitamente la fase 3.

| # | Item | Addressed In | Evidence |
|---|------|--------------|----------|
| 1 | Contenido narrativo de los 4 proyectos en en/es (IDEN-05) | Phase 3 | ROADMAP fase 3, criterio 6: "El contenido de los 4 proyectos (IDEN-05) ... cargados y aprobados por Teo desde el admin"; línea 95 lista IDEN-05 |
| 2 | 3 capturas 16:10 por proyecto revisadas por Teo (IDEN-06) | Phase 3 | ROADMAP fase 3, criterio 6 (IDEN-06) |
| 3 | Copy final en/es sin marcadores ni borradores, bullets de Sofka incluidos (IDEN-07) | Phase 3 | ROADMAP fase 3, criterio 6 (IDEN-07) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| IDEN-01 | 01-11, 01-12 | DESIGN.md APROBADO con las dos frases del concepto "escritas por Teo" | SATISFIED (con desviación declarada) | DESIGN.md APROBADO; frases propuestas por Claude y aceptadas por Teo, registrado en `decisions.md` 2026-11-01. REQUIREMENTS.md `[x]`, tabla "Complete" |
| IDEN-02 | 01-01, 01-02 | Tokens OKLCH claro/oscuro, escala tipográfica y tema shadcn en `globals.css` | SATISFIED | `globals.css` verificado arriba; `/lab/tokens` compila |
| IDEN-03 | 01-01, 01-03 | Tres fuentes self-hosted con `next/font` (latin + latin-ext) y TTF estáticos en `assets/fonts-pdf/` | SATISFIED | `fonts.ts`, `.next/static/media`, 6 TTF verificados |
| IDEN-04 | 01-04, 01-06, 01-09 | 3 variantes del hero tipadas contra `site_settings`; Teo elige una | SATISFIED | variantes A/B/C, fixture `satisfies SiteSettings`, elección A en `decisions.md:106` |
| IDEN-05 | (fase 3) | Contenido de los 4 proyectos (en/es) | RE-MAPPED a fase 3 | REQUIREMENTS.md línea 16 `[ ]` y tabla "Phase 3 / Pending"; ROADMAP fase 3 líneas 95 y 102; `decisions.md:148` |
| IDEN-06 | (fase 3) | 3 capturas 16:10 por proyecto | RE-MAPPED a fase 3 | idem (REQUIREMENTS línea 17 y tabla) |
| IDEN-07 | (fase 3) | `docs/copy.md` sin marcadores, escrito por Teo en en/es | RE-MAPPED a fase 3 | idem (REQUIREMENTS línea 18 y tabla). ROADMAP resumen: "IDEN-05 a IDEN-07" en fase 3 (21 requisitos) |

Sin requisitos huérfanos: los 7 IDEN están en el plan o en el re-mapeo. Los cuatro de fase 1 están `[x]` y los tres de fase 3 `[ ]` Pending, de forma coherente con ROADMAP.

### Gate script `scripts/check-phase-1.sh --final`

Resultado: 14 passed, 10 failed (nombres distintos), 22 líneas FAIL; sale con código no cero, como se esperaba. Mapeo de cada FAIL:

| FAIL | Mapea a | Origen |
|------|---------|--------|
| `copy-pending` (bullets de Sofka) | IDEN-07 | copy aplazado a admin |
| `content-media` x2, `content-complete` x4 | IDEN-05 | narrativa, fechas, portada, media, permisos y URLs aplazados |
| `material` x2, `material-committed` x4 | IDEN-06 | capturas no se versionan; Teo las sube desde el admin |
| `content-approved` x5, `copy-approved`, `herocopy-approved`, `fixture-approved` | IDEN-05 / IDEN-07 | estados `draft-translation`/`draft` sin aprobar; son traducciones y copy del hero, no la elección de variante |
| `g7-option` | Consecuencia del aplazamiento en G7 | Teo no escribió la línea "opción:"; era el mecanismo para aprobar el contenido aplazado |

Ningún FAIL toca IDEN-01 a IDEN-04: `design-approved`, `design-mechanics`, `pdf-fonts`, `g1-record`, `legitimacy-record`, `decisions` están en PASS.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Gate completo de calidad | `pnpm check` (typecheck + biome + vitest + next build) | EXIT=0; 44 archivos biome limpios; 62/62 pruebas en 6 archivos; build Next 16.4.3 con rutas `/`, `/lab`, `/lab/hero`, `/lab/tokens` | PASS |
| Contrato de contenido | `pnpm content:check` | 19/19 | PASS |
| TTF del PDF | `verify-pdf-fonts.py assets/fonts-pdf/*.ttf` | 6 OK | PASS |

### Probe Execution

Step 7c: la fase no declara probes `probe-*.sh`. SKIPPED.

### Anti-Patterns Found

Sin marcadores de deuda (`TBD/FIXME/XXX`) ni lorem en archivos de la fase. Advertencias de `01-REVIEW.md` (0 críticas, 10 advertencias; consultivas, ninguna invalida un criterio de fase 1):

| Ref | Severidad | Impacto |
|-----|-----------|---------|
| WR-01 `hero-parts.tsx` CTA con `role="button"` | Advertencia | Se heredará en `/` en fase 2 si no se corrige; afecta WCAG 4.1.2 |
| WR-10 `format.ts`/`status-line.tsx` lanzan con timezone o fecha inválidos | Advertencia | Riesgo cuando el admin edite esos campos (fases 2-3) |
| WR-02, 03, 04 (`localized()` laxo, `isoDate`, `pendingFields`) | Advertencia | Robustez del contrato; fase 2 |
| WR-05, 06, 07 (scripts de captura) | Advertencia | Solo herramientas locales |
| WR-08, 09 (gates `fixture-approved`, `pdf-fonts` parciales) | Advertencia | Los gates son más laxos de lo que dicen; el TTF lo comprobé a mano (6 OK) |

### Human Verification Required

Ninguna pendiente para el cierre de la fase 1. La revisión visual de `/lab` y `/lab/tokens` (24 capturas y axe de 01-08) y la aprobación de DESIGN.md con variante A ya las dio Teo (G3 y G7). No rendericé el sitio en navegador en esta verificación.

### Gaps Summary

No hay brechas bloqueantes. La meta re-alcanzada de la fase 1 se cumple: identidad aprobada (DESIGN.md APROBADO, tokens, fuentes self-hosted, variante A elegida y registrada) y base de contenido honesta de los 4 proyectos (pendientes declarados, sin datos inventados). Los fallos del gate final corresponden uno a uno a IDEN-05/06/07, que están correctamente re-mapeados a la fase 3 en ROADMAP.md, REQUIREMENTS.md y `docs/decisions.md`; el plan 01-13 se omitió por decisión documentada.

Advertencias no bloqueantes:

- **W1 (redacción):** ROADMAP criterio 1 y REQUIREMENTS IDEN-01 siguen diciendo "las dos frases del concepto escritas por Teo", pero las escribió Claude y Teo las aceptó. Está declarado en `decisions.md`, DESIGN.md y `01-11-ANSWERS.md`, por eso se acepta como override. Conviene ajustar el texto de ROADMAP/REQUIREMENTS a "aceptadas por Teo" (requiere su visto bueno) para que el contrato no mienta.
- **W2:** `.planning/ROADMAP.md` muestra "12/13 plans executed" y las casillas de fase 1 sin marcar; cerrar al completar la fase.
- **W3:** WR-01 y WR-10 del code review deberían entrar como tareas en el inicio de la fase 2 antes de que el hero llegue a `/`.
- **W4:** `/lab` y las variantes B/C se borran al empezar la fase 2 (`decisions.md:120`); no se pierde nada requerido.

---

_Verified: 2026-11-01_
_Verifier: Claude (gsd-verifier)_
