---
gsd_state_version: "1.0"
milestone: v1.0
current_phase: "04.1"
current_phase_name: Contenido y posicionamiento full stack + AI (INSERTED)
status: executing
stopped_at: Completed 04.1-04-PLAN.md
last_updated: "2026-11-25T16:42:20.622Z"
last_activity: 2026-11-25
last_activity_desc: Phase 04.1 execution started
state_head: daee069a83d8deebf4b0afe7bc8c44eae7da7677
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 63
  completed_plans: 55
milestone_name: milestone
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-22)

**Core value:** Los casos de estudio (`/projects/[slug]`) convencen a un cliente o reclutador de que Teo sabe decidir y entregar.
**Current focus:** Phase 04.1 — Contenido y posicionamiento full stack + AI (INSERTED)

## Current Position

Phase: 04.1 (Contenido y posicionamiento full stack + AI (INSERTED)) — EXECUTING
Plan: 5 of 12
Status: Ready to execute
Last activity: 2026-11-25 — Phase 04.1 execution started

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**

- Total plans completed: 51
- Average duration: -
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 13 | - | - |
| 2 | 9 | - | - |
| 03 | 14 | - | - |
| 04 | 15 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 3min | 2 tasks | 8 files |
| Phase 01 P03 | 31min | 3 tasks | 12 files |
| Phase 01 P02 | 4min | 2 tasks | 9 files |
| Phase 01 P05 | 6min | 2 tasks | 8 files |
| Phase 01 P04 | 31min | 3 tasks | 15 files |
| Phase 01 P06 | 7min | 2 tasks | 10 files |
| Phase 01 P08 | 9min | 2 tasks | 5 files |
| Phase 01 P07 | 10min | 3 tasks | 6 files |
| Phase 01 P09 | 97min | 3 tasks | 2 files |
| Phase 01 P10 | 3min | 1 tasks | 6 files |
| Phase 01 P11 | 10min | 3 tasks | 6 files |
| Phase 01 P12 | 16min | 2 tasks | 4 files |
| Phase 02 P02 | 15min | 3 tasks | 25 files |
| Phase 02 P03 | 25min | 2 tasks | 20 files |
| Phase 02 P04 | 25min | 2 tasks | 26 files |
| Phase 03 P01 | 25min | 3 tasks | 40 files |
| Phase 03 P03 | 30min | 3 tasks | 30 files |
| Phase 03 P04 | 90m | 3 tasks | 30 files |
| Phase 03 P05 | 75min | 3 tasks | 30 files |
| Phase 03 P09 | 25m | 1 tasks | 20 files |
| Phase 03 P08 | 40min | 2 tasks | 20 files |
| Phase 03 P11 | 60min | 2 tasks | 19 files |
| Phase 03 P12 | ~20m | 1 tasks | 8 files |
| Phase 04 P01 | 20 min | 2 tasks | 18 files |
| Phase 04 P14 | 10 min | 3 tasks | 12 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table and in `docs/decisions.md`.
Recent decisions affecting current work:

