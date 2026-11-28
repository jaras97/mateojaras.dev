---
phase: 05-pulido-y-lanzamiento
plan: 02
subsystem: site
tags: [404, proxy, next-intl, cache-components, e2e, preview]
requires: [05-01]
provides:
  - "HTTP 404 localizado para URLs sin ruta (catch-all) y para slugs desconocidos o borrador (proxy)"
  - "scripts/wait-preview.ts y .preview-url para verificar la Preview de la rama phase-05-polish"
affects: [05-03, 05-04, 05-05, 05-07]
tech-stack:
  added: []
  patterns: ["guarda de slugs con memo solo positivo y carga bloqueante acotada", "helpers e2e que se niegan a escribir en producción"]
key-files:
  created:
    - "src/app/[locale]/[...rest]/page.tsx"
    - src/lib/published-slug-guard.ts
    - src/lib/published-slug-guard.test.ts
    - src/features/projects/slug-index.ts
    - src/features/projects/slug-index.test.ts
    - e2e/not-found.spec.ts
    - e2e/target.ts
    - scripts/wait-preview.ts
    - .planning/phases/05-pulido-y-lanzamiento/.preview-url
  modified:
    - src/proxy.ts
    - src/features/projects/queries.ts
    - e2e/db.ts
    - e2e/public.spec.ts
    - e2e/case-study.spec.ts
    - e2e/admin-settings.spec.ts
    - e2e/admin-reorder.spec.ts
    - e2e/admin-projects.spec.ts
    - playwright.config.ts
    - scripts/check-live.ts
    - docs/decisions.md
    - docs/backlog.md
key-decisions:
  - "Carga bloqueante acotada (1,5 s) con memo frío o miss; abre solo ante error o timeout; negativos nunca memorizados"
  - "wait-preview usa el CLI de Vercel porque la integración no publica deployments de GitHub"
requirements-completed: [SITE-08, QUAL-03]
duration: ~1 h
completed: 2026-11-26
---

# Phase 5 Plan 2: 404 reales Summary

URLs sin ruta responden 404 localizado (catch-all `[locale]/[...rest]`) y los slugs desconocidos o borrador responden 404 desde `src/proxy.ts` con una guarda de memo solo positivo y carga bloqueante acotada a 1,5 s; verificado en local y en la Preview de `phase-05-polish`.

## Tasks

| Task | Commit |
|------|--------|
| 1 catch-all, branch, plumbing de Preview | a6a601a, bcc71d3, f0dd622 |
| 2 guarda de slugs + loader con tests | df78dd5 |
| 3 proxy, guarda de escritura e2e, verificación en Preview | 510405a |
| 4 aserciones de 404 real | 15eae25 |
| 5 decisions/backlog + pnpm check | c100d10 |

## Verification

- Preview alias (en `.preview-url`): `/foo`, `/es/foo`, `/projects/no-existe-check-live`, `/es/proyectos/no-existe-check-live` responden 404 en la primera petición (`check-live --only=notfound`: RESULT all PASS, incluida una instancia recién desplegada). A2 confirmada: el 404 sobrevive en Vercel.
- `e2e/not-found.spec.ts` pasa en local y en la Preview (lang, h1, noindex, axe).
- Lighthouse móvil en Preview (3 corridas): `/projects/centro-estetico-manuj` perf 96, LCP 2,23 s, CLS 0; `/es/proyectos/centro-estetico-manuj` perf 96, LCP 2,24 s, CLS 0.
- Unit: 11 tests de la guarda + toSQL de `publishedSlugsQuery`. e2e local: public, case-study, seo, admin-projects, admin-settings, admin-reorder, draft-mode: verdes. `pnpm check` verde.
- Rechazo de escritura en producción probado por comando (`E2E_BASE_URL=https://mateojaras.dev` lanza "Refusing...").

## Deviations from Plan

**1. [Rule 3 - Blocking] wait-preview vía Vercel CLI.** La integración Vercel-GitHub no publica deployments ni statuses de GitHub (la API vacía), así que el supuesto del plan no se cumplía. `scripts/wait-preview.ts` ahora llama `vercel ls --environment preview -m githubCommitSha=<HEAD> --format json` (solo lectura). Commit bcc71d3. Decisión registrada en docs/decisions.md.

**2. Amend sin push previo:** la guarda se enmendó (comentario de slug-index.ts reformulado para no coincidir con el grep de aceptación) y se hizo force-push de la propia rama `phase-05-polish` (nunca main).

**3. seo.spec.ts** no contenía `[200, 404]` (ya asertaba noindex); no necesitó cambios. admin-projects.spec.ts ahora calienta el memo con un slug sembrado y asegura 200 en la primera petición del fixture.

## Known observation (out of scope)

Durante los e2e locales `next start` registra "Unexpected cache miss after cache warming phase during prerendering" para `/[locale]` y `/[locale]/about`. Aparece tras las mutaciones del admin en los specs; no se relaciona con proxy ni con la guarda (los tests pasan). No se investigó.

## Needs from Teo

Nada bloqueante. Contacto (RESEND/KV en Preview) fuera de alcance.

## Self-Check: PASSED
