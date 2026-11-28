---
phase: 01-identidad-y-contenido
plan: 10
subsystem: content
tags: [content, captures, playwright, material, webp, pending-fields]
status: complete

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-05 docs/content contract (media, coverImage, altStatus); 01-07 content files and fixed slugs; 01-08 scripts/capture-lab.ts (main-checkout resolution)"
provides:
  - "scripts/capture-material.ts: re-runnable capture of registered views to a 2880x1800 PNG and a 1600x1000 WebP per view, under <main-checkout>/material/<slug>/"
  - "material/centro-estetico-manuj/ (3 views) and material/ecoexport-costa-rica/ (4 views), PNG + WebP, git-ignored until 01-13"
  - "media, provisional coverImage and altStatus: draft in the ManuJ and EcoExport content files; media and coverImage in pendingFields of all four"
  - "Personal-data list for G7 (below, machine-readable for scripts/check-phase-1.sh)"
affects: [01-12 G7 (review every capture, the personal-data list, the provisional covers, the views and G5 for the sample apps), 01-13 (commits only the WebP Teo clears), phase 3 Blob upload]

actuals:
  tokens: 4300
  tasks: 1
  commits: 2
plan_head_before: 5ba3bd159caf204562346bc0555ff0367c51562e
plan_head_after: b54f7249afdf7455d568a80bf4505c051cfe18b0

tech-stack:
  added: []
  patterns:
    - "PNG to WebP with Chromium's canvas inside the same Playwright run (no image dependency)"
    - "A provisional value chosen by Claude stays listed in pendingFields until Teo confirms it"

key-files:
  created:
    - scripts/capture-material.ts
  modified:
    - docs/content/centro-estetico-manuj.md
    - docs/content/ecoexport-costa-rica.md
    - docs/content/sistema-gestion-inventario.md
    - docs/content/finanzas-personales.md
    - docs/decisions.md

key-decisions:
  - "Live-site views chosen by Claude after Teo's G4 delegation (orchestrator instruction): ManuJ inicio, galeria, reservar; EcoExport inicio, nosotros, productos, inicio-en; media stays in pendingFields until Teo confirms them at G7"
  - "Provisional cover 01-inicio.webp for ManuJ and EcoExport, with coverImage kept in pendingFields so G7 asks Teo"
  - "Inventory and finance not captured: permission unknown and only Teo can start them with sample data; media and coverImage pending, G5 still open"
  - "The floating WhatsApp button is not hidden: Teo did not ask for it"

requirements-completed: []
requirements-advanced: [IDEN-06]  # live half done on disk; the sample-data apps and Teo's G7 review keep it open

duration: 3min
completed: 2026-10-30
---

# Phase 1 Plan 10: Capturas de material Summary