- [Roadmap]: Se usan exactamente las 5 fases, días y compuertas de `PROJECT.md` raíz.
- [Roadmap]: QUAL-01, QUAL-02 y QUAL-04 van en la fase 4 (son su compuerta); SITE-08 (404) va en la fase 5 (Pulido, según `PROJECT.md` raíz).
- [Roadmap]: Plan B de caché pre-aprobado: `cacheComponents: false` + ISR si Cache Components + next-intl falla; go/no-go al final del día 3.
- [Roadmap]: El CV público es la copia generada y guardada en Blob (CV-01/CV-02); se confirma con Teo en la fase 3.
- [Phase 01]: Biome excludes .claude, .agents, .planning and .impeccable (local hook cache); vendored files are never edited to satisfy lint
- [Phase 01]: The terracotta reaches components only through --color-signal (bg-signal/text-signal) and --ring; shadcn --color-accent stays a neutral hover surface
- [Phase 01]: PDF fonts: six static TTFs from Google Fonts' official static/ folders (D-19); instancer fallback not needed; OFL shipped next to them
- [Phase 01]: Teo approved yaml@2.9.1 and @axe-core/playwright@4.14.0 (exact devDeps) and verified axe on npm; install in 01-05 / 01-08
- [Phase 01]: Teo (2026-10-30): ask him only about highly relevant matters
- [Phase 01]: 01-02: Lab chrome read from messages/en.json + es.json via labMessages (en as type, es rendered); src/lib/messages.test.ts enforces two-way key parity inside pnpm check
- [Phase 01]: 01-05: docs/content contract is strict (unknown keys fail); metrics always present, never silenced by pendingFields; yaml 2.9.1 branch
- [Phase 01]: 01-04: Hero headline ES completed by Claude at Teo's explicit request ('termina el texto tu'), EN is Claude's translation; both draft until G7 (headlineEsStatus draft, headlineEnStatus draft-translation, headlineAuthorship)
- [Phase 01]: 01-04: G2 fixture values from Teo: open, availableFrom null, location 'Medellín, Colombia'; headlineSource stays 'Teo, 2026-10-30' (01-06 precondition form)
- [Phase 01]: 01-06: LabBar headline notes read heroFixtureMeta.headlineEsStatus/headlineAuthorship and headlineEnStatus; /lab/hero never presents the headline as Teo's approved text
- [Phase 01]: 01-06: hero variants share hero-parts.tsx (props, container/title classes, CTA); each keeps its own h1#hero-title and localized()
- [Phase 01]: 01-08: @axe-core/playwright 4.14.0 installed exact after re-reading Teo's own G1 ('1 si, 2 si') and legitimacy ('verificado'); lab axe gate passes at 1440
- [Phase 01]: 01-08: /lab/tokens audit 17/20; axe serious scrollable-region-focusable at 390 (contrast table) and light accent as text are reported to Teo in 01-09, not fixed (D-05)
- [Phase 01]: G4 delegated to admin editing: docs/content carries only verifiable facts, narrative fields in pendingFields, IDEN-05 narrative open
- [Phase 01]: Project slugs fixed: centro-estetico-manuj, ecoexport-costa-rica, sistema-gestion-inventario, finanzas-personales
- [Phase 01]: 01-09 G3 (Teo): hero variant a; P1 keep light accent; P2 ES strings approved, CTA stays Let’s talk / Hablemos, short headline; P5 fix DESIGN.md §4 example; fix only the focusable contrast-table region now, rest to phase 4
- [Phase 01]: 01-10: live-site views (ManuJ inicio/galeria/reservar; EcoExport inicio/nosotros/productos/inicio-en) chosen by Claude after Teo's G4 delegation; media and coverImage stay in pendingFields until G7
- [Phase 01]: 01-10: provisional cover 01-inicio.webp for ManuJ and EcoExport, coverImage kept pending for Teo
- [Phase 01]: 01-10: inventory and finance captures deferred (G5 open, permission unknown); IDEN-06 stays open
- [Phase 01]: 01-11: G6 copy (about, now, freelance bullets, contact intro) and the DESIGN.md §1 concept are Claude proposals Teo asked for and accepted item by item; authorship disclosed inline and in docs/decisions.md; English is draft-translation until G7
- [Phase 01]: 01-11: Sofka bullets stay pending (Teo: 'Sofka pendiente'); Teo writes them from the admin; nothing invented
- [Phase 01]: DESIGN.md approved by Teo at G7 ('si' to a closed yes/no question): Estado APROBADO, variant A
- [Phase 01]: G7: Teo deferred all content, captures, covers, alt texts, Sofka bullets, English translations, client permissions and open facts to the admin ('todo eso lo subo desde admin'); nothing under material/ is committed
- [Phase 01]: G7: no option or aplazar line written for Teo; --parse-g7 reads pendiente and the deferred gates stay FAIL under --final (never PASS); 01-13 must be replanned
- [Phase 02]: 02-04: content/*.json committed (9 allowlisted tables only); seed dates use the first of the month
- [Phase ?]: Phase 2 start: next 16.4.6, better-auth 1.7.25, languages jsonb, metrics_en/es, login rate limit in memory
- [Phase 03]: Phase 3 start: Teo delegated all recommended options (draft jsonb, structural fields live, content/ untracked, cover from media, Blob suffix, tokens, Blob token luego, production load)
- [Phase 03]: 03-03: draft jsonb column per row; publish copies to columns; saves never call updateTag
- [Phase 03]: 03-04: projects list uses a bare table; shadcn Table overflow wrapper breaks dnd-kit keyboard coordinates
- [Phase 03]: 03-05: project form works on paired {es,en} rows via form-model.ts; schemas validated manually, no RHF resolver
- [Phase 03]: 03-09: experience form labels passed as a prop; relations of a published experience stay in draft until publish
- [Phase 03]: 03-08: time zones validated via Intl.DateTimeFormat try/catch; education create needs institution + ES program only
- [Phase 03]: 03-11: CV blob path resume/<lang>/v<n>-<suffix>.pdf, A4; blank locale field falls back to English, pre-flight flags it
- [Phase 03]: 03-12: CvData carries raw ISO dates and lastModified; absent site URL means url/canonical omitted
- [Phase 04]: Pass t.raw('figure') to CaseGallery in page.tsx only (G-04-2) — Component expects raw template

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: `docs/content/` y `material/` están vacíos y `docs/copy.md` tiene marcadores `[Teo escribe]`. Bloquea el seed de la fase 2 (al menos un proyecto completo), el gate de la fase 3 y los casos de estudio de la fase 4.
- [Phase 2]: Las aprobaciones de dependencias y de cambios en `docs/data-model.md` y CLAUDE.md se piden juntas al inicio, antes de escribir código que dependa de ellas.
- [Phase 3]: CR-01 accepted as known open item at UAT (2026-11-22): stale relation ids in pending drafts block publish; workaround "Descartar borrador".
- [Phase 3]: Only ManuJ is complete. EcoExport is published-but-hidden with empty narrative fields; Finanzas and Inventario stay draft (D-10). Phase 4 case studies render only complete projects.
- [Phase 4]: Arrancar la verificación DNS de Resend en Porkbun la primera mañana; pedir las claves de Resend, Upstash y la URL de Cal.com.
- IDEN-06: inventory and finance captures need Teo's G5 (permission, local sample-data apps, URLs, views); ask at G7 or before
- 01-13 cannot run as written: G7 option reads pendiente and Teo deferred content, captures and translations to the admin; IDEN-05/06/07 need a replan or gap closure (see 01-12-SUMMARY 'Ajustes que necesita 01-13')

### Roadmap Evolution

- Phase 04.1 inserted after Phase 4: Contenido y posicionamiento full stack + AI (antes del lanzamiento de la fase 5; ver 05-CONTEXT D-13) (URGENT)

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-11-25T16:42:20.389Z
Stopped at: Completed 04.1-04-PLAN.md
Resume file: None