**Playwright capture script (1440x900 at 2x to PNG plus a 1600x1000 WebP through Chromium's canvas) that produced 3 ManuJ and 4 EcoExport views on disk with draft alt text; the views and covers are Claude's provisional picks after Teo delegated G4, and the inventory and finance captures stay pending until Teo starts those apps (G5).**

## Performance

- Duration: about 3 min of wall clock between the first and last commit (captures included)
- Started: 2026-10-30T23:09:45Z
- Completed: 2026-10-30T23:12:44Z
- Tasks: 1 of 3 executed (Task 1). Task 2 (G5, blocking-human) and Task 3 (sample-data captures) deferred by orchestrator instruction
- Files: 1 created, 5 modified (plus 14 git-ignored files under material/)

## Respuestas de Teo (G5)

No hay. G5 no se le preguntó a Teo en este plan: el orquestador indicó no interrumpirlo por el inventario y la app de finanzas, porque su permiso es desconocido y levantarlas en local requiere pasos que solo él conoce. No se creó `01-10-ANSWERS.md` (no hay respuesta que copiar). URLs base y vistas confirmadas: ninguna.

## Vistas capturadas (elegidas por Claude, pendientes de Teo)

Teo no dio vistas en G4 (01-07-SUMMARY.md, "Vistas para 01-10" vacía). Por instrucción del orquestador, Claude eligió páginas públicas representativas. Ninguna de estas líneas es de Teo; G7 las confirma, cambia o quita:

- centro-estetico-manuj | 01-inicio | / | portada provisional
- centro-estetico-manuj | 02-galeria | /galeria
- centro-estetico-manuj | 03-reservar | /reservar
- ecoexport-costa-rica | 01-inicio | /es | portada provisional
- ecoexport-costa-rica | 02-nosotros | /es#nosotros
- ecoexport-costa-rica | 03-productos | /es#productos
- ecoexport-costa-rica | 04-inicio-en | /en

Preparación por sitio: ManuJ cierra el diálogo promocional (Escape y, si sigue, "Cerrar") y pone el carrusel en el slide 1. EcoExport se captura en `www` directamente (sin el 308) y las secciones se desplazan sin scroll suave, esperando 2,5 s a que terminen sus animaciones de entrada (no respetan reduced motion). El botón flotante de WhatsApp no se oculta en ninguno de los dos.

## Posibles datos personales

- material/centro-estetico-manuj/01-inicio.webp | cara de una mujer real en la foto del carrusel y teléfono del negocio en la cabecera
- material/centro-estetico-manuj/02-galeria.webp | caras de varias personas maquilladas en la galería y teléfono del negocio en la cabecera

## Herramientas locales

Pillow (PIL) es un verificador local de solo lectura que usan únicamente el verify de este plan y `scripts/check-phase-1.sh` para leer el tamaño de los WebP. No es dependencia del proyecto, no aparece en CONTEXT.md, y RESEARCH "Environment Availability" lo lista como instalado (12.3.0, confirmado en esta ejecución).

## Task Commits

1. Task 1: tracer, vistas en vivo: `036575f` (feat(scripts): capture the live project views and register them in docs/content)
2. Tasks 2 y 3 aplazadas, pendientes marcados y decisión registrada: `b54f724` (docs(content): keep the sample-data captures pending and log the 01-10 capture choices)

## Files Created/Modified

- `scripts/capture-material.ts`: registro VIEWS por slug, `--base-url` (obligatorio para slugs con datos de ejemplo), login opcional desde `.env.capture.local` con `CAPTURE_LOGIN_EMAIL_<APP>` y `CAPTURE_LOGIN_PASSWORD_<APP>`, comprobación del host final, `document.fonts.ready`, PNG del viewport, WebP 1600x1000 y lectura del tamaño desde la cabecera RIFF. Los slugs del inventario y de finanzas tienen `views: []` y el script se niega a capturarlos con un mensaje claro hasta que Teo dé sus vistas.
- `docs/content/centro-estetico-manuj.md`, `docs/content/ecoexport-costa-rica.md`: `altStatus: draft`, `coverImage` provisional y `media` con alt en español e inglés; `coverImage` y `media` añadidos a `pendingFields`.
- `docs/content/sistema-gestion-inventario.md`, `docs/content/finanzas-personales.md`: `coverImage` y `media` añadidos a `pendingFields`.
- `docs/decisions.md`: entrada "Capturas de 01-10 sin vistas elegidas por Teo".
- En disco (ignorado por git): `material/centro-estetico-manuj/{01-inicio,02-galeria,03-reservar}.{png,webp}` y `material/ecoexport-costa-rica/{01-inicio,02-nosotros,03-productos,04-inicio-en}.{png,webp}`. PNG 2880x1800, WebP 1600x1000.

## Decisions Made

Ver key-decisions. Todas quedan sujetas a la revisión de Teo en G7; nada se publica sin ella (D-15).

## Deviations from Plan

### Instrucción del orquestador ante la delegación de Teo

**1. Vistas y portada elegidas por Claude (Task 1)**
- Found during: precondición de Task 1
- Issue: la precondición exige al menos 3 líneas de vista de Teo por proyecto en "Vistas para 01-10" y el plan prohíbe inventar vistas; Teo no dio ninguna en G4 porque delegó todo.
- Fix: por instrucción del orquestador, Claude eligió páginas públicas reales (no contenido inventado), puso `01-inicio` como portada provisional y dejó `media` y `coverImage` en `pendingFields`. La sección "Vistas para 01-10" de 01-07-SUMMARY.md no se tocó, porque sus líneas deben ser de Teo.
- Files: los dos archivos en vivo de docs/content, docs/decisions.md
- Commit: 036575f, b54f724

**2. G5 y Task 3 aplazadas (inventario y finanzas)**
- Issue: Task 2 es un checkpoint blocking-human y Task 3 depende de él; el orquestador pidió no detener la ejecución por ellas.
- Fix: no se capturó nada de esas apps ni se creó `01-10-ANSWERS.md`; `media` y `coverImage` quedan en `pendingFields`. IDEN-06 sigue abierto: el verify de Task 3 (4 slugs con 3 WebP y README) fallaría hoy.
- Commit: b54f724

**3. [Rule 1 - Bug] Animaciones de EcoExport capturadas a medias**
- Found during: Task 1 (revisión visual)
- Issue: la primera captura de `03-productos` salió con una tarjeta deformada a mitad de su animación de entrada, que el sitio no desactiva con reduced motion.
- Fix: espera de 2,5 s tras desplazar a la sección (`SCROLL_SETTLE_MS`) y nueva captura; las cuatro tarjetas salen en su sitio.
- Commit: 036575f

**4. Cuatro vistas para EcoExport**
- Se añadió `04-inicio-en` para que el material muestre el sitio multilingüe, que es parte de su solución en docs/content. Mínimo del plan: 3.

Total: 4 desviaciones (3 por instrucción del orquestador o por no decidir por Teo, 1 bug corregido). Impacto: el contrato y `pnpm check` siguen en verde; IDEN-06 y el criterio 3 (mitad material) quedan abiertos hasta G5 y G7.

## Issues Encountered

Node imprime `MODULE_TYPELESS_PACKAGE_JSON` al correr el script (igual que `capture-lab.ts`); es solo un aviso y no se cambió `package.json`.

## Pregunta pendiente para Teo (una sola, para G7 o antes)

Inventario y finanzas: (1) ¿se pueden mostrar sus capturas (sí o no)? (2) Si sí, arranca cada app en local con datos de ejemplo (puertos distintos de 3100), pásame las dos URL base, al menos 3 vistas con su ruta y la portada, dime cuál tiene login (las credenciales van tú mismo en `.env.capture.local`, nunca en el chat) y confirma con tus palabras que las dos corren solo con datos de ejemplo. Entonces: `node scripts/capture-material.ts <slug> --base-url <url>`.

## User Setup Required

None ahora. El paso G5 de arriba lo necesita IDEN-06.

## Next Phase Readiness

- 01-11 no depende de este plan.
- 01-12 (G7) debe pedir a Teo: "revisadas: todas" o "liberar:" por captura, "liberar:"/"quitar:" para las dos de la lista de datos personales, confirmar o cambiar las vistas y las portadas provisionales, y G5 para el inventario y finanzas.
- Riesgo: si G5 no ocurre, el inventario y finanzas no llegan a 3 WebP y la compuerta material de `check-phase-1.sh` falla.

## Known Stubs

None. Los campos pendientes están nombrados en `pendingFields`, no rellenos.

## Verification

- Verify de Task 1 (PIL): `live ['centro-estetico-manuj', 'ecoexport-costa-rica'] bad []`, exit 0.
- PNG: 7 archivos a 2880x1800. WebP: 7 a 1600x1000 (cabecera leída por el script y por PIL).
- `git status --porcelain material`: vacío.
- `grep -nE 'PASSWORD|password=' scripts/capture-material.ts`: solo nombres de variable `CAPTURE_LOGIN_PASSWORD_*`.
- `CONTENT_MIN_FILES=4 pnpm content:check`: 19 tests pasan. `pnpm check`: typecheck, lint, test y build en verde.
- Ninguna raya larga U+2014 en docs/content ni en docs/decisions.md.

## Self-Check: PASSED

scripts/capture-material.ts and the material/ captures exist; commits 036575f and b54f724 are ancestors of HEAD; the personal-data list matches the 01-12 line format.
